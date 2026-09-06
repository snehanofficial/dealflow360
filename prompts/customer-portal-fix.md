# Implementation Prompt: Customer Portal Root-Cause Diagnosis & Fix (Refined)

## Goal
Resolve all Customer Portal failures end-to-end by establishing server-authoritative User-to-Customer binding (`User.customerId`), enforcing server-side RBAC permissions and customer ownership isolation (with 404 non-disclosure for unauthorized resources), eliminating API envelope and contract drift, serving dedicated customer-safe DTO projections without internal commercial/margin data, and fixing frontend routing and navigation for the CUSTOMER role.

## Relevant Skills Read
- `AGENTS.md` (Product Principles, Commercial Governance, Security, Testing, UI Rules)
- `skills/domain/SKILL.md` (Commercial rules, customer counteroffers, audit events)
- `skills/prisma/SKILL.md` (Prisma schema, relations, migrations, seed logic)
- `skills/testing/SKILL.md` (API & integration testing with Vitest & Supertest)

## Code/Config Inspected
- `packages/db/prisma/schema.prisma` (Verified no existing User ↔ Customer relation exists; confirmed adding `User.customerId` is minimal and required)
- `packages/db/prisma/seed.ts`
- `packages/contracts/src/auth/index.ts`
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/auth/token.ts`
- `apps/api/src/services/authService.ts`
- `apps/api/src/modules/dashboard/dashboardService.ts`
- `apps/api/src/modules/quotes/quoteController.ts` & `quoteService.ts`
- `apps/api/src/modules/invoice/invoiceController.ts` & `invoiceService.ts`
- `apps/api/src/modules/portal/portalService.ts`
- `apps/web/src/routes/AppRoutes.tsx`
- `apps/web/src/components/layout/DashboardLayout.tsx`
- `apps/web/src/features/dashboard/HomePage.tsx`

## Decisions & Assumptions
1. **User ↔ Customer Binding**: `User` model in `schema.prisma` will add `customerId String?` referencing `Customer`. No email fallback (`user.email -> customer.email`) will ever be used for authorization or ownership. If a user with `CUSTOMER` role has no `customerId`, requests fail safely with 403 Forbidden.
2. **Database-Driven Server-Side Customer Resolution**: JWT payload remains standard and minimal (`sub`, `email`, `role`). `authService.me()` and authenticated context resolve `user.customerId` server-side from the database to prevent JWT staleness.
3. **RBAC Permissions**: `ROLE_PERMISSIONS.CUSTOMER` in `@dealflow360/contracts` includes `dashboard.view`, `quotation.view`, `fulfillment.view`, `billing.view`, `profile.view`, `portal.negotiate`, and `portal.confirm`.
4. **Server-Authoritative Ownership & 404 Non-Disclosure**: Client-supplied `customerId`, `userId`, etc., are ignored for scoping. If `req.user.role === 'CUSTOMER'`, ownership filter `where.customerId = user.customerId` is enforced server-side. Access attempts to foreign resources return `404 Not Found` for non-disclosure.
5. **Dedicated Customer-Safe DTOs**: Backend services project dedicated customer DTOs (`CustomerDashboardDto`, `CustomerQuotationDto`, `CustomerInvoiceDto`). Cost price, margin amount, margin percentage, internal approval thresholds, and internal audit logs are NEVER exposed.
6. **Seed Data**: Link seeded user `customer@dealflow360.com` (`Role.CUSTOMER`) to `cust-acme-001` (`Acme Enterprise Solutions`). Maintain valid seed structure without fabricating fake history.

## Security Matrix

| Resource | Required Permission | Ownership Source | Customer-Visible Fields |
|---|---|---|---|
| **Dashboard** | `dashboard.view` | DB lookup via `User.customerId` | Customer KPIs (Quotes, Invoices, Orders count), Recent Quotes (Quote #, Status, Net Value, Date), Recent Invoices (Invoice #, Dates, Total, Status). *No internal margin/cost or sales team pipeline.* |
| **Quotation** | `quotation.view` | `Quotation.customerId === user.customerId` | `id`, `quoteNumber`, `status`, `subtotal`, `totalDiscount`, `taxAmount`, `netValue`, `createdAt`, `customer` (`id`, `name`, `code`, `tier`), `lines` (`id`, `productId`, `quantity`, `listPrice`, `proposedDiscountPercent`, `discountAmount`, `netLinePrice`, `product` (`id`, `name`, `sku`, `category`, `billingType`)). *No standardCost, margin, gross profit, or internal approval rules.* |
| **Negotiation / Counteroffer** | `portal.negotiate` | `Quotation.customerId === user.customerId` | `id`, `quotationId`, `proposedDiscountPercent`, `customerNotes`, `status`, `createdAt`. *Server-authoritative pricing & risk re-evaluation.* |
| **Fulfillment** | `fulfillment.view` | `Quotation.customerId === user.customerId` | `id`, `quotationId`, `quoteNumber`, `status`, `allocatedQuantity`, `shippedDate`, `deliveryStatus`. *No internal warehouse costs, margin, or operational notes.* |
| **Invoice** | `billing.view` | `Invoice.customerId === user.customerId` | `id`, `invoiceNumber`, `status`, `issueDate`, `dueDate`, `subtotal`, `taxAmount`, `totalAmount`, `lines` (`id`, `description`, `quantity`, `unitPrice`, `netAmount`). *No internal accounting GL codes or margin metrics.* |
| **Profile** | `profile.view` | DB lookup via `User.id` & `User.customerId` | `user.id`, `user.name`, `user.email`, `user.role`, `customer` (`id`, `name`, `code`, `tier`, `region`). *Server-derived ownership only.* |

## Expected Files to Change
- [MODIFY] `packages/db/prisma/schema.prisma`
- [MODIFY] `packages/db/prisma/seed.ts`
- [MODIFY] `packages/contracts/src/auth/index.ts`
- [MODIFY] `apps/api/src/middleware/auth.ts`
- [MODIFY] `apps/api/src/services/authService.ts`
- [MODIFY] `apps/api/src/modules/dashboard/dashboardService.ts`
- [MODIFY] `apps/api/src/modules/quotes/quoteController.ts`
- [MODIFY] `apps/api/src/modules/quotes/quoteService.ts`
- [MODIFY] `apps/api/src/modules/invoice/invoiceController.ts`
- [MODIFY] `apps/web/src/routes/AppRoutes.tsx`
- [MODIFY] `apps/web/src/components/layout/DashboardLayout.tsx`
- [MODIFY] `apps/web/src/features/dashboard/HomePage.tsx`
- [NEW] `apps/api/src/__tests__/customerPortalAuth.test.ts`

## Acceptance Criteria
- Customer login succeeds and resolves `user.customerId` from DB.
- Unbound customer user fails safely with 403 Forbidden (no email fallback).
- `GET /api/v1/dashboard` returns real customer KPI metrics and quotes for authenticated customer.
- Customer requesting another customer's ID receives HTTP 404 Not Found.
- Dedicated customer DTOs omit internal cost, gross margin, and internal approval data.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass with 0 errors.

## Checks to Run
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
