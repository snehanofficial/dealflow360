# DealFlow360 — Business Rules

## 1. Purpose

This document defines the authoritative business rules that govern DealFlow360 behavior.

These rules determine:

- How quotation values are calculated
- How discounts are evaluated
- How risk is determined
- When approval is required
- How approval is routed
- How warehouse fulfillment is calculated
- How backorders are handled
- How one-time and recurring billing behave
- How subscription proration works
- How customer negotiation affects approval
- How deal-health alerts are generated
- How important state changes are controlled

These are business rules, not UI rules.

The application MUST implement them in actual application/business logic.

The DealFlow360 problem statement explicitly requires approval routing, discount governance, warehouse splitting, and billing proration to be implemented as application logic rather than hardcoded or faked behavior. fileciteturn6file1L69-L75

---

# 2. Rule Authority

This file is the authoritative source for core DealFlow360 business behavior.

Implementation documents may describe:

- APIs
- UI
- Module ownership
- Data structures
- Phase tasks

but they must not silently redefine these business rules.

If an implementation detail conflicts with a rule in this document:

1. Identify the conflict.
2. Do not implement contradictory behavior.
3. Report the conflict.
4. Resolve the rule before changing shared logic.

---

# 3. Core Business Principle

Every important operation follows:

```text
Input Data
    ↓
Business Rule
    ↓
Calculation / Decision
    ↓
State Change
    ↓
Next Workflow Step
```

The result must be derived from actual application data.

Do not use:

- Hardcoded approval results
- Hardcoded discount decisions
- Hardcoded warehouse allocations
- Hardcoded billing schedules
- Hardcoded proration values
- Hardcoded dashboard metrics

---

# 4. Rule Classification

Rules are classified as:

### CORE

Mandatory for the MVP and final demo.

### SUPPORTING

Required to make a CORE workflow reliable.

### OPTIONAL

Useful enhancements that must not delay the core flow.

The core rules are implemented first.

---

# 5. Quotation Rules

## 5.1 Quotation as Central Object

Quotation is the central commercial object.

Quotation information is consumed by:

```text
Customer
Product
Discount
Approval
Upsell
Fulfillment
Billing
Negotiation
Deal Health
Reporting
```

Other modules must use the quotation through approved interfaces.

They must not create competing quotation representations.

---

# 6. Quotation Line Rules

Each quotation line must contain enough information to determine:

- Product
- Quantity
- Unit price
- Discount
- Line amount
- Product cost
- Margin
- Product type

A quotation may contain multiple quotation lines.

Every line must be independently valid.

---

# 7. Quantity Rules

Quantity must:

- Be numeric.
- Be greater than zero for active quotation lines.
- Be validated before calculation.
- Be validated before submission.

Invalid quantities must not be accepted into a confirmed quotation.

---

# 8. Price Rules

Unit price must come from approved product/pricing data unless an explicit pricing override rule exists.

The application must not allow arbitrary client-side prices to bypass server/business validation.

---

# 9. Line Amount Rules

For a quotation line:

```text
Gross Amount
=
Quantity × Unit Price
```

Discount amount:

```text
Discount Amount
=
Gross Amount × Discount Percentage
```

Net line amount:

```text
Net Line Amount
=
Gross Amount - Discount Amount
```

All monetary calculations must use consistent decimal/rounding rules defined by the implementation.

---

# 10. Quotation Total Rules

Quotation total is derived from its valid quotation lines.

Conceptually:

```text
Quotation Total
=
Sum of Net Line Amounts
```

If an order-level discount is supported:

```text
Final Total
=
Subtotal After Line Discounts
-
Order-Level Discount
```

The exact order-level discount rule must remain consistent across UI, API, and business logic.

---

# 11. Margin Rules

Margin is based on revenue and product cost.

Conceptually:

```text
Total Cost
=
Sum of Quantity × Product Cost
```

```text
Margin
=
Net Revenue - Total Cost
```

