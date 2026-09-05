# DealFlow360 — Roles, Permissions & Flows

## 1. Purpose

This document defines:

- The users/roles in DealFlow360
- What each role can see
- What each role can do
- Which actions require authorization
- The end-to-end business flows
- Role-specific workflows
- State transitions relevant to each role
- Customer portal restrictions
- Cross-module interaction points

This document is the authoritative source for role behavior and user-facing workflow decisions.

Detailed data structures belong in:

`04_DATA_MODEL_AND_DATABASE.md`

Detailed business calculations and rules belong in:

`05_BUSINESS_RULES.md`

API details belong in:

`06_API_CONTRACT.md`

Feature ownership belongs in:

- `08_DEVELOPER_A.md`
- `09_DEVELOPER_B.md`

---

# 2. Role Model

DealFlow360 uses the following primary roles:

```text
ADMIN
SALES_MANAGER
SALES_REP
FINANCE_OPERATIONS
CUSTOMER
```

These roles correspond to the user types described in the DealFlow360 problem statement:

- Sales Rep
- Sales Manager / Approver
- Finance / Operations User
- Customer / Portal User
- Admin


---

# 3. Role Responsibilities

## 3.1 ADMIN

The Administrator manages system configuration and access.

Primary responsibilities:

- Manage users
- Assign roles
- Configure products
- Configure pricing
- Configure discount rules/tiers
- Configure approval chains
- Configure warehouses
- Configure subscription plans
- Manage system-level configuration
- View relevant system information

Admin should not bypass business rules simply because the role has high privileges.

Where the workflow requires an approval decision, normal approval logic should remain intact unless an explicit administrative operation is defined.

---

## 3.2 SALES_REP

The Sales Representative is responsible for creating and progressing quotations.

Primary responsibilities:

- Access sales workspace
- View permitted customers
- Create quotations
- Add products
- Change quantities
- Apply permitted discounts
- View margin
- View upsell/cross-sell recommendations
- Track approval status
- Track fulfillment status
- Access quotation-related information
- Send/share quotations with customers where permitted
- Monitor their own deals

The Sales Representative must not:

- Approve their own manager-level approval request
- Approve finance-level requests
- Access other customers' private portal information
- Modify system-wide approval configuration
- Modify system-wide warehouse configuration
- Access administrator functions

---

## 3.3 SALES_MANAGER

The Sales Manager acts as a sales approver and manages the sales approval side of the workflow.

Primary responsibilities:

- View quotations requiring approval
- Review discount/risk information
- Approve quotations
- Reject quotations
- Return quotations for revision
- Review sales activity
- Review deal-health information
- Monitor stalled/risky deals
- View relevant reporting

The Sales Manager must only approve requests for which they are authorized.

---

## 3.4 FINANCE_OPERATIONS

The Finance / Operations role is responsible for finance and operational actions that require this level of authority.

Primary responsibilities may include:

- Review finance-level approvals
- Approve finance-required quotation exceptions
- View billing information
- View invoice/payment state
- Monitor operational fulfillment information
- Review relevant reports

Finance/Operations must not automatically appear as an approval step when finance approval is not required by the business rules.

---

## 3.5 CUSTOMER

The Customer is an external portal user.

Primary responsibilities:

- View their quotation
- View quotation status
- Review quotation details
- Submit comments
- Submit line-level change requests where supported
- Submit counter-discount proposals
- Confirm quotation

The Customer must NOT:

- View other customers' quotations
- View internal approval screens
- Approve internal approval requests
- Access administration
- Access internal sales configuration
- Access internal operational dashboards
- Modify system configuration


---

# 4. Permission Philosophy

Authorization must be based on permissions rather than scattered role checks.

Conceptual model:

```text
ROLE
  ↓
PERMISSIONS
  ↓
ROUTE ACCESS
  ↓
ACTION ACCESS
  ↓
API / SERVER AUTHORIZATION
```

Hiding a UI element does not count as authorization.

Protected operations must independently verify the user's permissions.

---

# 5. Permission Categories

Initial permissions should be organized by capability.

## Dashboard

```text
dashboard.view
dashboard.manage
```

## Profile

```text
profile.view
profile.update
```

## Customers

```text
customer.view
customer.create
customer.update
customer.status_update
```

## Products

```text
product.view
product.create
product.update
product.status_update
```

## Quotations

