# Implementation Prompt: Developer B — Phase B2 Customer Negotiation Portal & Counteroffers

## 1. Goal
Implement Phase B2 of Developer B's vertical slice in DealFlow360:
- Add `PortalToken` and `CounterOffer` models to Prisma schema.
- Implement REST API endpoints:
  - `GET /api/v1/portal/quotes/:token` (Fetch customer-facing quotation portal view by secure token).
  - `POST /api/v1/portal/quotes/:token/counter-offer` (Submit customer counteroffer with proposed discount / quantities / comments).
- Re-evaluate quote totals, gross margin, risk score, and target status upon counteroffer submission.
- Build responsive `CustomerPortalPage` UI with itemized lines, counteroffer modal, and submission feedback.
- Write unit and Supertest API tests for portal token verification and counteroffer state recalculation.

## 2. Relevant Skills Read
- `skills/domain/SKILL.md`
- `skills/frontend/SKILL.md`
- `skills/prisma/SKILL.md`
- `skills/testing/SKILL.md`

## 3. Code & Config Inspected
- `docs/09_DEVELOPER_B.md`
- `packages/db/prisma/schema.prisma`
- `packages/contracts/src/index.ts`
- `packages/domain/src/quote/quoteEngine.ts`
- `apps/api/src/app.ts`
- `apps/web/src/routes/AppRoutes.tsx`

## 4. Decisions and Assumptions
- Access to customer portal is authenticated via a secure, unguessable UUID token (`PortalToken`).
- Portal endpoint does NOT require Bearer user login — the token itself authorizes read access to that specific quote.
- Submitting a counteroffer recalculates line net price, quote totals, gross margin %, risk score, and sets status to `NEGOTIATING` (or `PENDING_MANAGER`/`PENDING_FINANCE` depending on risk re-evaluation).
- Token can expire or be revoked (`isRevoked: true`).
- Responsive UI supports viewports from 360px (mobile) to 4K displays.

## 5. Expected Files to Change
- `packages/db/prisma/schema.prisma` (Add `PortalToken` and `CounterOffer` models, add relation to `Quotation`)
- `packages/contracts/src/portal/index.ts` (Zod schemas for portal token query & counteroffer submission)
- `packages/contracts/src/index.ts` (Export portal contracts)
- `packages/domain/src/quote/quoteEngine.ts` (Counteroffer domain recalculation and negotiation state transitions)
- `apps/api/src/modules/portal/portalService.ts` (Portal logic, token lookup, counteroffer persistence)
- `apps/api/src/modules/portal/portalController.ts` (HTTP handlers for portal endpoints)
- `apps/api/src/routes/portalRoutes.ts` (REST routes for `/api/v1/portal`)
- `apps/api/src/app.ts` (Mount `/api/v1/portal` routes)
- `apps/api/src/__tests__/portal.test.ts` (Supertest integration tests for portal API)
- `apps/web/src/features/portal/CustomerPortalPage.tsx` (Customer quotation review & counteroffer portal UI)
- `apps/web/src/routes/AppRoutes.tsx` (Mount route `/portal/quotes/:token`)

## 6. Requirements
1. **Prisma Models**:
   - `PortalToken`: `id`, `token` (unique), `quotationId`, `expiresAt`, `isRevoked`, `createdAt`.
   - `CounterOffer`: `id`, `quotationId`, `proposedDiscountPercent`, `customerNotes`, `status`, `createdAt`.
2. **REST Endpoints**:
   - `GET /api/v1/portal/quotes/:token`: Validate token; return sanitized customer quote details & lines.
   - `POST /api/v1/portal/quotes/:token/counter-offer`: Validate token & quote state; update proposed discounts/lines; recalculate risk; log counteroffer.
3. **Frontend UI**:
   - `CustomerPortalPage`: Publicly accessible customer view with clear proposal summary, line items, and "Submit Counteroffer" modal.

## 7. Security Considerations
- Validate token existence, expiration (`expiresAt > now`), and active status (`isRevoked === false`).
- Sanitize customer portal response to exclude sensitive internal data (e.g. standard cost prices).

## 8. Acceptance Criteria
- Valid portal token returns 200 with sanitized quote data.
- Expired/revoked token returns 401/404 with clear error.
- Counteroffer updates quote line discounts, recalculates totals & risk level, and transitions quote state to `NEGOTIATING` or required approval state.
- `pnpm typecheck` and `pnpm test` pass with 0 errors.

## 9. Checks to Run
- `pnpm --filter @dealflow360/db build`
- `pnpm build`
- `pnpm test -- --run`

## 10. Exact Manual Test Steps
1. Create a quotation and generate/fetch a portal token.
2. Open `/portal/quotes/:token` in browser.
3. Verify customer portal renders proposal without internal cost metrics.
4. Click "Submit Counteroffer", propose a 20% discount and customer notes, click Submit.
5. Verify quote totals, gross margin, and risk score re-evaluate cleanly.
