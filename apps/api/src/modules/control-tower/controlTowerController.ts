import { Request, Response, NextFunction } from 'express';
import { controlTowerService } from './controlTowerService.js';

export class ControlTowerController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, riskLevel, search } = req.query;

      const data = await controlTowerService.getControlTowerDashboardData({
        status: status as string,
        riskLevel: riskLevel as string,
        search: search as string,
      });

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const alertId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await controlTowerService.resolveAlert(alertId);

      res.json({
        success: true,
        data: result,
        message: 'Alert resolved successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const controlTowerController = new ControlTowerController();
