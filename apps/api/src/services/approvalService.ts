import {
  ApprovalRequestDto,
  ApprovalStepDto,
  CreateApprovalRequestInput,
  ApprovalQueryInput,
  ApprovalRequestStatus,
} from '@dealflow360/contracts';
import { canRoleApproveStep, deriveNextRequestState } from '@dealflow360/domain';
import { db, Role } from '@dealflow360/db';
import { approvalRepository, ApprovalFilters } from '../repositories/approvalRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import { recordAuditEvent } from './auditService.js';

function mapStepToDto(step: any): ApprovalStepDto {
  return {
    id: step.id,
    approvalRequestId: step.approvalRequestId,
    sequence: step.sequence,
    requiredRole: step.requiredRole,
    status: step.status,
    actedById: step.actedById || null,
    actedByName: step.actedBy ? step.actedBy.name : null,
    actedAt: step.actedAt ? step.actedAt.toISOString() : null,
    comments: step.comments || null,
    createdAt: step.createdAt.toISOString(),
    updatedAt: step.updatedAt.toISOString(),
  };
}

function mapRequestToDto(request: any): ApprovalRequestDto {
  return {
    id: request.id,
    quotationId: request.quotationId || null,
    quoteNumber: request.quotation ? request.quotation.quoteNumber : null,
    customerName: request.quotation && request.quotation.customer ? request.quotation.customer.name : null,
    requestedById: request.requestedById,
    requestedByName: request.requestedBy ? request.requestedBy.name : null,
    status: request.status,
    riskScore: request.riskScore,
    riskLevel: request.riskLevel,
    netTotal: request.netTotal,
    marginAmount: request.marginAmount,
    marginPercentage: request.marginPercentage,
    violations: request.violations ?? [],
    commercialSummary: request.commercialSummary ?? null,
    currentStepSequence: request.currentStepSequence,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    steps: (request.steps || []).map(mapStepToDto),
  };
}

export async function createApprovalRequest(
  input: CreateApprovalRequestInput,
  requestedById: string,
): Promise<ApprovalRequestDto> {
  const { evaluation, quotationId } = input;

  const requester = await db.user.findUnique({ where: { id: requestedById } });
  if (!requester) {
    throw new AppError('NOT_FOUND', `User with ID '${requestedById}' not found.`, 404);
  }

  if (quotationId) {
    const quote = await db.quotation.findUnique({ where: { id: quotationId } });
    if (!quote) {
      throw new AppError('NOT_FOUND', `Quotation with ID '${quotationId}' not found.`, 404);
    }
    await approvalRepository.supersedeAllPendingForQuote(quotationId);
  }

  const requiredRoles = evaluation.requiredApprovalRoles || [];

  const uniqueRoles: Role[] = [];
  for (const roleStr of requiredRoles) {
    const role = ((roleStr as string) === 'FINANCE' ? 'FINANCE_OPERATIONS' : roleStr) as Role;
    if (!uniqueRoles.includes(role)) {
      uniqueRoles.push(role);
    }
  }

  const stepsData = uniqueRoles.map((role, idx) => ({
    sequence: idx + 1,
    requiredRole: role,
    status: 'PENDING' as const,
  }));

  const initialStatus: ApprovalRequestStatus =
    stepsData.length === 0 || !evaluation.requiresApproval ? 'APPROVED' : 'PENDING';

  const requestRecord = await approvalRepository.create({
    quotationId: quotationId || evaluation.quoteId,
    requestedById,
    status: initialStatus,
    riskScore: evaluation.riskScore,
    riskLevel: evaluation.riskLevel,
    netTotal: evaluation.netTotal,
    marginAmount: evaluation.marginAmount,
    marginPercentage: evaluation.marginPercentage,
    violations: evaluation.violations,
    commercialSummary: evaluation.lineEvaluations || null,
    steps: stepsData,
  });

  if (quotationId && initialStatus === 'PENDING') {
    const firstRole = stepsData[0]?.requiredRole;
    const targetStatus = firstRole === 'FINANCE_OPERATIONS' ? 'PENDING_FINANCE' : 'PENDING_MANAGER';
    await db.quotation.update({
      where: { id: quotationId },
      data: { status: targetStatus },
    });
  } else if (quotationId && initialStatus === 'APPROVED') {
    await db.quotation.update({
      where: { id: quotationId },
      data: { status: 'APPROVED' },
    });
  }

  await recordAuditEvent({
    eventType: 'APPROVAL_REQUESTED',
    action: `Submitted Commercial Approval Request (Risk Score: ${evaluation.riskScore}, Level: ${evaluation.riskLevel})`,
    entityType: 'ApprovalRequest',
    entityId: requestRecord.id,
    actor: { id: requester.id, name: requester.name, role: requester.role },
    newState: requestRecord,
  });

  return mapRequestToDto(requestRecord);
}

