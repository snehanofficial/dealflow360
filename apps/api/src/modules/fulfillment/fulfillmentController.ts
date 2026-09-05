import { Request, Response, NextFunction } from 'express';
import { QuoteIdParamSchema, FulfillmentOverrideRequestSchema } from '@dealflow360/contracts';
import { fulfillmentService } from './fulfillmentService.js';

export async function computeFulfillment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = QuoteIdParamSchema.parse(req.params);

    const plan = await fulfillmentService.computeFulfillment(id);

    res.json({
      success: true,
      data: plan,
      message: 'Fulfillment allocation plan computed successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function overrideFulfillment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = QuoteIdParamSchema.parse(req.params);
    const body = FulfillmentOverrideRequestSchema.parse(req.body);

    const result = await fulfillmentService.overrideFulfillment(id, body);

    res.json({
      success: true,
      data: result.allocations,
      message: result.message,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFulfillmentPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = QuoteIdParamSchema.parse(req.params);

    const plan = await fulfillmentService.getFulfillmentPlan(id);

    res.json({
      success: true,
      data: plan,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function listWarehouses(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const warehouses = await fulfillmentService.listWarehouses();

    res.json({
      success: true,
      data: warehouses,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}
