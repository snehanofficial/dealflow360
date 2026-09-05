# Antigravity Execution Rules - DealFlow360

## 1. Purpose

This document defines the mandatory execution behavior for the Antigravity agent while implementing DealFlow360.

The agent must use this document together with the project MD files to control:

- What to read
- What to implement
- Which phase may be executed
- How many tasks may be executed
- How developers work independently
- How shared files are protected
- How tests and verification are performed
- How Git is managed
- When the agent must stop
- When user permission is required

This document is an execution-control document.

It does not replace:

- `00_BASE_IMPLEMENTATION.md`
- `01_PROJECT_VISION.md`
- `02_REQUIREMENTS_AND_SCOPE.md`
- `03_ROLES_PERMISSIONS_AND_FLOWS.md`
- `04_DATA_MODEL_AND_DATABASE.md`
- `05_BUSINESS_RULES.md`
- `06_API_CONTRACT.md`
- `07_FEATURE_MODULES.md`
- `08_DEVELOPER_A.md`
- `09_DEVELOPER_B.md`
- `10_PHASE_PLAN.md`

Those files define the product and implementation details.

This file defines HOW Antigravity must execute them.

---

# 2. Source-of-Truth Hierarchy

Antigravity must resolve project decisions using this order:

```text
Official DealFlow360 Problem Statement
        ↓
01_PROJECT_VISION.md
        ↓
02_REQUIREMENTS_AND_SCOPE.md
        ↓
03_ROLES_PERMISSIONS_AND_FLOWS.md
        ↓
04_DATA_MODEL_AND_DATABASE.md
        ↓
05_BUSINESS_RULES.md
        ↓
06_API_CONTRACT.md
        ↓
07_FEATURE_MODULES.md
        ↓
Developer A / Developer B ownership files
        ↓
Phase Plan
        ↓
Implementation
```

When a more specific implementation document defines an accepted detail, use that detail unless it conflicts with a higher-level project requirement.

If two documents conflict:

1. Identify the conflict.
2. Do not silently choose one.
3. Do not implement both.
4. Report the conflict.
5. Ask for user approval when the decision changes shared behavior.

---

# 3. Core Execution Principle

Antigravity must operate in controlled phases.

The required cycle is:

```text
READ
  ↓
PLAN
  ↓
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
  ↓
WAIT FOR USER APPROVAL
```

The agent must never treat phase completion as permission to start the next phase.

---

# 4. Phase Structure

The project uses explicit phases.

The Base Implementation, Developer A, Developer B, and overall project phase documents define the exact number of tasks in each phase.

Unless a phase document explicitly says otherwise:

- Do not create extra tasks.
- Do not skip required tasks.
- Do not start future-phase tasks.
- Do not continue into another phase automatically.

The currently authorized phase is the ONLY phase the agent may execute.

---

# 5. Task Execution Rules

For each task:

1. Read the relevant requirement.
2. Inspect existing implementation.
3. Identify affected files.
4. Confirm ownership.
5. Implement the smallest complete solution.
6. Run relevant tests.
7. Verify the behavior.
8. Mark the task as completed only when actually complete.

A task is NOT complete merely because code was written.

A task is complete when the required behavior works and has been verified.

---

# 6. Context / Documentation Loading Rules

Do NOT unnecessarily read every MD file for every task.

Read only the documentation required by the current phase.

Typical hierarchy:

## Base phase

Read:

- `00_BASE_IMPLEMENTATION.md`
- Relevant vision/requirements/role documentation

## Developer A phase

Read:

- `08_DEVELOPER_A.md`
- Relevant requirements
- `04_DATA_MODEL_AND_DATABASE.md`
- `05_BUSINESS_RULES.md`
- `06_API_CONTRACT.md`

## Developer B phase

Read:

- `09_DEVELOPER_B.md`
- Relevant requirements
- `04_DATA_MODEL_AND_DATABASE.md`
- `05_BUSINESS_RULES.md`
- `06_API_CONTRACT.md`

Do not load unrelated documentation merely for completeness.

The objective is to maintain a focused execution context.

---

# 7. No Automatic Scope Expansion

Antigravity must not expand the scope of the current phase automatically.

Do not add:

- Optional features
- Extra refactors
- Unrequested redesigns
- Unnecessary abstractions
- Additional integrations
- Advanced infrastructure
- Large UI redesigns

unless they are necessary to complete the currently authorized task.

If a potentially useful feature is discovered:

```text
Record it
Do not implement it
Continue current scope
```

unless the user explicitly approves expansion.

