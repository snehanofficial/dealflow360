import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
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
warehouseRoutes.get('/warehouses', requirePermission(Permissions.WAREHOUSE_VIEW), listWarehouses);
warehouseRoutes.get('/warehouses/:id', requirePermission(Permissions.WAREHOUSE_VIEW), getWarehouseById);
warehouseRoutes.post('/warehouses', requirePermission(Permissions.WAREHOUSE_MANAGE), createWarehouse);
warehouseRoutes.patch('/warehouses/:id', requirePermission(Permissions.WAREHOUSE_MANAGE), updateWarehouse);

// Inventory & Movements endpoints
warehouseRoutes.get('/inventory', requirePermission(Permissions.INVENTORY_VIEW), getInventoryStock);
warehouseRoutes.get('/inventory/movements', requirePermission(Permissions.INVENTORY_VIEW), getInventoryMovements);
warehouseRoutes.post('/inventory/adjustments', requirePermission(Permissions.INVENTORY_MANAGE), adjustInventory);

