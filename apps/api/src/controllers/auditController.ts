import { Request, Response, NextFunction } from 'express';
import { AuditFilterQuerySchema } from '@dealflow360/contracts';
import { getAuditLogs, getEntityAuditLogs } from '../services/auditService.js';

export async function listAuditLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = AuditFilterQuerySchema.parse(req.query);
    const result = await getAuditLogs(query);
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

export async function getEntityAuditLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const entityType = Array.isArray(req.params.entityType)
      ? req.params.entityType[0]
      : req.params.entityType;
    const entityId = Array.isArray(req.params.entityId)
      ? req.params.entityId[0]
      : req.params.entityId;

    const result = await getEntityAuditLogs(entityType, entityId);
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
