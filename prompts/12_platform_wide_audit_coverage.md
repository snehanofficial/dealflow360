# IMPLEMENTATION PROMPT - DEALFLOW360 PLATFORM-WIDE AUDIT COVERAGE

## Goal
Expand the DealFlow360 audit subsystem from Developer A (A1-A5) to cover the complete B2B sales-to-cash lifecycle across all application modules (Quotations, Customer Portal/Negotiation, Multi-Warehouse Fulfillment Allocation, Hybrid Billing Schedules, Control Tower Deal Health Alerts, and User Authentication) while preserving append-only immutability, server-derived actor identity, data sanitization, and transactional consistency.

---

## Relevant Skills Read
- `skills/domain/SKILL.md`
- `skills/testing/SKILL.md`
- `skills/prisma-client-api/SKILL.md`

---

## Code/Config Inspected
- `packages/contracts/src/audit/index.ts`
- `packages/domain/src/audit/index.ts`
- `apps/api/src/services/auditService.ts`
- `apps/api/src/modules/quotes/quoteService.ts`
- `apps/api/src/modules/portal/portalService.ts`
- `apps/api/src/modules/fulfillment/fulfillmentService.ts`
- `apps/api/src/modules/billing/billingService.ts`
- `apps/api/src/modules/control-tower/controlTowerService.ts`
- `apps/api/src/services/authService.ts`
- `apps/web/src/features/audit/AuditTrailPage.tsx`
- `docs/events.md`

---

## Audit Coverage Matrix

