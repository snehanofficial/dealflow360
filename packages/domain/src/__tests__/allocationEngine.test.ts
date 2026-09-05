import { describe, it, expect } from 'vitest';
import {
  calculateAllocationPlan,
  validateFulfillmentOverrides,
  WarehouseStockSnapshot,
  LineRequirementInput,
} from '../fulfillment/allocationEngine.js';

describe('Allocation Engine - Pure Deterministic Domain Rules', () => {
  const stockItems: WarehouseStockSnapshot[] = [
    {
      warehouseId: 'wh-main',
      warehouseCode: 'WH-MAIN',
      warehouseName: 'Main Warehouse',
      priority: 1,
      isActive: true,
      productId: 'prod-laptop',
      onHandQuantity: 100,
      reservedQuantity: 40, // Available = 60
    },
    {
      warehouseId: 'wh-regional',
      warehouseCode: 'WH-REGIONAL',
      warehouseName: 'Regional Warehouse',
      priority: 2,
      isActive: true,
      productId: 'prod-laptop',
      onHandQuantity: 50,
      reservedQuantity: 10, // Available = 40
    },
    {
      warehouseId: 'wh-backup',
      warehouseCode: 'WH-BACKUP',
      warehouseName: 'Backup Warehouse',
      priority: 3,
      isActive: true,
      productId: 'prod-laptop',
      onHandQuantity: 20,
      reservedQuantity: 0, // Available = 20
    },
    {
      warehouseId: 'wh-inactive',
      warehouseCode: 'WH-INACTIVE',
      warehouseName: 'Inactive Warehouse',
      priority: 1,
      isActive: false,
      productId: 'prod-laptop',
      onHandQuantity: 200,
      reservedQuantity: 0,
    },
  ];

  it('Scenario 1: Single warehouse complete order fulfillment', () => {
    const lines: LineRequirementInput[] = [
      { quoteLineId: 'line-1', productId: 'prod-laptop', requestedQuantity: 50 },
    ];

    const plan = calculateAllocationPlan(lines, stockItems);

    expect(plan.isFullyFulfilled).toBe(true);
    expect(plan.totalRequested).toBe(50);
    expect(plan.totalAllocated).toBe(50);
    expect(plan.totalBackordered).toBe(0);
    expect(plan.lineResults[0].allocations).toHaveLength(1);
    expect(plan.lineResults[0].allocations[0].warehouseCode).toBe('WH-MAIN');
    expect(plan.lineResults[0].allocations[0].allocatedQuantity).toBe(50);
    expect(plan.lineResults[0].allocations[0].reasons).toContain('Single-warehouse complete order fulfillment');
  });

  it('Scenario 2: Multi-warehouse split allocation when single warehouse has insufficient stock', () => {
    const lines: LineRequirementInput[] = [
      { quoteLineId: 'line-1', productId: 'prod-laptop', requestedQuantity: 90 },
    ];

    const plan = calculateAllocationPlan(lines, stockItems);

    expect(plan.isFullyFulfilled).toBe(true);
    expect(plan.totalRequested).toBe(90);
    expect(plan.totalAllocated).toBe(90);
    expect(plan.totalBackordered).toBe(0);
    expect(plan.warehousesUsedCount).toBe(2);

    // Should allocate 60 from WH-MAIN (max avail) and 30 from WH-REGIONAL
    const allocMain = plan.lineResults[0].allocations.find((a) => a.warehouseCode === 'WH-MAIN');
    const allocReg = plan.lineResults[0].allocations.find((a) => a.warehouseCode === 'WH-REGIONAL');

    expect(allocMain?.allocatedQuantity).toBe(60);
    expect(allocReg?.allocatedQuantity).toBe(30);
  });

  it('Scenario 3: Partial backorder when total available stock is less than required', () => {
    const lines: LineRequirementInput[] = [
      { quoteLineId: 'line-1', productId: 'prod-laptop', requestedQuantity: 150 }, // Total avail = 60+40+20 = 120
    ];

    const plan = calculateAllocationPlan(lines, stockItems);

    expect(plan.isFullyFulfilled).toBe(false);
    expect(plan.totalRequested).toBe(150);
    expect(plan.totalAllocated).toBe(120);
    expect(plan.totalBackordered).toBe(30);
    expect(plan.lineResults[0].backorderedQuantity).toBe(30);
  });

  it('Scenario 4: Full backorder when no stock is available', () => {
    const emptyStock: WarehouseStockSnapshot[] = [
      {
        warehouseId: 'wh-main',
        warehouseCode: 'WH-MAIN',
        warehouseName: 'Main Warehouse',
        priority: 1,
        isActive: true,
        productId: 'prod-laptop',
        onHandQuantity: 50,
        reservedQuantity: 50, // Available = 0
      },
    ];

    const lines: LineRequirementInput[] = [
      { quoteLineId: 'line-1', productId: 'prod-laptop', requestedQuantity: 10 },
    ];

    const plan = calculateAllocationPlan(lines, emptyStock);

    expect(plan.isFullyFulfilled).toBe(false);
    expect(plan.totalRequested).toBe(10);
    expect(plan.totalAllocated).toBe(0);
    expect(plan.totalBackordered).toBe(10);
  });

  it('Scenario 5: Ignore inactive warehouses regardless of high stock levels', () => {
    const lines: LineRequirementInput[] = [
      { quoteLineId: 'line-1', productId: 'prod-laptop', requestedQuantity: 50 },
    ];

    const plan = calculateAllocationPlan(lines, stockItems);

    const inactiveAlloc = plan.lineResults[0].allocations.find((a) => a.warehouseCode === 'WH-INACTIVE');
    expect(inactiveAlloc).toBeUndefined();
  });

  it('Scenario 6: Server-side override validation enforces available = onHand - reserved', () => {
    const validOverrides = [
      { quoteLineId: 'line-1', warehouseId: 'wh-main', allocatedQuantity: 60 },
    ];
    const invalidOverrides = [
      { quoteLineId: 'line-1', warehouseId: 'wh-main', allocatedQuantity: 70 }, // 70 > 60 available
    ];

    const validRes = validateFulfillmentOverrides(validOverrides, stockItems);
    expect(validRes.isValid).toBe(true);

    const invalidRes = validateFulfillmentOverrides(invalidOverrides, stockItems);
    expect(invalidRes.isValid).toBe(false);
    expect(invalidRes.errors[0]).toContain('exceeds available stock');
  });
});
