# Developer B — Phased Implementation Plan

## 1. Developer Role

Developer B owns the following DealFlow360 vertical business modules:

1. Upsell & Cross-sell
2. Warehouse Fulfillment & Splitting
3. Subscription & Hybrid Billing
4. Customer Negotiation Portal
5. Deal Health & Alerts
6. Operational Dashboard

Developer B works by feature/module, not by frontend/backend layer.

For every assigned module, the goal is:

Business requirement
→ data usage
→ business logic
→ API
→ UI
→ validation
→ authorization
→ tests
→ working feature

The shared application foundation is already implemented in:

`00_BASE_IMPLEMENTATION.md`

Developer B must reuse the shared:

- Authentication
- RBAC
- Routing
- Navbar
- Application shell
- API/service foundation
- UI primitives
- Validation foundation
- Loading states
- Error handling
- Notifications

Do not create duplicate implementations.

---

# 2. Ownership Boundary

## Developer B owns

- Upsell & Cross-sell
- Warehouse Fulfillment & Splitting
- Subscription & Hybrid Billing
- Customer Negotiation Portal
- Deal Health & Alerts
- Operational Dashboard

## Developer A owns

- Customer Management
- Product & Pricing Management
- Quotation Management
- Discount Governance
- Approval Workflow
- Audit Trail

Developer B must not implement Developer A's internal business logic.

Developer A must not implement Developer B's internal business logic.

Shared contracts are defined by:

- `04_DATA_MODEL_AND_DATABASE.md`
- `05_BUSINESS_RULES.md`
- `06_API_CONTRACT.md`

---

# 3. Phase Execution Rules

This document contains **12 phases**.

Each phase contains **10 implementation tasks**.

Therefore, Developer B has exactly:

- 12 phases
- 120 phase tasks

The tasks are intentionally grouped into meaningful vertical milestones.

## Mandatory execution rule

Developer B MUST execute only the current phase.

After completing the current phase:

1. Run relevant automated tests.
2. Run/build the application.
3. Verify the completed functionality manually.
4. Check for unintended file changes.
5. Check API and data-model consistency.
6. Check Git status.
7. Commit the phase work where appropriate.
8. Produce the required phase report.
9. STOP.

Developer B MUST NOT automatically start the next phase.

The next phase requires explicit user approval.

Valid examples:

- `Proceed to Phase 2`
- `Continue`
- `Start Phase 2`
- `Proceed`

Ambiguous acknowledgements such as `okay` or `good` should not automatically trigger the next phase unless clearly intended as permission.

---

# 4. Phase 1 — Upsell & Cross-sell Foundation

## Objective

Implement the complete Upsell & Cross-sell vertical slice.

The DealFlow360 specification requires ranked suggestions based on co-purchase history and active promotions, with immediate margin impact after a suggestion is added. fileciteturn6file2L126-L135

## Tasks

### Task 1.1
Review the approved upsell/cross-sell requirements, data model, and business rules.

### Task 1.2
Implement the recommendation-rule persistence required for the MVP.

### Task 1.3
Implement co-purchase and/or deterministic recommendation logic.

### Task 1.4
Implement promotion-aware recommendation logic where supported.

### Task 1.5
Implement recommendation ranking.

### Task 1.6
Implement recommendation explanation/reason metadata.

### Task 1.7
Implement recommendation retrieval API/service.

### Task 1.8
Implement the upsell/cross-sell panel UI.

### Task 1.9
Implement Add to Quote and Dismiss actions using the approved quotation contract.

### Task 1.10
Add unit/API/UI tests and verify recommendation and margin-update behavior.

## Phase 1 Completion Criteria

A real quotation can produce relevant recommendations, show their commercial impact, and add/dismiss recommendations correctly.

Then STOP and wait for approval.

---

# 5. Phase 2 — Upsell Margin Integration

## Objective

Complete the commercial impact calculation of upsell/cross-sell actions.

## Tasks

### Task 2.1
Review the quotation calculation contract supplied by Developer A.

### Task 2.2
Implement recommendation-level additional revenue calculation.

### Task 2.3
Implement recommendation-level additional cost calculation.

### Task 2.4
Implement margin delta calculation.

### Task 2.5
Implement margin percentage impact where required.

