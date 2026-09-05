# Developer A — Phased Implementation Plan

## 1. Developer Role

Developer A owns the following DealFlow360 vertical business modules:

1. Customer Management
2. Product & Pricing Management
3. Quotation Management
4. Discount Governance
5. Approval Workflow
6. Audit Trail

Developer A works by feature/module, not by frontend/backend layer.

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

Developer A must reuse the shared:

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

## Developer A owns

- Customer Management
- Product & Pricing
- Quotation Management
- Discount Governance
- Approval Workflow
- Audit Trail

## Developer B owns

- Upsell & Cross-sell
- Warehouse Fulfillment & Splitting
- Subscription & Hybrid Billing
- Customer Negotiation Portal
- Deal Health & Alerts
- Operational Dashboard

Developer A must not implement Developer B's internal business logic.

Developer B must not implement Developer A's internal business logic.

Shared contracts are defined by:

- `04_DATA_MODEL_AND_DATABASE.md`
- `05_BUSINESS_RULES.md`
- `06_API_CONTRACT.md`

---

# 3. Phase Execution Rules

This document contains **12 phases**.

Each phase contains **10 implementation tasks**.

Therefore, Developer A has exactly:

- 12 phases
- 120 phase tasks

The tasks are intentionally grouped into meaningful vertical milestones.

## Mandatory execution rule

Developer A MUST execute only the current phase.

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

Developer A MUST NOT automatically start the next phase.

The next phase requires explicit user approval.

Valid examples:

- `Proceed to Phase 2`
- `Continue`
- `Start Phase 2`
- `Proceed`

Ambiguous acknowledgements such as `okay` or `good` should not automatically trigger the next phase unless clearly intended as permission.

---

# 4. Phase 1 — Customer Foundation

## Objective

Implement the complete Customer Management vertical slice.

## Tasks

### Task 1.1
Review the customer requirements in the project documentation and confirm the customer entity and required fields.

### Task 1.2
Implement customer persistence using the approved data model.

### Task 1.3
Implement customer creation.

### Task 1.4
Implement customer listing with basic search.

### Task 1.5
Implement customer details view.

### Task 1.6
Implement customer editing.

### Task 1.7
Implement customer activation/deactivation or status management as defined by the data model.

### Task 1.8
Implement customer tier handling.

### Task 1.9
Apply RBAC and validation to customer operations.

### Task 1.10
Add customer unit/API/UI tests and verify the complete customer flow.

## Phase 1 Completion Criteria

The customer module must support:

- Create
- Read/list
- View details
- Update
- Search
- Tier
- Status
- Authorization
- Validation
- Persistence
- Tests

Then STOP and wait for approval.

---

# 5. Phase 2 — Product & Pricing Foundation

## Objective

Implement the complete Product & Pricing vertical slice required for quotation and discount logic.

## Tasks

### Task 2.1
Review the product requirements and confirm product fields, categories, types, and pricing concepts.

### Task 2.2
Implement product persistence using the approved schema.

### Task 2.3
Implement product creation.

### Task 2.4
Implement product listing and search/filtering.

### Task 2.5
Implement product details.

### Task 2.6
Implement product editing and status handling.

### Task 2.7
Implement product category handling.

### Task 2.8
Implement cost price, selling price, and allowed discount storage.

### Task 2.9
Implement product type handling, including one-time/subscription classification required by later billing functionality.

### Task 2.10
Apply RBAC, validation, and tests to the complete product flow.

## Phase 2 Completion Criteria

The product module must provide reliable product data to the quotation and discount modules.

Then STOP and wait for approval.

---

# 6. Phase 3 — Quotation Core

## Objective

Implement the central quotation object and basic quotation lifecycle.

## Tasks

### Task 3.1
Review the approved quotation data model and lifecycle.

### Task 3.2
Implement quotation persistence.

### Task 3.3
Implement quotation creation with customer and sales representative assignment.

### Task 3.4
Implement quotation listing.

### Task 3.5
Implement quotation details.

### Task 3.6
Implement quotation line creation and removal.

### Task 3.7
Implement quantity and unit-price handling.

### Task 3.8
Implement quotation totals and line calculations.

### Task 3.9
Implement quotation draft save/update behavior.

### Task 3.10
Implement controlled quotation status transitions for the currently supported states and add tests.

## Phase 3 Completion Criteria

A sales representative must be able to create and save a real quotation containing customer, products, quantities, and calculated totals.

Then STOP and wait for approval.

---

