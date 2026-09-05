# Implementation Prompt — Developer A Phase A2: Product Catalog & Base Pricing

## Goal
Implement Developer A Phase A2: Product Catalog & Base Pricing vertical slice, supporting Product CRUD, category filtering, product types (`ONE_TIME`, `RECURRING`), base selling price, standard cost price, maximum allowed discount governance limits, RBAC authorization, Zod validation, responsive UI, and automated unit/API test suite.

## Relevant Skills Read
- `skills/develop/SKILL.md`
- `skills/prisma-cli/SKILL.md`
- `skills/prisma-client-api/SKILL.md`
- `skills/domain/SKILL.md`

## Code / Config Inspected
- `docs/08_DEVELOPER_A.md` (Developer A Phase A2 spec)
- `packages/db/prisma/schema.prisma`
- `packages/contracts/src/product/index.ts`
- `apps/api/src/app.ts`
- `apps/web/src/routes/AppRoutes.tsx`

## Decisions & Assumptions
1. **Database Schema**: Update `Product` model in `packages/db/prisma/schema.prisma` to ensure `maxAllowedDiscount` (Float, default 15.0) aligns with `ProductReferenceDto`.
2. **Contracts**: Utilize `packages/contracts/src/product/index.ts` Zod schemas (`CreateProductSchema`, `UpdateProductSchema`, `ProductFilterQuerySchema`, `ProductDto`, `ProductReferenceDto`).
3. **Backend API**: Implement `apps/api/src/modules/products/product.service.ts`, `apps/api/src/controllers/productController.ts`, and `apps/api/src/routes/productRoutes.ts` registered under `/api/v1/products`.
4. **Frontend UI**: Build `apps/web/src/features/products/` with `ProductListPage.tsx`, `ProductFormModal.tsx`, and `useProducts.ts`. Add `/products` route to `AppRoutes.tsx` and Sidebar navigation.
5. **RBAC & Authorization**:
   - `SALES_REP`, `SALES_MANAGER`, `ADMIN`, `FINANCE_OPERATIONS`: List and view product catalog details.
   - `ADMIN`, `SALES_MANAGER`: Create and update products, set list/cost prices and max allowed discount limits.

## Expected Files to Change
- `packages/db/prisma/schema.prisma` [MODIFY]
- `packages/contracts/src/product/index.ts` [MODIFY]
- `apps/api/src/modules/products/product.service.ts` [NEW]
- `apps/api/src/controllers/productController.ts` [NEW]
- `apps/api/src/routes/productRoutes.ts` [NEW]
- `apps/api/src/app.ts` [MODIFY]
- `apps/web/src/features/products/ProductListPage.tsx` [NEW]
- `apps/web/src/features/products/ProductFormModal.tsx` [NEW]
- `apps/web/src/features/products/useProducts.ts` [NEW]
- `apps/web/src/routes/AppRoutes.tsx` [MODIFY]
- `apps/web/src/components/layout/DashboardLayout.tsx` [MODIFY]
- `apps/api/src/__tests__/product.test.ts` [NEW]

## Requirements
- Support creation and editing of products with SKU, name, description, category, type (`ONE_TIME`, `RECURRING`), unit price, cost price, and maximum allowed discount limit.
- Provide searching by SKU/name and filtering by category and active status.
- Enforce unique SKU check and return HTTP 409 conflict when duplicate SKU is used.
- Enforce server-side Zod validation.

## Security Considerations
- Require Bearer JWT access tokens on all product API endpoints.
- Enforce RBAC authorization via `requireRole` middleware.

## Domain / Business-Rule Considerations
- `ProductReferenceDto` (`id`, `sku`, `name`, `category`, `type`, `unitPrice`, `costPrice`, `maxAllowedDiscount`) is produced as a stable contract for Developer B's quotation engine.
- `maxAllowedDiscount` feeds directly into Phase A3 Discount Policy Evaluation Engine.

## Acceptance Criteria
- **AC-1**: Product schema contains all required fields including `maxAllowedDiscount`.
- **AC-2**: GET `/api/v1/products` returns paginated, filterable product lists.
- **AC-3**: POST/PATCH `/api/v1/products` allows `ADMIN` and `SALES_MANAGER` to manage product catalog master data.
- **AC-4**: Responsive product UI renders cleanly from mobile to 4K display.
- **AC-5**: Automated unit/API tests in `apps/api/src/__tests__/product.test.ts` pass cleanly.

## Checks to Run
- `pnpm --filter @dealflow360/db build`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

## Exact Manual Test Steps
1. Log in as Sales Manager.
2. Navigate to `/products` and click **Add Product**.
3. Create product with SKU `HW-SRV-001`, Name `Enterprise Rack Server`, Category `HARDWARE`, Unit Price `5000`, Cost Price `3200`, Max Discount `20%`.
4. Verify product appears in the table.
5. Filter table by `HARDWARE` category and search `HW-SRV`.