### Task 2.6
Ensure recommendation calculations use current product/pricing data.

### Task 2.7
Ensure Add to Quote triggers quotation recalculation through the shared contract.

### Task 2.8
Verify the quotation total updates immediately after adding an upsell item.

### Task 2.9
Verify quotation margin updates immediately after adding an upsell item.

### Task 2.10
Add boundary and regression tests for recommendation/margin calculations.

## Phase 2 Completion Criteria

The upsell module must provide correct, dynamic commercial impact and integrate cleanly with quotations.

Then STOP and wait for approval.

---

# 6. Phase 3 — Warehouse Fulfillment Foundation

## Objective

Implement real warehouse stock and fulfillment allocation logic.

The specification requires warehouse splitting based on stock availability with manual override support. fileciteturn6file2L136-L145

## Tasks

### Task 3.1
Review the warehouse, inventory, fulfillment, and backorder models.

### Task 3.2
Implement warehouse/inventory access through the approved data model.

### Task 3.3
Implement stock-availability retrieval.

### Task 3.4
Implement requested-quantity validation.

### Task 3.5
Implement single-warehouse allocation.

### Task 3.6
Implement multi-warehouse allocation.

### Task 3.7
Implement remaining-quantity calculation.

### Task 3.8
Implement shipment-count calculation.

### Task 3.9
Implement estimated shipment-cost calculation according to the business rules.

### Task 3.10
Add unit/API tests for stock and allocation calculations.

## Phase 3 Completion Criteria

Given a real order and warehouse inventory, the system can calculate a valid recommended fulfillment allocation.

Then STOP and wait for approval.

---

# 7. Phase 4 — Warehouse Split, Override & Backorder

## Objective

Complete the fulfillment workflow for shortages and manual operational decisions.

## Tasks

### Task 4.1
Implement recommended split display.

### Task 4.2
Implement Accept Suggested Split.

### Task 4.3
Implement Manual Override.

### Task 4.4
Validate manual allocations against inventory/business rules.

### Task 4.5
Prevent total allocation from becoming inconsistent with required quantity.

### Task 4.6
Implement insufficient-stock detection.

### Task 4.7
Implement backorder quantity calculation.

### Task 4.8
Implement backorder persistence/status where required.

### Task 4.9
Implement Consolidate Remaining Backorder workflow where supported.

### Task 4.10
Implement the complete fulfillment UI and test the normal, split, shortage, and override cases.

## Phase 4 Completion Criteria

The fulfillment module supports recommended allocation, manual override, and backorders using actual stock data.

Then STOP and wait for approval.

---

# 8. Phase 5 — Subscription & Hybrid Billing Foundation

## Objective

Implement support for one-time and recurring lines within the same quotation/order.

The DealFlow360 requirement explicitly calls for hybrid orders containing one-time and recurring products with separate billing behavior. fileciteturn6file0L42-L45

## Tasks

### Task 5.1
Review the approved billing and subscription data model.

### Task 5.2
Implement billing classification for quotation/order lines.

### Task 5.3
Implement one-time billing data handling.

### Task 5.4
Implement recurring billing data handling.

### Task 5.5
Implement subscription-plan selection.

### Task 5.6
Implement supported billing frequencies.

### Task 5.7
Implement subscription start and next-billing dates.

### Task 5.8
Implement recurring billing schedule generation.

### Task 5.9
Ensure one-time and recurring lines remain logically separate.

### Task 5.10
Add tests for mixed one-time/recurring orders and billing schedule generation.

## Phase 5 Completion Criteria

One quotation/order can correctly contain one-time and recurring lines with distinct billing behavior.

Then STOP and wait for approval.

---

# 9. Phase 6 — Proration, Modification & Cancellation

## Objective

Complete the subscription lifecycle required by the MVP.

The specification requires mid-cycle proration and cancellation/modification with a refund/credit trigger where applicable. fileciteturn6file2L147-L151

## Tasks

### Task 6.1
Review the centralized proration formula.

### Task 6.2
Implement mid-cycle proration calculation.

### Task 6.3
Implement quantity-change adjustments.

### Task 6.4
Implement subscription modification.

### Task 6.5
Update future billing schedule after modification.

### Task 6.6
Implement cancellation validation and state transition.

### Task 6.7
Stop future billing where required after cancellation.

