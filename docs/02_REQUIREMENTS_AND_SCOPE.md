# DealFlow360 — Requirements & Scope

## 1. Purpose

This document defines the functional requirements and implementation scope for DealFlow360.

DealFlow360 is an intelligent sales operations platform designed to manage a connected sales process from quotation creation through approval, fulfillment, billing, customer negotiation, and deal-health monitoring.

The project is centered on business logic, data modeling, and an end-to-end workflow rather than on any particular programming language, framework, or vendor. fileciteturn6file0L10-L36

This document is the main requirements boundary for implementation.

It defines:

- What the system must do
- What users must be able to do
- What business capabilities are required
- What is mandatory for the MVP
- What is optional/bonus
- What is explicitly outside the hackathon scope
- What must be demonstrated in the final working application

Detailed implementation contracts are defined separately in:

- `03_ROLES_PERMISSIONS_AND_FLOWS.md`
- `04_DATA_MODEL_AND_DATABASE.md`
- `05_BUSINESS_RULES.md`
- `06_API_CONTRACT.md`
- `07_FEATURE_MODULES.md`
- `08_DEVELOPER_A.md`
- `09_DEVELOPER_B.md`

---

# 2. Product Objective

The primary objective is to build a complete sales flow with:

```text
Backend Configuration
        ↓
Quotation
        ↓
Discount Evaluation
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
Re-approval if required
        ↓
Confirmation
        ↓
Payment / Invoice Status
        ↓
Deal Health / Reporting
```

The official problem statement defines the goal as a complete sales flow from backend configuration through a frontend quotation-to-cash experience. fileciteturn6file0L34-L48

---

# 3. Core Problem

The platform addresses sales situations involving:

- Multi-level discount approvals
- Product-specific pricing limits
- Partial stock distributed across warehouses
- Mixed one-time and recurring products
- Customer negotiation
- Deal monitoring
- Operational exceptions

The intended product should go beyond a simple quote-to-invoice flow and behave as a connected deal engine that enforces pricing discipline, reacts to inventory, reconciles recurring and one-time sales, and supports live customer negotiation. fileciteturn6file0L20-L29

---

# 4. Functional Scope Overview

The MVP must cover these major capabilities:

1. User access and role-aware application access
2. Backend sales configuration
3. Customer management
4. Product and pricing management
5. Quotation management
6. Discount governance
7. Automated approval routing
8. Upsell/cross-sell recommendations
9. Multi-warehouse fulfillment
10. Backorder handling
11. Hybrid one-time/recurring billing
12. Subscription billing schedules
13. Mid-cycle proration
14. Customer portal negotiation
15. Automatic approval re-entry after negotiation changes
16. Deal-health alerts
17. Operational dashboards and reporting
18. Auditability of important actions

---

# 5. Requirement Classification

Requirements are classified as:

### MUST

Required for the MVP and final demonstration.

### SHOULD

Strongly recommended when implementation time permits.

### BONUS

Explicitly optional or identified as a bonus by the problem statement.

### OUT OF SCOPE

Not required for the hackathon MVP.

---

# 6. User Access Requirements

## 6.1 Authentication

The system must provide controlled access to the application.

Required:

- User signup where applicable
- User login
- User logout
- Authenticated session handling
- Protected application areas
- Role-aware access

The base implementation is defined separately in:

`00_BASE_IMPLEMENTATION.md`

---

# 7. User Roles

The system supports the following primary roles:

```text
SALES_REP
SALES_MANAGER / APPROVER
FINANCE / OPERATIONS
CUSTOMER / PORTAL USER
ADMIN
```

The source problem statement explicitly identifies Sales Rep, Sales Manager/Approver, Finance/Operations User, Customer/Portal User, and Admin as the intended user roles. fileciteturn6file0L49-L53

Detailed permissions belong in:

`03_ROLES_PERMISSIONS_AND_FLOWS.md`

---

# 8. Backend Configuration Requirements

The system must support initial business configuration for the sales operation.

Required configuration concepts include:

- Products
- Price lists/pricing information
- Discount tiers/rules
- Approval chains
- Warehouses
- Subscription plans

These configuration capabilities are part of the required end-to-end flow. fileciteturn6file3L219-L228