---

# 8. Feature Ownership Rules

DealFlow360 is implemented using vertical feature/module ownership.

## Developer A owns

- Customer Management
- Product & Pricing Management
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

Ownership means complete feature implementation:

```text
Data
→ Logic
→ API
→ UI
→ Validation
→ Authorization
→ Tests
```

Do NOT split ownership into:

```text
Developer A = Backend
Developer B = Frontend
```

---

# 9. Ownership Enforcement

Before changing a file, determine whether the file belongs to:

- Current developer/module
- Shared foundation
- Another developer

If the file belongs to another developer's module:

DO NOT modify it unless the current phase explicitly requires integration.

If a shared file needs modification:

1. Identify why.
2. Check whether a module-local solution is possible.
3. Make the smallest required change.
4. Report the change.
5. Update the relevant contract/documentation if needed.

---

# 10. Shared Infrastructure Protection

The following are shared infrastructure:

```text
Authentication
RBAC
Routing
Application Shell
Navbar
Shared API Client / Service Layer
Shared UI Components
Validation
Global Loading
Global Error Handling
Notifications
Global User Context
```

After the base implementation is approved, treat these systems as stable.

Do not:

- Rebuild them
- Duplicate them
- Replace them without reason
- Change their behavior casually

Feature modules must consume these shared systems.

---

# 11. Data Model Protection

`04_DATA_MODEL_AND_DATABASE.md` is the authoritative data-model document.

Before introducing a new entity or field:

1. Search the existing model.
2. Determine whether an existing entity already supports the requirement.
3. Check dependencies.
4. Determine whether the change affects the other developer.
5. Update the documented model when required.
6. Implement only after the model decision is clear.

Never silently:

- Create duplicate entities
- Rename shared entities
- Change primary relationships
- Change shared enums
- Remove shared fields
- Change quotation state semantics

---

# 12. Business Rule Protection

`05_BUSINESS_RULES.md` is authoritative for core business behavior.

Do not invent local versions of:

- Discount governance
- Risk scoring
- Approval routing
- Warehouse allocation
- Billing/proration
- Negotiation rules
- Deal-health rules

When business logic is missing:

```text
Identify missing rule
        ↓
Check requirements
        ↓
Check business-rules document
        ↓
If still undefined:
STOP and report
```

Do not guess when the decision materially affects the system.

---

# 13. API Contract Protection

`06_API_CONTRACT.md` defines cross-module communication.

Rules:

- Reuse existing endpoints.
- Reuse existing request structures.
- Reuse existing response structures.
- Reuse shared error formats.
- Reuse authorization conventions.
- Avoid duplicate endpoints.

When a new API is required:

1. Confirm it does not already exist.
2. Define the contract.
3. Identify consumers.
4. Update the contract document.
5. Implement the endpoint.
6. Add tests.

Do not silently create undocumented cross-module APIs.

---

# 14. No Direct Cross-Module Coupling

Prefer:

```text
Module A
   ↓
Stable Contract
   ↓
Module B
```

Avoid:

```text
Module B
   ↓
Directly manipulates
Module A internals
```

A module should not need knowledge of another module's internal database queries, internal UI components, or private business logic.

Use stable interfaces.

---

# 15. No Fake Business Logic

The agent must never implement core functionality using fake results merely to make the demo look complete.

Never hardcode as the final implementation:

- Approval result
- Discount risk
- Margin
- Warehouse allocation
- Backorder quantity
- Billing schedule
- Proration
- Negotiation approval
- Deal-health alerts
- Dashboard metrics

Development mocks or fixtures may be used temporarily for isolated testing, but they must never be mistaken for the final business implementation.

---

# 16. Dynamic Data Rule

Persistent business behavior must use the real application data layer.

Do not use static JSON as the permanent source for:

- Customers
- Products
- Quotations
- Discounts
- Approvals
- Inventory
- Billing
- Negotiations
- Alerts
- Dashboard metrics

Static data is acceptable only for controlled:

- UI prototypes
- Development fixtures
- Tests
- Seed data

---

# 17. Authentication and RBAC Rule

The authentication and RBAC foundation belongs to the base implementation.

All later modules must reuse it.

Never:

- Create a second login system
- Create a second session system
- Create module-specific role systems
- Treat hidden UI controls as authorization

Authorization must be enforced for protected operations.

The system must validate:

```text
Who is the user?
        ↓
What role do they have?
        ↓
What permission do they have?
        ↓
Is this action allowed?
```

---

# 18. Customer Portal Security Rule

