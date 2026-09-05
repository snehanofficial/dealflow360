# DealFlow360 — Feature & Module Architecture

## 1. Purpose

This document defines the functional module architecture of DealFlow360.

It answers:

- What modules exist?
- What is the responsibility of each module?
- Which developer owns each module?
- What does each module consume?
- What does each module produce?
- Which modules may depend on which other modules?
- Which modules must remain independent?
- What are the module boundaries?
- What are the main integration points?

The objective is to allow two developers to implement DealFlow360 in parallel with minimal dependency and minimal merge conflicts.

The architecture must remain aligned with the required DealFlow360 flow:

```text
Configuration
    ↓
Quotation
    ↓
Discount Governance
    ↓
Approval
    ↓
Upsell / Cross-sell
    ↓
Fulfillment
    ↓
Billing
    ↓
Customer Negotiation
    ↓
Re-approval if Required
    ↓
Confirmation
    ↓
Deal Health / Reporting
```

The source problem statement defines the core capabilities around discount governance, approval routing, upsell/cross-sell, warehouse splitting, hybrid billing, deal health, customer negotiation, backend configuration, and reporting. fileciteturn6file0L10-L19

---

# 2. Architecture Principles

## Principle 1 — Vertical module ownership

Each developer owns complete business modules.

Ownership is NOT split as:

```text
Developer A = Backend
Developer B = Frontend
```

Instead:

```text
Developer A = complete business modules
Developer B = complete business modules
```

Each module may contain:

- Data access
- Business logic
- API
- UI
- Validation
- Authorization
- Tests

---

## Principle 2 — Clear boundaries

A module owns its business responsibility.

A module should not contain unrelated business logic.

Example:

```text
Billing
```

may calculate subscription billing.

It should not contain:

```text
Discount approval logic
Warehouse allocation logic
```

---

## Principle 3 — Contract-based communication

Modules communicate through:

- Defined APIs
- Service interfaces
- Shared domain contracts
- Events/hooks where appropriate

Do not rely on direct access to another module's internals.

---

## Principle 4 — Minimize shared files

Shared files are the main source of merge conflicts.

Therefore:

- Keep shared infrastructure small.
- Keep module code isolated.
- Avoid unnecessary global utilities.
- Avoid modifying another module's files.
- Prefer module-local changes.

---

## Principle 5 — One authoritative business rule

A business rule must have one authoritative implementation.

Examples:

```text
Discount evaluation
Approval routing
Warehouse allocation
Proration
```

Other modules consume the result.

They should not recreate the same formula.

---

# 3. Module Classification

Modules are classified as:

### FOUNDATION

Shared infrastructure used by all modules.

### CORE

Core business capabilities required for the MVP.

### SUPPORTING

Capabilities that support the core sales lifecycle.

### MONITORING

Visibility/reporting capabilities.

---

# 4. FOUNDATION MODULE

## Module F1 — Base Application Foundation

### Owner

Base Implementation / Shared

### Responsibility

Provides:

- Application shell
- Responsive navbar
- Routing
- Authentication
- Login
- Signup
- Logout
- Session handling
- RBAC
- Protected routes
- Shared UI components
- API/service foundation
- Validation
- Error handling
- Loading states
- Notifications

Detailed implementation:

`00_BASE_IMPLEMENTATION.md`

### Dependencies

None beyond the selected application stack.

### Consumers

All business modules.

### Ownership Rule

After Phase 0, this module should be treated as stable shared infrastructure.

---

# 5. CORE MODULES — DEVELOPER A

Developer A owns:

```text
A1 Customer Management
A2 Product & Pricing Management
A3 Quotation Management
A4 Discount Governance
A5 Approval Workflow
A6 Audit Trail
```

---

# 6. MODULE A1 — Customer Management

## Purpose

Maintain customers used throughout the sales lifecycle.

## Responsibilities

- Create customer
- List customers
- Search customers
- View customer
- Update customer
- Manage customer tier
- Manage customer status
- Provide customer information to quotations
- Support customer ownership relationships

## Primary Data

```text
Customer
Customer Tier
Customer Status
```

## Inputs

