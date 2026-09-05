export * from './allocationEngine.js';
export {
  computeFulfillmentPlan,
  type FulfillmentLineInput,
  type InventoryItemStock,
  type OverallFulfillmentResult,
} from './fulfillmentEngine.js';

export interface WarehouseAllocation {
  warehouseId: string;
  quantity: number;
}