export async function syncMissingQuoteApprovals(): Promise<void> {
  if (!db.quotation?.findMany || !db.approvalRequest?.create) {
    return;
  }
  try {
    const pendingQuotes = await db.quotation.findMany({
      where: {
        status: { in: ['PENDING_MANAGER', 'PENDING_FINANCE', 'APPROVED', 'REJECTED'] as any[] },
        approvalRequests: { none: {} },
      },
      include: {
        customer: true,
        lines: { include: { product: true } },
        createdBy: true,
      },
    });

    for (const quote of pendingQuotes) {
      let stepsData: { sequence: number; requiredRole: Role; status: any }[] = [];
      let requestStatus: any = 'PENDING';
      const statusStr = quote.status as string;

      if (statusStr === 'PENDING_MANAGER') {
        requestStatus = 'PENDING';
        stepsData = [{ sequence: 1, requiredRole: 'SALES_MANAGER', status: 'PENDING' }];
        if (quote.riskScore >= 6.1 || quote.netValue > 100000) {
          stepsData.push({ sequence: 2, requiredRole: 'FINANCE_OPERATIONS', status: 'PENDING' });
        }
      } else if (statusStr === 'PENDING_FINANCE') {
        requestStatus = 'PENDING';
        stepsData = [
          { sequence: 1, requiredRole: 'SALES_MANAGER', status: 'APPROVED' },
          { sequence: 2, requiredRole: 'FINANCE_OPERATIONS', status: 'PENDING' },
        ];
      } else if (statusStr === 'APPROVED') {
        requestStatus = 'APPROVED';
        stepsData = [{ sequence: 1, requiredRole: 'SALES_MANAGER', status: 'APPROVED' }];
      } else if (statusStr === 'REJECTED') {
        requestStatus = 'REJECTED';
        stepsData = [{ sequence: 1, requiredRole: 'SALES_MANAGER', status: 'REJECTED' }];
      }

      const currentStepSeq = statusStr === 'PENDING_FINANCE' ? 2 : 1;

      await db.approvalRequest.create({
        data: {
          quotationId: quote.id,
          requestedById: quote.createdById,
          status: requestStatus,
          riskScore: quote.riskScore,
          riskLevel: quote.riskLevel,
          netTotal: quote.netValue,
          marginAmount: (quote.netValue * (quote.grossMarginPercent || 0)) / 100,
          marginPercentage: quote.grossMarginPercent,
          currentStepSequence: currentStepSeq,
          violations: [
            {
              ruleName: 'Quote Commercial Governance',
              violatedField: 'GOVERNANCE',
              allowedValue: 0,
              proposedValue: quote.riskScore,
              severity: quote.riskLevel === 'HIGH' || quote.riskLevel === 'CRITICAL' ? 'VIOLATION' : 'WARNING',
              message: `Quotation ${quote.quoteNumber} requires commercial approval (Status: ${quote.status}).`,
            },
          ],
          steps: {
            create: stepsData,
          },
        },
      });
    }
  } catch (err) {
    console.error('Error syncing missing quote approvals:', err);
  }
}