The customer portal must remain a genuinely restricted experience.

Never trust a client-provided quotation ID alone.

Verify:

```text
Authenticated Customer
        ↓
Quotation Ownership
        ↓
Permission
        ↓
Access
```

A customer must never gain access to another customer's quotation or internal operational functionality.

---

# 19. Definition of Complete

Antigravity must distinguish between:

```text
Code exists
```

and:

```text
Feature is complete
```

A feature is complete only when applicable:

- Data works
- Logic works
- API works
- UI works
- Validation works
- Authorization works
- Error handling works
- Tests pass
- Real data works
- Integration contract is valid

Not every feature requires every layer to be newly created, but the complete user-visible behavior must work.

---

# 20. Testing Rule

Testing is mandatory before declaring a phase complete.

At minimum:

### Unit tests

For critical business logic.

### API tests

For critical endpoints.

### Integration tests

For cross-module contracts.

### UI verification

For critical user flows and responsive behavior.

Testing priority:

```text
Business correctness
>
Data correctness
>
Security
>
Integration correctness
>
UI correctness
>
Cosmetic polish
```

---

# 21. Regression Rule

When modifying existing functionality:

1. Run tests related to the modified feature.
2. Run tests for dependent modules where practical.
3. Verify previously working critical flows.
4. Do not declare the phase complete if an existing critical flow is broken.

A feature is not considered successful if it introduces a regression in another module.

---

# 22. Error Handling Rule

Errors must be handled intentionally.

Do not leave:

- Unhandled promise failures
- Raw server errors
- Database errors in the UI
- Stack traces in production-facing screens
- Silent failures

Use the shared error-handling mechanism.

Errors should communicate:

- What happened
- Whether the user can retry
- What action is available

without exposing sensitive internals.

---

# 23. Validation Rule

All important input must be validated.

Use:

```text
Client-side validation
+
Server-side validation
```

Client validation improves UX.

Server validation is authoritative.

Never assume that because the UI prevents invalid input, the server will only receive valid input.

---

# 24. Performance / Simplicity Rule

Do not optimize prematurely.

Prefer:

- Simple algorithms
- Clear business logic
- Small modules
- Reusable utilities
- Understandable code

Avoid unnecessary:

- Microservices
- Event infrastructure
- Complex caching
- Over-engineered state management
- Advanced AI systems
- Large third-party integrations

unless explicitly justified by the current requirement.

---

# 25. Git Rules

Git must be used continuously.

Before work:

```text
Check branch
Check working tree
Understand current state
```

During work:

- Make focused commits.
- Avoid massive commits.
- Do not mix unrelated module changes.
- Do not commit secrets.
- Do not commit temporary debug files.

Before phase completion:

```text
Review changed files
Check Git status
Review diff
Commit completed work
```

---

# 26. Commit Rules

Prefer focused commit messages.

Examples:

```text
feat(customer): add customer management
feat(product): add product pricing
feat(quotation): add quotation builder
feat(discount): add discount evaluation
feat(approval): add approval workflow
feat(upsell): add recommendation engine
feat(fulfillment): add warehouse allocation
feat(billing): add hybrid billing
feat(portal): add customer negotiation
feat(deal-health): add alert engine
```

Exact commit messages may differ.

The principle is:

```text
One coherent change
=
One focused commit
```

---

# 27. Shared File Conflict Prevention

When two developers are working in parallel:

Avoid unnecessary edits to:

- Global files
- Shared schemas
- Shared configuration
- Shared types
- Global components

Prefer module-local changes.

Before editing a shared file ask:

```text
Can this be solved inside my module?
```

If yes, prefer the module-local solution.

If no, make the smallest shared change possible and report it.

---

# 28. Integration Rules

Integration must happen intentionally.

Do not repeatedly merge unfinished work just because it exists.

Use stable contracts.

Recommended flow:

```text
Developer A module
        ↓
Module verification
        ↓
Stable contract
        ↓
Developer B integration
        ↓
Integration test
```

Integration problems must be reported clearly.

Do not silently rewrite another developer's module to make an integration issue disappear.

---

# 29. Phase Completion Checklist

Before declaring a phase complete, verify:

### Scope

- All current-phase tasks completed.
- No future-phase task started.
- No unrelated feature added.

### Code

- No obvious dead/debug code.
- No accidental duplicate systems.
- No unnecessary refactor.

### Data

- Data model remains consistent.
- No duplicate entities.
- No invalid relationships.

### Business Logic

- Central rules followed.
- No fake core behavior.

### Security

