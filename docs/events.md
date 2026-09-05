# DealFlow360 — Governance Commercial Events & Audit Specification

## 1. Overview

This document specifies the canonical platform-wide commercial event contract and taxonomy for **DealFlow360**.

Audit events capture critical commercial mutations, approval decisions, customer negotiation counteroffers, warehouse fulfillment allocations, hybrid billing lockouts, and deal health alert resolutions across the system. The audit subsystem follows an append-only architecture, ensuring a trustworthy historical timeline for financial compliance.

---

## 2. Event Payload Schema

Every audit record in DealFlow360 strictly conforms to the following generic contract:

```typescript
export interface CommercialEventPayload {
  eventType: AuditEventType;       // Controlled event constant (e.g., CUSTOMER_CREATED, QUOTE_SUBMITTED, COUNTEROFFER_SUBMITTED)
  action: string;                 // Human-readable summary title (e.g., "Submitted quotation QT-2026-0001 for approval")
  entityType: AuditEntityType;    // Controlled entity name (e.g., Customer, Product, Quotation, BillingSchedule)
  entityId: string;               // Unique ID of target business record
  actor?: {                       // Authenticated actor snapshot at event time
    id?: string | null;           // Authoritative User.id (null for SYSTEM actions)
    name?: string | null;         // Snapshot actor name
    role?: Role | null;           // Snapshot actor role at event time
  } | null;
  previousState?: Record<string, unknown> | null;  // Allowlist-filtered snapshot before change
  newState?: Record<string, unknown> | null;       // Allowlist-filtered snapshot after change
  metadata?: Record<string, unknown> | null;        // Contextual metadata (IP, path, reason, correlation ID)
}
```

---

## 3. Canonical Event Taxonomy

The following event types represent all governed business mutations across the system:

| Event Type | Entity Type | Triggering Service Method | Description |
|---|---|---|---|
| `CUSTOMER_CREATED` | `Customer` | `customer.service.ts` -> `createCustomer` | New customer account created |
| `CUSTOMER_UPDATED` | `Customer` | `customer.service.ts` -> `updateCustomer` | Customer details/tier updated |
| `PRODUCT_CREATED` | `Product` | `product.service.ts` -> `createProduct` | New product added to catalog |
| `PRODUCT_UPDATED` | `Product` | `product.service.ts` -> `updateProduct` | Product properties updated |
| `PRODUCT_PRICE_CHANGED` | `Product` / `PriceListEntry` | `product.service.ts` / `priceListService.ts` | List price or custom price updated |
| `PRICE_LIST_CREATED` | `PriceList` | `priceListService.ts` -> `createPriceList` | New customer-tier price list created |
| `PRICE_LIST_UPDATED` | `PriceList` | `priceListService.ts` -> `updatePriceList` | Price list rules updated |
| `DISCOUNT_POLICY_CREATED` | `DiscountPolicyRule` | `discountPolicyService.ts` -> `createRule` | New discount policy rule created |
| `DISCOUNT_POLICY_UPDATED` | `DiscountPolicyRule` | `discountPolicyService.ts` -> `updateRule` | Discount policy thresholds updated |
| `APPROVAL_REQUESTED` | `ApprovalRequest` | `approvalService.ts` -> `createApprovalRequest` | Commercial approval workflow requested |
| `APPROVAL_APPROVED` | `ApprovalStep` | `approvalService.ts` -> `approveStep` | Approval step approved by manager/finance |
| `APPROVAL_REJECTED` | `ApprovalStep` | `approvalService.ts` -> `rejectStep` | Approval step rejected with reason |
| `QUOTE_CREATED` | `Quotation` | `quoteService.ts` -> `createQuotation` | Draft quotation created |
| `QUOTE_LINE_ADDED` | `QuoteLine` | `quoteService.ts` -> `addQuoteLine` | Product line item added to quotation |
| `QUOTE_LINE_UPDATED` | `QuoteLine` | `quoteService.ts` -> `updateQuoteLine` | Quantity/discount updated on line item |
| `QUOTE_LINE_DELETED` | `QuoteLine` | `quoteService.ts` -> `deleteQuoteLine` | Product line item removed from quotation |
| `QUOTE_SUBMITTED` | `Quotation` | `quoteService.ts` -> `submitQuotation` | Quotation submitted for risk & approval evaluation |
| `PORTAL_TOKEN_GENERATED` | `PortalToken` | `portalService.ts` -> `generatePortalToken` | Customer portal token generated |
| `COUNTEROFFER_SUBMITTED` | `CounterOffer` | `portalService.ts` -> `submitCounterOffer` | Customer submitted counteroffer via portal |
| `FULFILLMENT_ALLOCATED` | `FulfillmentAllocation` | `fulfillmentService.ts` -> `overrideFulfillment` | Warehouse fulfillment allocations saved |
| `BILLING_SCHEDULE_GENERATED` | `BillingSchedule` | `billingService.ts` -> `generateAndSaveBillingSchedule` | Hybrid billing schedule generated and locked |
| `DEAL_ALERT_RESOLVED` | `DealAlert` | `controlTowerService.ts` -> `resolveAlert` | Operational deal health alert resolved |
| `USER_LOGGED_IN` | `User` | `authService.ts` -> `login` | Authenticated user session initiated |

---

## 4. Immutability & Safety Rules

1. **Append-Only Persistence**: Audit logs are strictly read-only to external clients. No HTTP mutation routes (`POST`, `PUT`, `PATCH`, `DELETE`) exist for `/api/v1/audit`.
2. **Server-Derived Identity**: Actor identity (`actorId`, `actorName`, `actorRole`) is derived strictly from validated server authentication (`req.user`), never from request bodies.
3. **Allowlist Field Filtering**: Only explicit safe business fields are persisted in `previousState` and `newState`. Sensitive credentials (`password`, `passwordHash`, `token`, `refreshToken`, `authorization`, `cookie`) are strictly forbidden and sanitized.
4. **Transactional Atomicity**: State mutations and their corresponding audit logs execute within Prisma database transactions (`tx`) where applicable, guaranteeing that failed mutations never produce false audit records.
