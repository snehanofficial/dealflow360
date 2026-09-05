# Developer 0 — Base Implementation Phased Plan

## 1. Phase Identity

Developer / Foundation Owner: Base Implementation

Phase ID:

`PHASE 0 — BASE IMPLEMENTATION`

Purpose:

Establish the shared application foundation before Developer A and Developer B begin business-module implementation.

This phase owns shared infrastructure only:

- Application shell
- Responsive navbar
- Authentication
- Signup
- Login
- Logout
- Session handling
- RBAC
- Protected routes
- Shared UI primitives
- Shared API/service foundation
- Validation foundation
- Error/loading/notification foundation
- Basic dashboard
- Basic profile
- Development seed users
- Base tests

This phase does NOT own DealFlow360 business modules.

---

# 2. Important Scope Boundary

The following business modules must NOT be implemented during this base phase:

- Customer Management
- Product & Pricing Management
- Quotation Management
- Discount Governance
- Approval Workflow
- Upsell / Cross-sell
- Warehouse Fulfillment
- Subscription / Billing
- Customer Negotiation
- Deal Health
- Operational Dashboard metrics

Those are implemented later by Developer A and Developer B.

The purpose of this phase is to make those later modules easier and safer to build independently.

---

# 3. Shared Foundation Ownership

The following are established here and then treated as shared infrastructure:

```text
Authentication
RBAC
Routing Foundation
Responsive Navbar
Application Shell
Shared API / Service Layer
Shared UI Components
Validation Foundation
Global Error Handling
Global Loading Handling
Notification System
Basic User Profile
```

Developer A and Developer B MUST reuse these systems.

They MUST NOT create duplicate implementations.

---

# 4. Phase Execution Model

This document contains exactly:

- 12 phases
- 10 tasks per phase

Every phase must be completed as a vertical milestone.