# 7. Phase 4 — Quotation Pricing, Margin & Shared Interfaces

## Objective

Complete quotation calculations and stabilize the interfaces that later modules will consume.

## Tasks

### Task 4.1
Implement line-level discount storage and calculation.

### Task 4.2
Implement order-level discount handling where required.

### Task 4.3
Implement total discount calculation.

### Task 4.4
Implement product-cost-based quotation margin calculation.

### Task 4.5
Implement margin percentage calculation with safe zero-value handling.

### Task 4.6
Ensure quotation totals and margin recalculate when product, quantity, price, or discount changes.

### Task 4.7
Implement the quotation calculation service as reusable business logic.

### Task 4.8
Expose stable quotation APIs for other modules.

### Task 4.9
Document or align the quotation request/response structures with `06_API_CONTRACT.md`.

### Task 4.10
Add unit, API, and integration tests for quotation calculations and interfaces.

## Phase 4 Completion Criteria

Quotation calculations are real, reusable, testable, and ready for Discount Governance, Upsell, Fulfillment, Billing, and Negotiation modules.

Then STOP and wait for approval.

---

# 8. Phase 5 — Discount Governance Foundation

## Objective

Implement the actual per-line discount governance engine.

The DealFlow360 specification requires each product line to be checked against its own allowed discount and does not permit the core rule to be faked. fileciteturn6file1L69-L75

## Tasks

### Task 5.1
Review the centralized discount rules and permitted discount concepts.

### Task 5.2
Implement the discount evaluation service.

### Task 5.3
Evaluate each quotation line independently.

### Task 5.4
Compare requested discount against the applicable allowed discount.

### Task 5.5
Calculate discount difference/excess.

### Task 5.6
Implement the configured risk classification inputs.

### Task 5.7
Generate a structured quotation-level discount/risk evaluation result.

### Task 5.8
Generate an approval-required decision based on the approved business rules.

### Task 5.9
Expose the discount evaluation through a stable service/API contract.

### Task 5.10
Create comprehensive tests for normal, boundary, excessive, and multi-line discounts.

## Phase 5 Completion Criteria

The system must be able to evaluate a real quotation and determine whether its discounts require approval.

Then STOP and wait for approval.

---

# 9. Phase 6 — Approval Workflow Foundation

## Objective

Implement automatic approval routing based on the discount/risk results.

The required flow is that excessive discounts automatically route the quotation for approval rather than requiring the sales representative to manually request it. fileciteturn6file4L254-L261

## Tasks

### Task 6.1
Review the configured approval hierarchy and approval conditions.

### Task 6.2
Implement approval request persistence.

### Task 6.3
Implement approval step persistence.

### Task 6.4
Implement automatic approval request creation when required.

### Task 6.5
Implement Sales Manager approval routing.

### Task 6.6
Implement Finance routing only when required by the business rules.

### Task 6.7
Implement approve action.

### Task 6.8
Implement reject and return-for-revision actions.

### Task 6.9
Synchronize quotation state with approval state.

### Task 6.10
Add tests for single-step, multi-step, rejection, return, and completion scenarios.

## Phase 6 Completion Criteria

A quotation with excessive discount must automatically enter the correct approval path.

Then STOP and wait for approval.

---

# 10. Phase 7 — Approval UI & Quotation Approval Integration

## Objective

Connect the approval engine to the complete internal user experience.

The problem specification expects an approval screen containing the blended risk score, approval steps, reviewer actions, and audit history. fileciteturn6file2L119-L125

## Tasks

### Task 7.1
Implement the pending-approval list.

### Task 7.2
Implement approval details view.

### Task 7.3
Display quotation and relevant discount information.

### Task 7.4
Display blended risk information according to the business rules.

### Task 7.5
Display approval steps and current reviewer.

### Task 7.6
Implement approve UI action.

### Task 7.7
Implement reject UI action.

### Task 7.8
Implement return-for-revision UI action.

### Task 7.9
Connect approval decisions to quotation state updates.

### Task 7.10
Test the complete quotation → discount → approval → approval decision flow.

## Phase 7 Completion Criteria

The complete approval experience must be usable by the correct internal role.

Then STOP and wait for approval.

---

# 11. Phase 8 — Audit Trail

## Objective

Implement traceability for important Developer A business events.

## Tasks

### Task 8.1
Review the audit-log data model.

### Task 8.2
Implement the audit event persistence mechanism.

### Task 8.3
Implement a reusable audit service/event interface.

### Task 8.4
Record quotation creation.

