import { Request, Response, NextFunction } from 'express';
import { billingService } from './billingService.js';

export class BillingController {
  async getBillingSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id || (req.query.quoteId as string) || '';
      const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;

      const result = await billingService.getBillingScheduleForQuote(quotationId, startDate);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async generateBillingSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id || '';
      const { billingStartDate } = req.body || {};
      const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : null;
      const result = await billingService.generateAndSaveBillingSchedule(
        quotationId,
        typeof billingStartDate === 'string' ? billingStartDate : undefined,
        actor,
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async completeBilling(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id || '';
      const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : null;
      const result = await billingService.completeBillingAndMarkQuoteCompleted(quotationId, actor);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const billingController = new BillingController();