For each phase:

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
```

The agent MUST execute only the current phase.

The agent MUST NOT automatically continue to the next phase.

Explicit user approval is required before starting the next phase.

---

# 5. Phase 1 — Project Foundation & Application Startup

## Objective

Verify and establish the minimum project foundation required for the remaining base work.

## Tasks

### Task 1.1
Inspect the existing project and determine the current frontend, backend, database, package, environment, and Git setup.

### Task 1.2
Verify that the existing application can start successfully.

### Task 1.3
Verify the existing development/build commands and document the working commands.

### Task 1.4
Verify environment configuration and required environment variables.

### Task 1.5
Verify that secrets are excluded from version control.

### Task 1.6
Establish the base application entry point and shared configuration conventions where needed.

### Task 1.7
Establish the global application error boundary/error handling entry point.

### Task 1.8
Establish the shared loading-state mechanism.

### Task 1.9
Establish the initial route structure for public and authenticated application areas.

### Task 1.10
Run the application/build and create a stable initial Git checkpoint.

## Phase 1 Completion Criteria

- Application starts.
- Build works.
- Environment configuration is understood.
- Initial routing exists.
- No blocking foundation issue remains.

Then STOP and wait for approval.

---

# 6. Phase 2 — Application Shell & Responsive Layout

## Objective

Create the reusable application shell that all later modules will use.

## Tasks

### Task 2.1
Create the global application layout.

### Task 2.2
Create the main content container.

### Task 2.3
Create the shared navigation area.

### Task 2.4
Create the global feedback/notification area.

### Task 2.5
Create responsive layout behavior for desktop.

### Task 2.6
Create responsive layout behavior for tablet.

### Task 2.7
Create responsive layout behavior for mobile.

### Task 2.8
Verify there is no horizontal overflow in the shell.

### Task 2.9
Create reusable layout patterns for future feature pages.

### Task 2.10
Test the shell at the supported viewport sizes and create the phase checkpoint.

## Phase 2 Completion Criteria

The application has a stable responsive shell that later modules can plug into.

Then STOP and wait for approval.

---

# 7. Phase 3 — Responsive Navbar & Navigation Foundation

## Objective

Implement the shared responsive navbar and navigation framework.

## Tasks

### Task 3.1
Create the shared navbar component.

### Task 3.2
Add application identity/logo/name.

### Task 3.3
Add desktop navigation behavior.

### Task 3.4
Add tablet navigation behavior.

### Task 3.5
Add mobile menu behavior.

### Task 3.6
Add current-user display area.

### Task 3.7
Add role display area.

### Task 3.8
Add logout action placeholder/integration point for the authentication phase.

### Task 3.9
Make navigation extensible for future feature modules without hardcoding module internals.

### Task 3.10
Test responsive navigation and route transitions.

## Phase 3 Completion Criteria

A reusable responsive navbar exists and can later display role-aware module navigation.

Then STOP and wait for approval.

---

# 8. Phase 4 — Authentication Data & Service Foundation

## Objective

Establish the real authentication foundation used by login, signup, logout, protected routes, and RBAC.

## Tasks

### Task 4.1
Define the authentication user representation according to the approved project conventions.

### Task 4.2
Implement secure password handling.

### Task 4.3
Implement authentication persistence/storage according to the chosen authentication architecture.

### Task 4.4
Implement the authentication service/API foundation.

### Task 4.5
Implement current-user retrieval.

### Task 4.6
Implement centralized authentication state.

### Task 4.7
Implement authentication loading state.

### Task 4.8
Implement authentication error normalization.

### Task 4.9
Ensure authentication secrets and sensitive values are not exposed or logged.

### Task 4.10
Add authentication-service tests and verify the foundation independently.

## Phase 4 Completion Criteria

The application has a working authentication foundation ready for Login, Signup, Logout, and protected routes.

Then STOP and wait for approval.

---

# 9. Phase 5 — Signup

## Objective

Implement the complete user signup flow.

## Tasks

### Task 5.1
Create the responsive signup page.

### Task 5.2
Implement full-name input.

### Task 5.3
Implement email input and validation.

### Task 5.4
Implement password input and password validation.

### Task 5.5
Implement confirm-password validation.

### Task 5.6
Connect signup to the real authentication/data layer.

### Task 5.7
Handle duplicate-account errors.

### Task 5.8
Prevent uncontrolled privileged-role self-assignment.

### Task 5.9
Implement signup loading/success/error states and post-signup behavior.

### Task 5.10
Add signup tests and verify the complete responsive signup flow.

## Phase 5 Completion Criteria

A normal user can complete a real validated signup flow without gaining unauthorized privileged access.

Then STOP and wait for approval.

---

# 10. Phase 6 — Login & Logout

## Objective

Implement the complete login/logout experience.

## Tasks

### Task 6.1
Create the responsive login page.

### Task 6.2
Implement email/password input.

### Task 6.3
Implement login form validation.

### Task 6.4
Connect login to the real authentication service.

### Task 6.5
Implement invalid-credential handling.

### Task 6.6
Implement login loading state.

### Task 6.7
Implement successful authentication state restoration.

### Task 6.8
Implement logout and client authentication-state reset.

### Task 6.9
Prevent access to authenticated content after logout.

### Task 6.10
Add login/logout/session tests and verify browser reload behavior.

## Phase 6 Completion Criteria

Users can:

- Sign up
- Log in
- Stay authenticated after reload
- Log out
- Lose protected access after logout

Then STOP and wait for approval.

---

# 11. Phase 7 — RBAC & Permission Foundation

## Objective

Implement centralized Role-Based Access Control.

Initial roles:

```text
SALES_REP
SALES_MANAGER
FINANCE_OPERATIONS
CUSTOMER
ADMIN
```

## Tasks

### Task 7.1
Implement centralized role definitions.

### Task 7.2
Implement centralized permission definitions.

### Task 7.3
Map roles to permissions.

### Task 7.4
Implement reusable permission-check functions/services.

### Task 7.5
Implement route-level permission checking.

### Task 7.6
Implement action-level permission checking.

### Task 7.7
Implement API/server-side permission checking where applicable.

### Task 7.8
Integrate permissions with the navbar/navigation visibility.

### Task 7.9
Create the access-denied experience.

### Task 7.10
Test all initial roles and permission boundaries.

## Phase 7 Completion Criteria

RBAC is centralized, reusable, and enforced beyond simple UI visibility.

Then STOP and wait for approval.

---

# 12. Phase 8 — Protected Routes & User Context

## Objective

Complete route protection and global user context.

## Tasks

### Task 8.1
Implement reusable authenticated-route protection.

### Task 8.2
Redirect unauthenticated users to login.

### Task 8.3
Implement permission-protected routes.

### Task 8.4
Return a clear access-denied state for unauthorized users.

### Task 8.5
Implement centralized current-user context/state.

### Task 8.6
Expose authenticated user information to the application shell.

### Task 8.7
Expose current role and permissions to authorized application components.

### Task 8.8
Prevent protected content flash during authentication restoration.

### Task 8.9
Test direct URL access to protected and unauthorized routes.

### Task 8.10
Test navigation, refresh, logout, and route-protection behavior together.

## Phase 8 Completion Criteria

Authentication and authorization behave correctly even when users directly navigate to protected URLs.

Then STOP and wait for approval.

---

# 13. Phase 9 — Shared UI, Validation, Loading, Errors & Notifications

## Objective

Create reusable application-wide UX infrastructure for all later developers.

## Tasks

### Task 9.1
Create reusable Button, Input, Password Input, Select, Card, and Badge components.

### Task 9.2
Create reusable Modal, Dropdown, Table, and Confirmation components where required.

### Task 9.3
Create reusable loading indicators and page-level loading states.

### Task 9.4
Create reusable empty and error states.

### Task 9.5
Create the shared form-validation mechanism.

### Task 9.6
Create standardized validation error handling.

### Task 9.7
Create global API/network error handling.

### Task 9.8
Create the toast/notification system.

### Task 9.9
Integrate these systems into Login, Signup, and protected-route flows.

### Task 9.10
Verify that shared components are generic and contain no business-module logic.

## Phase 9 Completion Criteria

Developer A and Developer B can reuse the same UI, validation, loading, error, and notification infrastructure.

Then STOP and wait for approval.

---

# 14. Phase 10 — Basic Dashboard & Profile

## Objective

Create the basic authenticated landing experience without implementing business analytics.

## Tasks

### Task 10.1
Create the authenticated dashboard page.

### Task 10.2
Display the current user's name.

### Task 10.3
Display the current user's role.

### Task 10.4
Add generic module/navigation shortcuts.

### Task 10.5
Create the basic user-profile page.

### Task 10.6
Display profile identity information.

### Task 10.7
Display account status and role.

### Task 10.8
Add basic profile-edit support only if it does not delay the foundation.

### Task 10.9
Ensure dashboard/profile respect RBAC and protected routing.

### Task 10.10
Test dashboard and profile behavior for multiple roles.

## Phase 10 Completion Criteria

Every authenticated user has a stable landing/dashboard and profile experience.

Do not create fake business KPIs.

Then STOP and wait for approval.

---

# 15. Phase 11 — Seed Users, Security Hardening & Base Integration

## Objective

Prepare the complete base foundation for Developer A and Developer B.

## Tasks

### Task 11.1
Create development seed users for:

```text
ADMIN
SALES_MANAGER
SALES_REP
FINANCE_OPERATIONS
CUSTOMER
```

### Task 11.2
Verify role assignments for all seed users.

### Task 11.3
Verify privileged roles cannot be created through uncontrolled public signup.

### Task 11.4
Review secrets, logs, tokens, and sensitive values.

### Task 11.5
Verify protected API operations enforce authentication.

### Task 11.6
Verify protected operations enforce authorization.

### Task 11.7
Verify shared API/service behavior is consistent.

### Task 11.8
Verify shared UI components are available to both developers.

### Task 11.9
Verify no duplicate authentication, RBAC, navbar, or notification implementations exist.

### Task 11.10
Run a complete base integration test using each development role.

## Phase 11 Completion Criteria

The shared foundation is stable and ready for independent module development.

Then STOP and wait for approval.

---

# 16. Phase 12 — Final Base Validation & Handoff

## Objective

Perform final hardening and freeze the base foundation before business-module development starts.

## Tasks

### Task 12.1
Run the complete authentication test suite.

### Task 12.2
Run the complete RBAC and protected-route test suite.

### Task 12.3
Run the responsive navbar/layout verification.

### Task 12.4
Run validation, loading, error, and notification verification.

### Task 12.5
Run the dashboard/profile verification for all development roles.

### Task 12.6
Run application build/startup verification.

### Task 12.7
Review all changed files for accidental or unrelated modifications.

### Task 12.8
Verify that no Developer A or Developer B business-module logic was introduced.

### Task 12.9
Create the stable base Git checkpoint/tag and prepare the handoff report.

### Task 12.10
Document the final shared contracts/conventions that Developers A and B must reuse.

## Phase 12 Completion Criteria

The base implementation is considered complete only when:

- Application starts successfully.
- Responsive shell works.
- Navbar works.
- Signup works.
- Login works.
- Logout works.
- Session restoration works.
- RBAC works.
- Protected routes work.
- Access-denied behavior works.
- Shared UI foundation works.
- Validation works.
- Loading states work.
- Error handling works.
- Notifications work.
- Development users exist.
- Tests pass.
- Git baseline is clean.
- No business-specific module logic has been implemented prematurely.

Then STOP and wait for approval.

---

# 17. Base Architecture Rules

The following systems are shared and must be implemented only once:

```text
Authentication
RBAC
Routing Foundation
Application Shell
Navbar
API / Service Foundation
UI Primitives
Validation
Loading
Error Handling
Notifications
User Context
```

Later developers must reuse them.

Do not create parallel implementations.

---

# 18. Security Rules

Mandatory requirements:

- Passwords must never be stored in plaintext.
- Passwords must never be logged.
- Authentication secrets must not be exposed to the frontend.
- Privileged roles must not be self-assigned through uncontrolled signup.
- Protected APIs must verify authentication.
- Protected operations must verify authorization.
- Logout must clear/invalidate the client authentication state.
- Secrets must not be committed to Git.
- Internal database or stack-trace details must not be shown to users.

---

# 19. Responsive Requirements

The following must work on:

- Desktop
- Laptop
- Tablet
- Mobile

At minimum verify:

```text
Navbar
Login
Signup
Dashboard
Profile
Access Denied
```

No horizontal overflow should occur.

No critical controls should become inaccessible on mobile.

---

# 20. Shared API Rules

Establish consistent conventions for:

- Requests
- Responses
- Authentication errors
- Authorization errors
- Validation errors
- Generic server errors
- Loading states

Feature developers must use the shared service/API foundation.

Do not introduce a second HTTP/API client without a documented architectural reason.

---

# 21. Shared Validation Rules

Validation should distinguish between:

```text
Client-side validation
        +
