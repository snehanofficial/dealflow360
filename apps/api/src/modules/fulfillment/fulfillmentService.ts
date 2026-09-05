import { db, Warehouse, InventoryItem, FulfillmentAllocation, QuoteLine, Product } from '@dealflow360/db';
import {
  computeFulfillmentPlan,
  validateFulfillmentOverrides,
  OverallFulfillmentResult,
  InventoryItemStock,
} from '@dealflow360/domain';
import { FulfillmentOverrideInput } from '@dealflow360/contracts';
import { AppError } from '../../middleware/errorHandler.js';

export class FulfillmentService {
  async ensureWarehousesAndInventory(): Promise<Warehouse[]> {
    let warehouses = await db.warehouse.findMany({ where: { isActive: true } });

    if (warehouses.length === 0) {
      warehouses = await Promise.all([
        db.warehouse.create({
          data: { code: 'WH-EAST', name: 'East Coast Distribution Center', location: 'US-East' },
        }),
        db.warehouse.create({
          data: { code: 'WH-WEST', name: 'West Coast Logistics Hub', location: 'US-West' },
        }),
        db.warehouse.create({
          data: { code: 'WH-EU', name: 'EU Central Fulfillment Center', location: 'EU-Central' },
        }),
      ]);
    }

    const products = await db.product.findMany({ where: { isActive: true } });

    for (const wh of warehouses) {
      for (const prod of products) {
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
            availableQuantity: wh.code === 'WH-EAST' ? 100 : wh.code === 'WH-WEST' ? 150 : 80,
            reservedQuantity: 0,
          },
        });
      }
    }

    return warehouses;
  }

  async listWarehouses() {
    await this.ensureWarehousesAndInventory();
    return db.warehouse.findMany({
      where: { isActive: true },
      include: {
        inventory: {
          include: { product: true },
        },
      },
    });
  }

  async getInventoryStockForQuote(quotationId: string): Promise<InventoryItemStock[]> {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { lines: true },
    });

    if (!quotation) {
      throw new AppError('NOT_FOUND', `Quotation ${quotationId} not found`, 404);
    }

    await this.ensureWarehousesAndInventory();

    const productIds = quotation.lines.map((l) => l.productId);

    const inventoryItems = await db.inventoryItem.findMany({
      where: {
        productId: { in: productIds },
        warehouse: { isActive: true },
      },
      include: { warehouse: true },
    });

    return inventoryItems.map((item) => ({
      warehouseId: item.warehouseId,
      warehouseCode: item.warehouse.code,
      warehouseName: item.warehouse.name,
      productId: item.productId,
      availableQuantity: item.availableQuantity,
    }));
  }

  async computeFulfillment(quotationId: string): Promise<OverallFulfillmentResult> {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { lines: true },
    });

    if (!quotation) {
      throw new AppError('NOT_FOUND', `Quotation ${quotationId} not found`, 404);
    }

    const stockItems = await this.getInventoryStockForQuote(quotationId);

    const linesInput = quotation.lines.map((l) => ({
      quoteLineId: l.id,
      productId: l.productId,
      requestedQuantity: l.quantity,
    }));

    return computeFulfillmentPlan(linesInput, stockItems);
  }

  async overrideFulfillment(
    quotationId: string,
    input: FulfillmentOverrideInput,
  ): Promise<{ message: string; allocations: FulfillmentAllocation[] }> {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { lines: true },
    });

    if (!quotation) {
      throw new AppError('NOT_FOUND', `Quotation ${quotationId} not found`, 404);
    }

    const stockItems = await this.getInventoryStockForQuote(quotationId);

    const validation = validateFulfillmentOverrides(input.overrides, stockItems);

    if (!validation.isValid) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Fulfillment allocation override failed: ${validation.errors.join('; ')}`,
        400,
        { errors: validation.errors },
      );
    }

    // Delete existing allocations for quote
    await db.fulfillmentAllocation.deleteMany({
      where: { quotationId },
    });

    // Create new persisted allocations
    const createdAllocations = await Promise.all(
      input.overrides.map((override) =>
        db.fulfillmentAllocation.create({
          data: {
            quotationId,
            quoteLineId: override.quoteLineId,
            warehouseId: override.warehouseId,
            allocatedQuantity: override.allocatedQuantity,
            isOverride: true,
          },
        }),
      ),
    );

    // Update quote status to FULFILLMENT
    await db.quotation.update({
      where: { id: quotationId },
      data: { status: 'FULFILLMENT' },
    });

    return {
      message: 'Fulfillment allocation override plan saved successfully.',
      allocations: createdAllocations,
    };
  }

  async getFulfillmentPlan(quotationId: string) {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        lines: {
          include: { product: true },
        },
        fulfillmentAllocations: {
          include: { warehouse: true },
        },
      },
    });

    if (!quotation) {
      throw new AppError('NOT_FOUND', `Quotation ${quotationId} not found`, 404);
    }

    const stockItems = await this.getInventoryStockForQuote(quotationId);
    const computedPlan = await this.computeFulfillment(quotationId);

    return {
      quotation,
      computedPlan,
      persistedAllocations: quotation.fulfillmentAllocations,
      availableStock: stockItems,
    };
  }
}

export const fulfillmentService = new FulfillmentService();
