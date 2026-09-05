import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
import {
  listAuditLogsHandler,
  getEntityAuditLogsHandler,
} from '../controllers/auditController.js';

export const auditRoutes: Router = Router();

auditRoutes.use(authenticate);

auditRoutes.get(
  '/',
  requirePermission(Permissions.AUDIT_VIEW),
  listAuditLogsHandler,
);

auditRoutes.get(
  '/entity/:entityType/:entityId',
  requirePermission(Permissions.AUDIT_VIEW),
  getEntityAuditLogsHandler,
);

export default auditRoutes;
