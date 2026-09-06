import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { dashboardController } from './dashboardController.js';
import { AppError } from '../../middleware/errorHandler.js';

export const dashboardRoutes: Router = Router();


function authorizeDashboardAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('AUTHENTICATION_REQUIRED', 'User must be authenticated.', 401));
  }

  // All 5 roles (ADMIN, SALES_MANAGER, SALES_REP, FINANCE_OPERATIONS, CUSTOMER) are authorized for dashboard access
  next();
}

dashboardRoutes.get('/', authenticate, authorizeDashboardAccess, (req, res, next) =>
  dashboardController.getDashboard(req, res, next),
);
