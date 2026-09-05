import { Request, Response, NextFunction } from 'express';
import { warehouseService } from './warehouseService.js';
import { WarehouseCreateSchema, WarehouseUpdateSchema, InventoryAdjustmentSchema } from '@dealflow360/contracts';
import { AppError } from '../../middleware/errorHandler.js';

export async function listWarehouses(req: Request, res: Response, next: NextFunction) {
  try {
    const warehouses = await warehouseService.listWarehouses();
    res.json({ success: true, data: warehouses });
  } catch (error) {
    next(error);
  }
}

export async function getWarehouseById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const warehouse = await warehouseService.getWarehouseById(id);
    res.json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
}

export async function createWarehouse(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = WarehouseCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid warehouse data', 400, parsed.error.format());
    }

    const warehouse = await warehouseService.createWarehouse(parsed.data, req.user);
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
}

export async function updateWarehouse(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const parsed = WarehouseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid warehouse update data', 400, parsed.error.format());
    }

    const warehouse = await warehouseService.updateWarehouse(id, parsed.data, req.user);
    res.json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
}

export async function getInventoryStock(req: Request, res: Response, next: NextFunction) {
  try {
    const stock = await warehouseService.getInventoryStock();
    res.json({ success: true, data: stock });
  } catch (error) {
    next(error);
  }
}

export async function getInventoryMovements(req: Request, res: Response, next: NextFunction) {
  try {
    const warehouseId = req.query.warehouseId as string | undefined;
    const productId = req.query.productId as string | undefined;
    const movements = await warehouseService.getInventoryMovements(warehouseId, productId);
    res.json({ success: true, data: movements });
  } catch (error) {
    next(error);
  }
}

export async function adjustInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = InventoryAdjustmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid inventory adjustment data', 400, parsed.error.format());
    }

    const result = await warehouseService.adjustInventory(parsed.data, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
