# Implementation Prompt: Developer B - Phase B1 Quotation Management & Quote Builder UI

## 1. Goal
Complete Phase B1 of Developer B's vertical slice in DealFlow360:
- Implement complete quotation management API routes (`POST /api/v1/quotes`, `GET /api/v1/quotes`, `PATCH /api/v1/quotes/:id/lines/:lineId`, `DELETE /api/v1/quotes/:id/lines/:lineId`, `POST /api/v1/quotes/:id/submit`).
- Implement quote state machine in `packages/domain` for governed status transitions (`DRAFT` -> `PENDING_MANAGER` / `PENDING_FINANCE` / `APPROVED`).
- Build responsive `QuoteListPage` and `QuoteBuilderPage` / Quote Line Editor in `apps/web`.
- Add unit and integration tests for quotation creation, line management, margin/risk recalculation, and status transitions.

## 2. Relevant Skills Read
- `skills/domain/SKILL.md`
- `skills/frontend/SKILL.md`
- `skills/prisma/SKILL.md`
- `skills/testing/SKILL.md`

## 3. Code & Config Inspected
- `docs/09_DEVELOPER_B.md`
- `packages/db/prisma/schema.prisma`
- `packages/contracts/src/quotes/index.ts`
- `packages/domain/src/state-machine/index.ts`
- `apps/api/src/routes/quoteRoutes.ts`
- `apps/api/src/modules/quotes/quoteController.ts`
- `apps/api/src/modules/quotes/quoteService.ts`
- `apps/web/src/features/quotes/QuotationViewPage.tsx`
- `apps/web/src/routes/AppRoutes.tsx`

## 4. Decisions and Assumptions
- Customer and Product references are fetched via seed contracts / endpoints.
- Creating a quote requires selecting a Customer and initial parameters (quote number generated or supplied).
- Adding/editing line items recalculates `subtotal`, `totalDiscount`, `netValue`, `grossMarginPercent`, `riskScore`, and `riskLevel` server-side.
- Submitting a quote transitions status from `DRAFT` to `PENDING_MANAGER` or `PENDING_FINANCE` (if risk/discount requires approval) or `APPROVED` (if low risk/within thresholds).
- Responsive UI supports viewports from 360px mobile up to 4K displays.

## 5. Expected Files to Change
- `packages/contracts/src/quotes/index.ts` (Zod schemas for quote creation, quote filtering, line update, submit)
- `packages/domain/src/quote/quoteEngine.ts` (Domain logic for pricing, margin & status transitions)
- `apps/api/src/modules/quotes/quoteService.ts` (Data layer integration & business operations)
- `apps/api/src/modules/quotes/quoteController.ts` (HTTP handlers & response formatting)
- `apps/api/src/routes/quoteRoutes.ts` (REST route definitions)
- `apps/api/src/__tests__/quote.test.ts` (Supertest API integration tests)
- `packages/domain/src/__tests__/quoteEngine.test.ts` (Vitest domain unit tests)
- `apps/web/src/features/quotes/QuoteListPage.tsx` (Quotations list table with search & filter)
- `apps/web/src/features/quotes/QuoteBuilderPage.tsx` (Create quote & edit lines interface)
- `apps/web/src/features/quotes/QuotationViewPage.tsx` (Updated quote detail view with line management & submit)
- `apps/web/src/routes/AppRoutes.tsx` (Route definitions for `/quotations`, `/quotations/new`, `/quotations/:id`)

## 6. Requirements
1. **API Endpoints**:
   - `POST /api/v1/quotes`: Create new quotation for customer.
   - `GET /api/v1/quotes`: List quotes with search by quote number/customer and filter by status/riskLevel.
   - `GET /api/v1/quotes/:id`: Fetch quote with lines and customer.
   - `POST /api/v1/quotes/:id/lines`: Add line item.
   - `PATCH /api/v1/quotes/:id/lines/:lineId`: Update quantity or proposed discount.
   - `DELETE /api/v1/quotes/:id/lines/:lineId`: Remove line item.
   - `POST /api/v1/quotes/:id/submit`: Submit quote for evaluation/approval.
2. **State Machine**:
   - Validate status transitions (`DRAFT` can transition to `PENDING_MANAGER` / `PENDING_FINANCE` or `APPROVED`).
   - Mutations on non-DRAFT quotes reset status to `DRAFT` or trigger re-evaluation.
3. **Frontend UI**:
   - `QuoteListPage`: Table of quotations with search, status filters, risk badges, and "Create New Quote" action.
   - `QuoteBuilderPage` / Modal: Customer selection dropdown, product selection with instant pricing pre-fill, line item quantity & discount inputs.
   - Live recalculation of totals, margins, and risk level.
   - Responsive layout adapting seamlessly from 360px to 4K.

## 7. Security Considerations
- Require Bearer JWT authentication on all quote routes.
- Enforce role check: `SALES_REP`, `SALES_MANAGER`, `FINANCE_OPERATIONS`, `ADMIN` can view/edit quotes.
- Prevent non-authoritative discount overrides by computing net line price and margins strictly on server.

## 8. Domain / Business-Rule Considerations
- Margin calculation: `((netValue - totalCost) / netValue) * 100`.
- Risk evaluation: Average discount > 20% or margin < 20% increases risk score to HIGH, requiring approval.
- Server-side derivation of approval requirements.

## 9. Acceptance Criteria
- All 7 REST endpoints work cleanly with correct HTTP status codes and Zod validation.
- `QuoteListPage` lists quotes with search & filter.
- `QuoteBuilderPage` allows creating a quote and adding/editing/deleting lines.
- Recalculation updates subtotal, net value, gross margin %, and risk level accurately.
- `POST /api/v1/quotes/:id/submit` evaluates risk and updates status cleanly.
- `pnpm typecheck` and `pnpm test` pass with 0 errors.

## 10. Checks to Run
- `pnpm --filter @dealflow360/api test`
- `pnpm --filter @dealflow360/domain test`
- `pnpm typecheck`

## 11. Exact Manual Test Steps
1. Navigate to `/quotations` in browser. Verify list of existing quotes is rendered.
2. Click "New Quotation", select a customer, enter Quote Number, click Create.
3. Add a product line item (e.g. 5 units at 10% discount).
4. Verify subtotal, discount, net value, gross margin %, and risk score update instantly.
5. Update line quantity to 10 and discount to 25%. Verify risk updates to HIGH.
6. Click "Submit Quote". Verify status changes to `PENDING_FINANCE` or `PENDING_MANAGER`.