```text
quotation.view
quotation.create
quotation.update
quotation.submit
quotation.confirm
```

## Discounts

```text
discount.view
discount.evaluate
discount.configure
```

## Approvals

```text
approval.view
approval.action
approval.configure
```

## Fulfillment

```text
fulfillment.view
fulfillment.manage
```

## Billing

```text
billing.view
billing.manage
```

## Customer Portal / Negotiation

```text
portal.view
portal.negotiate
portal.confirm
```

## Deal Health

```text
deal_health.view
deal_health.manage
```

## Administration

```text
admin.manage_users
admin.manage_configuration
```

The permission set may be extended as feature modules are implemented, but existing meanings must remain stable.

---

# 6. Initial Role-to-Permission Model

The following is the baseline role model.

## ADMIN

```text
All permitted administrative and operational permissions
```

Admin has broad access but must still pass normal validation and application safeguards.

---

## SALES_REP

Can:

```text
dashboard.view
profile.view
profile.update

customer.view

product.view

quotation.view
quotation.create
quotation.update
quotation.submit

discount.view
discount.evaluate

fulfillment.view

billing.view

portal.view
```

The final permission set must reflect the exact implemented product scope.

---

## SALES_MANAGER

Can:

```text
dashboard.view
profile.view
profile.update

customer.view

product.view

quotation.view
quotation.update
quotation.submit

discount.view
discount.evaluate

approval.view
approval.action

fulfillment.view
billing.view

deal_health.view
deal_health.manage
```

---

## FINANCE_OPERATIONS

Can:

```text
dashboard.view
profile.view
profile.update

product.view

quotation.view

discount.view
discount.evaluate

approval.view
approval.action

fulfillment.view

billing.view
billing.manage

deal_health.view
```

---

## CUSTOMER

Can:

```text
profile.view

portal.view
portal.negotiate
portal.confirm
```

Customer permissions must be restricted by ownership in addition to role.

A CUSTOMER permission does not grant access to every quotation.

---

# 7. Permission Enforcement Levels

## Level 1 — Navigation

The UI may hide navigation items that a user cannot access.

Example:

```text
SALES_REP
    ↓
No Approval menu
```

However, navigation visibility is only a usability feature.

---

## Level 2 — Route

Protected pages must check permissions.

Example:

```text
/approvals
    ↓
Requires approval.view
```

---

## Level 3 — Action

Individual actions must check permissions.

Example:

```text
Approve
    ↓
Requires approval.action
```

---

## Level 4 — API / Server

Protected operations must validate:

- Authentication
- Role/permission
- Resource ownership where applicable
- Input validity
- Business rules

---

# 8. Customer Ownership Rule

Customer portal access requires both:

```text
CUSTOMER role
+
Quotation ownership
```

Conceptually:

```text
Authenticated Customer
        ↓
Customer owns quotation?
      /       \
    YES        NO
     ↓          ↓
  Allow       Reject
```

A customer must never infer or retrieve another customer's quotation merely by changing an ID or URL parameter.

---

# 9. Sales Representative Ownership

Where the product requires sales-representative ownership restrictions:

The Sales Representative should only access quotations/customers allowed by the implemented business scope.

At minimum, the system must distinguish between:

- Their own working deals
- Deals they are authorized to view
- Manager-level broader sales visibility

The exact visibility rule must follow the final business configuration.

Do not assume that every Sales Representative automatically has access to all customer data.

---

# 10. Administrative Access Rule

Public signup must not allow users to select privileged roles arbitrarily.

A normal signup should create a controlled non-privileged user state unless an administrator or controlled setup process assigns the privileged role.

The following roles must not be self-assigned through unrestricted public signup:

```text
ADMIN
SALES_MANAGER
FINANCE_OPERATIONS
```

---

# 11. Application Entry Flow

The initial access flow is:

```text
User
 ↓
Login / Signup
 ↓
Authentication
 ↓
Load Current User
 ↓
Load Role / Permissions
 ↓
Determine Allowed Routes
 ↓
Open Appropriate Workspace
```

Unauthenticated users must not access protected application areas.

---

# 12. Sales Representative Flow

The core Sales Representative flow is:

```text
Login
 ↓
Sales Workspace
 ↓
Quotation List / Pipeline
 ↓
Create Quotation
 ↓
Select Customer
 ↓
Add Products
 ↓
Adjust Quantities
 ↓
Apply Discount
 ↓
View Margin
 ↓
Discount / Risk Evaluation
 ↓
Approval Required?
```

