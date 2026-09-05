# Developer A — Phase A2 Price List Management Implementation Plan

## Goal
Complete the Price List Management experience end-to-end for Developer A Phase A2. Introduce a dedicated `/price-lists` management page and route, full CRUD capabilities for Price Lists and Price List Entries, filtering by Customer Tier, Currency, and Status, search, default/active status toggling, deletion with safety confirmation, customer-tier and currency pricing visibility, server-calculated effective price visibility, and full integration with Product Detail & Navigation.

## Relevant Skills Read
- `AGENTS.md` (Product principles, modular monolith architecture, UI display adaptability, REST API standards, permission rules)
- `.agents/skills/develop/SKILL.md` (Implementation workflow, spec/gate rules, UI/logical building)
- `.agents/skills/test/SKILL.md` (Testing guidelines)

## Code and Config Inspected
- `packages/db/prisma/schema.prisma` (`PriceList`, `PriceListEntry`, `Product`, `CustomerTier`, `Role`)
- `packages/contracts/src/product/index.ts` (`PriceListSchema`, `CreatePriceListSchema`, `UpdatePriceListSchema`, `UpsertPriceListEntrySchema`)
- `packages/contracts/src/auth/index.ts` (`Role`, `Permissions`, `ROLE_PERMISSIONS`)
- `apps/api/src/repositories/priceListRepository.ts` (`findMany`, `findById`, `create`, `update`, `upsertEntry`, `deleteEntry`, `findEffectivePriceEntry`)
- `apps/api/src/controllers/productController.ts` (`getPriceListsHandler`, `createPriceListHandler`, `updatePriceListHandler`, `upsertPriceListEntryHandler`, `deletePriceListEntryHandler`)
- `apps/api/src/routes/productRoutes.ts` & `apps/api/src/app.ts`
- `apps/api/src/__tests__/product.test.ts`
- `apps/web/src/routes/AppRoutes.tsx`
- `apps/web/src/components/layout/DashboardLayout.tsx`
- `apps/web/src/features/products/useProducts.ts`
- `apps/web/src/features/products/ProductListPage.tsx`
- `apps/web/src/features/products/ProductDetailPage.tsx`
- `apps/web/src/features/products/PriceListManagementModal.tsx`

## Decisions and Assumptions
1. **Dedicated Route & Navigation**:
   - Implement route `/price-lists` in `AppRoutes.tsx` (with `/pricelists` redirecting to `/price-lists`).
   - Add sidebar navigation item under `SALES` in `DashboardLayout.tsx` pointing to `/price-lists`.
2. **Dedicated Price List Management UI**:
   - Build a full-page `/price-lists` management interface (`PriceListPage.tsx` & `PriceListDetailPage.tsx`).
   - Feature summary stats, search by name, filter by Customer Tier (`ENTERPRISE`, `TIER_1`, `TIER_2`, `TIER_3`, `GLOBAL`), Currency (`USD`, `EUR`, `GBP`, `INR`), and Status (`Active`, `Inactive`).
   - Enable Create Price List, Edit Price List parameters, Activate/Deactivate toggle, and Delete Price List with safety confirmation.
3. **Product Entry Management**:
   - Provide a searchable Product Selector modal (`AddProductToPriceListModal.tsx`) showing products missing from the Price List, preventing duplicate entries.
   - Provide entry price editor modal (`EditPriceEntryModal.tsx`) showing base list price, currency, customer tier, and price list price override.
   - Provide removal confirmation for price list entries without deleting the underlying catalog product.
4. **Backend Enhancements**:
   - Add `delete(id)` method to `PriceListRepository` and `deletePriceListHandler` controller to safely delete Price Lists (with entry cascade).
   - Add `getPriceListByIdHandler` controller (`GET /api/v1/products/price-lists/:id`).
   - Ensure setting `isDefault = true` for a currency unsets `isDefault` for existing price lists with the same currency.
   - Mount `/api/v1/price-lists` as a direct API alias for `/api/v1/products/price-lists`.
5. **Permissions & Security**:
   - `ADMIN` and `SALES_MANAGER` can create, edit, activate, deactivate, add/remove products, edit prices, and delete price lists.
   - `SALES_REP` and `FINANCE` can view price lists and entries in read-only mode.
   - Server-side authorization remains authoritative.