Configuration must be stored as application data rather than hardcoded values.

---

# 9. Customer Management Requirements

The system must support customer information required for quotations and discount/approval decisions.

Required capabilities:

- Create customer
- View customer
- List customers
- Update customer
- Customer tier
- Customer status
- Customer quotation association

Customer information must be available to downstream quotation and discount workflows.

---

# 10. Product & Pricing Requirements

The system must support products used in the sales workflow.

Products should support categories such as:

- Hardware
- Services
- Subscriptions

The quotation experience in the specification explicitly expects products across these categories. fileciteturn6file2L113-L118

Required product information includes:

- Product identity
- Category
- Cost
- Selling price
- Allowed discount
- Product type
- Active/inactive state
- Subscription eligibility where required

Product-level discount limits must be stored as business data.

---

# 11. Quotation Requirements

Quotation is the central business object.

The system must support:

- Create quotation
- View quotation
- List quotations
- Update quotation
- Customer assignment
- Sales representative assignment
- Add products
- Remove products
- Quantity adjustment
- Line-level discount
- Order-level discount
- Price calculation
- Total calculation
- Margin calculation
- Draft saving
- Submission
- Controlled quotation status

The specification requires the quotation builder to support product selection, quantities, line/order discounts, live totals, and a live margin indicator. fileciteturn6file2L109-L118

---

# 12. Quotation Calculation Requirements

The system must calculate quotation values from actual stored data.

At minimum:

```text
Line Gross Amount
= Quantity × Unit Price
```

```text
Discount Amount
= Gross Amount × Discount %
```

```text
Net Line Amount
= Gross Amount - Discount Amount
```

Margin must be based on:

```text
Revenue
-
Product Cost
```

Margin percentage must be calculated safely.

Calculations must respond when relevant quotation inputs change.

Do not hardcode quotation totals or margins.

---

# 13. Discount Governance Requirements

Discount governance is a mandatory core capability.

The system must:

1. Identify the product on each quotation line.
2. Retrieve the product's allowed discount.
3. Evaluate the requested discount.
4. Determine whether the discount exceeds the permitted limit.
5. Contribute to quotation-level risk/approval evaluation.
6. Produce an understandable reason for an approval requirement.

The specification explicitly states that different products can have different discount limits and that every line must be checked individually rather than using only one overall order limit. fileciteturn6file4L272-L275

---

# 14. Approval Requirements

Approval routing must be automatic.

The Sales Representative must not have to manually request approval when the business rules determine that approval is required.

Required capabilities:

- Determine approval requirement
- Create approval request
- Route to Sales Manager
- Route to Finance when required
- Show approval state
- Approve
- Reject
- Return for revision
- Maintain approval history

The official quick-test flow requires an excessive discount to automatically route the quotation for manager approval. fileciteturn6file4L256-L261

---

# 15. Approval State Requirements

The quotation must reflect approval state correctly.

Conceptual flow:

```text
DRAFT
  ↓
SUBMIT
  ↓
Discount / Risk Evaluation
  ↓
Approval Required?
  ├── NO  → Continue
  └── YES → PENDING_APPROVAL
```

For multi-step approval:

```text
Sales Manager
      ↓
Finance
```

Finance should be included only when the rules require it.

---

# 16. Upsell & Cross-sell Requirements

The system must provide recommendations while the quotation is being built.

Required:

- Ranked recommendations
- Co-purchase-based suggestions
- Promotion-based suggestions
- Suggested product information
- Margin delta
- Promotion indicator
- Add to Quote
- Dismiss

The specification requires the upsell/cross-sell panel to show ranked suggestions and margin impact, with the quotation margin updating immediately after a recommendation is accepted. fileciteturn6file2L126-L135

For the MVP, deterministic recommendation logic is acceptable.

The recommendation system must not be a fake static list presented as real intelligence.

---

# 17. Fulfillment & Warehouse Requirements

The system must calculate how an order can be fulfilled from available warehouses.

Required:

- Warehouse stock visibility
- Recommended warehouse allocation
- Multi-warehouse split
- Quantity allocation
- Shipment count
- Estimated shipment cost
- Accept suggested split
- Manual override
- Backorder calculation
- Backorder consolidation prompt/workflow where applicable

