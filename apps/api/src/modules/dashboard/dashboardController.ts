import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboardService.js';
import { AppError } from '../../middleware/errorHandler.js';

export class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('AUTHENTICATION_REQUIRED', 'User authentication required.', 401);
      }

      const dashboardData = await dashboardService.getDashboard(req.user);

      res.json({
        success: true,
        data: dashboardData,
        message: null,
        meta: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
