# Implementation Prompt: Developer B - Phase 1 (Upsell & Cross-sell Foundation)

## Goal
Implement the complete Phase 1 Upsell & Cross-sell vertical slice for DealFlow360. This includes recommendation rule persistence, deterministic recommendation & co-purchase logic, promotion-aware recommendation evaluation, deterministic ranking, explainable reason metadata, commercial margin delta impact calculation, recommendation retrieval API (`GET /api/v1/quotations/:quotationId/recommendations`), Upsell Panel UI with "Add to Quote" and "Dismiss" actions, validation, authorization, seed data, and unit/integration tests.

## Relevant Skills Read
- `skills/domain/SKILL.md` (Business rules, state transitions, domain isolation)
- `skills/frontend/SKILL.md` (UI implementation, design tokens, responsive layout 360px to 4K)
- `skills/prisma/SKILL.md` (Prisma schema, migrations, seed data)
- `skills/testing/SKILL.md` (Unit & API test setup)

## Code & Config Inspected
- `packages/db/prisma/schema.prisma` (Currently contains `User` and `RefreshSession`)
- `packages/domain/src/recommendations/index.ts` (Basic stub interface)
- `packages/contracts/src/quotes/index.ts` (Contains `QuoteIdParamSchema`)
- `apps/api/src/app.ts` (Express server setup)
- `apps/web/src/routes/AppRoutes.tsx` & `apps/web/src/lib/api/client.ts` (Frontend routing and Axios client)
- `docs/09_DEVELOPER_B.md`, `docs/05_BUSINESS_RULES.md`, `docs/06_API_CONTRACT.md`, `docs/domain-model.md`

## Decisions & Assumptions
1. **Schema Additions**:
   - Add `RecommendationRule` entity to `packages/db/prisma/schema.prisma`.
   - Add minimal `Product`, `Customer`, `Quotation`, `QuoteLine` models to `packages/db/prisma/schema.prisma` so recommendations can execute against real persistent DB records and add items to actual quotes.
2. **Domain Architecture**:
   - Implement `RecommendationEngine` inside `packages/domain/src/recommendations/`.
   - Keep domain logic framework-independent (pure functions, zero Prisma/Express/React dependencies).
3. **Ranking Formula**:
   - Deterministic rank score: `Score = RulePriority * 10 + PromotionBonus (20 if active promotion) + (RecommendedProductListPrice / 100) + MarginImpactScore`.
4. **Reason Metadata**:
   - Specific readable strings, e.g., `"Frequently co-purchased with Enterprise Server Pro"` or `"Active 10% Bundle Promotion for Cloud Security Addon"`.
5. **Add to Quote / Dismiss**:
   - "Add to Quote" calls `POST /api/v1/quotations/:quotationId/lines` via quotation service, triggering quote total and margin recalculation.
   - "Dismiss" removes the recommendation card locally from the UI without modifying the quote state.

## Expected Files to Change / Create

### Database & Seed
- [MODIFY] `packages/db/prisma/schema.prisma` (Add `RecommendationRule`, `Product`, `Customer`, `Quotation`, `QuoteLine`)
- [MODIFY] `packages/db/prisma/seed.ts` (Seed sample products, customers, quotes, and recommendation rules)

### Domain (`packages/domain`)
- [MODIFY] `packages/domain/src/recommendations/index.ts`
- [NEW] `packages/domain/src/recommendations/recommendationEngine.ts`
- [NEW] `packages/domain/src/recommendations/types.ts`
- [MODIFY] `packages/domain/src/index.ts`

### Contracts (`packages/contracts`)
- [NEW] `packages/contracts/src/recommendations/index.ts`
- [MODIFY] `packages/contracts/src/index.ts`

### API (`apps/api`)
- [NEW] `apps/api/src/modules/recommendations/recommendationController.ts`
- [NEW] `apps/api/src/modules/recommendations/recommendationService.ts`
- [NEW] `apps/api/src/routes/recommendationRoutes.ts`
- [NEW] `apps/api/src/modules/quotes/quoteService.ts` (Minimal contract implementation to support line additions)
- [NEW] `apps/api/src/routes/quoteRoutes.ts`
- [MODIFY] `apps/api/src/app.ts` (Mount recommendation & quote routes)

### Web UI (`apps/web`)
- [NEW] `apps/web/src/features/quotes/components/UpsellPanel.tsx`
- [NEW] `apps/web/src/features/quotes/QuotationViewPage.tsx`
- [MODIFY] `apps/web/src/routes/AppRoutes.tsx`

### Tests (`apps/api` / `packages/domain`)
- [NEW] `packages/domain/src/recommendations/__tests__/recommendationEngine.test.ts`
- [NEW] `apps/api/src/__tests__/recommendations.test.ts`

## Requirements & Security Considerations
- **Authorization**: Restrict API endpoints to authenticated users with `SALES_REP`, `SALES_MANAGER`, `FINANCE_OPERATIONS`, or `ADMIN` roles.
- **Validation**: Use Zod schemas for all route parameters and request payloads.
- **Data Integrity**: Ensure product pricing and costs are retrieved from DB, avoiding hardcoded values.

## Acceptance Criteria
1. Opening a quotation fetches real ranked recommendations based on active products in the quote.
2. Recommendations display explainable reasons and promotion badges where applicable.
3. Margin delta (revenue impact and margin change) is dynamically calculated from actual product prices and costs.
4. Clicking "Add to Quote" adds the recommended product to the quotation via `POST /api/v1/quotations/:id/lines` and recalculates quote total and margin.
5. Clicking "Dismiss" removes the item from the panel UI without mutating the quotation.
6. Automated unit tests for recommendation logic and integration tests for API endpoints pass cleanly.

## Manual Test Steps
1. Seed database with test products (e.g., "Enterprise Server Pro", "UPS Power Backup", "Rackmount Kit") and co-purchase recommendation rules.
2. Login as `sales_rep`.
3. Navigate to a quotation containing "Enterprise Server Pro".
4. Verify "UPS Power Backup" appears in the Upsell Panel with reason "Frequently co-purchased with Enterprise Server Pro".
5. Observe the calculated margin delta (e.g. `+₹15,000`).
6. Click "Add to Quote". Verify quote lines update, and total/margin are recalculated.
7. Observe another recommendation, click "Dismiss", and verify it disappears without altering the quote.