If approval is not required:

```text
NO
 ↓
Continue to next permitted step
```

If approval is required:

```text
YES
 ↓
PENDING_APPROVAL
 ↓
Manager Review
```

The official problem statement requires the Sales Representative to create quotations, apply discounts, add upsell items, and track approval/fulfillment progress. It also requires automatic routing when discount/risk exceeds the configured threshold. fileciteturn6file0L49-L53 fileciteturn6file3L219-L228

---

# 13. Quotation Creation Flow

The Sales Representative creates a quotation through:

```text
Create Quotation
       ↓
Select Customer
       ↓
Add Product
       ↓
Set Quantity
       ↓
Calculate Pricing
       ↓
Apply Discount
       ↓
Calculate Margin
       ↓
Evaluate Discount / Risk
```

The quotation must remain in a valid editable state until it is submitted.

---

# 14. Discount Decision Flow

The discount flow is:

```text
Requested Discount
        ↓
Check Product Allowed Discount
        ↓
Evaluate Each Quotation Line
        ↓
Calculate Risk
        ↓
Approval Required?
```

The DealFlow360 specification explicitly requires line-level discount evaluation rather than relying only on one overall quotation limit. fileciteturn6file4L272-L275

---

# 15. Automatic Approval Routing Flow

When approval is required:

```text
Quotation Submitted
       ↓
PENDING_APPROVAL
       ↓
Determine Required Approver
       ↓
Sales Manager
       ↓
Decision
```

Possible outcomes:

```text
APPROVE
REJECT
RETURN_FOR_REVISION
```

If Finance is required:

```text
Sales Manager
       ↓
Approved
       ↓
Finance Required?
   /          \
 YES           NO
  ↓             ↓
FINANCE       APPROVED
```

The official frontend specification describes Sales Manager and Finance as approval steps, with Finance shown only when required. fileciteturn6file2L119-L125

---

# 16. Approval Decision Flow

## Approve

```text
PENDING_APPROVAL
       ↓
Approve
       ↓
Next Approval?
   /        \
 YES         NO
  ↓           ↓
Next Step   APPROVED
```

## Reject

```text
PENDING_APPROVAL
       ↓
Reject
       ↓
REJECTED
```

## Return for Revision

```text
PENDING_APPROVAL
       ↓
Return
       ↓
Editable / Revision Required
```

All decisions must be recorded in the audit trail.

---

# 17. Upsell / Cross-sell Interaction Flow

During quotation creation:

```text
Quotation Builder
       ↓
Upsell / Cross-sell Panel
       ↓
Recommended Products
       ↓
Sales Rep:
Add OR Dismiss
```

When added:

```text
Add Product
       ↓
Quotation Line Added
       ↓
Recalculate Total
       ↓
Recalculate Margin
```

The specification requires immediate margin impact after accepting an upsell recommendation. fileciteturn6file2L126-L135

The Sales Representative does not approve the recommendation itself; the quotation remains subject to normal discount/approval rules.

---

# 18. Fulfillment Flow

After approval or when no approval is required:

```text
Approved / Eligible Order
       ↓
Check Warehouse Stock
       ↓
Calculate Recommended Allocation
       ↓
Single Warehouse?
   /         \
 YES          NO
  ↓            ↓
Allocate      Split
               ↓
        Manual Override?
          /        \
        NO          YES
         ↓           ↓
      Accept       Validate
```

If stock is insufficient:

```text
Insufficient Stock
        ↓
Backorder
```

The specification requires warehouse splitting based on live stock with manual override and remaining-backorder handling. fileciteturn6file2L136-L145

---

# 19. Billing Flow

A confirmed order may contain:

```text
ONE_TIME
+
RECURRING
```

Billing flow:

```text
Confirmed Order
       ↓
Classify Lines
       ↓
 ┌─────┴─────┐
 ↓           ↓
ONE_TIME   RECURRING
 ↓           ↓
One-time    Billing Schedule
Billing       ↓
             Future Charges
```

The specification explicitly requires one-time and recurring lines to coexist and be billed correctly/separately. fileciteturn6file0L42-L45

---

# 20. Subscription Modification Flow

