import { db, Warehouse, InventoryItem, InventoryMovement } from '@dealflow360/db';
import { WarehouseCreateInput, WarehouseUpdateInput, InventoryAdjustmentInput } from '@dealflow360/contracts';
import { AppError } from '../../middleware/errorHandler.js';
import { recordAuditEvent } from '../../services/auditService.js';

async function executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  if (typeof (db as any).$transaction === 'function') {
    const res = await (db as any).$transaction(fn);
    if (res !== undefined) return res;
  }
  return fn(db);
}

export class WarehouseService {
  async ensureWarehousesAndInventory(): Promise<Warehouse[]> {
    let warehouses = await db.warehouse.findMany({ where: { isActive: true }, orderBy: { priority: 'asc' } });

    if (warehouses.length === 0) {
      warehouses = await Promise.all([
        db.warehouse.create({
          data: { code: 'WH-EAST', name: 'East Coast Distribution Center', location: 'US-East', priority: 1 },
        }),
        db.warehouse.create({
          data: { code: 'WH-WEST', name: 'West Coast Logistics Hub', location: 'US-West', priority: 2 },
        }),
        db.warehouse.create({
          data: { code: 'WH-EU', name: 'EU Central Fulfillment Center', location: 'EU-Central', priority: 3 },
        }),
      ]);
    }

    const products = await db.product.findMany({ where: { isActive: true } });

    for (const wh of warehouses) {
      for (const prod of products) {
        const onHand = wh.code === 'WH-EAST' ? 100 : wh.code === 'WH-WEST' ? 150 : 80;
        await db.inventoryItem.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: wh.id,
              productId: prod.id,
            },
          },
          update: {},
          create: {
            warehouseId: wh.id,
            productId: prod.id,
            onHandQuantity: onHand,
            reservedQuantity: 0,
            availableQuantity: onHand,
          },
        });
      }
    }

    return warehouses;
  }

  async listWarehouses() {
    await this.ensureWarehousesAndInventory();
    const warehouses = await db.warehouse.findMany({
      orderBy: { priority: 'asc' },
      include: {
        inventory: {
          include: { product: true, productVariant: true },
        },
      },
    });

    return warehouses.map((wh: any) => ({
      ...wh,
      inventory: (wh.inventory || []).map((inv: any) => {
        const onHand = inv.onHandQuantity ?? 0;
        const reserved = inv.reservedQuantity ?? 0;
        return {
          ...inv,
          onHandQuantity: onHand,
          reservedQuantity: reserved,
          availableQuantity: inv.availableQuantity ?? Math.max(0, onHand - reserved),
        };
      }),
    }));
  }

  async getWarehouseById(id: string) {
    const warehouse = await db.warehouse.findUnique({
      where: { id },
      include: {
        inventory: {
          include: { product: true, productVariant: true },
        },
        movements: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: { product: true },
        },
      },
    });

    if (!warehouse) {
      throw new AppError('NOT_FOUND', `Warehouse with ID ${id} not found`, 404);
    }

    return {
      ...warehouse,
      inventory: warehouse.inventory.map((inv) => ({
        ...inv,
        availableQuantity: Math.max(0, inv.onHandQuantity - inv.reservedQuantity),
      })),
    };
  }

  async createWarehouse(input: WarehouseCreateInput, actor?: { id?: string; name?: string; role?: any }) {
    const existing = await db.warehouse.findUnique({ where: { code: input.code } });
    if (existing) {
      throw new AppError('CONFLICT', `Warehouse code ${input.code} already exists`, 409);
    }

    const warehouse = await db.warehouse.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
        location: input.location,
        priority: input.priority,
        isActive: input.isActive,
      },
    });

    // Populate default inventory rows for active products
    const products = await db.product.findMany({ where: { isActive: true } });
    for (const prod of products) {
      await db.inventoryItem.create({
        data: {
          warehouseId: warehouse.id,
          productId: prod.id,
          onHandQuantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
        },
      });
    }

    await recordAuditEvent({
      eventType: 'WAREHOUSE_CREATED',
      action: `Created warehouse ${warehouse.name} (${warehouse.code})`,
      entityType: 'Warehouse',
      entityId: warehouse.id,
      actor,
      newState: warehouse,
    });

    return warehouse;
  }

  async updateWarehouse(id: string, input: WarehouseUpdateInput, actor?: { id?: string; name?: string; role?: any }) {
    const existing = await db.warehouse.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('NOT_FOUND', `Warehouse with ID ${id} not found`, 404);
    }

    if (input.code && input.code !== existing.code) {
      const codeCheck = await db.warehouse.findUnique({ where: { code: input.code } });
      if (codeCheck) {
        throw new AppError('CONFLICT', `Warehouse code ${input.code} already exists`, 409);
      }
    }

    const updated = await db.warehouse.update({
      where: { id },
      data: input,
    });

    await recordAuditEvent({
      eventType: 'WAREHOUSE_UPDATED',
      action: `Updated warehouse ${updated.name} (${updated.code})`,
      entityType: 'Warehouse',
      entityId: updated.id,
      actor,
      previousState: existing,
      newState: updated,
    });

    return updated;
  }

  async getInventoryStock() {
    await this.ensureWarehousesAndInventory();
    const items = await db.inventoryItem.findMany({
      include: {
        warehouse: true,
        product: true,
        productVariant: true,
      },
      orderBy: [{ warehouse: { priority: 'asc' } }, { product: { name: 'asc' } }],
    });

    return items.map((item) => ({
      ...item,
      availableQuantity: Math.max(0, item.onHandQuantity - item.reservedQuantity),
    }));
  }

  async getInventoryMovements(warehouseId?: string, productId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;

    return db.inventoryMovement.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        warehouse: true,
        product: true,
        productVariant: true,
      },
    });
  }

  async adjustInventory(input: InventoryAdjustmentInput, actor?: { id?: string; name?: string; role?: any }) {
    await this.ensureWarehousesAndInventory();

    const { warehouseId, productId, productVariantId, quantity, movementType, reason } = input;

    const result = await executeTransaction(async (tx: any) => {
      const item = await tx.inventoryItem.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId,
          },
        },
        include: { warehouse: true, product: true },
      });

      if (!item) {
        throw new AppError('NOT_FOUND', `Inventory item for product ${productId} in warehouse ${warehouseId} not found`, 404);
      }

      const onHandBefore = item.onHandQuantity;
      const reservedBefore = item.reservedQuantity;
      let onHandAfter = onHandBefore;
      let reservedAfter = reservedBefore;

      if (movementType === 'RECEIPT' || movementType === 'RETURN' || movementType === 'TRANSFER_IN') {
        onHandAfter += Math.abs(quantity);
      } else if (movementType === 'ADJUSTMENT') {
        onHandAfter = Math.max(0, onHandBefore + quantity);
      } else if (movementType === 'SHIPMENT') {
        onHandAfter = Math.max(0, onHandBefore - Math.abs(quantity));
        reservedAfter = Math.max(0, reservedBefore - Math.abs(quantity));
      } else if (movementType === 'RESERVATION') {
        reservedAfter += Math.abs(quantity);
      } else if (movementType === 'RESERVATION_RELEASE') {
        reservedAfter = Math.max(0, reservedBefore - Math.abs(quantity));
      }

      const availableAfter = Math.max(0, onHandAfter - reservedAfter);

      const updatedItem = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          onHandQuantity: onHandAfter,
          reservedQuantity: reservedAfter,
          availableQuantity: availableAfter,
        },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          warehouseId,
          productId,
          productVariantId,
          movementType: movementType as any,
          quantity,
          onHandBefore,
          onHandAfter,
          reservedBefore,
          reservedAfter,
          reason,
          actorId: actor?.id,
          actorName: actor?.name,
        },
      });

      return { updatedItem, movement, item };
    });

    await recordAuditEvent({
      eventType: 'INVENTORY_ADJUSTED',
      action: `Adjusted inventory for ${result.item.product.name} at ${result.item.warehouse.name} (${movementType}: ${quantity})`,
      entityType: 'InventoryItem',
      entityId: result.updatedItem.id,
      actor,
      newState: {
        onHandQuantity: result.updatedItem.onHandQuantity,
        reservedQuantity: result.updatedItem.reservedQuantity,
        availableQuantity: Math.max(0, result.updatedItem.onHandQuantity - result.updatedItem.reservedQuantity),
      },
    });

    return {
      inventoryItem: {
        ...result.updatedItem,
        availableQuantity: Math.max(0, result.updatedItem.onHandQuantity - result.updatedItem.reservedQuantity),
      },
      movement: result.movement,
    };
  }
}

export const warehouseService = new WarehouseService();
