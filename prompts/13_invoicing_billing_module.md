# Prompt: DealFlow360 - Invoicing & Billing Module Implementation

## Goal
Implement a production-style, financially accurate **Invoicing / Billing Module** for DealFlow360.
The invoice acts as an immutable financial snapshot of an approved commercial transaction (quotation), preserving approved selling prices, discounts, tax rates, taxable amounts, and customer billing identities.

## Relevant Skills & Docs Read
- `AGENTS.md` - Core product principles & workflow
- `docs/domain-model.md`, `docs/database-contract.md`, `docs/api-contracts.md`, `docs/events.md`
- `packages/db/prisma/schema.prisma`
- `packages/domain/src/quote/quoteEngine.ts`
- `packages/domain/src/billing/billingEngine.ts`

## Code & Schema Inspected
- Verified existing Prisma schema (`Quotation`, `QuoteLine`, `Customer`, `Product`, `BillingSchedule`, `BillingLine`).
- Confirmed `Invoice` and `InvoiceLine` models do NOT exist yet in `schema.prisma`.
- Inspected canonical calculation functions (`calculateLinePricing`, `calculateQuoteTotals`, `roundMoney`).
- Inspected existing routes in `apps/api` and `apps/web`.

## Decisions & Assumptions
1. **Financial Snapshot Authority**: The invoice snapshots the approved quotation's line-level `unitPrice` (selling price), `quantity`, `proposedDiscountPercent`, `discountAmount`, `taxRate`, `taxAmount`, `taxableAmount`, and `netLinePrice`. It does NOT read catalog price for invoice totals.
2. **Immutability**: Issued invoices cannot have line items, prices, discounts, or tax rates modified.
3. **Database Safeguards & Idempotency**: `quotationId` link on `Invoice` ensures a quotation cannot produce duplicate active invoices.
4. **Numbering Scheme**: Invoice numbers generated server-side using format `INV-YYYY-XXXXXX` (e.g. `INV-2026-000101`).
5. **State Machine**: Invoice statuses: `DRAFT`, `ISSUED`, `PAID`, `VOID`.
6. **Audit Integration**: Log events `INVOICE_CREATED`, `INVOICE_ISSUED`, `INVOICE_PAID`, `INVOICE_VOIDED`.

## Files to Change / Create
- `packages/db/prisma/schema.prisma` [MODIFY]
- `packages/contracts/src/invoice/index.ts` [NEW]
- `packages/contracts/src/index.ts` [MODIFY]
- `packages/domain/src/invoice/invoiceEngine.ts` [NEW]
- `packages/domain/src/invoice/index.ts` [NEW]
- `packages/domain/src/index.ts` [MODIFY]
- `packages/domain/src/__tests__/invoiceEngine.test.ts` [NEW]
- `apps/api/src/modules/invoice/invoiceService.ts` [NEW]
- `apps/api/src/modules/invoice/invoiceController.ts` [NEW]
- `apps/api/src/modules/invoice/invoiceRoutes.ts` [NEW]
- `apps/api/src/routes/index.ts` [MODIFY]
- `apps/api/src/__tests__/invoice.test.ts` [NEW]
- `apps/web/src/features/billing/InvoiceListPage.tsx` [NEW]
- `apps/web/src/features/billing/InvoiceDetailPage.tsx` [NEW]
- `apps/web/src/features/billing/index.ts` [MODIFY]
- `apps/web/src/routes/AppRoutes.tsx` [MODIFY]
- `apps/web/src/components/layout/DashboardLayout.tsx` [MODIFY]
- `apps/web/src/features/quotes/QuotationViewPage.tsx` [MODIFY]
- `apps/web/src/features/portal/CustomerPortalPage.tsx` [MODIFY]
- `docs/domain-model.md` [MODIFY]
- `docs/api-contracts.md` [MODIFY]

## Acceptance Criteria
- Acceptance test case:
  - Catalog Price = ₹1,000, Tax = 18%
  - Quotation Selling Price = ₹1,500, Qty = 2, Disc = 10%, Tax = 18%
  - Gross = ₹3,000, Disc = ₹300, Taxable = ₹2,700, Tax = ₹486, Net Total = ₹3,186.
  - Invoice retains ₹1,500 unit selling price even if product catalog price changes to ₹1,800.
- Server-authoritative calculations & duplicate invoice prevention.
- All checks (`pnpm typecheck`, `pnpm test`, `pnpm build`) pass cleanly.