```text
Existing Subscription
       ↓
Modify
       ↓
Validate Change
       ↓
Calculate Proration
       ↓
Update Subscription
       ↓
Update Future Schedule
       ↓
Create Adjustment / Credit Trigger if Required
```

The billing requirements include mid-cycle proration and modification/cancellation handling. fileciteturn6file2L147-L151

---

# 21. Subscription Cancellation Flow

```text
Active Subscription
       ↓
Cancel
       ↓
Validate
       ↓
Cancel Subscription
       ↓
Stop Future Billing
       ↓
Credit / Refund Trigger if Applicable
```

The MVP does not require a real external payment-refund gateway.

---

# 22. Customer Portal Flow

Customer receives quotation access:

```text
Quotation Sent
       ↓
Customer Portal
       ↓
Quotation Details
       ↓
Status
       ↓
Review Terms
```

The portal is separate from the internal sales workspace.

The problem statement explicitly requires a real separate restricted customer view. fileciteturn6file1L71-L75

---

# 23. Customer Negotiation Flow

```text
Customer Opens Quotation
        ↓
Reviews Terms
        ↓
Comment / Change Request
        ↓
Counter Discount
        ↓
Submit Request
        ↓
UNDER_NEGOTIATION
        ↓
Re-evaluate Terms
```

The customer cannot directly approve their own requested changes.

---

# 24. Negotiation Approval Re-entry

After customer changes:

```text
Negotiated Terms
       ↓
Discount / Risk Evaluation
       ↓
Threshold Exceeded?
    /          \
  YES           NO
   ↓             ↓
Approval       Continue
Required
```

If YES:

```text
UNDER_NEGOTIATION
       ↓
PENDING_APPROVAL
       ↓
Internal Approval
```

The official specification explicitly requires negotiated terms exceeding approval thresholds to re-enter the approval flow automatically. fileciteturn6file3L201-L212

---

# 25. Customer Confirmation Flow

Customer selects:

`Confirm Quotation`

The system must:

```text
Validate Customer Ownership
        ↓
Validate Quotation State
        ↓
Check Negotiation Changes
        ↓
Re-evaluate Approval
        ↓
Approval Complete?
     /          \
   YES           NO
    ↓             ↓
CONFIRMED     PENDING_APPROVAL
```

The customer must never bypass outstanding approval.

---

# 26. Deal Health Flow

The system evaluates relevant deal conditions:

```text
Quotation / Fulfillment / Activity
        ↓
Deal Health Rules
        ↓
Potential Problem?
      /       \
    YES        NO
     ↓          ↓
Create Alert   Continue
```

Initial alert categories:

- Stalled deal
- Discount anomaly
- Delivery promise slippage

The problem statement explicitly requires these deal-health indicators. fileciteturn6file2L164-L169

---

# 27. Alert Action Flow

```text
Alert Created
      ↓
Manager / Authorized User
      ↓
Open Alert
      ↓
Open Related Quotation
      ↓
Take Action
```

Possible actions:

- Review
- Acknowledge
- Resolve
- Nudge
- Escalate

The final supported actions must follow the implemented scope.

---

# 28. Dashboard Flow

Internal users with dashboard permissions can access:

```text
Dashboard
   ↓
Operational Metrics
   ↓
Filters
   ↓
Updated Data
```

Required reporting filter concepts:

```text
Period
Sales Team / Representative
Approval Status
Product / Category
```

The specification explicitly lists these reporting filters. fileciteturn6file2L95-L100

---

# 29. Role-Specific Main Flows

## ADMIN

```text
Login
 ↓
Admin Area
 ↓
Manage Users / Configuration
 ↓
Save Configuration
 ↓
Configuration Becomes Available To Workflows
```

---

## SALES_REP

```text
Login
 ↓
Sales Workspace
 ↓
Quotation
 ↓
Discount
 ↓
Risk
 ↓
Approval if required
 ↓
Upsell
 ↓
Fulfillment
 ↓
Billing
 ↓
Customer Interaction
```

---

## SALES_MANAGER

```text
Login
 ↓
Dashboard / Approval Center
 ↓
Pending Approval
 ↓
Review Quotation
 ↓
Review Risk
 ↓
Approve / Reject / Return
 ↓
Audit Trail
```

---

## FINANCE_OPERATIONS

```text
Login
 ↓
Finance / Operations
 ↓
Finance Approval if required
 ↓
Billing / Operational Information
 ↓
Payment / Invoice State
```

