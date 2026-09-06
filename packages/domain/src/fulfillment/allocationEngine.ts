export interface LineRequirementInput {
  quoteLineId: string;
  productId: string;
  productVariantId?: string;
  productName?: string;
  sku?: string;
  requestedQuantity: number;
  billingType?: string;
}

export interface WarehouseStockSnapshot {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  priority: number;
  isActive: boolean;
  productId: string;
  productVariantId?: string;
  onHandQuantity: number;
  reservedQuantity: number;
}

export interface AllocatedLineDetail {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  allocatedQuantity: number;
  reasons: string[];
}

export interface LineAllocationResult {
  quoteLineId: string;
  productId: string;
  productVariantId?: string;
  requestedQuantity: number;
  totalAllocated: number;
  backorderedQuantity: number;
  isFullyFulfilled: boolean;
  allocations: AllocatedLineDetail[];
}

export interface OverallAllocationPlan {
  lineResults: LineAllocationResult[];
  totalRequested: number;
  totalAllocated: number;
  totalBackordered: number;
  warehousesUsedCount: number;
  isFullyFulfilled: boolean;
  summaryExplanation: string[];
}

export interface ManualOverrideItem {
  quoteLineId: string;
  warehouseId: string;
  allocatedQuantity: number;
}

/**
 * Pure, framework-independent allocation engine for DealFlow360.
 *
 * Priority order:
 * 1. Active / eligible warehouses only
 * 2. Maximize fulfillable quantity
 * 3. Prefer complete-order single-warehouse fulfillment
 * 4. Minimize number of warehouse split shipments
 * 5. Warehouse priority (1 = top priority, 2, 3...)
 * 6. Available stock (onHand - reserved)
 * 7. Alphabetical warehouse code tie-breaker
 */