### Task 8.5
Record quotation modifications and important status transitions.

### Task 8.6
Record discount changes/evaluation events where required.

### Task 8.7
Record approval creation and decisions.

### Task 8.8
Implement audit-history retrieval.

### Task 8.9
Implement an internal audit/history UI for relevant records.

### Task 8.10
Add tests confirming actor, action, entity, timestamp, and relevant change data.

## Phase 8 Completion Criteria

Important Developer A business actions must be traceable without exposing sensitive secrets.

Then STOP and wait for approval.

---

# 12. Phase 9 — Customer-to-Quotation Integration

## Objective

Stabilize the relationship between Customer, Product, and Quotation modules before cross-developer integration.

## Tasks

### Task 9.1
Verify customer selection inside quotation creation.

### Task 9.2
Verify product selection inside quotation creation.

### Task 9.3
Verify customer tier is available to discount evaluation.

### Task 9.4
Verify product allowed discount is available to discount evaluation.

### Task 9.5
Verify product cost is available to margin calculation.

### Task 9.6
Verify product type is exposed for Developer B's billing module.

### Task 9.7
Verify quotation status and approval status remain consistent.

### Task 9.8
Verify all Developer A module APIs conform to `06_API_CONTRACT.md`.

### Task 9.9
Remove duplicated calculations or data representations discovered during integration.

### Task 9.10
Run an end-to-end Developer A regression suite.

## Phase 9 Completion Criteria

Customer → Product → Quotation → Discount → Approval must work as one stable internal chain.

Then STOP and wait for approval.

---

# 13. Phase 10 — Developer A / Developer B Contract Integration

## Objective

Prepare Developer A's modules for independent consumption by Developer B.

Developer B will need quotation, customer, product, discount, and approval information for upsell, fulfillment, billing, and customer negotiation.

## Tasks

### Task 10.1
Verify the quotation read interface consumed by other modules.

### Task 10.2
Verify quotation-line interfaces.

### Task 10.3
Verify product pricing/cost/type interfaces.

### Task 10.4
Verify customer identity/tier/ownership information exposed through approved contracts.

### Task 10.5
Verify discount evaluation can be requested by another module.

### Task 10.6
Verify approval re-evaluation can be requested by another module.

### Task 10.7
Define and test quotation status transition interfaces required by Developer B.

### Task 10.8
Create mocks/test fixtures that allow Developer B modules to test independently.

### Task 10.9
Identify and resolve unnecessary shared-file dependencies.

### Task 10.10
Run contract tests against the agreed API/data boundaries.

## Phase 10 Completion Criteria

Developer B can consume Developer A capabilities without accessing Developer A's internal implementation.

Then STOP and wait for approval.

---

# 14. Phase 11 — Full Developer A Regression & Demo Flow

## Objective

Prove that Developer A's complete feature set works as one coherent flow.

The DealFlow360 quick test expects a quotation to be created, an excessive discount to automatically trigger approval, and the quotation to proceed through the sales lifecycle. fileciteturn6file4L252-L268

## Tasks

### Task 11.1
Create or use the required seed data for customers, products, discount limits, and approval configuration.

### Task 11.2
Log in as a Sales Representative.

### Task 11.3
Create a quotation.

### Task 11.4
Add multiple products and quantities.

### Task 11.5
Apply a discount exceeding the allowed threshold.

### Task 11.6
Verify the quotation automatically enters approval.

### Task 11.7
Log in as the appropriate approver and review the quotation/risk information.

### Task 11.8
Approve or return the quotation and verify the state transition.

### Task 11.9
Verify audit history contains the important actions.

### Task 11.10
Run the complete automated regression suite and fix Developer A defects.

## Phase 11 Completion Criteria

Developer A's complete owned flow must work from quotation creation through approval and audit.

Then STOP and wait for approval.

---

# 15. Phase 12 — Hardening & Handoff

## Objective

Prepare Developer A's modules for final integration, demo, and handoff.

## Tasks

### Task 12.1
Review all Developer A modules against their documented requirements.

### Task 12.2
Remove dead code, duplicate logic, temporary mocks, and unnecessary abstractions.

### Task 12.3
Verify there are no hardcoded business results.

### Task 12.4
Verify all critical business rules are implemented in application logic.

### Task 12.5
Verify RBAC and permission enforcement on all Developer A APIs and actions.

### Task 12.6
Verify validation and error handling across the modules.

### Task 12.7
Verify responsive behavior of Developer A-owned screens.

### Task 12.8
Verify API contracts and data-model consistency one final time.