The specification explicitly requires automatic warehouse splitting based on available stock with manual override and backorder handling. fileciteturn6file2L136-L145

---

# 18. Fulfillment Rules

The recommended fulfillment allocation must use actual stock data.

Example:

```text
Required:
10

Warehouse A:
6

Warehouse B:
4

Recommended:
A → 6
B → 4
```

If insufficient stock exists:

```text
Required:
10

Available:
7

Fulfilled:
7

Backorder:
3
```

Values must be calculated by application logic.

Do not hardcode demo quantities.

---

# 19. Hybrid Billing Requirements

The system must allow a single order to contain:

```text
ONE_TIME
+
RECURRING
```

products/lines.

The specification explicitly requires one-time products and recurring subscription lines to coexist on one order with correct billing schedules and proration. fileciteturn6file0L42-L45

---

# 20. One-time Billing Requirements

One-time items must:

- Be identified as one-time
- Generate the appropriate one-time billing record/invoice flow
- Not be incorrectly included in recurring billing

---

# 21. Subscription Billing Requirements

Recurring items must support:

- Subscription plan
- Billing frequency
- Start date
- Next billing date
- Recurring amount
- Billing schedule
- Subscription status

The billing screen must show one-time and recurring lines separately and display upcoming billing schedules. fileciteturn6file2L147-L151

---

# 22. Proration Requirements

The system must support mid-cycle proration when applicable.

Proration may be triggered by:

- Quantity changes
- Subscription modifications

The result must be calculated by the approved business rule.

Do not hardcode a sample proration value.

---

# 23. Subscription Modification Requirements

Support:

- Modify subscription
- Change quantity
- Change supported subscription attributes
- Recalculate future billing
- Apply adjustment
- Trigger credit/refund handling where applicable

---

# 24. Subscription Cancellation Requirements

Support:

- Cancellation
- Cancellation validation
- Subscription status update
- Future billing handling
- Refund/credit trigger where applicable

The specification explicitly calls for cancellation/modification controls with an automatic partial refund or credit note trigger where applicable. fileciteturn6file2L147-L151

A real external payment gateway is not required for the MVP.

---

# 25. Customer Portal Requirements

The customer must receive a separate restricted quotation experience.

Required:

- Customer quotation access
- Quotation details
- Quotation status
- Line-level comments
- Change requests
- Counter discount proposal
- Submit request
- Confirm quotation

The portal must be genuinely separate and restricted.

It must not be the internal sales screen with only a different label. fileciteturn6file1L71-L75

---

# 26. Customer Portal Authorization

The customer must only access quotations belonging to them.

Required security behavior:

```text
Authenticated Customer
        ↓
Verify Ownership
        ↓
Allow Access
```

If ownership fails:

```text
Reject Access
```

Customers must not access:

- Other customers' quotations
- Internal approval screens
- Admin settings
- Internal dashboards
- Internal configuration

---

# 27. Negotiation Requirements

Customers must be able to negotiate through the portal.

Required flow:

```text
Quotation Sent
     ↓
Customer Opens Portal
     ↓
Customer Requests Change
     ↓
UNDER_NEGOTIATION
     ↓
Terms Updated
     ↓
Re-evaluate Rules
```

Negotiation changes must not bypass discount/approval governance.

---

# 28. Negotiated Discount Requirements

Customers may submit a counter discount.

Example:

```text
Current Discount: 10%
Customer Counter: 15%
```

The proposed discount must be:

- Stored
- Validated
- Evaluated against the same business rules
- Routed back into approval when required

The problem statement explicitly requires negotiated terms that exceed thresholds to re-enter approval automatically. fileciteturn6file3L201-L212

---

# 29. Customer Confirmation Requirements

When the customer selects Confirm:

The system must:

1. Validate the quotation.
2. Check current negotiated terms.
3. Re-evaluate approval requirements.
4. Prevent confirmation if required approvals are incomplete.
5. Confirm only when the quotation is valid and approved.

---

# 30. Deal Health Requirements

The system must identify deals that require attention.

Initial required signals:

- Stalled quotations
- Discount anomalies
- Delivery promise slippage

The specification explicitly identifies these three categories. fileciteturn6file2L164-L169

---

# 31. Stalled Deal Requirement