- User-entered customer information
- Customer configuration

## Outputs

- Customer record
- Customer identity
- Customer tier
- Customer status

## Consumers

```text
Quotation
Discount Governance
Customer Portal
Deal Health
Dashboard
```

## Does NOT Own

- Quotation calculation
- Discount calculation
- Customer portal UI
- Approval logic

## Developer

Developer A

---

# 7. MODULE A2 — Product & Pricing Management

## Purpose

Maintain products and pricing information used across DealFlow360.

## Responsibilities

- Product creation
- Product listing
- Product editing
- Product category
- Cost
- Selling price
- Allowed discount
- Product type
- Active/inactive status
- Subscription eligibility

The quotation experience must support product categories such as Hardware, Services, and Subscriptions. fileciteturn6file2L113-L118

## Primary Data

```text
Product
Product Category
Product Pricing
Product Type
```

## Outputs

- Product identity
- Selling price
- Cost
- Allowed discount
- Product type

## Consumers

```text
Quotation
Discount Governance
Upsell
Fulfillment
Billing
Dashboard
```

## Does NOT Own

- Quotation calculations
- Discount approval
- Recommendation logic
- Inventory allocation
- Billing

## Developer

Developer A

---

# 8. MODULE A3 — Quotation Management

## Purpose

Provide the central commercial object of DealFlow360.

Quotation is the primary object connecting the sales lifecycle.

## Responsibilities

- Create quotation
- Edit quotation
- Add quotation lines
- Remove quotation lines
- Change quantities
- Apply discounts
- Calculate totals
- Calculate margin
- Assign customer
- Assign sales representative
- Save draft
- Submit quotation
- Maintain quotation state
- Expose quotation interfaces to other modules

The official frontend requirements describe the quotation builder with product selection, quantities, discounts, totals, and live margin. fileciteturn6file2L109-L118

## Primary Data

```text
Quotation
Quotation Line
Quotation Status
```

## Inputs

- Customer
- Product
- Quantity
- Price
- Discount

## Outputs

- Quotation
- Quotation Lines
- Total
- Margin
- Quotation State

## Consumers

```text
Discount Governance
Approval
Upsell
Fulfillment
Billing
Negotiation
Deal Health
Dashboard
```

## Does NOT Own

- Warehouse allocation
- Subscription schedule
- Recommendation ranking
- Customer portal
- Deal-health calculation

## Developer

Developer A

---

# 9. MODULE A4 — Discount Governance

## Purpose

Evaluate and govern discounts according to product and business rules.

## Responsibilities

- Validate discounts
- Evaluate every quotation line
- Compare requested vs allowed discount
- Calculate discount difference
- Calculate risk
- Determine approval requirement
- Explain discount violations

The source specification explicitly requires line-by-line discount evaluation because different products may have different permitted discount limits. fileciteturn6file4L272-L275

## Inputs

```text
Quotation
Quotation Lines
Products
Customer Tier
Discount Rules
```

## Outputs

```text
Line Discount Evaluation
Risk Level
Approval Required
Required Approval Level
Reasons
```

## Consumers

```text
Quotation
Approval
Customer Negotiation
Dashboard
```

## Does NOT Own

- Approval decisions
- Customer negotiation
- Product pricing master data

## Developer

Developer A

---

# 10. MODULE A5 — Approval Workflow

## Purpose

Automatically route quotations requiring authorization.

## Responsibilities

- Create approval requests
- Create approval steps
- Determine approval hierarchy
- Route to Sales Manager
- Route to Finance when required
- Approve
- Reject
- Return for revision
- Maintain approval state
- Trigger approval re-entry

The specification requires automatic approval routing when discount/risk thresholds are exceeded. fileciteturn6file4L256-L261

## Inputs

```text
Quotation
Discount Evaluation
Risk Result
Approval Configuration
```

## Outputs

```text
Approval Request
Approval Steps
Approval Status
Quotation Approval State
```

## Consumers

```text
Quotation
Customer Negotiation
Dashboard
Audit
```

## Does NOT Own

- Discount calculation
- Customer negotiation UI
- Warehouse logic
- Billing logic

