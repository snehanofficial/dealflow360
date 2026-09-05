import { Request, Response, NextFunction } from 'express';
import {
  CreateApprovalRequestSchema,
  ApprovalApproveRequestSchema,
  ApprovalRejectRequestSchema,
  ApprovalQuerySchema,
} from '@dealflow360/contracts';
import * as approvalService from '../services/approvalService.js';

export async function createApprovalRequestHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = CreateApprovalRequestSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await approvalService.createApprovalRequest(payload, userId);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Approval request created successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getApprovalInboxHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = ApprovalQuerySchema.parse(req.query);
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const result = await approvalService.getApprovalInbox(userId, userRole, query);

    res.json({
      success: true,
      data: result.items,
      message: null,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getApprovalByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await approvalService.getApprovalById(id);

    res.json({
      success: true,
      data: result,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function approveStepHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const body = ApprovalApproveRequestSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const result = await approvalService.approveStep(id, userId, userRole, body.comments);

    res.json({
      success: true,
      data: result,
      message: 'Approval step approved successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectStepHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const body = ApprovalRejectRequestSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const result = await approvalService.rejectStep(id, userId, userRole, body.reason);

    res.json({
      success: true,
      data: result,
      message: 'Approval step rejected successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}
