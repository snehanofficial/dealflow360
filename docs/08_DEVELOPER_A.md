# Developer A - Phased Implementation Plan (Updated for True A/B Independence)

## 1. Ownership Overview & Scope Boundary

Developer A owns the **Commercial Master Data & Governance Engines** vertical slice of DealFlow360.

### Owned Business Modules:
1. **Customer Management** (Customer CRUD, Customer Tier, Status, Validation, Search/Filter)
2. **Product Catalog & Base Pricing** (Product CRUD, Categories, Types, Base Selling & Cost Prices, Allowed Discount limits)
3. **Discount Governance & Margin Engine** (Per-line discount rules, Margin calculation, Policy evaluation)
4. **Approval Workflow Engine & Inbox** (Automatic approval request routing, Sales Manager & Finance approval tasks, Approval decision UI)
5. **Audit Trail & Commercial Event History** (Governance action logging, Audit history API & UI)

### Explicitly Excluded (Owned by Developer B):
- Quotation Creation & Quote Line Builder (`/api/v1/quotes`)
- Customer Negotiation Portal & Counteroffers (`/api/v1/portal/*`)
- Multi-Warehouse Inventory & Fulfillment Allocation (`/api/v1/fulfillment/*`)
- Subscription & Hybrid Billing Schedules (`/api/v1/billing/*`)
- Upsell / Cross-sell Recommendations (`/api/v1/recommendations/*`)
- Operational Dashboard, Deal Health & Control Tower (`/api/v1/control-tower/*`)

---

## 2. Technical Ownership Boundaries

### Database Model Ownership:
- `Customer`
- `Product`
- `DiscountPolicyRule`
- `ApprovalRequest`
- `ApprovalStep`
- `AuditLog`

### API Endpoint Ownership:
- `/api/v1/customers/*`
- `/api/v1/products/*`
- `/api/v1/discount-policies/*`
- `/api/v1/approvals/*`
- `/api/v1/audit/*`

### Frontend Route Ownership:
- `/customers` (`CustomerListPage`, `CustomerDetailPage`)
- `/products` (`ProductListPage`, `ProductDetailPage`)
- `/approvals` (`ApprovalInboxPage`, `ApprovalDetailPage`)
- `/audit` (`AuditTrailPage`)

### Contracts Produced for Developer B:
- `CustomerReferenceDto` (`id`, `code`, `name`, `tier`)
- `ProductReferenceDto` (`id`, `sku`, `name`, `category`, `type`, `unitPrice`, `costPrice`, `maxAllowedDiscount`)
- `CommercialEvaluationDto` (`quoteId`, `netTotal`, `marginAmount`, `marginPercentage`, `riskScore`, `violations`, `requiredApprovalRoles`)

---

## 3. Phased Execution Path

### Phase A1: Customer Management Vertical Slice
- Implement `Customer` Prisma model, repository, service, and controller.
- Implement REST API: `GET /api/v1/customers`, `POST /api/v1/customers`, `GET /api/v1/customers/:id`, `PATCH /api/v1/customers/:id`.
- Build `CustomerListPage` UI with debounced search, filtering, and creation modal.
- Write unit & API tests in `apps/api/src/__tests__/customer.test.ts`.

### Phase A2: Product Catalog & Base Pricing Vertical Slice
- Implement `Product` Prisma model, repository, service, and controller.
- Implement REST API: `GET /api/v1/products`, `POST /api/v1/products`, `GET /api/v1/products/:id`, `PATCH /api/v1/products/:id`.
- Build `ProductListPage` UI with category filtering and price/discount limit inputs.
- Write product unit & API tests.

### Phase A3: Discount Policy Matrix & Margin Engine
- Implement standalone Policy & Margin calculation engine in `packages/domain`.
- Implement per-line allowed discount checks and margin impact derivation.
- Expose evaluation API: `POST /api/v1/discount-policies/evaluate`.
- Write unit tests for normal, boundary, and excessive discount cases.

### Phase A4: Approval Workflow Engine & Inbox UI
- Implement `ApprovalRequest` and `ApprovalStep` Prisma models.
- Implement approval derivation logic (Manager vs Finance required).
- Build `ApprovalInboxPage` and decision modal (`POST /api/v1/approvals/:id/approve`, `reject`).
- Write approval workflow tests.

### Phase A5: Audit Trail & Commercial Event History
- Implement `AuditLog` Prisma model and audit logging middleware/service.
- Log customer, product, policy, and approval mutations.
- Build `AuditTrailPage` UI.
- Run complete Developer A test suite verification (`pnpm typecheck`, `pnpm test`).

---

## 4. Independence Declaration

> Developer A can implement, test, and run all 5 owned phases independently using local seed data and unit/integration tests without waiting for Developer B.
