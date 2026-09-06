# Implementation Prompt: Quotation Commercial Calculation Correction (Tax + Editable Selling Price + Discount on Final Price)

## Goal
Implement revised quotation commercial calculation rules:
1. Single server-authoritative quotation calculation engine in `@dealflow360/domain`.
2. Editable line selling price (`unitPrice`) defaulting from A2 effective price reference (`listPrice`) without any upper limit constraint.
3. Calculation of line discount based strictly on final editable selling price (`grossAmount = unitPrice * quantity`).
4. Tax calculation based on taxable base (`taxableAmount = grossAmount - discountAmount`) with taxRate snapshotted from `product.taxRate`.
5. Addition of Tax fields (`taxRate`, `taxAmount`) to `QuoteLine` and `taxableAmount`, `taxAmount` to `Quotation` summary totals.
6. Absolute rejection of client-submitted totals (backend recalculates all values before persistence/submission).
7. Unified `roundMoney` formatting at line-level metric boundaries and header summation reconciliation.
8. Preservation of A3 commercial policy evaluation, margin calculation, and A4 approval routing based on actual deal selling price.
9. Responsive UI updates in Quote Builder, Quotation View, and Customer Portal with clear display of Default/Reference Price vs Selling Price, Tax, Taxable Base, and Grand Total.
10. Audit event logging for committed line mutations and quotation submission.

## Relevant Skills Read
- `skills/domain/SKILL.md` - Framework-independent domain engines (`packages/domain`).
- `skills/frontend/SKILL.md` - UI guidelines, design tokens, Axios client.
- `skills/prisma/SKILL.md` - Prisma schema updates and DB safety.
- `skills/testing/SKILL.md` - Unit and integration test strategy.

## Code/Config Inspected
- `packages/db/prisma/schema.prisma` - `Quotation` and `QuoteLine` models.
- `packages/domain/src/quote/quoteEngine.ts` - Line calculation, quote totals, and risk evaluation functions.
- `packages/domain/src/margin/marginEngine.ts` - Line margin and deal totals functions.
- `packages/domain/src/policy/policyEvaluator.ts` - Commercial deal evaluator.
- `packages/contracts/src/quotes/index.ts` - Zod schemas for quote requests and line mutations.
- `apps/api/src/modules/quotes/quoteService.ts` - Quote service line CRUD, recalculation, submission logic.
- `apps/api/src/services/commercialEvaluationService.ts` - A3 commercial evaluation service.
- `apps/web/src/features/quotes/QuoteBuilderPage.tsx` - Quote creation page.
- `apps/web/src/features/quotes/QuotationViewPage.tsx` - Quotation detail page.
- `apps/web/src/features/portal/CustomerPortalPage.tsx` - Customer portal page.

## Decisions and Assumptions
1. `unitPrice` stored in `QuoteLine` represents the final quotation selling price per unit. `listPrice` stored in `QuoteLine` represents the A2 catalog/effective reference price at quotation creation time.
2. `unitPrice` defaults to A2 effective price, but can be edited by the user to any non-negative number (lower or higher than default price). `Product.listPrice` is never modified by quotation price changes.
3. Line calculation formula:
   - `grossAmount` = `unitPrice * quantity`
   - `discountAmount` = `roundMoney(grossAmount * proposedDiscountPercent / 100)`
   - `taxableAmount` = `roundMoney(grossAmount - discountAmount)`
   - `taxAmount` = `roundMoney(taxableAmount * taxRate / 100)`
   - `netLinePrice` (Line Grand Total) = `roundMoney(taxableAmount + taxAmount)`
   - `lineCost` = `roundMoney(quantity * standardCost)`
   - `marginAmount` = `roundMoney(taxableAmount - lineCost)`
   - `lineMarginPercent` = `taxableAmount > 0 ? roundMoney((marginAmount / taxableAmount) * 100) : 0`
4. Header quotation summary formula:
   - `subtotal` = `roundMoney(Σ line grossAmount)`
   - `totalDiscount` = `roundMoney(Σ line discountAmount)`
   - `taxableAmount` = `roundMoney(Σ line taxableAmount)`
   - `taxAmount` = `roundMoney(Σ line taxAmount)`
   - `netValue` (Header Grand Total) = `roundMoney(taxableAmount + taxAmount)`
5. `taxRate` defaults from `product.taxRate` when creating a line and is snapshotted on `QuoteLine`.

## Expected Files to Change
- `packages/db/prisma/schema.prisma`
- `packages/domain/src/quote/quoteEngine.ts`
- `packages/contracts/src/quotes/index.ts`
- `apps/api/src/modules/quotes/quoteService.ts`
- `apps/api/src/services/commercialEvaluationService.ts`
- `apps/web/src/features/quotes/QuoteBuilderPage.tsx`
- `apps/web/src/features/quotes/QuotationViewPage.tsx`
- `apps/web/src/features/portal/CustomerPortalPage.tsx`
- `packages/domain/src/__tests__/quoteEngine.test.ts`
- `apps/api/src/__tests__/quote.test.ts`

## Acceptance Criteria
- Seeded Product default price ₹1,000 edited to ₹1,500, qty=2, disc=10%, tax=18% yields Subtotal ₹3,000, Disc ₹300, Taxable ₹2,700, Tax ₹486, Grand Total ₹3,186.
- Changing `unitPrice` to ₹2,000 dynamically updates all dependent calculations. Product default price remains ₹1,000 unchanged.
- Client attempts to submit fake `taxAmount` or `netValue` are ignored; backend recalculates correct values.
- Selling price can be greater than product list price (`unitPrice > listPrice`).
- Discount governance, margin calculation, and approval routing evaluate using the final selling price (`unitPrice`).

## Checks to Run
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
