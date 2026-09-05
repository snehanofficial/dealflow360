# Implementation Prompt: Developer B - Phase B5 Upsell & Cross-sell Recommendation Engine

## 1. Goal
Implement Phase B5 of Developer B's vertical slice in DealFlow360:
- Verify deterministic recommendation service (`packages/domain/src/recommendations/recommendationEngine.ts`) calculating co-purchase & promotion suggestions and margin delta impact.
- Expose REST API endpoint `GET /api/v1/recommendations/quotes/:quotationId` and `GET /api/v1/quotations/:id/recommendations`.
- Ensure `UpsellPanel.tsx` is embedded inside Quote Builder & Quotation View pages with live commercial impact metrics (additional revenue, additional cost, projected gross margin %, and margin delta %).
- Ensure adding a recommended product adds the quotation line, recalculates quote pricing/margin server-side, and removes the added item from the active recommendation list.
- Write Vitest unit and Supertest integration tests verifying deterministic ranking, margin delta recalculation, and exclusion of already-added quote items.

## 2. Relevant Skills Read
- `skills/domain/SKILL.md`
- `skills/frontend/SKILL.md`
- `skills/testing/SKILL.md`

## 3. Code & Config Inspected
- `docs/09_DEVELOPER_B.md`
- `packages/domain/src/recommendations/recommendationEngine.ts`
- `packages/domain/src/recommendations/__tests__/recommendationEngine.test.ts`
- `apps/api/src/modules/recommendations/recommendationService.ts`
- `apps/web/src/features/quotes/components/UpsellPanel.tsx`

## 4. Decisions and Assumptions
- Recommendation ranking formula: `RankScore = priority * 10 + promoBonus + valueBonus + marginBonus`.
- Items already present on the quote are filtered out from recommendation results.
- Adding a recommendation invokes `POST /api/v1/quotes/:id/lines` with the target product and promotional discount (if applicable), which triggers authoritative server-side recalculation of quotation subtotal, total discount, net value, gross margin %, risk score, and risk level.

## 5. Expected Files to Change
- `apps/api/src/routes/recommendationRoutes.ts` (Mounted standalone `/api/v1/recommendations` routes)
- `apps/api/src/app.ts` (Registered `recommendationRoutes`)
- `apps/web/src/features/quotes/components/UpsellPanel.tsx` (Upsell UI panel)
- `apps/web/src/features/quotes/QuotationViewPage.tsx` (Embedded Upsell panel)
- `apps/api/src/__tests__/recommendations.test.ts` (Supertest API integration tests)

## 6. Acceptance Criteria
- `GET /api/v1/recommendations/quotes/:id` returns ranked recommendations with explainable reasons and margin delta calculations.
- Adding a recommendation appends line item to quotation and recalculates totals and margin.
- Monorepo build and test suite pass with zero errors.

## 7. Checks to Run
- `pnpm build`
- `pnpm test -- --run`