Server-side validation
```

Client validation improves user experience.

Server validation remains authoritative.

Do not treat UI validation as a security mechanism.

---

# 22. Shared RBAC Rules

Do not rely only on:

```text
Hide button
```

for security.

The permission model must operate at:

```text
Route
Action
API / Server operation
```

Later modules must register new permissions through the centralized permission system.

---

# 23. Module Handoff Rules

After the base phase is approved:

Developer A and Developer B may start their own feature modules.

They must treat the following as stable shared infrastructure:

```text
Authentication
RBAC
Routing
Navbar
Application Shell
API Client / Service Layer
Shared UI
Validation
Loading
Error Handling
Notifications
User Context
```

Changes to these systems after handoff should be rare.

Any required change to shared infrastructure must be:

1. Identified.
2. Checked for cross-developer impact.
3. Implemented minimally.
4. Documented.
5. Reported.

---

# 24. Git Rules

Use small focused commits.

Recommended commit style:

```text
chore: initialize application foundation
feat(app): add application shell
feat(ui): add responsive navbar
feat(auth): add authentication foundation
feat(auth): add signup
feat(auth): add login
feat(auth): add logout and session restoration
feat(rbac): add roles and permissions
feat(rbac): add protected routes
feat(ui): add shared components
feat(app): add validation and error handling
feat(app): add notifications and loading states
feat(app): add dashboard and profile
feat(seed): add development users
test(app): add base authentication and rbac coverage
```

Do not combine unrelated business-module work into the base commits.

---

# 25. Required Phase Report

At the end of EVERY phase, produce:

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
10.

FILES CREATED:
- ...

FILES MODIFIED:
- ...

API / CONTRACT CHANGES:
- ...

DATA / AUTH CHANGES:
- ...

TESTS RUN:
- ...

TEST RESULT:
PASS / FAIL

APPLICATION VERIFICATION:
- ...

RESPONSIVE VERIFICATION:
- ...

SECURITY VERIFICATION:
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

# 26. Mandatory Stop Rule

After the ten tasks of the current phase are completed:

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

The agent MUST stop.

The agent MUST NOT:

- Start the next phase.
- Start Developer A modules.
- Start Developer B modules.
- Implement quotation logic.
- Implement discount logic.
- Implement approval logic.
- Implement fulfillment logic.
- Implement billing logic.
- Implement customer negotiation logic.
- Implement deal-health logic.
- Implement dashboard business metrics.

Explicit user approval is required before continuing.

---

# 27. User Approval

The next phase starts only after explicit approval.

Examples:

```text
Proceed to Phase 2
Continue to Phase 2
Start Phase 2
Proceed
```

If the user's response is ambiguous, do not automatically advance.

---

# 28. No Scope Expansion

Do not add optional functionality simply because there is time available.

The agent may only expand the phase if:

- A blocking issue requires it.
- The change is necessary for the phase to function.
- The user explicitly approves the scope expansion.

Otherwise remain within the ten tasks defined for the phase.

---

# 29. Final Foundation Principle

The purpose of the Base Implementation is not to build DealFlow360 business functionality.

The purpose is to create a stable platform on which two developers can work independently:

```text
                  BASE FOUNDATION
                        │
        ┌───────────────┴───────────────┐
        │                               │
   DEVELOPER A                     DEVELOPER B
        │                               │
 Customer Management             Upsell / Cross-sell
 Product & Pricing               Warehouse Fulfillment
 Quotation                        Subscription/Billing
 Discount Governance              Customer Negotiation
 Approval Workflow                Deal Health
 Audit Trail                      Dashboard
        │                               │
        └───────────────┬───────────────┘
                        │
                  FINAL INTEGRATION
```

The base must therefore prioritize:

1. Stability
2. Security
3. Reusability
4. Responsive behavior
5. Clear boundaries
6. Minimal shared-file conflicts
7. Clean handoff
8. Testability

Once Phase 12 is complete and explicitly approved, the team can begin the Developer A and Developer B feature phases.