### Task 12.9
Run the full Developer A test suite and the application build/startup verification.

### Task 12.10
Create the final Developer A handoff report including known issues, integration notes, contract changes, and Git commit references.

## Phase 12 Completion Criteria

Developer A's modules are stable, tested, documented, and ready for final cross-developer integration.

Then STOP and wait for approval.

---

# 16. Developer A Critical Business Rules

Developer A MUST follow the centralized business rules in:

`05_BUSINESS_RULES.md`

In particular:

- Discount checks must be performed per quotation line.
- Approval must be automatic where thresholds are exceeded.
- Approval decisions must change quotation state correctly.
- Quotation totals must be calculated from real data.
- Margin must be derived from revenue and product cost.
- Audit records must reflect important business actions.

Do not invent alternative rules locally.

---

# 17. Developer A Shared Contracts

Developer A must provide stable interfaces for:

## Customer

- Get customer
- Get customer tier
- Verify customer ownership where required

## Product

- Get product
- Get product pricing
- Get product cost
- Get product type
- Get allowed discount

## Quotation

- Create quotation
- Get quotation
- List quotations
- Update quotation
- Get quotation lines
- Add/update/remove lines
- Calculate quotation
- Submit quotation
- Get quotation state

## Discount

- Evaluate quotation discounts
- Return line-level evaluation
- Return quotation-level risk/approval result

## Approval

- Get approval state
- Get pending approvals
- Approve
- Reject
- Return for revision
- Re-evaluate approval

## Audit

- Record event
- Retrieve history

These interfaces must follow:

`06_API_CONTRACT.md`

---

# 18. Independence Rules

Developer A must be able to work without waiting for Developer B.

Developer A must NOT require the completion of:

- Upsell
- Warehouse
- Billing
- Negotiation
- Deal Health
- Dashboard

for the completion of Developer A's core modules.

Where another module is not yet available, use stable interfaces, mocks, fixtures, or seeded data only for development/testing.

Do not hardwire dependencies on unfinished modules.

---

# 19. File Ownership Rules

Developer A should primarily modify files belonging to:

- Customer module
- Product module
- Quotation module
- Discount module
- Approval module
- Audit module

Avoid modifying Developer B's module files.

Avoid modifying shared foundation files after Phase 0 unless absolutely necessary.

Shared/high-conflict resources include:

- Global authentication
- RBAC definition
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
4. Update the corresponding documentation.
5. Report the change clearly.

---

# 20. No Silent Architecture Changes

Developer A MUST NOT silently:

- Add a new shared entity.
- Rename a shared entity.
- Change a shared enum.
- Change quotation states.
- Change permission semantics.
- Change API contracts.
- Change approval rules.
- Change discount formulas.

When such a change is necessary:

STOP and report it before implementing the shared change.

---

# 21. No Fake Business Logic

The following must NEVER be hardcoded only for demonstration:

- Approval decisions
- Discount risk
- Quotation totals
- Margin
- Customer tier behavior
- Product discounts
- Approval routing

The official specification requires core business rules to be implemented as actual application logic rather than hardcoded or faked results. fileciteturn6file1L69-L75

---

# 22. Required Phase Report

After every phase, Developer A MUST provide:

```text
DEVELOPER:
A

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

# 23. MANDATORY STOP RULE

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

# 24. Scope Control

Developer A MUST prioritize:

1. Correct business behavior
2. Data integrity
3. Module independence
4. API stability
5. Validation
6. Authorization
7. Tests
8. UI polish

Do not spend significant time on optional visual polish while core business logic is incomplete.

Do not add optional features unless:

- All current phase tasks are complete.
- Tests pass.
- The feature does not increase cross-developer dependency.
- The user explicitly approves the scope expansion.

---

# 25. Final Developer A Outcome

After Phase 12, Developer A should have stable vertical implementations for:

```text
Customer Management
        ↓
Product & Pricing
        ↓
Quotation Management
        ↓
Discount Governance
        ↓
Approval Workflow
        ↓
Audit Trail
```

These modules must be ready for the larger DealFlow360 flow:

```text
Quotation
   ↓
Discount / Risk
   ↓
Approval
   ↓
Upsell
   ↓
Fulfillment
   ↓
Billing
   ↓
Customer Negotiation
   ↓
Re-Approval if Required
   ↓
Confirmation
   ↓
Deal Health / Reporting
```

Developer A owns the first commercial-control section of this flow and must expose clean interfaces so Developer B can implement the remaining sections independently.
