# Developer B — Phased Implementation Plan (Updated for True A/B Independence)

## 1. Ownership Overview & Scope Boundary

Developer B owns the **Commercial Deal Execution & Operations** vertical slice of DealFlow360.

### Owned Business Modules:
1. **Quotation Management & Quote Builder** (Quotation Header, Quotation Lines, Quote Builder UI, Line item editor, State Machine)
2. **Customer Negotiation Portal** (Restricted customer portal view, Line-level comments, Counter-discount proposals, Customer submission)
3. **Multi-Warehouse Fulfillment & Splitting** (Inventory availability, Recommended multi-warehouse allocation split, Manual override, Backorders)
4. **Subscription & Hybrid Billing Engine** (One-time vs Recurring billing schedules, Billing frequency, Proration calculation, Modifications)
5. **Upsell & Cross-sell Recommendation Engine** (Deterministic co-purchase and promotion suggestions, Commercial impact calculation)
6. **Deal Health Alerts & Control Tower Dashboard** (Stalled deal detection, Margin leakage alerts, Live operational dashboard with multi-criteria filters)

### Explicitly Excluded (Owned by Developer A):
- Customer Entity & Customer CRUD (`/api/v1/customers`)
- Product Catalog & Allowed Discount Setup (`/api/v1/products`)
- Commercial Policy Rule Matrix (`/api/v1/discount-policies`)
- Approval Request Core Routing (`/api/v1/approvals`)
- System-wide Audit Trail (`/api/v1/audit`)

---

## 2. Technical Ownership Boundaries

### Database Model Ownership:
- `Quote`
- `QuoteLine`
- `PortalToken`
- `CounterOffer`
- `Warehouse`
- `InventoryItem`
- `FulfillmentAllocation`
- `BillingSchedule`
- `BillingLine`
- `RecommendationRule`
- `DealAlert`

### API Endpoint Ownership:
- `/api/v1/quotes/*`
- `/api/v1/portal/quotes/*`
- `/api/v1/fulfillment/*`
- `/api/v1/billing/*`
- `/api/v1/recommendations/*`
- `/api/v1/control-tower/*`

### Frontend Route Ownership:
- `/quotes` (`QuoteListPage`, `QuoteBuilderPage`, `QuoteDetailPage`)
- `/portal/quotes/:token` (`CustomerPortalPage`, `CounterOfferModal`)
- `/fulfillment` (`FulfillmentAllocationPage`)
- `/billing` (`BillingSchedulePage`)
- `/app` or `/dashboard` (`OperationalDashboardPage`, `ControlTowerPage`)

### Contracts Consumed from Developer A:
- `CustomerReferenceDto` (`id`, `code`, `name`, `tier`)
- `ProductReferenceDto` (`id`, `sku`, `name`, `category`, `type`, `unitPrice`, `costPrice`, `maxAllowedDiscount`)
- `CommercialEvaluationDto` (`quoteId`, `riskScore`, `violations`, `requiredApprovalRoles`)

---

## 3. Phased Execution Path

### Phase B1: Quotation Management & Quote Builder UI
- Implement `Quote` and `QuoteLine` Prisma models, repository, service, and controller.
- Implement REST API: `POST /api/v1/quotes`, `GET /api/v1/quotes`, `GET /api/v1/quotes/:id`, `POST /api/v1/quotes/:id/lines`.
- Build `QuoteBuilderPage` UI using `CustomerReference` and `ProductReference` seed contracts.
- Implement Quote state machine transitions (`DRAFT` -> `PENDING_APPROVAL` -> `APPROVED`).
- Write quotation unit & API tests.

### Phase B2: Customer Negotiation Portal & Counteroffers
- Implement `PortalToken` and `CounterOffer` models and token access verification.
- Implement API: `GET /api/v1/portal/quotes/:token`, `POST /api/v1/portal/quotes/:token/counter-offer`.
- Build responsive `CustomerPortalPage` UI.
- Test token security and counteroffer state recalculation.

### Phase B3: Multi-Warehouse Fulfillment & Splitting
- Implement `Warehouse`, `InventoryItem`, and `FulfillmentAllocation` models.
- Implement split-allocation algorithm in `packages/domain`.
- Implement API: `POST /api/v1/quotes/:id/fulfillment/compute`, `POST /api/v1/quotes/:id/fulfillment/override`.
- Build `FulfillmentAllocationPage` UI.

### Phase B4: Subscription & Hybrid Billing Engine
- Implement `BillingSchedule` and `BillingLine` models.
- Implement hybrid billing calculations (one-time vs recurring) and proration formulas.
- Implement API: `GET /api/v1/quotes/:id/billing`.
- Build `BillingSchedulePage` UI.

### Phase B5: Upsell & Cross-sell Recommendation Engine
- Implement deterministic recommendation service using product catalog seed contracts.
- Build Upsell panel UI embedded inside Quote Builder.
- Test margin delta recalculation after adding upsell items.

### Phase B6: Deal Health Alerts & Control Tower Operational Dashboard
- Implement `DealAlert` model and stalled-deal detection rules.
- Build `OperationalDashboardPage` with live metrics, deal health alerts, and period/team/status filters.
- Run complete Developer B test suite verification (`pnpm typecheck`, `pnpm test`).

---

## 4. Independence Declaration

> Developer B can implement, test, and run all 6 owned phases independently using seed customer/product contracts and unit/integration tests without waiting for Developer A.
