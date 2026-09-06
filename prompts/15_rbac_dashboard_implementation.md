# Corrected Implementation Prompt: RBAC Dashboard Engine & Role-Specific Projections

## 1. Executive Goal
Implement a server-authoritative, read-only, permission-enforced RBAC Dashboard projection engine (`GET /api/v1/dashboard`) and update `apps/web` (`HomePage.tsx`) to consume real backend DTO data across all 5 roles (`ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`, `CUSTOMER`), completely removing all hardcoded/mock data without changing visual layout or altering existing domain services.

## 2. Relevant Skills & Authoritative Documentation Inspected
- `AGENTS.md` — Core product principles, modular monolith architecture, backend as commercial authority, verification loop.
- `skills/domain/SKILL.md` — Read-only projection rules; domain engines are authoritative.
- `skills/frontend/SKILL.md` — React 19, Vite, design tokens, `axiosClient.ts`, responsive adaptability (360px to 4K).
- `skills/prisma/SKILL.md` — DB query optimization, aggregations, schema model relationships.
- `skills/testing/SKILL.md` — Vitest unit, API integration, and RBAC isolation tests.
- `packages/contracts/src/auth/index.ts` — Authoritative role & permission registry (`ROLE_PERMISSIONS`).
- `packages/db/prisma/schema.prisma` — Authoritative Prisma entities: `User`, `Quotation`, `QuoteLine`, `Customer`, `ApprovalRequest`, `ApprovalStep`, `FulfillmentAllocation`, `Warehouse`, `InventoryItem`, `Backorder`, `Invoice`, `BillingSchedule`, `DealAlert`, `AuditLog`.

## 3. Repository & Domain Findings
- **Entity Names**: `Quotation`, `QuoteLine`, `Customer`, `ApprovalRequest`, `ApprovalStep`, `CounterOffer`, `PortalToken`, `FulfillmentAllocation`, `Warehouse`, `InventoryItem`, `Backorder`, `Invoice`, `InvoiceLine`, `BillingSchedule`, `DealAlert`, `AuditLog`.
- **Sales Rep Ownership**: `Quotation.createdById` references `User.id`.
- **Customer Ownership**: Logged in `User` with role `CUSTOMER` matches `Customer` via `email` (`Customer.email == user.email`). Quotations & Invoices scoped via `customerId`.
- **Sales Manager Scope**: Team models (`Team` / `reportsTo`) do NOT exist in the database. `SALES_MANAGER` dashboard projects pipeline across all deals accessible via `quotation.view` and `approval.view`.
- **Permission Boundary**: `Permissions.DASHBOARD_VIEW` (`'dashboard.view'`) grants base access to `/dashboard`. Section-level projections evaluate specific domain permissions (`quotation.view`, `approval.view`, `billing.view`, `fulfillment.view`, `audit.view`). `CUSTOMER` role receives `Permissions.DASHBOARD_VIEW` or a dedicated portal-scoped dashboard route.

## 4. Key Architectural Decisions
1. **Read-Only Projection Layer**: `GET /api/v1/dashboard` performs DB aggregations without mutating database state, triggering approvals, or creating audit records.
2. **Permission-Driven DTO Sections**: Backend filters KPI grid, attention alerts, primary work queues, and recent activity based on `req.user.permissions` and ownership filters.
3. **No Duplicate Business Logic**: The dashboard reads existing entity states (e.g. `Quotation.status`, `Quotation.netValue`, `ApprovalRequest.status`, `FulfillmentAllocation.status`, `Invoice.status`, `InventoryItem.availableQuantity`) instead of recalculating prices, margins, or tax.
4. **Action Routing**: Cards & alerts navigate to existing UI routes (`/quotations`, `/approvals`, `/fulfillment`, `/invoices`, `/inventory`, `/audit`).

## 5. Expected Files to Change / Create
- `packages/contracts/src/dashboard/index.ts` [NEW] — Zod contracts and DTO types for dashboard response.
- `packages/contracts/src/index.ts` [MODIFY] — Export dashboard contract schemas.
- `apps/api/src/modules/dashboard/dashboardService.ts` [NEW] — Scoped aggregation & projection service.
- `apps/api/src/modules/dashboard/dashboardController.ts` [NEW] — Express controller.
- `apps/api/src/modules/dashboard/dashboardRoutes.ts` [NEW] — Express route definitions with auth & permission middleware.
- `apps/api/src/app.ts` [MODIFY] — Mount `/api/v1/dashboard`.
- `apps/web/src/lib/api/dashboardApi.ts` [NEW] — Axios client wrapper for dashboard endpoint.
- `apps/web/src/features/dashboard/useDashboard.ts` [NEW] — TanStack Query hook with caching and invalidation hooks.
- `apps/web/src/features/dashboard/HomePage.tsx` [MODIFY] — Connect existing UI components to backend `DashboardResponseDto` with loading skeletons, empty states, and section error recovery.
- `apps/api/src/__tests__/dashboard.test.ts` [NEW] — Integration tests for 5 roles, permission isolation, ownership security, and error handling.

## 6. Verification & Automated Checks
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