```text
Margin %
=
(Margin / Net Revenue) × 100
```

If net revenue is zero, do not divide by zero.

Margin must update when:

- Product changes
- Quantity changes
- Price changes
- Discount changes
- Upsell product is added
- Negotiated terms change

The system must not use a hardcoded margin.

---

# 12. Customer Tier Rules

Customer tier is a business attribute that may influence discount governance and approval evaluation.

The quotation must retain the customer relationship required for determining the applicable customer tier.

Do not copy the customer tier into multiple unrelated locations unless the data model explicitly requires a historical snapshot.

---

# 13. Product Discount Rules

Each product may have its own allowed discount.

Example:

```text
Product A → Allowed Discount = 10%
Product B → Allowed Discount = 15%
Product C → Allowed Discount = 5%
```

The system MUST evaluate each quotation line against the applicable product rule.

Do not use one universal discount threshold for every product.

The source specification explicitly requires per-line checking because different products can have different allowed discount limits. fileciteturn6file4L272-L275

---

# 14. Requested Discount Rules

For each quotation line:

```text
Requested Discount
        ↓
Compare with Allowed Discount
```

Possible outcomes:

```text
Within Allowed Limit
Above Allowed Limit
Invalid Discount
```

---

# 15. Discount Validation Rules

Reject invalid discount values such as:

- Negative discount
- Invalid numeric value
- Discount outside allowed domain
- Missing product
- Missing pricing information

The exact maximum domain limit must follow the centralized configuration.

---

# 16. Line-Level Discount Evaluation

Every quotation line must be evaluated independently.

Conceptual process:

```text
Quotation
 ├── Line 1 → Evaluate Discount
 ├── Line 2 → Evaluate Discount
 ├── Line 3 → Evaluate Discount
 └── Line 4 → Evaluate Discount
```

The result should identify which lines create discount risk.

---

# 17. Discount Difference Rule

For each line:

```text
Discount Difference
=
Requested Discount - Allowed Discount
```

If the result is:

```text
≤ 0
```

the requested discount is within the allowed limit.

If the result is:

```text
> 0
```

the requested discount exceeds the configured limit.

The actual approval/risk outcome depends on the centralized approval rules.

---

# 18. Discount Risk Rule

Quotation-level discount risk is derived from the line-level evaluations and the configured business rules.

Conceptually:

```text
Line Evaluations
      ↓
Combined Risk Evaluation
      ↓
Risk Level
      ↓
Approval Requirement
```

Possible risk categories may include:

```text
LOW
MEDIUM
HIGH
```

The exact thresholds/formula must be maintained consistently with the approved implementation.

Do not invent a different risk formula inside individual modules.

---

# 19. Explainable Risk Rule

Whenever an approval/risk result is presented to an internal user, the system should provide understandable reasons.

Example:

```text
Requested Discount: 18%
Allowed Discount: 10%

Excess: 8%

Risk: HIGH
Approval Required: YES
```

The system should expose sufficient information for a reviewer to understand why the quotation requires approval.

---

# 20. Approval Trigger Rule

Approval is required when the discount/risk evaluation reaches the configured approval threshold.

The Sales Representative does NOT manually decide whether approval is needed.

The system decides based on business rules.

The official quick-test flow requires an excessive discount to automatically request manager approval. fileciteturn6file4L256-L261

---

# 21. Approval Routing Rule

The approval chain must be determined by configured business rules.

Baseline conceptual routing:

```text
Quotation Submitted
        ↓
Discount / Risk Evaluation
        ↓
Approval Required?
       / \
     NO   YES
     │     │
     │     ▼
     │  SALES_MANAGER
     │     │
     │   Finance Required?
     │    /           \
     │  YES            NO
     │   │              │
     │   ▼              ▼
     │ FINANCE       APPROVED
     │   │
     └───┴──────────────
```

Finance must not appear as an unnecessary approval step.