---

## CUSTOMER

```text
Portal Access
 ↓
View Quotation
 ↓
Review
 ↓
Comment / Negotiate
 ↓
Counter Discount
 ↓
Re-evaluation
 ↓
Confirm
```

---

# 30. Full End-to-End Flow

The primary system flow is:

```text
ADMIN
 ↓
Configure Products
 ↓
Configure Pricing
 ↓
Configure Discount Rules
 ↓
Configure Approval Chains
 ↓
Configure Warehouses
 ↓
Configure Subscription Plans
 ↓
SALES REP
 ↓
Create Quotation
 ↓
Add Products
 ↓
Apply Discount
 ↓
Discount / Risk Evaluation
 ↓
Approval Required?
 ├───────────────┐
 NO              YES
 ↓                ↓
Continue       SALES MANAGER
                  ↓
             Approve / Reject / Return
                  ↓
              FINANCE?
              /       \
            YES        NO
             ↓          ↓
          FINANCE     APPROVED
             ↓
          APPROVED
             ↓
        UPSELL / CROSS-SELL
             ↓
          FULFILLMENT
             ↓
      Warehouse Allocation
             ↓
          BILLING
             ↓
     Customer Portal
             ↓
       Negotiation?
        /        \
      NO          YES
       ↓            ↓
    Confirm     Re-evaluate
                    ↓
             Approval Required?
               /          \
             YES           NO
              ↓             ↓
          APPROVAL       Confirm
              ↓
           Confirm
              ↓
     Fulfillment / Billing
              ↓
        Deal Health
              ↓
         Dashboard
```

This follows the intended quotation-to-cash workflow in the source problem statement. fileciteturn6file3L219-L240

---

# 31. State Ownership

The quotation state must not be changed arbitrarily.

Conceptual state lifecycle:

```text
DRAFT
  ↓
PENDING_APPROVAL
  ↓
APPROVED
  ↓
SENT_TO_CUSTOMER
  ↓
UNDER_NEGOTIATION
  ↓
PENDING_APPROVAL
  ↓
CONFIRMED
  ↓
FULFILLING
  ↓
COMPLETED
```

Not every quotation must visit every state.

Each transition must have a valid business reason.

---

# 32. Role-Based State Actions

## SALES_REP

May:

```text
Create Draft
Edit Draft
Submit
View Approval Status
```

Must not:

```text
Approve Own Approval
Override Approval
Bypass Required Finance Approval
```

---

## SALES_MANAGER

May:

```text
Approve
Reject
Return
View Approval History
```

only for authorized approval requests.

---

## FINANCE_OPERATIONS

May:

```text
Approve Finance-Level Requests
```

only when the business rules require finance approval.

---

## CUSTOMER

May:

```text
View
Comment
Request Change
Counter Offer
Confirm
```

subject to quotation state and ownership.

---

# 33. Invalid Action Handling

The system must reject invalid role actions.

Examples:

```text
Sales Rep tries to approve own quote
→ Reject

Customer tries to open another customer's quote
→ Reject

Customer tries to access internal approval page
→ Reject

Sales Manager tries to perform Admin configuration
→ Reject

Finance user tries to approve a request that does not require finance
→ Reject / Not available

User tries to confirm quote with pending approval
→ Reject
```

The UI should make unavailable actions clear, but the API/server must also enforce the rule.

---

# 34. Role-Aware Navigation

Initial navigation should be role-aware.

## SALES_REP

Typical navigation:

```text
Dashboard
Quotations
Pipeline
Customers
Profile
```

## SALES_MANAGER

Typical navigation:

```text
Dashboard
Quotations
Pipeline
Approvals
Customers
Deal Health
Profile
```

## FINANCE_OPERATIONS

Typical navigation:

```text
Dashboard
Approvals
Billing
Operations
Profile
```

## ADMIN

Typical navigation:

```text
Dashboard
Configuration
Users
Customers
Products
Quotations
Approvals
Operations
Profile
```

## CUSTOMER

Typical navigation:

```text
My Quotation / Portal
Profile
```

These menus should be adapted to the final implemented modules and permissions.

---

# 35. Separation Between Internal and Customer Views

Internal workspace:

```text
Sales / Manager / Finance / Admin
```

Customer workspace:

```text
Customer Portal
```