- Authentication respected.
- RBAC respected.
- Protected operations enforced.

### UI

- Critical screens work.
- Responsive behavior verified.

### Tests

- Relevant tests pass.
- Important flows manually verified.

### Git

- Changed files reviewed.
- No secrets committed.
- Phase work committed appropriately.

---

# 30. Mandatory Phase Report

After every phase, the agent MUST provide:

```text
PHASE:
<phase number and name>

STATUS:
COMPLETED / BLOCKED

TASKS COMPLETED:
1.
2.
3.
...
<all tasks in the phase>

FILES CREATED:
- ...

FILES MODIFIED:
- ...

MODULES AFFECTED:
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

RESPONSIVE VERIFICATION:
- ...

SECURITY / RBAC VERIFICATION:
- ...

GIT:
Branch:
Commit:
Working tree:

KNOWN ISSUES:
- ...

BLOCKERS:
- ...

NEXT PHASE:
NOT STARTED
```

The report must be factual.

Do not claim a test passed if it was not run.

Do not claim a feature works if it was not verified.

---

# 31. BLOCKER Rule

If the agent encounters a blocker that prevents correct implementation:

```text
STOP
```

Do not bypass the blocker by silently:

- Changing requirements
- Changing data model
- Changing API contracts
- Hardcoding a result
- Removing validation
- Disabling authorization
- Replacing the business rule
- Implementing an unrelated workaround

Report:

```text
BLOCKER:
What is blocked

CAUSE:
Why it is blocked

IMPACT:
What cannot continue

OPTIONS:
Possible resolutions

RECOMMENDATION:
Preferred resolution
```

Then wait for the user when a decision is required.

---

# 32. Architecture Change Rule

An architecture change includes:

- New shared service
- New shared database entity
- Major route restructure
- New global state mechanism
- New authentication mechanism
- New permission model
- Major API contract change
- Major module-boundary change

If a task requires one of these changes unexpectedly:

STOP before implementing it.

Ask for approval unless the current approved documents already explicitly authorize that change.

---

# 33. Refactoring Rule

Refactoring is allowed only when it directly supports the current phase.

Do not refactor another module merely because:

- Its code style differs.
- You prefer another architecture.
- You noticed a cleanup opportunity.
- A different naming scheme looks better.

During a hackathon, stability takes priority over broad cleanup.

---

# 34. Dependency Rule

Avoid unnecessary feature dependencies.

When designing a module:

1. Identify minimum required inputs.
2. Depend on stable contracts.
3. Avoid importing internal code from unrelated modules.
4. Keep business logic isolated.
5. Make the module testable independently.

The architecture should enable:

```text
Developer A
      ||
      || independent work
      ||
Developer B
```

with integration occurring through defined contracts.

---

# 35. Demo Integrity Rule

Anything shown during the final demo must represent actual working behavior.

Do not build "demo-only" shortcuts for core functionality.

It is acceptable to have:

- Seed data
- Controlled demo scenarios
- Predictable deterministic rules
- Simplified MVP algorithms

It is NOT acceptable to fake the result.

---

# 36. User Approval Rule

User approval is the ONLY phase-transition mechanism.

The agent must not interpret:

- Task completion
- Successful tests
- A clean Git state
- End of a document
- Availability of time
- An obvious next task

as permission to start the next phase.

Only explicit user authorization starts the next phase.

---

# 37. Valid Phase Authorization

Examples:

```text
Proceed to Phase 2
Continue to Phase 2
Start Phase 2
Proceed
Continue
```

If the current conversation makes the intended phase transition explicit, proceed.

If unclear:

```text
Ask:
"Phase <N> is complete. Shall I proceed to Phase <N+1>?"
```

---

# 38. Invalid Automatic Transition

Never do:

```text
Phase 1 complete
       ↓
Phase 2 automatically starts
       ↓
Phase 3 automatically starts
```

Correct:

```text
Phase 1 complete
       ↓
Report
       ↓
STOP
       ↓
User approval
       ↓
Phase 2
```

---

# 39. Current-Phase Isolation

While executing Phase N:

The agent MUST NOT:

- Implement Phase N+1.
- Implement unrelated module work.
- Prepare hidden changes for future phases.
- Modify files merely because future work will need them.
- Add "future-proofing" complexity without current need.

Complete the current phase first.

---

# 40. Base Implementation Special Rule

`00_BASE_IMPLEMENTATION.md` is Phase 0.

During Phase 0:

DO implement:

- Responsive application shell
- Responsive navbar
- Authentication
- Login
- Signup
- Logout
- Session handling
- RBAC
- Protected routes
- Shared UI
- Validation
- Error handling
- Loading states
- Notifications
- Basic dashboard/profile
- Seed users
- Base tests

DO NOT implement:

- Customer business module
- Product business module
- Quotation business logic
- Discount engine
- Approval engine
- Upsell
- Fulfillment
- Billing
- Negotiation
- Deal health
- Business dashboard metrics

At the end of Phase 0:

STOP and wait for explicit approval.

---

# 41. Developer A Special Rule

When executing a Developer A phase:

Developer A may work only on its assigned modules:

```text
Customer
Product & Pricing
Quotation
Discount Governance
Approval
Audit Trail
```

Do not start Developer B modules.

Do not modify Developer B internals.

At the end of the phase:

```text
TEST
→ REPORT
→ STOP
```

---

# 42. Developer B Special Rule

When executing a Developer B phase:

Developer B may work only on its assigned modules:

```text
Upsell
Warehouse Fulfillment
Subscription/Billing
Customer Negotiation
Deal Health
Dashboard
```

Do not start Developer A modules.

Do not modify Developer A internals.

At the end of the phase:

```text
TEST
→ REPORT
→ STOP
```

---

# 43. Integration Phase Rule

When an integration phase is explicitly authorized:

Integration may temporarily modify shared/module boundaries when required.

However:

- Keep changes minimal.
- Prefer contracts over direct coupling.
- Preserve module ownership.
- Test both sides.
- Report all cross-module changes.

Integration does NOT transfer module ownership.

---

# 44. Documentation Update Rule

If implementation changes an established:

- Requirement
- Data model
- Business rule
- API contract
- Permission
- Module boundary

the corresponding MD file must be updated.

Do not allow implementation and documentation to silently diverge.

---

# 45. No Silent Naming Changes

Maintain consistent naming across:

```text
Database
API
Business Logic
UI
Documentation
Tests
```

Do not casually rename:

- Entities
- Fields
- Roles
- Permissions
- Statuses
- API endpoints

If renaming is necessary, update all affected references and documentation.

---

# 46. Test Data Rule

Seed/demo data must be deterministic and realistic enough to demonstrate the business flow.

Examples:

- Customers with different tiers
- Products with different allowed discounts
- Products with costs/prices
- Warehouses with different stock
- Subscription plans
- Users with appropriate roles

Do not use random seed data that makes the demo behavior unreliable.

---

# 47. Environment Rule

Never commit:

- Production secrets
- Passwords
- API keys
- Tokens
- Private credentials

Use environment configuration and documented development values where appropriate.

Before a Git commit, inspect new configuration files for accidental secrets.

---

# 48. External Dependency Rule

Avoid adding external services unless they materially improve the requirement.

The project should remain runnable in the intended hackathon environment.

Before adding a new external dependency, consider:

- Internet availability
- Setup time
- Failure risk
- Dependency complexity
- Whether a local/simple implementation is sufficient

Prefer reliable local solutions for the MVP.

---

# 49. Time-Management Rule

This is a time-limited hackathon.

When a task becomes unexpectedly large:

Do NOT keep expanding it indefinitely.

Instead:

1. Preserve the required behavior.
2. Reduce unnecessary complexity.
3. Implement the smallest valid MVP.
4. Test it.
5. Continue the authorized phase.

Optional polish must never block core business functionality.

---

# 50. Priority Order

When trade-offs are necessary, prioritize:

```text
1. Core end-to-end business flow
2. Business rule correctness
3. Data integrity
4. Security / RBAC
5. Module independence
6. API/data contracts
7. Validation
8. Testing
9. Responsive UX
10. Cosmetic polish
11. Optional enhancements
```

---

# 51. Final Stop Condition

After completing the final authorized phase:

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

Do not continue into future work unless explicitly requested.

---

# 52. Final Agent Behavior

Antigravity should behave as a controlled engineering agent, not as an autonomous product manager.

The agent must:

- Follow the documents.
- Respect module ownership.
- Preserve contracts.
- Implement real business logic.
- Test before reporting completion.
- Protect shared infrastructure.
- Minimize merge conflicts.
- Avoid unnecessary scope.
- Report truthfully.
- Stop at phase boundaries.
- Wait for explicit user authorization.

The correct behavior is:

```text
READ WHAT IS REQUIRED
        ↓
IMPLEMENT ONLY WHAT IS AUTHORIZED
        ↓
VERIFY IT
        ↓
REPORT IT
        ↓
STOP
        ↓
WAIT FOR USER
```
