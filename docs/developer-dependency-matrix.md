# DealFlow360 — Developer Dependency & Ownership Matrix

## 1. Governance & Independence Overview

This document establishes the authoritative feature, database, API, and frontend ownership split between **Developer A** and **Developer B**.

### Non-Negotiable Rule
> **NO SINGLE FEATURE assigned to Developer A requires Developer B's unfinished implementation to function.**  
> **NO SINGLE FEATURE assigned to Developer B requires Developer A's unfinished implementation to function.**

Both developers operate completely independently within their assigned vertical slices using stable shared contracts (`packages/contracts`) and local seed/fixture data.

---

## 2. Feature Dependency Matrix

| Feature | Owner | Hard Dependency | Soft Dependency | Shared Contract Consumed | Independent? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | Shared Foundation | None | User profiles | Auth JWT & Cookies | **YES** |
| **Customer Management** | **Developer A** | Shared Foundation | None | `CustomerDto`, `CustomerReferenceDto` | **YES** |
| **Product Catalog & Pricing** | **Developer A** | Shared Foundation | Customer tier limits | `ProductDto`, `ProductReferenceDto` | **YES** |
| **Discount Governance & Margin** | **Developer A** | Product Catalog | Customer Tier | `CommercialEvaluationDto` | **YES** |
| **Approval Workflow Engine** | **Developer A** | Governance Engines | Audit Trail | `ApprovalDecisionDto` | **YES** |
| **Audit Trail & Activity Log** | **Developer A** | Shared Foundation | Event bus | `AuditLog` contract | **YES** |
| **Quotation Management** | **Developer B** | Shared Foundation | Customer / Product Data | `CustomerReferenceDto`, `ProductReferenceDto` | **YES** |
| **Customer Negotiation Portal** | **Developer B** | Quotation Core | Commercial Evaluation | `CommercialEvaluationDto`, `PortalToken` | **YES** |
| **Warehouse Fulfillment** | **Developer B** | Shared Foundation | Quote lines | `FulfillmentComputeRequest` | **YES** |
| **Subscription & Hybrid Billing** | **Developer B** | Shared Foundation | Quote totals | `BillingScheduleQuery` | **YES** |
| **Upsell & Cross-sell Engine** | **Developer B** | Shared Foundation | Quote context | `ProductReferenceDto` | **YES** |
| **Deal Health & Control Tower** | **Developer B** | Shared Foundation | Order/Alert metrics | Operational Dashboard data | **YES** |

---

## 3. Database Model Ownership Matrix

| Prisma Model / Entity | Owner | Write Owner | Read Consumers | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `User` | Shared Foundation | Dev 0 / Auth | Dev A, Dev B | Identity & RBAC |
| `RefreshSession` | Shared Foundation | Dev 0 / Auth | Auth Service | Session Security |
| `Customer` | **Developer A** | Developer A | Dev A, Dev B (via Contract) | Customer Master Data |
| `Product` | **Developer A** | Developer A | Dev A, Dev B (via Contract) | Product Master Catalog |
| `DiscountPolicyRule` | **Developer A** | Developer A | Governance Engines | Tier/Category Discount Limits |
| `ApprovalRequest` | **Developer A** | Developer A | Dev A, Dev B | Approval Tracking |
| `ApprovalStep` | **Developer A** | Developer A | Dev A | Approval Workflow Steps |
| `AuditLog` | **Developer A** | Developer A | Dev A, Dev B | Governance Audit Trail |
| `Quote` | **Developer B** | Developer B | Dev B, Dev A (read) | Commercial Quotation |
| `QuoteLine` | **Developer B** | Developer B | Dev B | Line Items & Line Pricing |
| `PortalToken` | **Developer B** | Developer B | Customer Portal | Portal Access |
| `CounterOffer` | **Developer B** | Developer B | Dev B, Dev A | Customer Negotiation |
| `Warehouse` | **Developer B** | Developer B | Dev B | Warehouse Locations |
| `InventoryItem` | **Developer B** | Developer B | Dev B | Stock Quantities |
| `FulfillmentAllocation` | **Developer B** | Developer B | Dev B | Split Shipments |
| `BillingSchedule` | **Developer B** | Developer B | Dev B | One-time & Recurring Billing |
| `BillingLine` | **Developer B** | Developer B | Dev B | Billing Schedule Lines |
| `RecommendationRule` | **Developer B** | Developer B | Dev B | Deterministic Recommendations |
| `DealAlert` | **Developer B** | Developer B | Dev B / Dashboard | Control Tower Alerts |

---

## 4. API Route Ownership Matrix

| Route Prefix | Owner | Responsibilities | Independence Strategy |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/*` | Shared Foundation | Login, logout, refresh, me | Implemented & Shared |
| `/api/v1/customers/*` | **Developer A** | Customer CRUD, Tier, Status | Serves customer data to Dev B |
| `/api/v1/products/*` | **Developer A** | Product CRUD, Categories, Prices | Serves product data to Dev B |
| `/api/v1/discount-policies/*` | **Developer A** | Policy matrix rules | Standalone governance evaluation |
| `/api/v1/approvals/*` | **Developer A** | Approval inbox, approve/reject | Standalone approval engine |
| `/api/v1/audit/*` | **Developer A** | Audit event retrieval | Standalone event log |
| `/api/v1/quotes/*` | **Developer B** | Quote creation, lines, totals | Consumes `CustomerReference` seed data |
| `/api/v1/portal/quotes/*` | **Developer B** | Customer counteroffers, portal | Restricted token access |
| `/api/v1/fulfillment/*` | **Developer B** | Inventory check, split allocation | Uses stock data & quote line contract |
| `/api/v1/billing/*` | **Developer B** | Schedules, proration, hybrid | Uses quote line & type contract |
| `/api/v1/recommendations/*` | **Developer B** | Upsell/cross-sell suggestions | Uses product catalog seed contract |
| `/api/v1/control-tower/*` | **Developer B** | Operational metrics & alerts | Aggregates local & contract state |

---

## 5. Summary Verification

- **Total Features Audited:** 12 Core Features
- **Developer A Independent Features:** 5 Vertical Slices (Customer, Product Catalog, Discount Governance, Approvals, Audit)
- **Developer B Independent Features:** 6 Vertical Slices (Quotation, Negotiation Portal, Fulfillment, Billing, Upsell, Control Tower)
- **Shared Infrastructure:** 1 (Auth & RBAC)
- **Cross-Developer Blockers:** **0 (NONE)**