A quotation should be considered stalled when it has remained inactive beyond the configured threshold.

The threshold must be configurable.

Example:

```text
Last activity:
8 days ago

Threshold:
5 days

Result:
STALLED DEAL
```

The exact threshold is part of the business-rule configuration.

---

# 32. Discount Anomaly Requirement

The system should identify unusually high discounts according to the defined anomaly rule.

Where historical sales-representative data is available, the system may compare current discounting against the defined historical baseline.

Do not manufacture historical data merely to create an anomaly.

---

# 33. Delivery Slippage Requirement

The system should identify delivery-promise slippage when actual fulfillment information exceeds the relevant expected commitment.

The rule must use actual fulfillment data where available.

---

# 34. Alert Requirements

Each alert must be associated with the relevant deal/quotation.

An alert should contain:

- Alert type
- Severity
- Related quotation
- Reason
- Creation time
- Status
- Suggested action where applicable

The specification requires users to be able to click an alert and open the related quotation. fileciteturn6file2L164-L169

---

# 35. Dashboard & Reporting Requirements

The system must provide operational visibility into sales activity.

Required reporting concepts include:

- Quotations
- Approval status
- Deal health
- Discount anomalies
- Fulfillment issues
- Billing state where applicable

---

# 36. Reporting Filters

The specification explicitly identifies these filters:

```text
Period
Sales Team / Representative
Approval Status
Product / Category
```

These filters must change the underlying reported data rather than only changing UI labels. fileciteturn6file2L95-L100

---

# 37. Sales Workspace Requirements

The sales workspace should provide access to:

- Quotations
- Pipeline
- Data reload/refresh
- Backend configuration
- Workspace/session controls

The specification describes the top-level sales workspace with Quotations, Pipeline, Reload Data, Go to Back-end, and Close Workspace. fileciteturn6file2L101-L108

---

# 38. Quotation List / Pipeline Requirements

The quotation/pipeline view should allow users to:

- See active/draft quotations
- See customer
- See quotation amount
- See quotation stage/status
- Select a quotation
- Open its builder/details

The problem statement describes selectable quotation cards and a Kanban-style deal pipeline. fileciteturn6file2L109-L112

---

# 39. Data Requirements

The application must use persistent application data for core functionality.

Core data must cover, at minimum:

```text
Users
Roles / Permissions
Customers
Products
Pricing
Quotations
Quotation Lines
Discount Rules
Approval Requests
Approval Steps
Warehouses
Inventory
Fulfillment Allocations
Subscription Plans
Billing Schedules
Invoices / Billing Records
Payments / Payment Records
Negotiations
Audit Logs
Deal Health Alerts
```

The detailed structure belongs in:

`04_DATA_MODEL_AND_DATABASE.md`

---

# 40. Dynamic Data Requirement

The final implementation must use real/dynamic application data.

Do not build the final application around static JSON.

Static data may be used only for:

- Initial prototyping
- Test fixtures
- Seed data
- Development support

Odoo's current hackathon guidance explicitly requires real-time/dynamic data and discourages static JSON beyond initial prototyping. citeturn982334search0

---

# 41. Validation Requirements

The system must validate user input robustly.

Validation must cover:

- Required fields
- Numeric values
- Discounts
- Quantities
- Dates
- Product selection
- Customer selection
- Allocation quantities
- Billing inputs
- Negotiation values
- Role-protected actions

Validation should exist at both:

```text
UI level
+
Server/business-logic level
```

Odoo currently lists robust user-input validation as a must-have expectation. citeturn982334search0

---

# 42. Responsive UI Requirement

The application must be usable on:

- Desktop
- Laptop
- Tablet
- Mobile

Critical interfaces include:

- Login
- Signup
- Navbar
- Sales workspace
- Quotation builder
- Approval screen
- Fulfillment screen
- Billing screen
- Customer portal
- Dashboard

The current Odoo Hackathon guidance explicitly requires responsive and clean UI. citeturn982334search0

---

# 43. Navigation Requirement

Navigation must be intuitive and consistent.

Requirements:

- Clear menu placement
- Consistent naming
- Role-aware visibility
- Mobile-friendly behavior
- No unnecessary navigation duplication

Odoo currently lists intuitive navigation as a must-have. citeturn982334search0

