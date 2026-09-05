import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import {
  listWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getInventoryStock,
  getInventoryMovements,
  adjustInventory,
} from './warehouseController.js';

export const warehouseRoutes: Router = Router();

warehouseRoutes.use(authenticate);

// Warehouse endpoints
warehouseRoutes.get('/warehouses', listWarehouses);
warehouseRoutes.get('/warehouses/:id', getWarehouseById);
warehouseRoutes.post('/warehouses', requireRole(['ADMIN', 'FINANCE_OPERATIONS']), createWarehouse);
warehouseRoutes.patch('/warehouses/:id', requireRole(['ADMIN', 'FINANCE_OPERATIONS']), updateWarehouse);

// Inventory & Movements endpoints
warehouseRoutes.get('/inventory', getInventoryStock);
warehouseRoutes.get('/inventory/movements', getInventoryMovements);
warehouseRoutes.post('/inventory/adjustments', requireRole(['ADMIN', 'FINANCE', 'FINANCE_OPERATIONS', 'SALES_MANAGER', 'SALES_REP']), adjustInventory);
