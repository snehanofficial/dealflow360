# Implementation Prompt: Developer B — Phase 2 (Upsell Margin Integration)

## Goal
Complete Phase 2 of Developer B's roadmap: Upsell Margin Integration. This phase enhances the commercial impact calculation of recommendations, ensuring dynamic revenue, cost, margin delta %, and recurring billing adjustments, integrated seamlessly with quotation recalculation and verified with comprehensive boundary and regression tests.

## Relevant Skills Read
- `skills/domain/SKILL.md` (Margin engine, pricing rules, decimal precision, deterministic calculations)
- `skills/testing/SKILL.md` (Boundary tests, regression tests, Vitest setup)

## Code & Config Inspected
- `packages/domain/src/recommendations/recommendationEngine.ts`
- `packages/domain/src/recommendations/types.ts`
- `apps/api/src/modules/quotes/quoteService.ts`
- `apps/api/src/modules/recommendations/recommendationService.ts`
- `docs/09_DEVELOPER_B.md` (Phase 2 Tasks 2.1 - 2.10)
- `docs/05_BUSINESS_RULES.md` (Pricing & Margin engines)

## Decisions & Assumptions
1. **Recurring Line Pricing Adjustment**:
   - For recurring products (`RECURRING` billing type), calculate annualized additional revenue if `recurringPeriod` is `'MONTHLY'` (12x monthly price) vs `'ANNUAL'` (1x annual price) so margin impact reflects total commercial deal impact.
2. **Margin Delta Precision**:
   - Calculate precision rounding (2 decimal places) for monetary amounts (`additionalRevenue`, `additionalCost`, `additionalMargin`) and margin percentages (`projectedGrossMarginPercent`, `marginDeltaPercent`).
3. **Boundary Edge Cases**:
   - Explicitly handle quotes with `$0` net value, 100% discount rules, zero-cost products, and negative margin products without divide-by-zero errors or NaNs.
4. **Recalculation Integration**:
   - Verify that adding a recommended line via `quoteService.addQuoteLine` recalculates quote totals and updates quote state immediately.

## Expected Files to Change / Create

### Domain Layer (`packages/domain`)
- [MODIFY] `packages/domain/src/recommendations/recommendationEngine.ts` (Enhance margin & revenue calculation to handle recurring periods, 100% discounts, and zero-net-value edge cases)
- [NEW] `packages/domain/src/recommendations/__tests__/marginIntegration.test.ts` (Add boundary and regression tests for margin & revenue calculations)

### API Layer (`apps/api`)
- [MODIFY] `apps/api/src/modules/quotes/quoteService.ts` (Ensure boundary-safe recalculations and precise margin delta outputs)
- [MODIFY] `apps/api/src/__tests__/recommendations.test.ts` (Add regression tests for quote total and margin updates post-addition)

## Acceptance Criteria
1. Additional revenue, cost, margin delta %, and projected gross margin % handle both one-time and recurring (monthly/annualized) products accurately.
2. Edge cases (zero current net value, 100% discount, zero cost) compute cleanly without NaN or infinite values.
3. Adding a recommendation recalculates quote subtotal, total discount, net value, gross margin %, and commercial risk level.
4. Boundary and regression test suite passes 100%.

## Manual Test Steps
1. Open quotation `QT-2026-0001`.
2. Inspect recommendation for recurring product "Enterprise Cloud Security Suite" (Annual recurring).
3. Observe annualized revenue impact and margin delta %.
4. Click "Add to Quote". Verify quote total and gross margin % update immediately.
5. Verify zero-value or 100% discount edge cases compute gracefully.
