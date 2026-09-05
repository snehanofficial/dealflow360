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
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  priority?: number;
  isActive?: boolean;
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
      .filter((s) => s.productId === line.productId && (s.availableQuantity ?? (s.onHandQuantity - s.reservedQuantity)) > 0)
      .sort((a, b) => (b.availableQuantity ?? (b.onHandQuantity - b.reservedQuantity)) - (a.availableQuantity ?? (a.onHandQuantity - a.reservedQuantity)));

    for (const stock of availableStock) {
      if (remainingQty <= 0) break;
      const currentAvail = stock.availableQuantity ?? Math.max(0, stock.onHandQuantity - stock.reservedQuantity);

      const allocQty = Math.min(remainingQty, currentAvail);
      if (allocQty > 0) {
        lineAllocations.push({
          warehouseId: stock.warehouseId,
          warehouseCode: stock.warehouseCode,
          warehouseName: stock.warehouseName,
          allocatedQuantity: allocQty,
        });

        stock.availableQuantity = currentAvail - allocQty;
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