export async function getApprovalInbox(
  userId: string,
  userRole: string,
  query: ApprovalQueryInput,
): Promise<{
  items: ApprovalRequestDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await syncMissingQuoteApprovals();

  const filters: ApprovalFilters = {
    status: query.status,
    quotationId: query.quotationId,
    search: query.search,
    page: query.page || 1,
    limit: query.limit || 20,
  };

  if (query.requiredRole) {
    filters.requiredRole = query.requiredRole as Role;
  }

  if (userRole === 'ADMIN') {
    if (!query.status) {
      filters.status = 'PENDING';
    }
  } else if (userRole === 'SALES_MANAGER') {
    if (!query.requiredRole && (!query.status || query.status === 'PENDING')) {
      filters.requiredRole = 'SALES_MANAGER';
      filters.status = 'PENDING';
    }
  } else if (userRole === 'FINANCE_OPERATIONS' || userRole === 'FINANCE') {
    if (!query.requiredRole && (!query.status || query.status === 'PENDING')) {
      filters.requiredRole = 'FINANCE_OPERATIONS';
      filters.status = 'PENDING';
    }
  } else if (userRole === 'SALES_REP') {
    filters.requestedById = userId;
  }

  const result = await approvalRepository.findAll(filters);

  return {
    items: result.items.map(mapRequestToDto),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

export async function getApprovalById(id: string): Promise<ApprovalRequestDto> {
  const requestRecord = await approvalRepository.findById(id);
  if (!requestRecord) {
    throw new AppError('NOT_FOUND', `Approval Request with ID '${id}' not found.`, 404);
  }
  return mapRequestToDto(requestRecord);
}

export async function approveStep(
  requestId: string,
  userId: string,
  userRole: string,
  comments?: string,
): Promise<ApprovalRequestDto> {
  return db.$transaction(async (tx) => {
    const requestRecord = await tx.approvalRequest.findUnique({
      where: { id: requestId },
      include: {
        steps: { orderBy: { sequence: 'asc' } },
        quotation: true,
      },
    });

    if (!requestRecord) {
      throw new AppError('NOT_FOUND', `Approval Request with ID '${requestId}' not found.`, 404);
    }

    if (requestRecord.status !== 'PENDING') {
      throw new AppError(
        'INVALID_STATE',
        `Cannot approve request in status '${requestRecord.status}'. Request must be 'PENDING'.`,
        400,
      );
    }

    const currentSequence = requestRecord.currentStepSequence;
    const currentStep = requestRecord.steps.find(
      (s) => s.sequence === currentSequence && s.status === 'PENDING',
    );

    if (!currentStep) {
      throw new AppError('INVALID_STATE', `No active pending approval step for sequence ${currentSequence}.`, 400);
    }

    if (!canRoleApproveStep(userRole, currentStep.requiredRole)) {
      throw new AppError(
        'FORBIDDEN',
        `User with role '${userRole}' is not authorized to approve step requiring '${currentStep.requiredRole}'.`,
        403,
      );
    }

    const actorUser = tx.user
      ? await tx.user.findUnique({ where: { id: userId } })
      : db.user?.findUnique
        ? await db.user.findUnique({ where: { id: userId } })
        : null;

    await tx.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'APPROVED',
        actedById: userId,
        actedAt: new Date(),
        comments: comments || null,
      },
    });

    const updatedSteps = requestRecord.steps.map((s) =>
      s.id === currentStep.id
        ? { ...s, status: 'APPROVED' as const, actedById: userId, actedAt: new Date(), comments: comments || null }
        : s,
    );

    const derivedState = deriveNextRequestState(updatedSteps);

    await tx.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: derivedState.requestStatus as any,
        currentStepSequence: derivedState.nextSequence,
      },
    });

    if (requestRecord.quotationId) {
      if (derivedState.requestStatus === 'APPROVED') {
        await tx.quotation.update({
          where: { id: requestRecord.quotationId },
          data: { status: 'APPROVED' },
        });
      } else if (derivedState.requestStatus === 'PENDING') {
        const nextStep = updatedSteps.find((s) => s.sequence === derivedState.nextSequence);
        if (nextStep) {
          const nextQuoteStatus =
            nextStep.requiredRole === 'FINANCE_OPERATIONS' ? 'PENDING_FINANCE' : 'PENDING_MANAGER';
          await tx.quotation.update({
            where: { id: requestRecord.quotationId },
            data: { status: nextQuoteStatus },
          });
        }
      }
    }

    const finalRecord = await tx.approvalRequest.findUnique({
      where: { id: requestId },
      include: {
        requestedBy: true,
        quotation: { include: { customer: true } },
        steps: { include: { actedBy: true }, orderBy: { sequence: 'asc' } },
      },
    });

    // Transactional Audit Event Write
    await recordAuditEvent(
      {
        eventType: 'APPROVAL_APPROVED',
        action: `Approved step ${currentStep.sequence} (${currentStep.requiredRole}) for Approval Request ${requestId}`,
        entityType: 'ApprovalRequest',
        entityId: requestId,
        actor: actorUser ? { id: actorUser.id, name: actorUser.name, role: actorUser.role } : { id: userId, role: userRole as Role },
        previousState: requestRecord,
        newState: finalRecord,
        metadata: { comments: comments || null, stepSequence: currentStep.sequence },
      },
      tx,
    );

    return mapRequestToDto(finalRecord);
  });
}