Customer portal must remain structurally separate from internal operational screens.

Do not expose internal:

- Approval controls
- Configuration
- Internal notes
- Internal risk details
- Other customer records
- Administrative controls

unless a specific requirement explicitly makes such information customer-visible.

---

# 36. Audit Requirements Across Flows

Important actions must be recorded.

At minimum:

```text
Quotation created
Quotation modified
Discount changed
Approval requested
Approval approved
Approval rejected
Quotation returned
Negotiation submitted
Important state transition
```

Audit records should contain:

```text
Actor
Action
Entity
Entity ID
Timestamp
Relevant change information
```

Sensitive credentials must never be recorded.

---

# 37. Flow Consistency Rules

A business action must trigger all relevant downstream behavior.

Examples:

## Discount change

```text
Discount Change
 ↓
Recalculate Amount
 ↓
Recalculate Margin
 ↓
Recalculate Risk
 ↓
Recalculate Approval Requirement
```

## Negotiation change

```text
Customer Change
 ↓
Update Terms
 ↓
Recalculate Discount / Risk
 ↓
Recalculate Approval Requirement
 ↓
Update State
```

## Billing modification

```text
Subscription Change
 ↓
Calculate Proration
 ↓
Update Schedule
 ↓
Create Credit/Adjustment if Required
```

## Fulfillment change

```text
Allocation Change
 ↓
Validate Stock
 ↓
Update Fulfillment
 ↓
Update Backorder
```

---

# 38. No Workflow Bypass

The following shortcuts are prohibited:

```text
Customer directly confirms unapproved quote
Sales Rep directly approves own discount
UI marks quote approved without approval service
Billing ignores subscription classification
Fulfillment ignores inventory
Negotiation bypasses discount evaluation
Dashboard invents metrics
```

The workflow must remain governed by the actual application logic.

---

# 39. Requirement-to-Flow Traceability

The core requirements must be represented in the following flow locations:

```text
Authentication
→ Base Implementation

Customer
→ Sales Rep / Customer workflows

Product
→ Configuration / Quotation

Quotation
→ Central sales flow

Discount Governance
→ Quotation submission / negotiation

Approval
→ Quotation submission / negotiation

Upsell
→ Quotation builder

Fulfillment
→ Approved order

Billing
→ Confirmed order

Negotiation
→ Customer portal

Deal Health
→ Throughout deal lifecycle

Dashboard
→ Operational monitoring
```

---

# 40. Final Flow Acceptance Criteria

The role/flow design is complete only when the system can demonstrate:

### Access

- Correct role can log in.
- Incorrect role cannot access restricted functionality.
- Customer sees only customer-facing functionality.

### Sales

- Sales Rep can create quotation.
- Sales Rep can add products.
- Sales Rep can apply discounts.
- System evaluates discount.

### Approval

- Excessive discount automatically triggers approval.
- Correct approver sees request.
- Approver can approve/reject/return.

### Commercial

- Upsell can be added.
- Margin changes.

### Fulfillment

- Warehouse allocation uses stock.
- Split is supported.
- Backorder is supported.

### Billing

- One-time and recurring products can coexist.
- Billing schedule exists.
- Proration works where required.

### Customer

- Customer can access own quotation.
- Customer can negotiate.
- Counter discount is handled.
- Approval is re-triggered when required.
- Customer can confirm only when allowed.

### Monitoring

- Deal-health alerts are generated from actual conditions.
- Related quotations can be opened.
- Dashboard reflects actual application data.

---

# 41. Developer Boundary Reference

## Developer A

Owns:

```text
Customer
Product & Pricing
Quotation
Discount Governance
Approval
Audit
```

## Developer B

Owns:

```text
Upsell
Warehouse Fulfillment
Subscription / Billing
Customer Negotiation
Deal Health
Dashboard
```

Neither developer should recreate the other's internal logic.

---

# 42. Final Flow Principle

DealFlow360 must behave as one governed business process:

```text
USER
 ↓
ROLE
 ↓
PERMISSION
 ↓
ACTION
 ↓
BUSINESS RULE
 ↓
STATE CHANGE
 ↓
NEXT WORKFLOW STEP
```

Every important action must respect:

- User role
- Permission
- Data ownership
- Business rules
- Current state
- Required approvals

The goal is a coherent quotation-to-cash system, not a collection of disconnected role-based pages.
