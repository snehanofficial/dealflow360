import { describe, it, expect } from 'vitest';
import {
  computeFulfillmentPlan,
  InventoryItemStock,
  FulfillmentLineInput,
} from '../fulfillment/fulfillmentEngine.js';
import { validateFulfillmentOverrides, WarehouseStockSnapshot } from '../fulfillment/allocationEngine.js';

describe('fulfillmentEngine domain logic', () => {
  const stockItems: WarehouseStockSnapshot[] = [
    {
      warehouseId: 'wh-east',
      warehouseCode: 'WH-EAST',
      warehouseName: 'East Coast Distribution Center',
      productId: 'prod-01',
      onHandQuantity: 10,
      reservedQuantity: 0,
      isActive: true,
      priority: 1,
    },
    {
      warehouseId: 'wh-west',
      warehouseCode: 'WH-WEST',
      warehouseName: 'West Coast Hub',
      productId: 'prod-01',
      onHandQuantity: 20,
      reservedQuantity: 0,
      isActive: true,
      priority: 2,
    },
  ];

  it('allocates quantity from single largest warehouse to minimize split shipments', () => {
    const lines: FulfillmentLineInput[] = [
      { quoteLineId: 'line-01', productId: 'prod-01', requestedQuantity: 15 },
    ];

    const result = computeFulfillmentPlan(lines, stockItems as any);

    expect(result.isFullyFulfilled).toBe(true);
    expect(result.totalRequested).toBe(15);
    expect(result.totalAllocated).toBe(15);
    expect(result.totalBackordered).toBe(0);
    expect(result.shipmentCount).toBe(1);
    expect(result.lineResults[0].allocations).toHaveLength(1);
    expect(result.lineResults[0].allocations[0].warehouseCode).toBe('WH-WEST');
    expect(result.lineResults[0].allocations[0].allocatedQuantity).toBe(15);
  });

  it('splits allocation across warehouses when single warehouse stock is insufficient', () => {
    const lines: FulfillmentLineInput[] = [
      { quoteLineId: 'line-01', productId: 'prod-01', requestedQuantity: 25 },
    ];

    const result = computeFulfillmentPlan(lines, stockItems as any);

    expect(result.isFullyFulfilled).toBe(true);
    expect(result.totalAllocated).toBe(25);
    expect(result.shipmentCount).toBe(2);
    expect(result.lineResults[0].allocations).toHaveLength(2);
    expect(result.lineResults[0].allocations[0].allocatedQuantity).toBe(20);
    expect(result.lineResults[0].allocations[1].allocatedQuantity).toBe(5);
  });

  it('calculates backorder quantity when total inventory stock is insufficient', () => {
    const lines: FulfillmentLineInput[] = [
      { quoteLineId: 'line-01', productId: 'prod-01', requestedQuantity: 40 },
    ];

    const result = computeFulfillmentPlan(lines, stockItems as any);

    expect(result.isFullyFulfilled).toBe(false);
    expect(result.totalAllocated).toBe(30);
    expect(result.totalBackordered).toBe(10);
  });

  it('validates manual allocation overrides correctly', () => {
    const validOverrides = [
      { quoteLineId: 'line-01', warehouseId: 'wh-east', allocatedQuantity: 5 },
    ];
    const validRes = validateFulfillmentOverrides(validOverrides, stockItems);
    expect(validRes.isValid).toBe(true);

    const invalidOverrides = [
      { quoteLineId: 'line-01', warehouseId: 'wh-east', allocatedQuantity: 50 },
    ];
    const invalidRes = validateFulfillmentOverrides(invalidOverrides, stockItems);
    expect(invalidRes.isValid).toBe(false);
    expect(invalidRes.errors[0]).toContain('exceeds available stock');
  });
});
