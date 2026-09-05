import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
import {
  createApprovalRequestHandler,
  getApprovalInboxHandler,
  getApprovalByIdHandler,
  approveStepHandler,
  rejectStepHandler,
} from '../controllers/approvalController.js';

export const approvalRoutes: Router = Router();

approvalRoutes.use(authenticate);

approvalRoutes.post('/', createApprovalRequestHandler);
approvalRoutes.get('/', requirePermission(Permissions.APPROVAL_VIEW), getApprovalInboxHandler);
approvalRoutes.get('/:id', requirePermission(Permissions.APPROVAL_VIEW), getApprovalByIdHandler);
approvalRoutes.post('/:id/approve', requirePermission(Permissions.APPROVAL_ACTION), approveStepHandler);
approvalRoutes.post('/:id/reject', requirePermission(Permissions.APPROVAL_ACTION), rejectStepHandler);