### Task 6.8
Implement refund/credit trigger calculation or record.

### Task 6.9
Implement billing UI for schedules, modifications, cancellation, and adjustments.

### Task 6.10
Add comprehensive tests for proration, modification, cancellation, and credit/refund scenarios.

## Phase 6 Completion Criteria

Hybrid billing, proration, modification, and cancellation work using actual application data and business rules.

Then STOP and wait for approval.

---

# 10. Phase 7 — Customer Negotiation Portal Foundation

## Objective

Implement a genuinely separate and restricted customer-facing quotation experience.

The specification requires the customer negotiation screen to be a real separate restricted view, not an internal screen with a different label. fileciteturn6file1L71-L75

## Tasks

### Task 7.1
Review customer-portal requirements and security boundaries.

### Task 7.2
Implement customer quotation access through the shared authentication/RBAC foundation.

### Task 7.3
Implement strict quotation ownership verification.

### Task 7.4
Implement customer-facing quotation details.

### Task 7.5
Implement customer-facing quotation status display.

### Task 7.6
Implement line-level comment/change-request persistence.

### Task 7.7
Implement counter-discount proposal persistence.

### Task 7.8
Implement Submit Request workflow.

### Task 7.9
Implement customer portal responsive UI.

### Task 7.10
Add authorization, API, and UI tests preventing cross-customer quotation access.

## Phase 7 Completion Criteria

A customer can securely view and interact with only their own quotation through the dedicated portal.

Then STOP and wait for approval.

---

# 11. Phase 8 — Negotiation, Re-evaluation & Confirmation

## Objective

Complete the customer negotiation lifecycle and approval re-entry.

The required flow is that customer changes which exceed approval thresholds must automatically return the quotation to approval; otherwise it can proceed toward fulfillment. fileciteturn6file3L201-L212

## Tasks

### Task 8.1
Implement quotation transition to UNDER_NEGOTIATION where required.

### Task 8.2
Implement customer-requested quotation changes.

### Task 8.3
Implement counter-discount validation.

### Task 8.4
Trigger discount/risk re-evaluation after negotiated changes.

### Task 8.5
Trigger approval re-evaluation when thresholds are exceeded.

### Task 8.6
Handle the quotation returning to PENDING_APPROVAL.

### Task 8.7
Handle the no-approval-required path after negotiation.

### Task 8.8
Implement customer Confirm Quotation action.

### Task 8.9
Prevent confirmation while required approval remains incomplete.

### Task 8.10
Test the complete customer negotiation → re-evaluation → approval/no-approval → confirmation flow.

## Phase 8 Completion Criteria

The customer can negotiate safely, and the quotation follows the correct approval path after changes.

Then STOP and wait for approval.

---

# 12. Phase 9 — Deal Health & Alerts Foundation

## Objective

Implement deterministic deal-health monitoring.

The specification calls for stalled deals, discount anomalies, and delivery promise slippage indicators. fileciteturn6file2L164-L169

## Tasks

### Task 9.1
Review the approved deal-health rules and thresholds.

### Task 9.2
Implement stalled-deal detection.

### Task 9.3
Implement discount-anomaly detection using the available project data.

### Task 9.4
Implement delivery-promise slippage detection where fulfillment data supports it.

### Task 9.5
Implement deal-health alert persistence.

### Task 9.6
Implement alert severity and status.

### Task 9.7
Implement alert generation from actual application data.

### Task 9.8
Implement alert retrieval API/service.

### Task 9.9
Implement alert list UI.

### Task 9.10
Add tests for each supported deal-health rule.

## Phase 9 Completion Criteria

The system can identify real problem deals and create actionable alerts.

Then STOP and wait for approval.

---

# 13. Phase 10 — Deal Health Actions & Operational Dashboard Foundation

## Objective

Connect deal-health alerts to actionable navigation and establish the operational dashboard.

## Tasks

### Task 10.1
Implement related quotation navigation from an alert.

### Task 10.2
Implement alert acknowledgement.

### Task 10.3
Implement alert resolution.

### Task 10.4
Implement nudge/escalation action where supported by the project scope.

### Task 10.5
Review reporting and dashboard metrics required by the specification.

### Task 10.6
Implement live quotation counts and status metrics.

