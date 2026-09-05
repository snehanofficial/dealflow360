import { db, Role } from '@dealflow360/db';
import { ApprovalRequestStatus, ApprovalStepStatus } from '@dealflow360/contracts';

export interface CreateApprovalRequestData {
  quotationId?: string;
  requestedById: string;
  status: ApprovalRequestStatus;
  riskScore: number;
  riskLevel: string;
  netTotal: number;
  marginAmount: number;
  marginPercentage: number;
  violations?: any;
  commercialSummary?: any;
  steps: {
    sequence: number;
    requiredRole: Role;
    status: ApprovalStepStatus;
  }[];
}

export interface ApprovalFilters {
  status?: string;
  requiredRole?: Role;
  requestedById?: string;
  quotationId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const approvalRepository = {
  async create(data: CreateApprovalRequestData) {
    return db.approvalRequest.create({
      data: {
        quotationId: data.quotationId || null,
        requestedById: data.requestedById,
        status: data.status,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        netTotal: data.netTotal,
        marginAmount: data.marginAmount,
        marginPercentage: data.marginPercentage,
        violations: data.violations ?? null,
        commercialSummary: data.commercialSummary ?? null,
        currentStepSequence: 1,
        steps: {
          create: data.steps.map((step) => ({
            sequence: step.sequence,
            requiredRole: step.requiredRole,
            status: step.status,
          })),
        },
      },
      include: {
        requestedBy: true,
        quotation: {
          include: {
            customer: true,
          },
        },
        steps: {
          include: {
            actedBy: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });
  },

  async findById(id: string) {
    return db.approvalRequest.findUnique({
      where: { id },
      include: {
        requestedBy: true,
        quotation: {
          include: {
            customer: true,
            createdBy: true,
          },
        },
        steps: {
          include: {
            actedBy: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });
  },

  async findActiveByQuotationId(quotationId: string) {
    return db.approvalRequest.findFirst({
      where: {
        quotationId,
        status: 'PENDING',
      },
      include: {
        steps: {
          orderBy: { sequence: 'asc' },
        },
      },
    });
  },

  async findAll(filters: ApprovalFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status && filters.status !== 'ALL') {
      const statusStr = filters.status as string;
      if (statusStr === 'PENDING_MANAGER') {
        where.status = 'PENDING';
        where.steps = {
          some: {
            requiredRole: 'SALES_MANAGER',
            status: 'PENDING',
          },
        };
      } else if (statusStr === 'PENDING_FINANCE') {
        where.status = 'PENDING';
        where.steps = {
          some: {
            requiredRole: 'FINANCE_OPERATIONS',
            status: 'PENDING',
          },
        };
      } else {
        where.status = statusStr;
      }
    }

    if (filters.requestedById) {
      where.requestedById = filters.requestedById;
    }

    if (filters.quotationId) {
      where.quotationId = filters.quotationId;
    }

    if (filters.requiredRole) {
      where.steps = {
        some: {
          requiredRole: filters.requiredRole,
          status: 'PENDING',
        },
      };
    }

    if (filters.search) {
      const s = filters.search;
      where.OR = [
        { quotation: { quoteNumber: { contains: s, mode: 'insensitive' } } },
        { quotation: { customer: { name: { contains: s, mode: 'insensitive' } } } },
        { requestedBy: { name: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      db.approvalRequest.count({ where }),
      db.approvalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requestedBy: true,
          quotation: {
            include: {
              customer: true,
            },
          },
          steps: {
            include: {
              actedBy: true,
            },
            orderBy: {
              sequence: 'asc',
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateStep(
    stepId: string,
    data: {
      status: ApprovalStepStatus;
      actedById: string;
      actedAt: Date;
      comments?: string | null;
    },
  ) {
    return db.approvalStep.update({
      where: { id: stepId },
      data: {
        status: data.status,
        actedById: data.actedById,
        actedAt: data.actedAt,
        comments: data.comments ?? null,
      },
    });
  },

  async updateRequestState(
    requestId: string,
    data: {
      status: ApprovalRequestStatus;
      currentStepSequence: number;
    },
  ) {
    return db.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        currentStepSequence: data.currentStepSequence,
      },
    });
  },

  async supersedeAllPendingForQuote(quotationId: string) {
    const pendingRequests = await db.approvalRequest.findMany({
      where: { quotationId, status: 'PENDING' },
      include: { steps: true },
    });

    for (const req of pendingRequests) {
      await db.approvalStep.updateMany({
        where: { approvalRequestId: req.id, status: 'PENDING' },
        data: { status: 'SUPERSEDED' },
      });
      await db.approvalRequest.update({
        where: { id: req.id },
        data: { status: 'SUPERSEDED' },
      });
    }
  },
};