The frontend requirements specifically state that the approval steps include Sales Manager and Finance only when required. fileciteturn6file2L119-L125

---

# 22. Approval Sequence Rule

If multiple approval steps are required:

```text
Step 1
  ↓
Step 2
  ↓
Step 3
```

A quotation must not bypass a required earlier approval.

An approval step becomes available only after its prerequisites are satisfied.

---

# 23. Approval Action Rules

Authorized approvers may:

```text
APPROVE
REJECT
RETURN_FOR_REVISION
```

Each action produces a valid state transition.

---

# 24. Approval Approve Rule

When an approver approves:

```text
Current Approval Step
        ↓
Approve
        ↓
More Required Steps?
     /           \
   YES            NO
    ↓              ↓
Next Step       APPROVED
```

The quotation must not become fully approved until all required approval steps have completed successfully.

---

# 25. Approval Reject Rule

When an authorized approver rejects:

```text
PENDING_APPROVAL
        ↓
REJECT
        ↓
REJECTED
```

The rejection must be recorded.

---

# 26. Approval Return Rule

When an approver returns the quotation:

```text
PENDING_APPROVAL
        ↓
RETURN_FOR_REVISION
        ↓
Editable / Revision Required
```

The reason for return should be captured where appropriate.

---

# 27. Self-Approval Rule

A Sales Representative must not approve their own approval request unless an explicit business rule later defines a permitted exception.

Normal approval hierarchy must remain intact.

---

# 28. Quotation State Rules

The quotation must follow controlled states.

Conceptual states:

```text
DRAFT
PENDING_APPROVAL
APPROVED
SENT_TO_CUSTOMER
UNDER_NEGOTIATION
CONFIRMED
FULFILLING
COMPLETED
```

Additional states such as:

```text
REJECTED
REVISION_REQUIRED
```

may be used where required by the implementation.

Do not allow arbitrary state changes from the UI.

---

# 29. State Transition Rules

Every state transition must have a valid triggering event.

Examples:

```text
DRAFT
→ Submit
→ PENDING_APPROVAL
```

```text
PENDING_APPROVAL
→ Final approval
→ APPROVED
```

```text
APPROVED
→ Send to customer
→ SENT_TO_CUSTOMER
```

```text
SENT_TO_CUSTOMER
→ Customer changes terms
→ UNDER_NEGOTIATION
```

```text
UNDER_NEGOTIATION
→ Terms exceed threshold
→ PENDING_APPROVAL
```

```text
UNDER_NEGOTIATION
→ No approval required
→ CONFIRMED eligibility
```

---

# 30. Quotation Submission Rule

Before submission, the system must validate:

- Customer
- At least one valid line
- Valid quantities
- Valid pricing
- Valid discounts
- Valid quotation state

Then:

```text
Calculate
↓
Evaluate Discount
↓
Evaluate Risk
↓
Determine Approval
↓
Transition State
```

---

# 31. Quotation Edit Rule

Editable quotations may be modified only while their state permits editing.

When important commercial terms are changed after approval, the system must determine whether approval needs to be re-evaluated.

Do not allow previously approved terms to become modified final terms without appropriate validation.

---

# 32. Upsell Business Rules

Upsell recommendations must be derived from configured data/rules.

Possible inputs:

- Co-purchase relationships
- Promotions
- Product relationships
- Current quotation contents

The MVP may use deterministic rules.

Do not claim machine learning if deterministic logic is being used.

---

# 33. Upsell Ranking Rule

Recommendations should be ranked using the configured recommendation logic.

Possible ranking inputs may include:

- Co-purchase relevance
- Promotion relevance
- Commercial value
- Margin impact

The exact ranking formula must remain deterministic and documented.

---

# 34. Upsell Add Rule

When a Sales Representative selects:

`Add to Quote`

the recommended product must be added through the quotation system.

Do not create a separate quotation-line implementation inside the recommendation module.

After addition:

```text
Add Product
    ↓
Quotation Line
    ↓
Recalculate Total
    ↓
Recalculate Margin
    ↓
Re-evaluate Relevant Rules
```

---

# 35. Upsell Dismiss Rule

Dismissed recommendations should not automatically alter the quotation.

Dismissing a suggestion means:

```text
Recommendation
    ↓
Dismiss
    ↓
No quotation change
```

---

# 36. Warehouse Fulfillment Rules

Fulfillment must use actual inventory information.

Inputs include:

- Required product
- Required quantity
- Warehouse inventory
- Warehouse availability
- Configured allocation rules

The system must calculate a recommended allocation.

---

# 37. Warehouse Single-Source Rule

If one warehouse can fulfill the required quantity under the applicable rules:

```text
Required Quantity
       ↓
Warehouse Stock Sufficient
       ↓
Allocate From One Warehouse
```

Avoid unnecessary warehouse splitting when a valid single-warehouse allocation is available and the business rules do not require splitting.

---

# 38. Multi-Warehouse Split Rule

If a single warehouse cannot fulfill the required quantity:

```text
Required Quantity
       ↓
Check Multiple Warehouses
       ↓
Allocate Available Quantities
       ↓
Continue Until:
Required Quantity fulfilled
OR
No valid stock remains
```

Example:

```text
Required = 10

Warehouse A = 6
Warehouse B = 4

Allocation:
A → 6
B → 4
```

---

# 39. Shipment Count Rule

Shipment count must be derived from the resulting warehouse allocation.

Conceptually:

```text
Number of warehouses with allocation > 0
=
Minimum shipment count
```

Any additional shipment rules must follow the fulfillment configuration.

Do not hardcode shipment counts.

---

# 40. Shipment Cost Rule

Estimated shipment cost must be derived from the configured fulfillment/shipping rules.

Do not hardcode a demo amount.

If the MVP uses a simplified shipping-cost calculation, the calculation must still be deterministic and documented.

---

# 41. Manual Override Rule

The system may allow an authorized internal user to override the recommended warehouse allocation.

The override must be validated.

At minimum:

```text
Allocated Quantity
≤
Valid Available/Reservable Quantity
```

subject to the approved inventory semantics.

---

# 42. Allocation Consistency Rule

After manual override:

```text
Sum of allocations
+
Backorder quantity
=
Required quantity
```

The result must remain internally consistent.

---

# 43. Backorder Rule

If required quantity exceeds valid available inventory:

```text
Required Quantity
-
Fulfillable Quantity
=
Backorder Quantity
```

Example:

```text
Required = 10
Available = 7
Fulfilled = 7
Backorder = 3
```

Backorder values must be calculated from actual stock.

---

# 44. Backorder Consolidation Rule

When additional stock becomes available during fulfillment, the system should provide the configured ability to consolidate remaining backorder quantity.

The source specification explicitly calls for a "Consolidate Remaining Backorder" prompt when stock arrives during fulfillment. fileciteturn6file2L136-L145

---

# 45. Billing Classification Rule

Every order line must be classified according to the product/business rule:

```text
ONE_TIME
```

or:

```text
RECURRING
```

A single order may contain both.

---

# 46. One-Time Billing Rule

One-time lines:

- Are billed as one-time charges.
- Must not be included in recurring billing schedules.
- Must retain their relationship to the originating order.

---

# 47. Recurring Billing Rule

Recurring lines must have:

- Subscription plan
- Billing frequency
- Start date
- Next billing date
- Recurring amount
- Subscription status

Recurring billing must generate a schedule from actual order/subscription data.

---

# 48. Hybrid Order Rule

A single order may contain:

```text
Hardware
→ ONE_TIME

Service
→ ONE_TIME

Support Plan
→ RECURRING
```

The system must process these correctly without converting one type into the other.

---

# 49. Billing Schedule Rule

A recurring subscription produces billing schedule entries based on:

- Subscription start
- Billing frequency
- Quantity
- Recurring price
- Subscription state

Do not generate schedule values solely for visual display.

---

# 50. Billing Date Rule

The next billing date must be derived from the subscription schedule.

After a valid modification:

```text
Subscription Change
        ↓
Recalculate Future Schedule
```

---

# 51. Proration Rule

Mid-cycle changes may require proration.

The proration calculation must use:

- Current billing period
- Effective change date
- Existing quantity/plan
- New quantity/plan
- Applicable recurring price
- Remaining period

The exact formula must be implemented consistently and must not be hardcoded.

---

# 52. Proration Integrity Rule

When a quantity or subscription attribute changes mid-cycle:

```text
Existing State
      ↓
Calculate Adjustment
      ↓
Apply Proration
      ↓
Update Subscription
      ↓
Update Future Schedule
```

The calculated adjustment must be traceable to the change.

---

# 53. Subscription Modification Rule

A subscription can be modified only when its current state permits the modification.

After modification:

- Validate change
- Calculate adjustment
- Update subscription
- Update future schedule
- Create credit/refund trigger where applicable

---

# 54. Subscription Cancellation Rule

Cancellation must:

- Validate current subscription state.
- Change subscription status.
- Prevent future billing where applicable.
- Trigger appropriate adjustment handling where required.

Do not create future billing entries after an effective cancellation unless the business rule explicitly requires them.

---

# 55. Refund / Credit Rule

When a subscription change or cancellation creates a customer adjustment:

```text
Calculate Adjustment
       ↓
Determine Credit / Refund Requirement
       ↓
Create Internal Credit / Refund Trigger
```

For the hackathon MVP, a real external payment gateway is not required.

The internal adjustment/credit state must still be logically correct.

---

# 56. Customer Negotiation Rules

Customers may negotiate quotations only through the restricted customer portal.

Customer actions may include:

- Comments
- Change requests
- Counter discount
- Confirmation

---

# 57. Customer Ownership Rule

A customer may access a quotation only when:

```text
Authenticated Customer
+
Quotation belongs to Customer
```

Changing an ID or URL must not bypass ownership validation.

---

# 58. Negotiation State Rule

When a customer submits a meaningful quotation change:

```text
SENT_TO_CUSTOMER
        ↓
UNDER_NEGOTIATION
```

The negotiation state should reflect that active changes are being discussed.

---

# 59. Negotiated Discount Rule

A customer counter-discount must be evaluated using the same relevant discount/approval rules as an internal discount change.

Do not create a separate weaker customer discount rule.

---

# 60. Negotiation Re-Evaluation Rule

After negotiated commercial terms change:

```text
Negotiated Terms
       ↓
Discount Evaluation
       ↓
Risk Evaluation
       ↓
Approval Requirement
```

This must happen before final confirmation.

---

# 61. Negotiation Approval Re-entry Rule

If the negotiated terms exceed approval thresholds:

```text
UNDER_NEGOTIATION
       ↓
Threshold Exceeded
       ↓
PENDING_APPROVAL
```

The approval chain must restart according to the appropriate rules.

The source problem statement explicitly requires automatic approval re-entry when final negotiated terms exceed thresholds. fileciteturn6file3L201-L212

---

# 62. Negotiation No-Approval Rule

If negotiated terms remain within the permitted boundaries:

```text
UNDER_NEGOTIATION
       ↓
Re-evaluation
       ↓
No Approval Required
       ↓
Eligible For Confirmation
```

---

# 63. Customer Confirmation Rule

A customer may confirm only when:

- Customer owns the quotation.
- Quotation is in a confirmable state.
- Required negotiation processing is complete.
- Required approvals are complete.
- Required validation succeeds.

A customer cannot bypass pending internal approval.

---

# 64. Deal Health Rules

Deal Health identifies deals that require attention.

Initial required conditions:

```text
Stalled Deal
Discount Anomaly
Delivery Promise Slippage
```