### Task 10.7
Implement pending-approval summary metrics.

### Task 10.8
Implement deal-health summary metrics.

### Task 10.9
Implement discount-anomaly and fulfillment/billing issue summaries where data is available.

### Task 10.10
Create the initial responsive operational dashboard and test its live data behavior.

## Phase 10 Completion Criteria

Deal-health alerts are actionable and the dashboard foundation displays real application metrics.

Then STOP and wait for approval.

---

# 14. Phase 11 — Dashboard Filters & Full Module Integration

## Objective

Complete dashboard filtering and connect Developer B's modules into a coherent operational experience.

The problem statement specifies filters for period, sales representative/team, approval status, and product/category. fileciteturn6file2L95-L100

## Tasks

### Task 11.1
Implement period filtering.

### Task 11.2
Implement sales representative/team filtering where supported.

### Task 11.3
Implement approval-status filtering.

### Task 11.4
Implement product/category filtering.

### Task 11.5
Ensure dashboard metrics respond to filters using real data.

### Task 11.6
Connect dashboard deal-health alerts to related quotations.

### Task 11.7
Connect dashboard fulfillment information to warehouse states.

### Task 11.8
Connect dashboard billing information to billing/subscription states.

### Task 11.9
Verify customer negotiation status is visible where required.

### Task 11.10
Run an end-to-end Developer B regression test across Upsell, Fulfillment, Billing, Negotiation, Deal Health, and Dashboard.

## Phase 11 Completion Criteria

The major Developer B modules work together and the dashboard reflects live operational state.

Then STOP and wait for approval.

---

# 15. Phase 12 — Hardening & Final Demo Readiness

## Objective

Prepare all Developer B modules for final integration and the five-minute end-to-end demonstration.

The official DealFlow specification requires at least two complete end-to-end flows and expects the core logic to actually work rather than merely showing screens. fileciteturn6file1L77-L82

## Tasks

### Task 12.1
Review all Developer B modules against their documented requirements.

### Task 12.2
Remove dead code, duplicate logic, temporary mocks, and unnecessary abstractions.

### Task 12.3
Verify no critical business result is hardcoded for the demo.

### Task 12.4
Verify warehouse allocation uses actual inventory data.

### Task 12.5
Verify billing/proration uses actual stored application data.

### Task 12.6
Verify customer portal authorization prevents cross-customer access.

### Task 12.7
Verify all Developer B APIs use shared contracts and permission checks.

### Task 12.8
Verify responsive behavior of all Developer B-owned screens.

### Task 12.9
Run the complete Developer B test suite and application build/startup verification.

### Task 12.10
Create the final Developer B handoff report with integration notes, known issues, contract dependencies, and Git references.

## Phase 12 Completion Criteria

Developer B's modules are stable, tested, responsive, documented, and ready for final cross-developer integration.

Then STOP and wait for approval.

---

# 16. Developer B Critical Business Rules

Developer B MUST follow the centralized rules in:

`05_BUSINESS_RULES.md`

In particular:

- Recommendations must be generated from real data/rules.
- Adding an upsell item must update quotation totals/margin.
- Warehouse allocation must respect actual stock and allocation rules.
- Backorders must reflect actual shortages.
- One-time and recurring billing must remain distinct.
- Proration must use the centralized formula.
- Customer negotiation must not bypass approval requirements.
- Deal-health alerts must be derived from application state.
- Dashboard metrics must be calculated from live application data.

Do not invent alternative rules locally.

---

# 17. Developer B Shared Contracts

Developer B consumes stable interfaces for:

## Customer

- Get customer
- Verify quotation ownership
- Get customer tier where required

## Product

- Get product
- Get price
- Get cost
- Get product type

## Quotation

- Get quotation
- Get quotation lines
- Add quotation line
- Update quotation
- Recalculate quotation
- Get quotation status

## Discount

- Evaluate quotation
- Get discount/risk result

## Approval

- Get approval status
- Request re-evaluation
- Get pending approval state

Developer B must use:

`06_API_CONTRACT.md`

and:

`04_DATA_MODEL_AND_DATABASE.md`

as the authoritative interface/data definitions.

---

# 18. Independence Rules

Developer B must be able to develop and test its modules without waiting for Developer A's internal code.

Where Developer A's module is incomplete, Developer B may use:

- Stable API contracts
- Test fixtures
- Mock interfaces
- Seed data

for development/testing.

Do not copy Developer A's business logic.

Do not directly couple Developer B's modules to Developer A's internal database implementation if an approved interface exists.

---

# 19. Module Dependency Rules

## Upsell

May depend on:

- Quotation
- Products
- Pricing
- Recommendation rules

Must not depend on:

- Warehouse internals
- Billing internals
- Dashboard UI

## Fulfillment

May depend on:

- Confirmed order/quotation
- Products
- Inventory
- Warehouses

Must not depend on:

- Dashboard internals
- Negotiation UI

## Billing

May depend on:

- Order/quotation lines
- Product type
- Subscription plan
- Dates

Must not depend on:

- Dashboard internals
- Warehouse UI

## Negotiation

May depend on:

- Customer
- Quotation
- Quotation lines
- Discount/approval interfaces

Must not depend on:

- Dashboard internals

## Deal Health

May consume relevant application state.

It must not require the dashboard UI to calculate alerts.

## Dashboard

Consumes module outputs.

It must not contain the underlying business logic for:

- Approval
- Discount evaluation
- Fulfillment
- Billing
- Negotiation

---

# 20. Database Rules

Follow:

`04_DATA_MODEL_AND_DATABASE.md`

Rules:

- Do not duplicate shared entities.
- Do not create a second quotation model.
- Do not create a second customer model.
- Do not duplicate product data.
- Maintain referential integrity.
- Use proper relationships.
- Use consistent status values.
- Keep transactional state separate from derived reporting state where appropriate.
- Avoid storing calculations as authoritative values unless explicitly required.

If a new entity/field is required:

1. Check whether an existing entity already supports it.
2. Identify why the new field/entity is required.
3. Update the data-model documentation.
4. Check Developer A impact.
5. Only then implement.

Do not silently change shared schema.

---

# 21. API Rules

All module APIs must follow:

`06_API_CONTRACT.md`

Rules:

- Stable request/response formats
- Consistent errors
- Authentication checks
- Permission checks
- Server-side validation
- No database implementation leakage
- No duplicate endpoint semantics

Do not create ad-hoc APIs solely because a UI component needs them.

---

# 22. Customer Portal Security

Customer-facing APIs must verify quotation ownership.

Never trust only a quotation ID from the client.

Required conceptual flow:

```text
Authenticated Customer
        ↓
Verify quotation ownership
        ↓
Authorized?
      /   \
    YES    NO
     │      │
     ▼      ▼
 Continue  Reject
```

Do not reveal another customer's quotation existence.

---

# 23. No Hardcoded Demo Results

Do NOT hardcode:

- Upsell recommendations
- Margin deltas
- Warehouse split quantities
- Shipment counts
- Billing schedules
- Proration values
- Refund/credit results
- Negotiation outcomes
- Deal-health alerts
- Dashboard metrics

The hackathon explicitly requires dynamic/real data and application logic rather than fake core behavior. citeturn217948search0

---

# 24. Testing Strategy

Each module must contain:

### Unit tests

For business logic.

### API tests

For important endpoints.

### Integration tests

For module contracts.

### UI tests

For critical user interactions where practical.

Prioritize correctness of business behavior over cosmetic test coverage.

---

# 25. Critical Integration Flow

Developer B must eventually support this flow:

```text
Quotation
    ↓
Upsell Recommendation
    ↓
Add to Quote
    ↓
Quotation Total / Margin Update
    ↓
Approved Order
    ↓
Warehouse Allocation
    ↓
One-time + Recurring Billing
    ↓
Customer Portal
    ↓
Customer Negotiation
    ↓
Discount / Approval Re-evaluation
    ↓
Confirmation
    ↓
Deal Health
    ↓
Dashboard
```

This sequence follows the required DealFlow360 flow from quotation through fulfillment/billing, customer negotiation, and monitoring. fileciteturn6file3L219-L238

---

# 26. Developer B Regression Scenario

At the appropriate integration phase, verify:

1. Open a valid quotation.
2. Display relevant upsell recommendations.
3. Add an upsell product.
4. Confirm total and margin change immediately.
5. Approve the quotation using Developer A's approval flow.
6. Calculate warehouse allocation.
7. Confirm multi-warehouse split when required.
8. Confirm one-time and recurring billing separation.
9. Open the customer portal.
10. Submit a customer negotiation.
11. Verify discount/approval re-evaluation.
12. Confirm the quotation only after required approval is complete.
13. Verify deal-health information.
14. Verify dashboard metrics reflect the resulting state.

The uploaded problem statement's quick test flow requires the same major behaviors: upsell/margin update, warehouse split, hybrid billing, customer negotiation, automatic approval re-entry, and final payment/invoice-status verification. fileciteturn6file4L252-L270

---

# 27. File Ownership Rules

Developer B should primarily modify files belonging to:

- Upsell module
- Fulfillment module
- Billing module
- Negotiation module
- Deal-health module
- Dashboard module

Avoid modifying Developer A's module files.

Avoid modifying shared foundation files after Phase 0 unless absolutely necessary.

Shared/high-conflict resources include:

- Global authentication
- RBAC
- Application shell
- Shared UI components
- Shared API client
- Data model
- API contract
- Global configuration

If a shared change is required:

1. Identify why.
2. Check downstream impact.
3. Make the smallest necessary change.
4. Update the relevant documentation.
5. Report the change clearly.

---

# 28. No Silent Architecture Changes

Developer B MUST NOT silently:

- Add a new shared entity.
- Rename a shared entity.
- Change shared enums.
- Change quotation states.
- Change permission semantics.
- Change API contracts.
- Change pricing/billing formulas.
- Change approval behavior.

If such a change is necessary:

STOP and report it before implementing the shared change.

---

# 29. Vertical Implementation Rule

Do NOT implement all backend work first and postpone all UI.

For each module use:

```text
Define
  ↓
Model integration
  ↓
Business logic
  ↓
API
  ↓
UI
  ↓
Validation
  ↓
Authorization
  ↓
Tests
  ↓
Module verification
```

Every phase should leave the affected module closer to a demonstrable vertical slice.

---

# 30. Scope Control

Developer B must prioritize:

1. Correct business behavior
2. Real application data
3. Module independence
4. Stable interfaces
5. Security
6. Validation
7. Tests
8. UI polish

Do not introduce advanced ML, complex payment integrations, or unnecessary infrastructure during the MVP unless explicitly approved and core work is already complete.

The official hackathon guidance also recommends using trendy technology only when it adds real value and encourages local/offline-capable solutions rather than relying entirely on internet connectivity. citeturn217948search0

---

# 31. Required Phase Report

After every phase, Developer B MUST provide:

```text
DEVELOPER:
B

PHASE:
<phase number and name>

STATUS:
COMPLETED / BLOCKED

TASKS COMPLETED:
1.
2.
3.
...
10.

MODULES CHANGED:
- ...

FILES CREATED:
- ...

FILES MODIFIED:
- ...

DATABASE CHANGES:
- ...

API CHANGES:
- ...

BUSINESS RULE CHANGES:
- ...

TESTS RUN:
- ...

TEST RESULT:
PASS / FAIL

APPLICATION VERIFICATION:
- ...

GIT:
Branch:
Commit:

KNOWN ISSUES:
- ...

BLOCKERS:
- ...

NEXT PHASE:
NOT STARTED
```

---

# 32. MANDATORY STOP RULE

When the ten tasks of the current phase have been completed and verified:

```text
IMPLEMENT
    ↓
TEST
    ↓
VERIFY
    ↓
GIT CHECK
    ↓
REPORT
    ↓
STOP
```

Do NOT continue directly into the next phase.

Do NOT interpret successful completion as automatic authorization for the next phase.

Wait for explicit user approval.

---

# 33. Final Developer B Outcome

After Phase 12, Developer B should have stable vertical implementations for:

```text
Upsell & Cross-sell
        ↓
Warehouse Fulfillment & Splitting
        ↓
Subscription & Hybrid Billing
        ↓
Customer Negotiation Portal
        ↓
Deal Health & Alerts
        ↓
Operational Dashboard
```

These modules must be ready for final integration with Developer A's:

```text
Customer
Product & Pricing
Quotation
Discount Governance
Approval Workflow
Audit Trail
```

The combined system must support the full DealFlow360 lifecycle without requiring either developer to own only a technical layer.
