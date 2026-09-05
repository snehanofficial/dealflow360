# Implementation Prompt: Developer B - Phase B4 Subscription & Hybrid Billing Engine

## 1. Goal
Implement Phase B4 of Developer B's vertical slice in DealFlow360:
- Add `BillingSchedule` and `BillingLine` models to Prisma schema in `packages/db/prisma/schema.prisma`.
- Implement hybrid billing calculations (one-time vs recurring monthly/annual billing schedules, proration calculation) in `packages/domain/src/billing/billingEngine.ts`.
- Export Zod contract schemas in `packages/contracts/src/billing/index.ts`.
- Implement REST API endpoint `GET /api/v1/quotes/:id/billing` in `apps/api/src/modules/billing/` to generate/retrieve hybrid billing schedules.
- Build responsive `BillingSchedulePage.tsx` UI in `apps/web/src/features/billing/BillingSchedulePage.tsx` showing:
  - Hybrid billing summary cards (One-Time Total, Monthly Recurring Total, Annual Recurring Total).
  - Detailed billing schedule timeline / breakdown table (Prorated initial period, monthly/annual installments, one-time charges).
  - Interactive billing start date & proration calculator controls.
- Write unit tests in `packages/domain/src/__tests__/billingEngine.test.ts` and Supertest integration tests in `apps/api/src/__tests__/billing.test.ts`.

## 2. Relevant Skills Read
- `skills/domain/SKILL.md`
- `skills/frontend/SKILL.md`
- `skills/prisma/SKILL.md`
- `skills/testing/SKILL.md`

## 3. Code & Config Inspected
- `docs/09_DEVELOPER_B.md`
- `docs/05_BUSINESS_RULES.md` (Sections 45–53: Billing Classification, One-Time, Recurring, Hybrid, Proration)
- `packages/db/prisma/schema.prisma`
- `apps/api/src/app.ts`
- `apps/web/src/routes/AppRoutes.tsx`

## 4. Decisions and Assumptions
- One-time lines (e.g., hardware/installation) are billed 100% on billing start date and are never included in recurring subscription schedules.
- Recurring lines are billed based on `recurringPeriod` (`MONTHLY` or `ANNUAL`).
- Initial partial billing period proration formula:
  `Prorated Amount = (Recurring Amount / Days in Period) * Active Days`.
- Backend generates deterministic billing schedules for 12 months horizon when requested.
- Quotation state transitions to `BILLING` when billing schedule is generated/confirmed.

## 5. Expected Files to Change
- `packages/db/prisma/schema.prisma` (Add `BillingSchedule` and `BillingLine` models, relation on `Quotation`)
- `packages/contracts/src/billing/index.ts` (Zod schemas for billing output and proration inputs)
- `packages/contracts/src/index.ts` (Export billing contracts)
- `packages/domain/src/billing/billingEngine.ts` (Pure hybrid billing schedule generator & proration algorithm)
- `packages/domain/src/__tests__/billingEngine.test.ts` (Domain unit tests)
- `apps/api/src/modules/billing/billingService.ts` (Billing persistence & service orchestration)
- `apps/api/src/modules/billing/billingController.ts` (HTTP handler for billing endpoints)
- `apps/api/src/routes/billingRoutes.ts` (REST route definitions for `/api/v1/billing` and `/api/v1/quotes/:id/billing`)
- `apps/api/src/app.ts` (Mount billing routes)
- `apps/api/src/__tests__/billing.test.ts` (Supertest integration tests)
- `apps/web/src/features/billing/BillingSchedulePage.tsx` (Billing Schedule & Proration UI)
- `apps/web/src/routes/AppRoutes.tsx` (Mount route `/quotations/:id/billing` & `/billing`)

## 6. Requirements
1. **Prisma Models**:
   - `BillingSchedule`: `id`, `quotationId`, `totalOneTimeAmount`, `totalRecurringMonthly`, `totalRecurringAnnual`, `billingStartDate`, `status`.
   - `BillingLine`: `id`, `billingScheduleId`, `quoteLineId`, `productName`, `billingType`, `recurringPeriod`, `billingDate`, `amount`, `proratedDays`, `isProrated`, `status`.
2. **Domain Billing Engine**:
   - `calculateHybridBillingSchedule`: Generates one-time charges, recurring schedules, and prorated first installment.
   - `calculateProration`: Determines prorated charge for partial month/year active days.
3. **REST API**:
   - `GET /api/v1/quotes/:id/billing` (Retrieve or compute billing schedule for quote).
   - `POST /api/v1/quotes/:id/billing/generate` (Persist schedule and transition state to `BILLING`).
4. **Frontend UI**:
   - `BillingSchedulePage`: Summary cards, timeline table, proration indicator badges, and responsive controls (360px to 4K).

## 7. Security Considerations
- Enforce JWT authentication on all billing endpoints.
- Server validates all proration and schedule calculations authoritatively.

## 8. Acceptance Criteria
- One-time lines and recurring lines are kept distinct in billing schedules.
- Proration accurately computes active days in initial partial billing period.
- `pnpm build` and `pnpm test` pass with zero errors.

## 9. Checks to Run
- `pnpm --filter @dealflow360/db build`
- `pnpm build`
- `pnpm test -- --run`

## 10. Exact Manual Test Steps
1. Navigate to `/quotations/:id/billing` or click "Billing Schedule" from Quotation View.
2. Verify one-time and recurring subscription breakdowns.
3. Adjust start date or proration parameters -> observe updated schedule breakdown.
4. Click "Confirm Billing Schedule" -> verify status updates to `BILLING`.