export function calculateAllocationPlan(
  lines: LineRequirementInput[],
  stockSnapshots: WarehouseStockSnapshot[],
): OverallAllocationPlan {
  const lineResults: LineAllocationResult[] = [];
  let totalRequested = 0;
  let totalAllocated = 0;
  let totalBackordered = 0;
  const activeWarehousesUsed = new Set<string>();
  const summaryExplanation: string[] = [];

  // Filter out inactive warehouses & compute available quantity invariant (onHand - reserved)
  const activeStock = stockSnapshots
    .filter((s) => s.isActive)
    .map((s) => ({
      ...s,
      availableQuantity: Math.max(0, s.onHandQuantity - s.reservedQuantity),
    }));

  // Create mutable working copy of stock levels for sequential allocation
  const workingStockMap = new Map<string, number>();
  for (const s of activeStock) {
    const key = `${s.warehouseId}_${s.productId}_${s.productVariantId || 'default'}`;
    workingStockMap.set(key, s.availableQuantity);
  }

  const getAvailableStock = (whId: string, prodId: string, varId?: string) => {
    const key = `${whId}_${prodId}_${varId || 'default'}`;
    return workingStockMap.get(key) || 0;
  };

  const updateWorkingStock = (whId: string, prodId: string, varId: string | undefined, delta: number) => {
    const key = `${whId}_${prodId}_${varId || 'default'}`;
    const current = workingStockMap.get(key) || 0;
    workingStockMap.set(key, Math.max(0, current - delta));
  };

  // Group unique warehouses
  const warehouseMap = new Map<string, { id: string; code: string; name: string; priority: number }>();
  for (const s of activeStock) {
    if (!warehouseMap.has(s.warehouseId)) {
      warehouseMap.set(s.warehouseId, {
        id: s.warehouseId,
        code: s.warehouseCode,
        name: s.warehouseName,
        priority: s.priority ?? 10,
      });
    }
  }

  const uniqueWarehouses = Array.from(warehouseMap.values());

  // Check Factor 3: Is there a SINGLE warehouse that can fulfill 100% of ALL lines?
  let completeOrderWarehouse: { id: string; code: string; name: string; priority: number } | null = null;

  const eligibleCompleteWarehouses = uniqueWarehouses.filter((wh) => {
    return lines.every((line) => {
      const avail = getAvailableStock(wh.id, line.productId, line.productVariantId);
      return avail >= line.requestedQuantity;
    });
  });

  if (eligibleCompleteWarehouses.length > 0) {
    // Sort complete warehouses by Priority ASC (1 > 2), then total available stock DESC, then Code ASC
    eligibleCompleteWarehouses.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const stockA = lines.reduce(
        (sum, l) => sum + getAvailableStock(a.id, l.productId, l.productVariantId),
        0,
      );
      const stockB = lines.reduce(
        (sum, l) => sum + getAvailableStock(b.id, l.productId, l.productVariantId),
        0,
      );
      if (stockB !== stockA) return stockB - stockA;
      return a.code.localeCompare(b.code);
    });

    completeOrderWarehouse = eligibleCompleteWarehouses[0];
    summaryExplanation.push(
      `Selected ${completeOrderWarehouse.name} (${completeOrderWarehouse.code}) for complete single-warehouse fulfillment (Priority ${completeOrderWarehouse.priority}).`,
    );
  }

  // Perform Line-by-Line Allocation
  for (const line of lines) {
    const reqQty = Math.max(0, line.requestedQuantity);
    totalRequested += reqQty;

    // Recurring subscription / digital lines do not require physical warehouse stock allocation
    if (line.billingType === 'RECURRING') {
      lineResults.push({
        quoteLineId: line.quoteLineId,
        productId: line.productId,
        productVariantId: line.productVariantId,
        requestedQuantity: reqQty,
        totalAllocated: reqQty,
        backorderedQuantity: 0,
        isFullyFulfilled: true,
        allocations: [
          {
            warehouseId: 'DIGITAL_FULFILLMENT',
            warehouseCode: 'DIGITAL',
            warehouseName: 'Digital Subscription Service',
            allocatedQuantity: reqQty,
            reasons: ['Recurring subscription service (Auto-fulfilled digitally, no physical warehouse stock required)'],
          },
        ],
      });
      totalAllocated += reqQty;
      continue;
    }

    let remainingQty = reqQty;
    const lineAllocations: AllocatedLineDetail[] = [];

    if (completeOrderWarehouse && reqQty > 0) {
      const avail = getAvailableStock(completeOrderWarehouse.id, line.productId, line.productVariantId);
      const allocQty = Math.min(remainingQty, avail);

      if (allocQty > 0) {
        lineAllocations.push({
          warehouseId: completeOrderWarehouse.id,
          warehouseCode: completeOrderWarehouse.code,
          warehouseName: completeOrderWarehouse.name,
          allocatedQuantity: allocQty,
          reasons: [
            'Single-warehouse complete order fulfillment',
            `Priority ${completeOrderWarehouse.priority} warehouse`,
            `Available stock: ${avail}`,
            'No split shipment required',
          ],
        });
        updateWorkingStock(completeOrderWarehouse.id, line.productId, line.productVariantId, allocQty);
        remainingQty -= allocQty;
        activeWarehousesUsed.add(completeOrderWarehouse.id);
      }
    } else if (reqQty > 0) {
      // Find candidate warehouses with available stock for this line
      const candidates = activeStock
        .filter((s) => s.productId === line.productId && (s.productVariantId || undefined) === (line.productVariantId || undefined))
        .map((s) => ({
          ...s,
          availableQuantity: getAvailableStock(s.warehouseId, s.productId, s.productVariantId),
        }))
        .filter((s) => s.availableQuantity > 0);

      // Sort candidates deterministically:
      // 1. Fulfillable Qty DESC
      // 2. Priority ASC
      // 3. Available Stock DESC
      // 4. Warehouse Code ASC
      candidates.sort((a, b) => {
        const allocA = Math.min(remainingQty, a.availableQuantity);
        const allocB = Math.min(remainingQty, b.availableQuantity);
        if (allocB !== allocA) return allocB - allocA;
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (b.availableQuantity !== a.availableQuantity) return b.availableQuantity - a.availableQuantity;
        return a.warehouseCode.localeCompare(b.warehouseCode);
      });

      for (const candidate of candidates) {
        if (remainingQty <= 0) break;
        const currentAvail = getAvailableStock(candidate.warehouseId, line.productId, line.productVariantId);
        const allocQty = Math.min(remainingQty, currentAvail);

        if (allocQty > 0) {
          const isSplit = lineAllocations.length > 0;
          lineAllocations.push({
            warehouseId: candidate.warehouseId,
            warehouseCode: candidate.warehouseCode,
            warehouseName: candidate.warehouseName,
            allocatedQuantity: allocQty,
            reasons: [
              isSplit ? 'Multi-warehouse split shipment allocation' : 'Primary warehouse allocation',
              `Priority ${candidate.priority} warehouse`,
              `Available stock: ${currentAvail}`,
              allocQty === reqQty ? 'Satisfies line requirement' : `Fulfills partial line quantity (${allocQty}/${reqQty})`,
            ],
          });

          updateWorkingStock(candidate.warehouseId, line.productId, line.productVariantId, allocQty);
          remainingQty -= allocQty;
          activeWarehousesUsed.add(candidate.warehouseId);
        }
      }
    }

    const lineAllocated = reqQty - remainingQty;
    totalAllocated += lineAllocated;
    totalBackordered += remainingQty;

    lineResults.push({
      quoteLineId: line.quoteLineId,
      productId: line.productId,
      productVariantId: line.productVariantId,
      requestedQuantity: reqQty,
      totalAllocated: lineAllocated,
      backorderedQuantity: remainingQty,
      isFullyFulfilled: remainingQty === 0,
      allocations: lineAllocations,
    });
  }

  if (activeWarehousesUsed.size > 1) {
    summaryExplanation.push(
      `Order requires split shipment across ${activeWarehousesUsed.size} warehouses to fulfill requested quantities.`,
    );
  }

  if (totalBackordered > 0) {
    summaryExplanation.push(
      `Stock deficit of ${totalBackordered} units created as backorder allocations.`,
    );
  }

  return {
    lineResults,
    totalRequested,
    totalAllocated,
    totalBackordered,
    warehousesUsedCount: activeWarehousesUsed.size,
    isFullyFulfilled: totalBackordered === 0,
    summaryExplanation,
  };
}

/**
 * Validates manual allocation overrides server-side.
 * Enforces availableQuantity = onHandQuantity - reservedQuantity invariant.
 */
export function validateFulfillmentOverrides(
  overrides: ManualOverrideItem[],
  stockSnapshots: WarehouseStockSnapshot[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const override of overrides) {
    if (override.allocatedQuantity < 0) {
      errors.push(`Invalid negative allocation quantity (${override.allocatedQuantity}) for line ${override.quoteLineId}`);
      continue;
    }

    const stock = stockSnapshots.find((s) => s.warehouseId === override.warehouseId);
    if (!stock) {
      errors.push(`Warehouse ${override.warehouseId} not found in inventory stock`);
      continue;
    }

    if (!stock.isActive) {
      errors.push(`Cannot allocate to inactive warehouse ${stock.warehouseName} (${stock.warehouseCode})`);
      continue;
    }

    const available = Math.max(0, stock.onHandQuantity - stock.reservedQuantity);
    if (override.allocatedQuantity > available) {
      errors.push(
        `Allocated quantity (${override.allocatedQuantity}) exceeds available stock (${available}) at warehouse ${stock.warehouseCode} (On-Hand: ${stock.onHandQuantity}, Reserved: ${stock.reservedQuantity})`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