These conditions are identified in the official DealFlow specification. fileciteturn6file2L164-L169

---

# 65. Stalled Deal Rule

A quotation becomes stalled when:

```text
Current Time
-
Last Relevant Activity
>
Configured Stalled Threshold
```

The threshold must be configurable.

Example:

```text
Last Activity = 8 days ago
Threshold = 5 days

Result = STALLED
```

---

# 66. Relevant Activity Rule

Relevant activity may include events such as:

- Quotation modification
- Approval activity
- Customer response
- Negotiation
- Fulfillment activity

The exact activity set must be consistent throughout the application.

---

# 67. Discount Anomaly Rule

A discount anomaly should identify unusually high discount behavior according to the configured anomaly rule.

Where historical sales-representative data exists, the rule may compare the current discount against the defined representative baseline.

Do not generate fake historical behavior solely to create alerts.

---

# 68. Delivery Slippage Rule

A delivery slippage alert may be generated when:

```text
Actual / Current Fulfillment Status
        >
Expected Delivery Commitment
```

The exact comparison must use available fulfillment data.

---

# 69. Alert Severity Rule

Alerts must have a severity based on the configured condition/risk.

Possible levels:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Only levels actually used by the implementation need to be exposed.

---

# 70. Alert Status Rule

Alerts may progress through:

```text
OPEN
ACKNOWLEDGED
RESOLVED
```

Do not allow arbitrary transitions.

---

# 71. Alert Ownership Rule

Each alert must reference the relevant business object, normally the quotation/deal.

Example:

```text
Alert
  ↓
Quotation ID
  ↓
Open Quotation
```

The specification requires clicking an alert to open the related quotation. fileciteturn6file2L164-L169

---

# 72. Nudge / Escalation Rule

Where enabled, an authorized user may trigger:

- Nudge
- Escalation

The action should be recorded.

Do not build a complex external notification platform for the MVP unless explicitly required.

---

# 73. Dashboard Rules

The operational dashboard must represent real application state.

Dashboard calculations may use:

- Quotations
- Approval state
- Deal-health alerts
- Fulfillment state
- Billing state
- Negotiation state

Do not hardcode KPI values.

---

# 74. Dashboard Metric Rule

A dashboard metric must be derived from a defined underlying dataset.

Example:

```text
Pending Approvals
=
Count of quotations currently requiring approval
```

The metric must change when the underlying quotation/approval state changes.

---

# 75. Dashboard Filter Rule

Required reporting filter concepts:

```text
Period
Sales Representative / Team
Approval Status
Product / Category
```

Each filter must change the underlying query/calculation.

The specification explicitly requires these reporting filters. fileciteturn6file2L95-L100

---

# 76. Dashboard Consistency Rule

Dashboard metrics must not contradict the transactional modules.

Example:

If there are:

```text
3 pending approvals
```

then the approval center should not show:

```text
5 pending approvals
```

unless a documented filter difference explains the discrepancy.

---

# 77. Audit Rules

Important business actions must be auditable.

At minimum record:

- Quotation creation
- Important quotation modifications
- Discount changes
- Approval request
- Approval decision
- Important state changes

---

# 78. Audit Actor Rule

Every auditable event should identify the actor where applicable.

Conceptually:

```text
Actor
+
Action
+
Entity
+
Entity ID
+
Timestamp
+
Relevant Change
```

---

# 79. Audit Integrity Rule

Audit records should represent actual events.

Do not create audit entries merely to make the interface look populated.

---

# 80. State Integrity Rule

No module may directly force a quotation into an invalid state.

All state changes must pass through the appropriate business rules.

For example:

```text
Customer Negotiation
≠
Direct CONFIRMED

Customer Negotiation
→ Re-evaluation
→ Approval if required
→ Confirmation
```

---

# 81. Cross-Module Rule

When an upstream value changes, downstream affected rules must be recalculated.

## Discount change