## Developer

Developer A

---

# 11. MODULE A6 — Audit Trail

## Purpose

Provide traceability for important actions.

## Responsibilities

Record:

- Quotation creation
- Quotation modification
- Discount changes
- Approval requests
- Approval decisions
- Important state transitions

## Inputs

Business events from modules.

## Outputs

```text
Audit Event
Audit History
```

## Consumers

```text
Quotation
Approval
Admin
Dashboard
```

## Does NOT Own

- Business decisions
- Business calculations
- Authorization logic

## Developer

Developer A

---

# 12. CORE MODULES — DEVELOPER B

Developer B owns:

```text
B1 Upsell & Cross-sell
B2 Warehouse Fulfillment
B3 Subscription & Hybrid Billing
B4 Customer Negotiation Portal
B5 Deal Health & Alerts
B6 Operational Dashboard
```

---

# 13. MODULE B1 — Upsell & Cross-sell

## Purpose

Recommend relevant additional products during quotation creation.

## Responsibilities

- Recommendation rules
- Co-purchase logic
- Promotion logic
- Ranking
- Recommendation explanation
- Margin delta
- Add to Quote
- Dismiss

The specification requires ranked suggestions, promotion information, and margin impact, with the margin indicator updating after addition. fileciteturn6file2L126-L135

## Inputs

```text
Quotation
Quotation Lines
Products
Recommendation Rules
Promotion Data
```

## Outputs

```text
Recommendation
Ranking
Margin Delta
```

## Consumers

Primarily Sales Representative quotation workspace.

## Depends On

```text
Product
Quotation
```

## Does NOT Own

- Core quotation line implementation
- Product master data
- Discount governance

## Developer

Developer B

---

# 14. MODULE B2 — Warehouse Fulfillment & Splitting

## Purpose

Determine how orders should be fulfilled from available warehouses.

## Responsibilities

- Stock availability
- Warehouse allocation
- Multi-warehouse splitting
- Shipment count
- Shipment cost estimate
- Manual override
- Backorder calculation
- Backorder consolidation

The specification explicitly requires recommended warehouse splits, manual override, and backorder handling. fileciteturn6file2L136-L145

## Inputs

```text
Quotation / Order
Products
Quantities
Warehouses
Inventory
Fulfillment Rules
```

## Outputs

```text
Allocation
Shipment Count
Shipment Cost
Backorder
Fulfillment Status
```

## Depends On

```text
Quotation
Product
Inventory
Warehouse
```

## Does NOT Own

- Product master data
- Quotation calculation
- Billing

## Developer

Developer B

---

# 15. MODULE B3 — Subscription & Hybrid Billing

## Purpose

Handle orders containing one-time and recurring items.

## Responsibilities

- One-time classification
- Recurring classification
- Subscription plans
- Billing frequency
- Billing schedules
- Proration
- Subscription modification
- Cancellation
- Credit/refund trigger

The official problem statement requires mixed one-time and recurring lines in a single order with correct billing schedules and proration. fileciteturn6file0L42-L45

## Inputs

```text
Quotation / Order
Quotation Lines
Product Type
Subscription Plan
Dates
Quantity
Pricing
```

## Outputs

```text
Billing Classification
Subscription
Billing Schedule
Proration
Credit/Refund Trigger
```

## Depends On

```text
Quotation
Product
```

## Does NOT Own

- Product type master data
- Quotation calculation
- External payment gateway

## Developer

Developer B

---

# 16. MODULE B4 — Customer Negotiation Portal

## Purpose

Provide a secure, separate customer-facing quotation experience.

## Responsibilities

- Customer quotation access
- Quotation details
- Status
- Line comments
- Change requests
- Counter discount
- Negotiation state
- Approval re-evaluation
- Customer confirmation

The specification requires a separate restricted customer-facing view rather than an internal screen relabeled as a portal. fileciteturn6file1L71-L75

## Inputs

```text
Customer
Quotation
Quotation Lines
Discount Rules
Approval State
```

## Outputs

```text
Negotiation Request
Updated Terms
Customer Confirmation
```

## Depends On

```text
Customer
Quotation
Discount Governance
Approval Workflow
```

