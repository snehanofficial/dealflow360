# Implementation Prompt: Developer B — Phase B3 Multi-Warehouse Fulfillment & Splitting

## 1. Goal
Implement Phase B3 of Developer B's vertical slice in DealFlow360:
- Add `Warehouse`, `InventoryItem`, and `FulfillmentAllocation` models to Prisma schema.
- Implement multi-warehouse split-allocation algorithm in `packages/domain/src/fulfillment/fulfillmentEngine.ts`.
- Implement REST API endpoints:
  - `POST /api/v1/quotes/:id/fulfillment/compute` (Calculate recommended split allocation plan).
  - `POST /api/v1/quotes/:id/fulfillment/override` (Save manual user allocation overrides with server-side inventory validation).
  - `GET /api/v1/quotes/:id/fulfillment` (Retrieve persisted allocation plan & stock levels).
  - `GET /api/v1/fulfillment/warehouses` (List warehouses & inventory balances).
- Build responsive `FulfillmentAllocationPage` UI with visual warehouse splits, manual allocation sliders/inputs, backorder warnings, and plan confirmation.
- Write unit and Supertest integration tests for fulfillment allocation logic and override validation.

## 2. Relevant Skills Read
- `skills/domain/SKILL.md`
- `skills/frontend/SKILL.md`
- `skills/prisma/SKILL.md`
- `skills/testing/SKILL.md`

## 3. Code & Config Inspected
- `docs/09_DEVELOPER_B.md`
- `packages/db/prisma/schema.prisma`
- `packages/domain/src/fulfillment/index.ts`
- `apps/api/src/app.ts`
- `apps/web/src/routes/AppRoutes.tsx`

## 4. Decisions and Assumptions
- Inventory availability is strictly enforced: `allocated quantity <= available quantity`.
- Fulfillment heuristic prioritizes warehouses with highest available stock for each line item to minimize split shipments.
- If total stock across all warehouses is less than requested quote line quantity, unallocated quantity is marked as `backorderedQuantity`.
- Manual overrides require server validation: requested allocations cannot exceed warehouse stock or quote line quantities.
- Persisting a fulfillment plan updates quotation status to `FULFILLMENT`.
- Responsive UI supports viewports from 360px (mobile) to 4K displays.

## 5. Expected Files to Change
- `packages/db/prisma/schema.prisma` (Add `Warehouse`, `InventoryItem`, and `FulfillmentAllocation` models)
- `packages/contracts/src/fulfillment/index.ts` (Zod schemas for fulfillment compute and override inputs)
- `packages/contracts/src/index.ts` (Export fulfillment contracts)
- `packages/domain/src/fulfillment/fulfillmentEngine.ts` (Pure split-allocation algorithm and validation)
- `packages/domain/src/__tests__/fulfillmentEngine.test.ts` (Domain unit tests)
- `apps/api/src/modules/fulfillment/fulfillmentService.ts` (Fulfillment persistence & calculation orchestration)
- `apps/api/src/modules/fulfillment/fulfillmentController.ts` (HTTP handlers for fulfillment endpoints)
- `apps/api/src/routes/fulfillmentRoutes.ts` (REST route definitions for `/api/v1/fulfillment` and `/api/v1/quotes/:id/fulfillment`)
- `apps/api/src/app.ts` (Mount fulfillment routes)
- `apps/api/src/__tests__/fulfillment.test.ts` (Supertest integration tests)
- `apps/web/src/features/fulfillment/FulfillmentAllocationPage.tsx` (Fulfillment allocation UI)
- `apps/web/src/routes/AppRoutes.tsx` (Mount route `/fulfillment` & `/quotations/:id/fulfillment`)

## 6. Requirements
1. **Prisma Models**:
   - `Warehouse`: `id`, `code` (unique), `name`, `location`, `isActive`.
   - `InventoryItem`: `id`, `warehouseId`, `productId`, `availableQuantity`, `reservedQuantity`.
   - `FulfillmentAllocation`: `id`, `quotationId`, `quoteLineId`, `warehouseId`, `allocatedQuantity`, `isOverride`.
2. **Domain Engine**:
   - `computeFulfillmentPlan`: Allocates lines across warehouses, calculates backorders and shipment count.
   - `validateFulfillmentOverride`: Ensures manual quantities do not exceed stock or quote line requirements.
3. **REST API**:
   - Compute, Override, Get Plan, and List Warehouses endpoints.
4. **Frontend UI**:
   - `FulfillmentAllocationPage`: Interactive warehouse allocation table, backorder banner, manual overrides, and Save Plan button.

## 7. Security Considerations
- Require Bearer JWT authentication on all fulfillment routes.
- Enforce server-side inventory validation so client cannot allocate non-existent inventory.

## 8. Acceptance Criteria
- `computeFulfillmentPlan` allocates stock without exceeding warehouse availability.
- Manual overrides exceeding available stock return 400 validation error.
- Valid allocation saves cleanly and updates quote status to `FULFILLMENT`.
- `pnpm typecheck` and `pnpm test` pass with 0 errors.

## 9. Checks to Run
- `pnpm --filter @dealflow360/db build`
- `pnpm build`
- `pnpm test -- --run`

## 10. Exact Manual Test Steps
1. Navigate to `/quotations/:id/fulfillment` or `/fulfillment`.
2. Compute recommended warehouse splits for quote line items.
3. Override warehouse allocation quantity manually.
4. Click "Confirm & Save Allocation Plan" -> verify plan persists and quotation status updates to `FULFILLMENT`.
