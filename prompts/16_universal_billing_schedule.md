# Universal Billing Schedule Implementation Prompt

## Goal
Transform the billing schedule interface from a single-quotation fallback model into a universal B2B commercial billing schedule hub. Navigating to `/billing` must NOT automatically open `quote-sample-001` or any single hardcoded quotation; instead, it will display a universal overview of all quotation billing schedules across the system, with full search/filter capabilities, KPI metrics, and navigation to individual quote billing details at `/quotations/:id/billing`.

## Relevant Skills Read
- `skills/frontend/SKILL.md`
- `skills/domain/SKILL.md`

## Code & Config Inspected
- `apps/web/src/features/billing/BillingSchedulePage.tsx` (Current fallback logic `id || 'quote-sample-001'`)
- `apps/web/src/routes/AppRoutes.tsx` (`/billing` and `/quotations/:id/billing` routes)
- `apps/api/src/routes/billingRoutes.ts` (Existing quote-nested and standalone billing endpoints)
- `apps/api/src/modules/billing/billingController.ts`
- `apps/api/src/modules/billing/billingService.ts`

## Decisions & Assumptions
1. **Server Authority & Endpoint**: Add `GET /api/v1/billing` endpoint in `apps/api` returning all quotations that have billing schedules or are in billing-relevant stages (`FULFILLMENT`, `BILLING`, `COMPLETED`, `APPROVED`), along with computed/persisted billing metrics for each quote and aggregated totals (Total One-Time, Monthly MRR, Annual MRR, Active Count).
2. **Frontend Routing & Dual Views**:
   - On `/billing` (where `id` is `undefined`), show the **Universal Billing Overview Hub**.
   - On `/quotations/:id/billing` (where `id` is present), show the **Detailed Quote Billing Schedule**.
   - Provide a "Back to All Schedules" button on the detailed view so users can seamlessly navigate back to `/billing`.
3. **No Hardcoded Fallbacks**: Remove `id || 'quote-sample-001'` fallback in `BillingSchedulePage.tsx`.
4. **UI Design & Responsiveness**: Follow DealFlow360 design tokens (`#714B67` primary theme, dark/light cards, responsive mobile-to-4K table/card containers, clean state badges).

## Expected Files to Change
- `apps/api/src/modules/billing/billingService.ts`
- `apps/api/src/modules/billing/billingController.ts`
- `apps/api/src/routes/billingRoutes.ts`
- `apps/web/src/features/billing/BillingSchedulePage.tsx`
- `apps/api/src/__tests__/billing.test.ts`

## Requirements
- **Backend API**: `GET /api/v1/billing` endpoint returning list of quotation billing schedules and aggregated financial metrics.
- **Universal Dashboard View**: KPI cards (Total One-Time, Monthly MRR, Annual MRR, Active Schedules), search input for quote # or customer name, status filters (All, BILLING, FULFILLMENT, COMPLETED), and data table with action buttons.
- **Detailed Quote Schedule View**: Clean view displaying one-time and recurring schedule lines, lock schedule action, complete billing action, and return to list navigation.
- **Security & Authorization**: Enforce `BILLING_VIEW` and `BILLING_MANAGE` permissions.

## Acceptance Criteria
1. Direct navigation to `/billing` does not open `quote-sample-001` or any single quote automatically.
2. Direct navigation to `/billing` displays the universal billing schedule list with aggregated metrics across all relevant deals.
3. Selecting a deal or navigating to `/quotations/:id/billing` displays the detailed schedule for that specific deal.
4. All existing billing operations (lock/generate schedule, complete billing) remain functional.
5. All automated unit and API integration tests pass cleanly.

## Checks to Run
- `pnpm --filter @dealflow360/api test`
- `pnpm --filter @dealflow360/web build`
