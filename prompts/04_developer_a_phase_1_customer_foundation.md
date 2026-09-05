# Implementation Prompt - Developer A Phase 1: Customer Foundation

## Goal
Implement Developer A Phase 1: Customer Foundation vertical slice, supporting full Customer CRUD, search/filtering, tier classification (`ENTERPRISE`, `GOLD`, `SILVER`, `BRONZE`), status management (`ACTIVE`, `INACTIVE`, `SUSPENDED`), RBAC enforcement, validation, and automated unit/API/UI test suite.

## Relevant Skills Read
- `skills/develop/SKILL.md`
- `skills/prisma-cli/SKILL.md`
- `skills/prisma-client-api/SKILL.md`

## Code / Config Inspected
- `docs/08_DEVELOPER_A.md` (Phase 1 specification)
- `docs/specs/0001-customer-management.md`
- `packages/db/prisma/schema.prisma`
- `packages/contracts/src/index.ts`
- `apps/api/src/app.ts`
- `apps/web/src/routes/`

## Decisions & Assumptions
1. **Database Schema**: Add `CustomerTier` (`ENTERPRISE`, `GOLD`, `SILVER`, `BRONZE`), `CustomerStatus` (`ACTIVE`, `INACTIVE`, `SUSPENDED`), and `Customer` model to `packages/db/prisma/schema.prisma`.
2. **Contracts**: Create `packages/contracts/src/customer/index.ts` with Zod schemas for Customer creation, updating, filter queries, and API response types.
3. **Backend API**: Implement `apps/api/src/modules/customer/` with `customer.repository.ts` and `customer.service.ts`, plus `apps/api/src/controllers/customer.controller.ts` and `apps/api/src/routes/customer.routes.ts`.
4. **Frontend UI**: Create `apps/web/src/features/customers/` containing `CustomerListPage.tsx`, `CustomerDetailsModal.tsx`, `CustomerFormModal.tsx`, and customer TanStack Query API hooks. Add `/customers` route to `apps/web/src/routes/app-routes.tsx` and Navbar link.
5. **Role-Based Access Control**:
   - `SALES_REP`, `SALES_MANAGER`, `ADMIN`: Create, read, and list customers.
   - `SALES_MANAGER`, `ADMIN`: Edit customer tier and update customer status.
   - `FINANCE_OPERATIONS`: Read/list customer details.
   - `CUSTOMER`: Access restricted to own customer context where applicable.

## Expected Files to Change
- `packages/db/prisma/schema.prisma` [MODIFY]
- `packages/contracts/src/customer/index.ts` [NEW]
- `packages/contracts/src/index.ts` [MODIFY]
- `apps/api/src/modules/customer/customer.repository.ts` [NEW]
- `apps/api/src/modules/customer/customer.service.ts` [NEW]
- `apps/api/src/controllers/customer.controller.ts` [NEW]
- `apps/api/src/routes/customer.routes.ts` [NEW]
- `apps/api/src/app.ts` [MODIFY]
- `apps/web/src/features/customers/CustomerListPage.tsx` [NEW]
- `apps/web/src/features/customers/CustomerFormModal.tsx` [NEW]
- `apps/web/src/features/customers/useCustomers.ts` [NEW]
- `apps/web/src/routes/app-routes.tsx` [MODIFY]
- `apps/api/src/__tests__/customer.test.ts` [NEW]

## Requirements
- Support creation of customer records with unique customer code, name, email, phone, tier, and initial active status.
- Provide searching by customer name/code and filtering by tier/status.
- Enforce unique code checks and return HTTP 409 conflict when duplicate codes are used.
- Enforce strict server-side validation using Zod contracts.

## Security Considerations
- Require Bearer JWT access tokens on all customer API endpoints.
- Enforce RBAC authorization checks via `requireRole` middleware.

## Domain / Business-Rule Considerations
- Customer tier (`ENTERPRISE`, `GOLD`, etc.) directly feeds into Phase 5 Discount Matrix rules.
- Suspended customers cannot be assigned to new quotations.

## Acceptance Criteria
- **AC-1**: Customer schema supports `name`, unique `code`, `email`, `phone`, `tier`, and `status`.
- **AC-2**: Search/filter GET endpoint `/api/v1/customers` returns paginated customer lists.
- **AC-3**: Status transitions and tier edits are restricted to authorized roles (`SALES_MANAGER`, `ADMIN`).
- **AC-4**: Responsive customer UI renders cleanly across mobile, tablet, and desktop viewports (360px to 4K).
- **AC-5**: Automated integration tests in `apps/api/src/__tests__/customer.test.ts` pass cleanly.

## Checks to Run
- `pnpm --filter @dealflow360/db build`
- `pnpm --filter @dealflow360/contracts build`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm --filter @dealflow360/api test`

## Exact Manual Test Steps
1. Log in as a Sales Rep user.
2. Navigate to `/customers` and click **Add Customer**.
3. Create customer `Acme Corp` with code `CUST-ACME-001` and tier `ENTERPRISE`.
4. Verify `Acme Corp` appears in the customer table.
5. Filter table by tier `ENTERPRISE` and verify search filtering.
6. Log in as Sales Manager and update status to `SUSPENDED`.
