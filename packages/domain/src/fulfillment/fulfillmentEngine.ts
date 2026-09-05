export interface FulfillmentLineInput {
  quoteLineId: string;
  productId: string;
  requestedQuantity: number;
}

export interface InventoryItemStock {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  productId: string;
  availableQuantity: number;
}

export interface LineWarehouseAllocation {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  allocatedQuantity: number;
}

export interface LineFulfillmentResult {
  quoteLineId: string;
  productId: string;
  requestedQuantity: number;
  totalAllocated: number;
  backorderedQuantity: number;
  isFullyFulfilled: boolean;
  allocations: LineWarehouseAllocation[];
}

export interface OverallFulfillmentResult {
  lineResults: LineFulfillmentResult[];
  totalRequested: number;
  totalAllocated: number;
  totalBackordered: number;
  shipmentCount: number;
  isFullyFulfilled: boolean;
}

export interface ManualOverrideItem {
  quoteLineId: string;
  warehouseId: string;
  allocatedQuantity: number;
}

/**
 * Computes deterministic multi-warehouse fulfillment allocation plan.
 * Heuristic: Sorts warehouses by available stock descending to minimize split shipments.
 * Enforces principle: allocated quantity <= available quantity.
 */
export function computeFulfillmentPlan(
  lines: FulfillmentLineInput[],
  stockItems: InventoryItemStock[],
): OverallFulfillmentResult {
  const lineResults: LineFulfillmentResult[] = [];
  let totalRequested = 0;
  let totalAllocated = 0;
  let totalBackordered = 0;
  const activeWarehouses = new Set<string>();

  // Clone stock map so allocation updates don't mutate external state during loop
  const stockMap = new Map<string, InventoryItemStock>(
    stockItems.map((item) => [`${item.warehouseId}_${item.productId}`, { ...item }]),
  );

  for (const line of lines) {
    const reqQty = Math.max(line.requestedQuantity, 0);
    totalRequested += reqQty;
    let remainingQty = reqQty;
    const lineAllocations: LineWarehouseAllocation[] = [];

    // Find all stock entries for this product
    const availableStock = Array.from(stockMap.values())
      .filter((s) => s.productId === line.productId && s.availableQuantity > 0)
      .sort((a, b) => b.availableQuantity - a.availableQuantity);

    for (const stock of availableStock) {
      if (remainingQty <= 0) break;

      const allocQty = Math.min(remainingQty, stock.availableQuantity);
      if (allocQty > 0) {
        lineAllocations.push({
          warehouseId: stock.warehouseId,
          warehouseCode: stock.warehouseCode,
          warehouseName: stock.warehouseName,
          allocatedQuantity: allocQty,
        });

        stock.availableQuantity -= allocQty;
        remainingQty -= allocQty;
        activeWarehouses.add(stock.warehouseId);
      }
    }

    const lineTotalAllocated = reqQty - remainingQty;
    totalAllocated += lineTotalAllocated;
    totalBackordered += remainingQty;

    lineResults.push({
      quoteLineId: line.quoteLineId,
      productId: line.productId,
      requestedQuantity: reqQty,
      totalAllocated: lineTotalAllocated,
      backorderedQuantity: remainingQty,
      isFullyFulfilled: remainingQty === 0,
      allocations: lineAllocations,
    });
  }

  return {
    lineResults,
    totalRequested,
    totalAllocated,
    totalBackordered,
    shipmentCount: activeWarehouses.size,
    isFullyFulfilled: totalBackordered === 0,
  };
}

/**
 * Validates manual user fulfillment overrides server-side.
 * Ensures: allocatedQuantity >= 0 and allocatedQuantity <= availableQuantity.
 */
export function validateFulfillmentOverrides(
  overrides: ManualOverrideItem[],
  stockItems: InventoryItemStock[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const override of overrides) {
    if (override.allocatedQuantity < 0) {
      errors.push(
        `Invalid negative allocation quantity (${override.allocatedQuantity}) for line ${override.quoteLineId}`,
      );
      continue;
    }

    const stockKey = Array.from(stockItems.values()).find(
      (s) => s.warehouseId === override.warehouseId,
    );

    if (!stockKey) {
      errors.push(`Warehouse ${override.warehouseId} not found in inventory stock`);
      continue;
    }

    if (override.allocatedQuantity > stockKey.availableQuantity) {
      errors.push(
        `Allocated quantity (${override.allocatedQuantity}) exceeds available stock (${stockKey.availableQuantity}) at warehouse ${stockKey.warehouseCode}`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