```text
Discount
→ Total
→ Margin
→ Risk
→ Approval Requirement
```

## Upsell addition

```text
Product Added
→ Quotation
→ Total
→ Margin
→ Relevant Discount / Approval Evaluation
```

## Negotiation change

```text
Terms Change
→ Total
→ Margin
→ Discount
→ Risk
→ Approval
```

## Fulfillment change

```text
Allocation
→ Fulfillment State
→ Backorder
```

## Subscription change

```text
Subscription Change
→ Proration
→ Billing Schedule
→ Adjustment
```

---

# 82. Rule Recalculation Principle

A business value must never remain stale after an action that changes its inputs.

Examples:

```text
Change Quantity
→ Recalculate totals/margin

Change Discount
→ Recalculate risk/approval

Add Upsell
→ Recalculate totals/margin

Change Subscription Quantity
→ Recalculate proration

Negotiate Discount
→ Recalculate approval requirement
```

---

# 83. Validation Before State Transition

Before any important transition:

```text
Validate Input
      ↓
Validate Current State
      ↓
Apply Business Rules
      ↓
Transition State
```

Do not transition first and validate afterward.

---

# 84. Authorization Before Business Action

For protected actions:

```text
Authentication
      ↓
Authorization
      ↓
Business Validation
      ↓
Business Rule
      ↓
State Change
```

Do not execute business logic before verifying that the user is authorized to perform the operation.

---

# 85. Transaction Integrity

Where one operation changes several related business records, the changes should remain consistent.

Example:

Approval completion may require:

```text
Approval Step
+
Approval Request
+
Quotation State
+
Audit Event
```

These should not leave contradictory states.

Use appropriate transaction handling in the data layer.

---

# 86. Concurrency Rule

Where simultaneous edits are possible, the system should prevent stale updates from silently overwriting newer business state.

At minimum, important state-changing actions should revalidate the current state before committing.

This is especially relevant for:

- Approval
- Customer negotiation
- Fulfillment allocation
- Subscription modification

---

# 87. Idempotency Principle

Repeated submission of the same action should not accidentally create duplicate business effects where the operation is expected to be single-use.

Examples:

- Double approval
- Duplicate confirmation
- Duplicate billing entry
- Duplicate fulfillment allocation

The implementation should reject or safely handle repeated actions.

---

# 88. Money and Precision Rules

All monetary calculations must use a consistent precision/rounding strategy.

Do not mix incompatible numeric behavior between:

- UI
- API
- Database
- Business logic

The authoritative monetary result must come from the business/service layer.

---

# 89. Date and Time Rules

Billing, subscription, stalled-deal, and delivery calculations depend on dates/times.

Use a consistent application time strategy.

Do not calculate time-sensitive rules using inconsistent local assumptions between modules.

---

# 90. Configuration Rule

Business thresholds should be stored as configurable data when the specification expects configuration.

Examples:

- Allowed discount
- Approval thresholds
- Stalled-deal threshold
- Subscription plans
- Warehouse rules

Do not bury configurable thresholds in random source files.

---

# 91. Business Rule Change Control

A change to a core rule requires:

1. Identify the affected rule.
2. Update this document.
3. Check Developer A impact.
4. Check Developer B impact.
5. Check API/data-model impact.
6. Update tests.
7. Implement.
8. Run regression tests.

Do not change business behavior in code alone.

---

# 92. Rule Priority

When multiple rules apply:

```text
Security / Authorization
        ↓
Data Validation
        ↓
Current State Validity
        ↓
Business Rules
        ↓
State Transition
        ↓
Audit
```

A business shortcut must never override authorization or validation.

---

# 93. Demo Scenario A — Excessive Discount

The application must support:

```text
Sales Rep
  ↓
Create Quotation
  ↓
Add Product
  ↓
Apply Discount > Allowed
  ↓
Line Discount Evaluation
  ↓
Risk Evaluation
  ↓
Approval Required
  ↓
Pending Approval
  ↓
Manager Approves
  ↓
Quotation Continues
```