6. **Responsive Design**:
   - Responsive layout adaptiveness from 360px mobile card views to 4K desktop displays.

## Expected Files to Change
- `[NEW] apps/web/src/features/pricelists/PriceListPage.tsx`
- `[NEW] apps/web/src/features/pricelists/PriceListDetailPage.tsx`
- `[NEW] apps/web/src/features/pricelists/PriceListFormModal.tsx`
- `[NEW] apps/web/src/features/pricelists/AddProductToPriceListModal.tsx`
- `[NEW] apps/web/src/features/pricelists/EditPriceEntryModal.tsx`
- `[MODIFY] apps/web/src/routes/AppRoutes.tsx`
- `[MODIFY] apps/web/src/components/layout/DashboardLayout.tsx`
- `[MODIFY] apps/web/src/features/products/useProducts.ts`
- `[MODIFY] apps/web/src/features/products/ProductListPage.tsx`
- `[MODIFY] apps/web/src/features/products/ProductDetailPage.tsx`
- `[MODIFY] apps/api/src/repositories/priceListRepository.ts`
- `[MODIFY] apps/api/src/controllers/productController.ts`
- `[MODIFY] apps/api/src/routes/productRoutes.ts`
- `[MODIFY] apps/api/src/app.ts`
- `[MODIFY] apps/api/src/__tests__/product.test.ts` (and/or `[NEW] apps/api/src/__tests__/priceList.test.ts`)

## Requirements
- No raw database IDs or Prisma models exposed to users.
- Business concepts only: Price List Name, Customer Tier, Currency, Product Name, SKU, Base Price, Override Price, Effective Price, Status, Default.
- Full two-way visibility: Product -> Price Lists and Price List -> Products.
- No live exchange rates or hardcoded tier names.

## Security Considerations
- Authentication required via Bearer JWT.
- RBAC authorization check on all write operations (`ADMIN` & `SALES_MANAGER` required).
- Input validation via Zod schemas (`CreatePriceListSchema`, `UpdatePriceListSchema`, `UpsertPriceListEntrySchema`).

## Domain / Business-Rule Considerations
- Precedence: Customer Tier + Currency > Default for Currency > Base Catalog List Price.
- Inactive Price Lists are ignored during pricing resolution.
- Only one default Price List per currency allowed.

## Acceptance Criteria
1. Dedicated `/price-lists` route and sidebar entry.
2. List Price Lists with search, tier filter, currency filter, and active/inactive filter.
3. Create Price List modal with Zod validation.
4. Edit Price List metadata (name, tier, currency, default, active).
5. Activate / deactivate Price List toggle.
6. Delete Price List with safety confirmation.
7. Price List detail page (`/price-lists/:id` or view state) showing products, prices, savings/deltas.
8. Add product to Price List via searchable selector (excluding already added products).
9. Edit product price entry in Price List with base price comparison.
10. Remove product from Price List with confirmation (product remains in catalog).
11. Product detail page shows all applicable Price Lists and Effective Price Inspector.
12. Read-only permissions for `SALES_REP` and `FINANCE`.
13. Responsive across mobile (360px), tablet, desktop, and 4K displays.
14. Automated tests pass (`pnpm test`), typecheck passes (`pnpm typecheck`), lint passes (`pnpm lint`), build passes (`pnpm build`).

## Checks to Run
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Exact Manual Acceptance Test Steps
1. Open `/price-lists`.
2. Create "Enterprise INR" with ENTERPRISE customer tier and INR currency.
3. Open "Enterprise INR" detail view.
4. Click [+ Add Product] and select an existing product.
5. Set its Price List price override and save.
6. Reopen/verify product and price persist.
7. Edit the entry price and verify change.
8. Add a second product.
9. Remove the second product and verify removal from Price List (product stays in catalog).
10. Deactivate "Enterprise INR" and verify UI shows INACTIVE.
11. Create "Enterprise USD" with ENTERPRISE tier and USD currency.
12. Add the same product with a USD price override.
13. Open Product Detail page for that product.
14. Verify both Price List prices are visible.
15. Test Effective Price Inspector with ENTERPRISE tier and USD currency.
16. Test with a user lacking Price List management permission (`SALES_REP`).
17. Verify view-only mode works and modification controls are hidden.