## Does NOT Own

- Customer master data
- Discount formula
- Approval algorithm
- Internal approval UI

## Developer

Developer B

---

# 17. MODULE B5 — Deal Health & Alerts

## Purpose

Detect deals that require operational attention.

## Responsibilities

- Stalled deal detection
- Discount anomaly detection
- Delivery slippage detection
- Alert creation
- Alert severity
- Alert status
- Alert acknowledgement
- Alert resolution
- Nudge/escalation where supported
- Open related quotation

The source specification explicitly identifies stalled deals, discount anomalies, and delivery promise slippage. fileciteturn6file2L164-L169

## Inputs

```text
Quotation Activity
Quotation State
Discount Information
Fulfillment State
Dates
Historical Data where available
```

## Outputs

```text
Deal Health Alert
Severity
Reason
Related Quotation
```

## Depends On

Relevant data from:

```text
Quotation
Discount
Fulfillment
Negotiation
```

## Does NOT Own

- Dashboard presentation
- Discount evaluation formula
- Fulfillment calculation

## Developer

Developer B

---

# 18. MODULE B6 — Operational Dashboard

## Purpose

Provide a high-level operational view of the sales lifecycle.

## Responsibilities

- Quotation metrics
- Approval metrics
- Deal-health metrics
- Fulfillment metrics
- Billing metrics
- Negotiation status
- Filters
- Drill-down/navigation

Required filter concepts include:

```text
Period
Sales Representative / Team
Approval Status
Product / Category
```

The source specification explicitly identifies these reporting filters. fileciteturn6file2L95-L100

## Inputs

Outputs/state from multiple modules.

## Outputs

```text
KPIs
Charts / Tables
Alerts
Filtered Reports
```

## Depends On

```text
Quotation
Approval
Fulfillment
Billing
Negotiation
Deal Health
```

## Does NOT Own

- Underlying business calculations
- Approval decisions
- Billing calculations
- Fulfillment calculations

## Developer

Developer B

---

# 19. Module Dependency Matrix

| Module | Customer | Product | Quotation | Discount | Approval | Inventory | Billing | Negotiation | Deal Health |
|---|---|---|---|---|---|---|---|---|---|
| Customer | — | No | No | No | No | No | No | No | No |
| Product | No | — | No | No | No | No | No | No | No |
| Quotation | Yes | Yes | — | Yes | Yes | No | No | No | No |
| Discount | Yes | Yes | Yes | — | Yes | No | No | Yes | No |
| Approval | No | No | Yes | Yes | — | No | No | Yes | No |
| Upsell | No | Yes | Yes | Read | No | No | No | No | No |
| Fulfillment | No | Yes | Yes | No | Read | Yes | No | No | No |
| Billing | No | Yes | Yes | No | Read | No | — | No | No |
| Negotiation | Yes | Read | Yes | Read | Read/Trigger | No | Read | — | No |
| Deal Health | Read | Read | Yes | Read | Read | Read | Read | Read | — |
| Dashboard | Read | Read | Read | Read | Read | Read | Read | Read | Read |

Legend:

```text
Yes
= Direct functional dependency

Read
= Consumes information only

Read/Trigger
= Reads state and may request a business operation

No
= Should remain independent

—
= Own module
```

The matrix is an architectural guide.

Actual implementation must follow the API and data contracts.

---

# 20. Dependency Direction

The preferred dependency flow is:

```text
FOUNDATION
    ↓
CUSTOMER / PRODUCT
    ↓
QUOTATION
    ↓
DISCOUNT
    ↓
APPROVAL
    ↓
UPSELL / FULFILLMENT / BILLING
    ↓
NEGOTIATION
    ↓
DEAL HEALTH
    ↓
DASHBOARD
```

Not every module needs to be strictly sequential at implementation time.

Modules may be developed in parallel using stable contracts.

---

# 21. Parallel Development Strategy

Developer A:

```text
Customer
Product
Quotation
Discount
Approval
Audit
```

Developer B:

```text
Upsell
Fulfillment
Billing
Negotiation
Deal Health
Dashboard
```