This is one of the key official quick-test scenarios. fileciteturn6file4L254-L261

---

# 94. Demo Scenario B — Upsell

The application must support:

```text
Quotation Builder
  ↓
Recommendation Appears
  ↓
Sales Rep Adds Recommendation
  ↓
Quotation Total Changes
  ↓
Margin Changes
```

The source specification requires immediate total/margin impact after accepting an upsell. fileciteturn6file2L126-L135

---

# 95. Demo Scenario C — Warehouse Split

The application must support:

```text
Approved Order
  ↓
Check Stock
  ↓
Warehouse A Partially Available
  ↓
Warehouse B Available
  ↓
Split Allocation
  ↓
Accept / Override
```

---

# 96. Demo Scenario D — Hybrid Billing

The application must support:

```text
Order
 ├── One-time Product
 └── Recurring Subscription
        ↓
Separate Billing Behavior
        ↓
Recurring Schedule
```

---

# 97. Demo Scenario E — Customer Negotiation

The application must support:

```text
Customer Portal
  ↓
Open Own Quotation
  ↓
Submit Counter Discount
  ↓
UNDER_NEGOTIATION
  ↓
Re-evaluate Discount / Risk
  ↓
Approval Required?
```

---

# 98. Demo Scenario F — Automatic Re-approval

The application must support:

```text
Customer Negotiation
      ↓
Terms Exceed Threshold
      ↓
PENDING_APPROVAL
      ↓
Internal Approval
      ↓
Customer/Order Confirmation Eligibility
```

The official specification requires this automatic re-entry behavior. fileciteturn6file3L201-L212

---

# 99. Demo Scenario G — Payment / Invoice State

After confirmation, the system should be able to record the relevant payment/billing state and update the invoice/billing status accordingly.

The exact accounting implementation should remain within the MVP boundary.

The official quick-test flow ends by recording payment and checking that invoice status updates correctly. fileciteturn6file4L264-L270

---

# 100. Final Business Rule Acceptance Criteria

The business-rule implementation is acceptable only when:

## Pricing

- Quantity calculations are correct.
- Discount calculations are correct.
- Margin calculations are correct.

## Discount Governance

- Every quotation line is evaluated.
- Product-specific limits are respected.
- Risk is calculated.
- Approval requirement is determined automatically.

## Approval

- Correct approver is routed.
- Multi-step approval works.
- Approval cannot be bypassed.
- State transitions are valid.
- Decisions are audited.

## Upsell

- Recommendations are rule-driven.
- Added recommendations affect the quotation.
- Margin updates correctly.

## Fulfillment

- Real stock is used.
- Multi-warehouse splitting works.
- Manual override is validated.
- Backorder is correct.

## Billing

- One-time and recurring lines coexist.
- Billing schedules are real.
- Proration is calculated.
- Modification/cancellation work.
- Credit/refund trigger is correct where applicable.

## Negotiation

- Customer ownership is enforced.
- Counter-discount is validated.
- Re-evaluation occurs.
- Required approval is re-triggered.
- Customer cannot bypass internal approval.

## Deal Health

- Alerts are derived from actual conditions.
- Alerts link to relevant quotations.
- Alert status works.

## Dashboard

- Metrics use real data.
- Filters affect actual results.
- Metrics remain consistent with transactional state.

## Audit

- Important actions are recorded.
- Actor and timestamp are captured.
- Audit information reflects actual events.

---

# 101. Final Principle

The system must behave as:

```text
REAL DATA
   ↓
REAL BUSINESS RULE
   ↓
REAL DECISION
   ↓
REAL STATE CHANGE
   ↓
REAL DOWNSTREAM EFFECT
```

Not:

```text
User clicks button
   ↓
Screen changes
   ↓
Fake result
```

DealFlow360 is successful when the same business rules that make the demo look correct also govern the underlying application state.
