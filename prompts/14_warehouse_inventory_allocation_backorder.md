# Prompt: DealFlow360 - Warehouse, Inventory, Automatic Allocation & Backorder Management

## Goal
Implement the complete **Warehouse Management + Inventory Management + Multi-Warehouse Allocation + Backorder** module for DealFlow360.
This includes:
1. Warehouse CRUD and priority management.
2. Variant-aware inventory tracking with `onHandQuantity` and `reservedQuantity`, deriving `availableQuantity = onHandQuantity - reservedQuantity` server-side.
3. Explicit two-stage inventory accounting:
   - Reservation stage: `reservedQuantity` increases; `onHandQuantity` unchanged.
   - Shipment stage: `onHandQuantity` decreases AND `reservedQuantity` decreases.
   - Enforce invariant `available = onHand - reserved >= 0` at all times.
4. Audited inventory movement ledger (`RECEIPT`, `RESERVATION`, `RESERVATION_RELEASE`, `SHIPMENT`, `RETURN`, `ADJUSTMENT`, `TRANSFER_IN`, `TRANSFER_OUT`).
5. Pure, deterministic multi-factor warehouse allocation engine in `packages/domain/src/fulfillment/allocationEngine.ts` (zero imports of Prisma, Express, or React) considering:
   - Active/eligible warehouses only
   - Maximize fulfillable quantity
   - Prefer complete-order single-warehouse fulfillment
   - Minimize number of warehouse splits
   - Warehouse priority hierarchy
   - Available stock (`onHand - reserved`)
   - Deterministic tie-breaker (alphabetical warehouse code/ID)
   - Human-readable explainable reasons for every allocation decision
6. Partial backorder and full backorder tracking linked to operational fulfillment lines, preserving: `requestedQuantity = allocatedQuantity + backorderedQuantity`.
7. Controlled backorder re-evaluation workflow:
   `Stock arrival → Identify eligible backorders → Calculate allocation proposal → Authorized confirmation → Reservation`.
8. Manual allocation overrides with strict server-side validation preventing over-allocation.
9. Transactional consistency for all stock mutations using Prisma `$transaction`.
10. Responsive UI with Warehouse Kanban, Table View, Inventory Dashboard, Backorders View, and Allocation Preview & Override Drawer.
11. Audit logging and RBAC enforcement across all endpoints.

## Relevant Skills & Docs Read
- `AGENTS.md` - Governance principles & workflow rules
- `skills/domain/SKILL.md`
- `skills/frontend/SKILL.md`
- `skills/prisma/SKILL.md`
- `skills/testing/SKILL.md`
- `docs/01_PROJECT_VISION.md`
- `docs/02_REQUIREMENTS_AND_SCOPE.md`
- `docs/03_ROLES_PERMISSIONS_AND_FLOWS.md`
- `docs/04_DATA_MODEL_AND_DATABASE.md`
- `docs/05_BUSINESS_RULES.md`
- `docs/06_API_CONTRACT.md`
- `docs/07_FEATURE_MODULES.md`
- `docs/09_DEVELOPER_B.md`
- `docs/domain-model.md`
- `docs/database-contract.md`
- `docs/api-contracts.md`
- `docs/events.md`
- `docs/state-machines.md`

## Code & Schema Inspected
- `packages/db/prisma/schema.prisma` (`Warehouse`, `InventoryItem`, `FulfillmentAllocation`, `Quotation`, `QuoteLine`)
- `packages/domain/src/fulfillment/fulfillmentEngine.ts`
- `apps/api/src/routes/fulfillmentRoutes.ts`
- `apps/api/src/modules/fulfillment/fulfillmentService.ts`
- `apps/api/src/modules/fulfillment/fulfillmentController.ts`

## Decisions & Assumptions
1. **Reuse Existing Objects**: Extend existing `Warehouse`, `InventoryItem`, and `FulfillmentAllocation` models rather than creating duplicate product or quotation entities.
2. **Server-Side Derived Available Quantity**: Store `onHandQuantity` and `reservedQuantity` in DB; derive `availableQuantity = onHandQuantity - reservedQuantity` in domain & API layer.
3. **Explicit Accounting Distinction**:
   - Reservation: `reservedQuantity += qty`, `onHandQuantity` unchanged.
   - Shipment: `onHandQuantity -= qty`, `reservedQuantity -= qty`.