Both developers can work simultaneously after the base foundation and shared contracts are stable.

---

# 22. Module Independence Rules

Each module must have a clearly defined boundary.

## Rule 1

Do not directly access another module's private implementation.

## Rule 2

Use shared contracts/interfaces.

## Rule 3

Do not duplicate business calculations.

## Rule 4

Do not duplicate database entities.

## Rule 5

Do not create feature-specific authentication.

## Rule 6

Do not create feature-specific RBAC.

## Rule 7

Do not make the dashboard the source of business truth.

## Rule 8

Do not make the UI responsible for authoritative business decisions.

---

# 23. Cross-Module Contract Pattern

Example:

## Upsell wants to add a product

Incorrect:

```text
Upsell
   ↓
Directly modify quotation database
```

Correct:

```text
Upsell
   ↓
Quotation Contract
   ↓
Add Line
   ↓
Quotation Recalculation
```

---

# 24. Discount / Approval Pattern

Incorrect:

```text
Quotation UI
   ↓
if discount > 10
   ↓
show approval
```

Correct:

```text
Quotation
   ↓
Discount Governance
   ↓
Risk Evaluation
   ↓
Approval Requirement
   ↓
Approval Workflow
```

The threshold must come from the configured business rules, not be hardcoded in UI code.

---

# 25. Negotiation / Approval Pattern

Incorrect:

```text
Customer submits 15%
   ↓
Portal marks quotation approved
```

Correct:

```text
Customer Counter Offer
   ↓
Quotation Terms Updated
   ↓
Discount Evaluation
   ↓
Risk Evaluation
   ↓
Approval Re-evaluation
   ↓
Approval if required
   ↓
Confirmation
```

---

# 26. Fulfillment / Quotation Pattern

Incorrect:

```text
Frontend manually calculates:
Warehouse A = 5
Warehouse B = 5
```

Correct:

```text
Quotation
   ↓
Fulfillment Service
   ↓
Read Inventory
   ↓
Allocation Algorithm
   ↓
Recommended Split
```

---

# 27. Billing / Product Pattern

Incorrect:

```text
Billing UI decides:
Product X = recurring
```

Correct:

```text
Product Type
   ↓
Billing Classification
   ↓
One-time / Recurring
   ↓
Billing Logic
```

---

# 28. Dashboard Pattern

Incorrect:

```text
Dashboard
   ↓
Calculates approval/business rules independently
```

Correct:

```text
Business Modules
   ↓
Authoritative State
   ↓
Dashboard Queries / Aggregates
   ↓
Visualization
```

The dashboard is a consumer, not the source of business truth.

---

# 29. Shared Entities

The following entities may be shared across modules:

```text
User
Customer
Product
Quotation
QuotationLine
Warehouse
Inventory
Approval
Subscription
Billing
Negotiation
AuditLog
DealHealthAlert
```

The detailed ownership and relationships are defined in:

`04_DATA_MODEL_AND_DATABASE.md`

---

# 30. Shared Entity Ownership

Even when an entity is consumed by multiple modules, one module should remain its primary owner.

Example:

```text
Customer
→ Customer Management

Product
→ Product Management

Quotation
→ Quotation Management

Approval
→ Approval Workflow

Inventory
→ Fulfillment

Subscription
→ Billing

Negotiation
→ Customer Negotiation

DealHealthAlert
→ Deal Health
```

Other modules consume these entities through approved interfaces.

---

# 31. Shared File Protection

High-conflict resources include:

```text
Global authentication
RBAC
Application shell
Shared components
Data model
API contract
Shared types
Global configuration
```

Module developers should avoid modifying these unless necessary.

---

# 32. Module Folder/Code Boundary Principle

When the project structure is implemented, each business module should have an identifiable code boundary.

Conceptually:

```text
customer
product
quotation
discount
approval
audit
upsell
fulfillment
billing
negotiation
deal-health
dashboard
```

The exact physical folder structure is intentionally NOT defined by this document.

The project owner will establish the base folder structure separately.

---

# 33. Module Interface Requirements

Every module should document:

```text
Purpose
Inputs
Outputs
Owned Data
APIs
Business Rules Used
Dependencies
Consumers
Authorization
Validation
Tests
```

This prevents undocumented coupling.

---

# 34. Module Definition of Done

A module is complete only when:

- Its responsibility is implemented.
- Its required data is available.
- Its business logic works.
- Its API/service boundary works.
- Its UI works where required.
- Validation works.
- Authorization works.
- Tests pass.
- It does not unnecessarily depend on unfinished modules.
- It does not violate another module's ownership.
- Its integration contract is stable.

---

# 35. Feature Prioritization

The team should prioritize modules according to the final demo flow.

## Highest Priority

```text
Quotation
Discount Governance
Approval
Upsell
Fulfillment
Billing
Negotiation
```

## Next Priority

```text
Deal Health
Dashboard
Audit enhancements
```

The base implementation remains mandatory before these modules begin.

---

# 36. MVP Module Status

The final MVP must contain functional implementations of:

```text
FOUNDATION
✓

CUSTOMER
✓

PRODUCT
✓

QUOTATION
✓

DISCOUNT
✓

APPROVAL
✓

UPSELL
✓

FULFILLMENT
✓

BILLING
✓

NEGOTIATION
✓

DEAL HEALTH
✓

DASHBOARD
✓
```

The objective is not to build every possible enterprise extension.

The objective is to complete the core connected sales lifecycle.

---

# 37. Module Integration Sequence

The preferred integration sequence is:

```text
1. Base Foundation
        ↓
2. Customer + Product
        ↓
3. Quotation
        ↓
4. Discount
        ↓
5. Approval
        ↓
6. Upsell
        ↓
7. Fulfillment
        ↓
8. Billing
        ↓
9. Negotiation
        ↓
10. Deal Health
        ↓
11. Dashboard
        ↓
12. Final Integration
```

Developers do not have to wait sequentially to code.

They can work in parallel once the contracts required by their module are available.

---

# 38. Final End-to-End Module Flow

The complete system should connect as:

```text
ADMIN CONFIGURATION
        ↓
Customer / Product / Pricing / Rules
        ↓
SALES REP
        ↓
Quotation
        ↓
Discount Governance
        ↓
Approval
        ↓
Upsell / Cross-sell
        ↓
Fulfillment
        ↓
Hybrid Billing
        ↓
Customer Portal
        ↓
Negotiation
        ↓
Discount / Approval Re-evaluation
        ↓
Confirmation
        ↓
Deal Health
        ↓
Operational Dashboard
```

This reflects the official DealFlow360 complete flow and quick-test expectations. fileciteturn6file3L219-L240 fileciteturn6file4L252-L270

---

# 39. Architecture Acceptance Criteria

The module architecture is accepted only when:

### Ownership

- Every business capability has one clear owner.
- No module has ambiguous ownership.

### Independence

- Developer A can develop its modules without Developer B's internal code.
- Developer B can develop its modules without Developer A's internal code.

### Contracts

- Cross-module communication uses defined contracts.
- APIs are documented.

### Data

- Shared entities have clear ownership.
- No unnecessary duplicate entities exist.

### Logic

- Business rules have one authoritative implementation.
- No core business logic is duplicated in UI or dashboard.

### Security

- Shared RBAC is reused.
- Customer portal ownership is enforced.

### Integration

- Modules can be integrated in the defined sequence.
- Integration does not require rewriting the modules.

### Demo

- The modules support the complete quotation-to-cash story.

---

# 40. Final Module Principle

The architecture should allow:

```text
                SHARED FOUNDATION
                       │
        ┌──────────────┴──────────────┐
        │                             │
   DEVELOPER A                   DEVELOPER B
        │                             │
 Customer Management             Upsell
 Product & Pricing               Fulfillment
 Quotation                        Billing
 Discount                         Negotiation
 Approval                         Deal Health
 Audit                            Dashboard
        │                             │
        └──────────────┬──────────────┘
                       │
                 FINAL INTEGRATION
                       │
                COMPLETE DEALFLOW
```

The objective is to make each module independently understandable, independently testable, independently implementable, and safely integrable into the complete DealFlow360 workflow.