| Module | Entity | Action / Mutation | Entry Point / Service Method | Database Mutation | Audit Event Type | Transactional | Actor Source |
|---|---|---|---|---|---|---|---|
| Customers | Customer | Create Customer | `customer.service.ts` -> `createCustomer` | `db.customer.create` | `CUSTOMER_CREATED` | Yes (`tx`) | Server (`req.user`) |
| Customers | Customer | Update Customer | `customer.service.ts` -> `updateCustomer` | `db.customer.update` | `CUSTOMER_UPDATED` | Yes (`tx`) | Server (`req.user`) |
| Products | Product | Create Product | `product.service.ts` -> `createProduct` | `db.product.create` | `PRODUCT_CREATED` | Yes (`tx`) | Server (`req.user`) |
| Products | Product | Update Product / Price | `product.service.ts` -> `updateProduct` | `db.product.update` | `PRODUCT_PRICE_CHANGED` / `PRODUCT_UPDATED` | Yes (`tx`) | Server (`req.user`) |
| Price Lists | PriceList | Create Price List | `priceListService.ts` -> `createPriceList` | `db.priceList.create` | `PRICE_LIST_CREATED` | Yes (`tx`) | Server (`req.user`) |
| Price Lists | PriceListEntry | Upsert Price Entry | `priceListService.ts` -> `upsertEntry` | `db.priceListEntry.upsert` | `PRODUCT_PRICE_CHANGED` | Yes (`tx`) | Server (`req.user`) |
| Discount Policies | DiscountPolicyRule | Create Rule | `discountPolicyService.ts` -> `createRule` | `db.discountPolicyRule.create` | `DISCOUNT_POLICY_CREATED` | Yes (`tx`) | Server (`req.user`) |
| Discount Policies | DiscountPolicyRule | Update Rule | `discountPolicyService.ts` -> `updateRule` | `db.discountPolicyRule.update` | `DISCOUNT_POLICY_UPDATED` | Yes (`tx`) | Server (`req.user`) |
| Approvals | ApprovalRequest | Request Approval | `approvalService.ts` -> `createApprovalRequest` | `db.approvalRequest.create` | `APPROVAL_REQUESTED` | Yes (`tx`) | Server (`req.user`) |
| Approvals | ApprovalStep | Approve Step | `approvalService.ts` -> `approveStep` | `tx.approvalStep.update` | `APPROVAL_APPROVED` | Yes (`tx`) | Server (`req.user`) |
| Approvals | ApprovalStep | Reject Step | `approvalService.ts` -> `rejectStep` | `tx.approvalStep.update` | `APPROVAL_REJECTED` | Yes (`tx`) | Server (`req.user`) |
| Quotations | Quotation | Create Quotation | `quoteService.ts` -> `createQuotation` | `db.quotation.create` | `QUOTE_CREATED` | Yes | Server (`req.user`) |
| Quotations | QuoteLine | Add Line Item | `quoteService.ts` -> `addQuoteLine` | `db.quoteLine.create/update` | `QUOTE_LINE_ADDED` | Yes | Server (`req.user`) |
| Quotations | QuoteLine | Update Line Item | `quoteService.ts` -> `updateQuoteLine` | `db.quoteLine.update` | `QUOTE_LINE_UPDATED` | Yes | Server (`req.user`) |
| Quotations | QuoteLine | Delete Line Item | `quoteService.ts` -> `deleteQuoteLine` | `db.quoteLine.delete` | `QUOTE_LINE_DELETED` | Yes | Server (`req.user`) |
| Quotations | Quotation | Submit Quotation | `quoteService.ts` -> `submitQuotation` | `db.quotation.update` | `QUOTE_SUBMITTED` | Yes | Server (`req.user`) |
| Customer Portal | PortalToken | Generate Portal Access Token | `portalService.ts` -> `generatePortalToken` | `db.portalToken.create` | `PORTAL_TOKEN_GENERATED` | Yes | Server (`req.user`) |
| Customer Portal | CounterOffer | Submit Counteroffer | `portalService.ts` -> `submitCounterOffer` | `db.counterOffer.create` | `COUNTEROFFER_SUBMITTED` | Yes | Portal Customer / Token |
| Fulfillment | FulfillmentAllocation | Override Warehouse Allocations | `fulfillmentService.ts` -> `overrideFulfillment` | `db.fulfillmentAllocation.create` | `FULFILLMENT_ALLOCATED` | Yes | Server (`req.user`) |
| Billing | BillingSchedule | Generate Billing Schedule | `billingService.ts` -> `generateAndSaveBillingSchedule` | `db.billingSchedule.create` | `BILLING_SCHEDULE_GENERATED` | Yes | Server (`req.user`) |
| Control Tower | DealAlert | Resolve Deal Alert | `controlTowerService.ts` -> `resolveAlert` | `db.dealAlert.update` | `DEAL_ALERT_RESOLVED` | Yes | Server (`req.user`) |
| Authentication | User / Session | User Login | `authService.ts` -> `login` | `userRepo.createRefreshSession` | `USER_LOGGED_IN` | Yes | Authenticated User |

---

## Decisions & Assumptions

1. **Centralized Write Boundary**: Audit calls will strictly occur inside application service methods (`QuoteService`, `PortalService`, `FulfillmentService`, `BillingService`, `ControlTowerService`, `AuthService`), keeping controllers and routes thin.
2. **Server-Derived Identity**: `actorId`, `actorName`, and `actorRole` will be populated from server-side context (`req.user`), preventing client-side spoofing.
3. **Data Sanitization**: Payload sanitization will filter sensitive credentials (`password`, `passwordHash`, `token`, `refreshToken`, `authorization`, `cookie`) and apply entity allowlists for Quotations, CounterOffers, Allocations, Billing Schedules, and Alerts.
4. **Append-Only REST API**: REST API (`GET /api/v1/audit`, `GET /api/v1/audit/entity/:entityType/:entityId`) remains strictly read-only under `Permissions.AUDIT_VIEW`. HTTP `POST`, `PUT`, `PATCH`, `DELETE` are rejected.
5. **No Technical Spam**: Read operations (GET requests), passive recalculations, and React state updates will not emit audit events.

---

## Expected Files to Change