---

# 44. Authorization Requirements

Authorization must be enforced at the application/business-operation level.

Do not consider:

```text
Hide button
```

to be sufficient authorization.

Protected actions and operations must check permissions.

---

# 45. Auditability Requirements

Important actions should be traceable.

At minimum, support audit history for:

- Quotation creation
- Important quotation modifications
- Discount changes
- Approval requests
- Approval decisions
- Important status changes

The audit system must identify the actor and time of the event.

---

# 46. Business Logic Requirements

Core business rules must be implemented in actual application logic.

The following are specifically required to be real logic:

- Approval routing
- Discount governance
- Warehouse splitting
- Billing proration

The official specification explicitly states that these rules must not be hardcoded or faked for the demo. fileciteturn6file1L69-L75

---

# 47. End-to-End Flow Requirement

The implementation must support the complete intended flow:

```text
1. User signs up/logs in.
2. Admin/configuration data is available.
3. Sales Rep creates quotation.
4. Products are added.
5. Discounts are applied.
6. Discount/risk is evaluated automatically.
7. Approval is triggered when required.
8. Upsell/cross-sell can be accepted.
9. Margin updates.
10. Approved quotation proceeds to fulfillment.
11. Warehouse split is calculated.
12. One-time and recurring billing are handled.
13. Customer receives portal access.
14. Customer negotiates if required.
15. Negotiated terms are re-evaluated.
16. Approval is re-entered when thresholds are exceeded.
17. Quotation is confirmed.
18. Fulfillment and billing proceed.
19. Deal health is monitored.
20. Reporting/dashboard reflects the resulting state.
```

The official complete flow follows this same sequence from configuration through quotation, approval, fulfillment, billing, negotiation, confirmation, and reporting. fileciteturn6file3L219-L240

---

# 48. Mandatory Demo Requirements

The final application must support at least two complete end-to-end flows.

The official deliverable requires a five-minute live demonstration covering at least two full flows from quotation through fulfillment or billing. fileciteturn6file1L77-L82

---

# 49. Primary Demo Flow

The primary demo should demonstrate:

```text
Sales Rep Login
      ↓
Create Quotation
      ↓
Add Product
      ↓
Apply Excessive Discount
      ↓
Automatic Approval
      ↓
Approve
      ↓
Upsell
      ↓
Margin Update
      ↓
Warehouse Allocation
      ↓
Hybrid Billing
      ↓
Customer Portal
      ↓
Customer Negotiation
      ↓
Re-approval if required
      ↓
Confirmation
```

---

# 50. Secondary Demo Flow

A second flow should demonstrate an exception-oriented scenario, such as:

```text
Quotation
   ↓
Insufficient Warehouse Stock
   ↓
Multi-warehouse Split
   ↓
Backorder
```

or:

```text
Existing Subscription
   ↓
Mid-cycle Change
   ↓
Proration
   ↓
Updated Billing Schedule
```

The final selection should be based on whichever completed flow is more reliable at demo time.

---

# 51. Quick-Test Requirements

The uploaded problem statement defines an eight-step quick test.

The application should be capable of:

1. Sign up/log in and configure basic discount, warehouse, and subscription data.
2. Create a quotation with an excessive discount.
3. Automatically route the quotation for manager approval.
4. Accept an upsell and immediately verify total/margin changes.
5. Approve the quotation and verify correct warehouse allocation/splitting.
6. Verify one-time and recurring billing are handled separately and correctly.
7. Open the customer portal, request a larger discount, and verify automatic approval re-entry.
8. Confirm the order, record payment, and verify invoice status.

These steps are specified as the quick test for validating that the core flow actually works. fileciteturn6file4L252-L270

---

# 52. MUST-HAVE MVP

The MVP must prioritize:

```text
Authentication
+
RBAC
+
Customer
+
Product
+
Quotation
+
Discount Governance
+
Approval
+
Upsell
+
Warehouse Fulfillment
+
Hybrid Billing
+
Customer Negotiation
+
Deal Health
+
Dashboard
```

The implementation must favor reliable business flow over excessive breadth.

---

# 53. SHOULD-HAVE Features

These should be implemented when the core MVP is stable:

- Better reporting
- More detailed audit history
- More advanced alert actions
- Improved recommendation ranking
- Richer dashboard visualization
- Additional subscription operations
- More polished customer negotiation experience

Only add these if they do not destabilize the core flow.

---

# 54. BONUS / OPTIONAL Requirements

The problem statement explicitly identifies:

- Multi-currency support
- Multi-company support

as bonuses rather than requirements. fileciteturn6file1L74-L76

Do not allow these features to delay the core MVP.

---

# 55. Out-of-Scope for MVP

The following are not required unless the team finishes core functionality and explicitly chooses to extend scope:

- Real external payment-gateway integration
- Full enterprise accounting integration
- Advanced machine-learning recommendation infrastructure
- Complex logistics optimization
- Production-scale distributed infrastructure
- Large external integration ecosystem
- Full multi-company implementation
- Full multi-currency implementation

These are optional extensions, not core requirements.

---

# 56. Technical Quality Requirements

The final application should demonstrate:

- Clean modular architecture
- Persistent data
- Clear data relationships
- Stable API contracts
- Proper validation
- Proper authorization
- Responsive UI
- Meaningful error handling
- Test coverage for critical logic
- Clean Git history

Odoo's current hackathon guidance identifies dynamic data, responsive UI, robust validation, intuitive navigation, and proper Git usage as must-have qualities; backend APIs/data modeling and a local database are specifically listed as useful capabilities. citeturn982334search0

---

# 57. Git & Collaboration Requirements

The two-developer team must use Git with clear ownership.

Requirements:

- Small focused commits
- Clear module ownership
- Minimal shared-file changes
- Stable API contracts
- No unnecessary cross-module edits
- Regular synchronization
- No secrets committed
- Review changed files before integration

The official hackathon guidance specifically states that one member managing the repository is not enough. citeturn982334search0

---

# 58. Module Independence Requirement

Developer A and Developer B should be able to implement their assigned capabilities independently.

The architecture should favor:

```text
Developer A Modules
        │
        │ Stable Contracts
        │
Developer B Modules
```

rather than direct manipulation of another developer's internals.

The main shared boundaries are:

- Data model
- API contract
- Authentication/RBAC
- Quotation interface
- Business rules

---

# 59. Data Integrity Requirements

The system must maintain consistent business state.

Examples:

If a discount changes:

```text
Discount
→ Risk
→ Approval
→ Quotation State
```

If warehouse allocation changes:

```text
Allocation
→ Fulfillment State
→ Backorder State
```

If subscription quantity changes:

```text
Quantity
→ Proration
→ Billing Schedule
```

If customer negotiation changes terms:

```text
Negotiation
→ Discount/Risk Re-evaluation
→ Approval
→ Confirmation Eligibility
```

---

# 60. Scope Control Rules

The following rules apply throughout development:

### Rule 1

Do not implement features not required by the current approved scope.

### Rule 2

Do not replace real business logic with hardcoded demo values.

### Rule 3

Do not create duplicate representations of core data.

### Rule 4

Do not allow optional features to delay mandatory features.

### Rule 5

Do not break the defined end-to-end flow in order to simplify an isolated module.

### Rule 6

Keep the MVP understandable and demonstrable.

---

# 61. Definition of Requirements Complete

The requirements are considered fully addressed when the final application can demonstrate:

```text
User Access
   ↓
Role-aware Application
   ↓
Quotation Creation
   ↓
Discount Governance
   ↓
Automatic Approval
   ↓
Upsell / Cross-sell
   ↓
Warehouse Fulfillment
   ↓
Hybrid Billing
   ↓
Customer Negotiation
   ↓
Approval Re-entry
   ↓
Confirmation
   ↓
Deal Health
   ↓
Reporting
```

with real persistent data and actual business logic.

---

# 62. Final Scope Principle

DealFlow360 should be judged as one connected sales-operations workflow, not as a collection of isolated screens.

Every mandatory feature should contribute to the central lifecycle:

```text
Quotation
    ↓
Governance
    ↓
Decision
    ↓
Fulfillment
    ↓
Billing
    ↓
Negotiation
    ↓
Completion
    ↓
Monitoring
```

The implementation should prioritize the correctness of this lifecycle above optional breadth or cosmetic complexity.
