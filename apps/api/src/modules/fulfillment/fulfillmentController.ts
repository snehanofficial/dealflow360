import { Request, Response, NextFunction } from 'express';
import { fulfillmentService } from './fulfillmentService.js';
import { warehouseService } from '../warehouse/warehouseService.js';
import {
  FulfillmentOverrideRequestSchema,
  FulfillmentConfirmRequestSchema,
  BackorderConfirmReallocationSchema,
} from '@dealflow360/contracts';
import { AppError } from '../../middleware/errorHandler.js';

export async function listWarehouses(req: Request, res: Response, next: NextFunction) {
  try {
    const warehouses = await warehouseService.listWarehouses();
    res.json({ success: true, data: warehouses });
  } catch (error) {
    next(error);
  }
}

export async function getFulfillmentPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const plan = await fulfillmentService.getFulfillmentPlan(id);
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
}

export async function computeFulfillment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const plan = await fulfillmentService.computeFulfillment(id);
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
}

export async function confirmFulfillment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const parsed = FulfillmentConfirmRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid allocation confirmation data', 400, parsed.error.format());
    }

    const result = await fulfillmentService.confirmFulfillment(id, parsed.data, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function shipAllocation(req: Request, res: Response, next: NextFunction) {
  try {
    const allocationId = req.params.allocationId as string;
    const result = await fulfillmentService.shipAllocation(allocationId, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function overrideFulfillment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const parsed = FulfillmentOverrideRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid allocation override data', 400, parsed.error.format());
    }

    const result = await fulfillmentService.overrideFulfillment(id, parsed.data, req.user);
    res.json({ success: true, data: result.createdAllocations || result });
  } catch (error) {
    next(error);
  }
}

export async function listBackorders(req: Request, res: Response, next: NextFunction) {
  try {
    const backorders = await fulfillmentService.listBackorders();
    res.json({ success: true, data: backorders });
  } catch (error) {
    next(error);
  }
}

export async function proposeBackorderReallocation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const proposal = await fulfillmentService.proposeBackorderReallocation(id);
    res.json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
}

export async function confirmBackorderReallocation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const parsed = BackorderConfirmReallocationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid backorder reallocation data', 400, parsed.error.format());
    }

    const result = await fulfillmentService.confirmBackorderReallocation(id, parsed.data, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