1. `packages/contracts/src/audit/index.ts` - Add new `AuditEventTypeEnum` and `AuditEntityTypeEnum` constants.
2. `apps/api/src/services/auditService.ts` - Add entity allowlists for `Quotation`, `QuoteLine`, `CounterOffer`, `FulfillmentAllocation`, `BillingSchedule`, `DealAlert`, and `User`.
3. `apps/api/src/modules/quotes/quoteService.ts` - Emit `QUOTE_CREATED`, `QUOTE_LINE_ADDED`, `QUOTE_LINE_UPDATED`, `QUOTE_LINE_DELETED`, and `QUOTE_SUBMITTED` with actor injection.
4. `apps/api/src/modules/quotes/quoteController.ts` - Pass authenticated `req.user` to `quoteService` methods.
5. `apps/api/src/modules/portal/portalService.ts` - Emit `PORTAL_TOKEN_GENERATED` and `COUNTEROFFER_SUBMITTED`.
6. `apps/api/src/modules/portal/portalController.ts` - Pass `req.user` context where available.
7. `apps/api/src/modules/fulfillment/fulfillmentService.ts` - Emit `FULFILLMENT_ALLOCATED` on allocation overrides.
8. `apps/api/src/modules/fulfillment/fulfillmentController.ts` - Pass `req.user` context to `fulfillmentService`.
9. `apps/api/src/modules/billing/billingService.ts` - Emit `BILLING_SCHEDULE_GENERATED` on schedule creation.
10. `apps/api/src/modules/billing/billingController.ts` - Pass `req.user` context to `billingService`.
11. `apps/api/src/modules/control-tower/controlTowerService.ts` - Emit `DEAL_ALERT_RESOLVED` when an alert is resolved.
12. `apps/api/src/modules/control-tower/controlTowerController.ts` - Pass `req.user` context to `controlTowerService`.
13. `apps/api/src/services/authService.ts` - Emit `USER_LOGGED_IN` event upon successful authentication.
14. `apps/web/src/features/audit/AuditTrailPage.tsx` - Update dropdown filters to include all entity types and event types.
15. `docs/events.md` - Document complete canonical event taxonomy and payload schemas.
16. `apps/api/src/__tests__/auditCoverage.test.ts` - New test suite validating end-to-end audit coverage across all modules.

---

## Security Considerations

- **Server-Side Identity Enforcement**: Actor context is injected from `req.user`. Client requests cannot specify or override `actorId`.
- **Sensitive Field Removal**: `sanitizeAuditPayload` enforces explicit field allowlists per entity type. Passwords, hashes, JWT tokens, and cookies are stripped.
- **Append-Only Protection**: No mutation routes exist for audit records.

---

## Acceptance Criteria

1. Every business mutation across all modules (Customers, Products, Price Lists, Policies, Approvals, Quotations, Portal Counteroffers, Fulfillment, Billing, Deal Alerts, Login) produces a structured, sanitized audit log.
2. Audit records reflect exact field deltas (`previousState`, `newState`, `changes`).
3. Audit queries support entity filtering, event filtering, search, and pagination.
4. `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass with 0 errors.

---

## Verification Plan

### Automated Tests
- Run `pnpm test` to verify all Vitest unit and integration suites (including `auditCoverage.test.ts`).
- Run `pnpm typecheck`, `pnpm lint`, and `pnpm build`.

### Manual Verification Steps
1. Log in as `sales.rep@dealflow360.com` and create a Quotation (`QT-2026-XXXX`).
2. Add product line items, update quantity, and submit quotation for approval.
3. Log in as `sales.manager@dealflow360.com` and approve the quotation request.
4. Generate a customer portal token and submit a customer counteroffer.
5. Log in as `sales.manager@dealflow360.com`, override warehouse fulfillment allocations, and generate a hybrid billing schedule.
6. Resolve a deal alert from the Control Tower.
7. Open `/audit` as `sales.manager@dealflow360.com` or `finance@dealflow360.com` and verify the complete timeline from Quotation Creation to Billing Schedule Generation.
8. Filter by entity (`Quotation`, `CounterOffer`, `FulfillmentAllocation`, `BillingSchedule`, `DealAlert`) and verify before/after state diffs.
9. Attempt `POST /api/v1/audit` or `DELETE /api/v1/audit/1` and verify rejection.