export async function rejectStep(
  requestId: string,
  userId: string,
  userRole: string,
  reason: string,
): Promise<ApprovalRequestDto> {
  if (!reason || reason.trim().length === 0) {
    throw new AppError('VALIDATION_ERROR', 'A valid rejection reason is required.', 400);
  }

  return db.$transaction(async (tx) => {
    const requestRecord = await tx.approvalRequest.findUnique({
      where: { id: requestId },
      include: {
        steps: { orderBy: { sequence: 'asc' } },
        quotation: true,
      },
    });

    if (!requestRecord) {
      throw new AppError('NOT_FOUND', `Approval Request with ID '${requestId}' not found.`, 404);
    }

    if (requestRecord.status !== 'PENDING') {
      throw new AppError(
        'INVALID_STATE',
        `Cannot reject request in status '${requestRecord.status}'. Request must be 'PENDING'.`,
        400,
      );
    }

    const currentSequence = requestRecord.currentStepSequence;
    const currentStep = requestRecord.steps.find(
      (s) => s.sequence === currentSequence && s.status === 'PENDING',
    );

    if (!currentStep) {
      throw new AppError('INVALID_STATE', `No active pending approval step for sequence ${currentSequence}.`, 400);
    }

    if (!canRoleApproveStep(userRole, currentStep.requiredRole)) {
      throw new AppError(
        'FORBIDDEN',
        `User with role '${userRole}' is not authorized to reject step requiring '${currentStep.requiredRole}'.`,
        403,
      );
    }

    const actorUser = tx.user
      ? await tx.user.findUnique({ where: { id: userId } })
      : db.user?.findUnique
        ? await db.user.findUnique({ where: { id: userId } })
        : null;

    await tx.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'REJECTED',
        actedById: userId,
        actedAt: new Date(),
        comments: reason,
      },
    });

    await tx.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
      },
    });

    if (requestRecord.quotationId) {
      await tx.quotation.update({
        where: { id: requestRecord.quotationId },
        data: { status: 'REJECTED' },
      });
    }

    const finalRecord = await tx.approvalRequest.findUnique({
      where: { id: requestId },
      include: {
        requestedBy: true,
        quotation: { include: { customer: true } },
        steps: { include: { actedBy: true }, orderBy: { sequence: 'asc' } },
      },
    });

    // Transactional Audit Event Write
    await recordAuditEvent(
      {
        eventType: 'APPROVAL_REJECTED',
        action: `Rejected step ${currentStep.sequence} (${currentStep.requiredRole}) for Approval Request ${requestId}`,
        entityType: 'ApprovalRequest',
        entityId: requestId,
        actor: actorUser ? { id: actorUser.id, name: actorUser.name, role: actorUser.role } : { id: userId, role: userRole as Role },
        previousState: requestRecord,
        newState: finalRecord,
        metadata: { reason, stepSequence: currentStep.sequence },
      },
      tx,
    );

    return mapRequestToDto(finalRecord);
  });
}