4. **Backorder Tracking**: Add `Backorder` model associated with fulfillment lines to track requested, allocated, and backordered quantities with status (`BACKORDERED`, `PARTIALLY_REALLOCATED`, `RESOLVED`, `CANCELLED`).
5. **Controlled Re-Evaluation**: Replenishment creates a proposal requiring confirmation rather than silently mutating confirmed allocations.
6. **Pure Domain Engine**: `allocationEngine.ts` is 100% pure and receives immutable snapshots without external DB dependencies.
7. **Commercial Independence**: Operational fulfillment and backorder states do NOT mutate commercial quotation pricing, discounts, margins, taxes, or approval decisions.
8. **Transactional Integrity**: Stock reservation, shipment, and movement recording occur atomically within Prisma transactions.

## Expected Files to Change / Create
- `packages/db/prisma/schema.prisma` [MODIFY]
- `packages/contracts/src/fulfillment/index.ts` [NEW]
- `packages/contracts/src/index.ts` [MODIFY]
- `packages/domain/src/fulfillment/allocationEngine.ts` [NEW]
- `packages/domain/src/fulfillment/index.ts` [MODIFY]
- `packages/domain/src/index.ts` [MODIFY]
- `packages/domain/src/__tests__/allocationEngine.test.ts` [NEW]
- `apps/api/src/modules/warehouse/warehouseService.ts` [NEW]
- `apps/api/src/modules/warehouse/warehouseController.ts` [NEW]
- `apps/api/src/modules/warehouse/warehouseRoutes.ts` [NEW]
- `apps/api/src/modules/fulfillment/fulfillmentService.ts` [MODIFY]
- `apps/api/src/modules/fulfillment/fulfillmentController.ts` [MODIFY]
- `apps/api/src/routes/fulfillmentRoutes.ts` [MODIFY]
- `apps/api/src/routes/index.ts` [MODIFY]
- `apps/api/src/__tests__/warehouseFulfillment.test.ts` [NEW]
- `apps/web/src/features/warehouse/WarehouseKanbanPage.tsx` [NEW]
- `apps/web/src/features/warehouse/WarehouseManagementPage.tsx` [NEW]
- `apps/web/src/features/inventory/InventoryDashboardPage.tsx` [NEW]
- `apps/web/src/features/inventory/BackordersPage.tsx` [NEW]
- `apps/web/src/routes/AppRoutes.tsx` [MODIFY]
- `apps/web/src/components/layout/DashboardLayout.tsx` [MODIFY]
- `docs/domain-model.md` [MODIFY]
- `docs/database-contract.md` [MODIFY]
- `docs/api-contracts.md` [MODIFY]
- `docs/events.md` [MODIFY]

## Security Considerations
- Require JWT authentication for all warehouse, inventory, allocation, and backorder endpoints.
- Require role authorization (`ADMIN`, `FINANCE_OPERATIONS`, `SALES_MANAGER`) for administrative/management endpoints.
- Strictly validate manual override quantities on the backend.

## Domain / Business-Rule Considerations
- Invariant `available = onHand - reserved` enforced on backend.
- Oversubscription (`allocatedQuantity > availableQuantity`) strictly forbidden and rejected server-side.
- Allocation scoring evaluates eligibility, max fulfillment, complete order preference, split minimization, warehouse priority, available stock, and tie-breakers.
- Backorder re-evaluation produces a proposal for confirmation.

## Acceptance Criteria
1. Single-warehouse, multi-warehouse split, partial backorder, and full backorder scenarios allocate correctly with explainable reasons.
2. Reservation increases `reservedQuantity`, shipment decreases both `onHandQuantity` and `reservedQuantity`, preserving `available = onHand - reserved`.
3. Over-allocation manual overrides are rejected with a 400 error.
4. Backorder re-evaluation proposes allocation for newly added stock without mutating existing confirmed allocations or commercial pricing.
5. Automated tests covering reservation/shipment accounting, invariants, concurrency, split allocations, backorders, and audit consistency pass cleanly.
6. All automated checks (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`) pass cleanly.
