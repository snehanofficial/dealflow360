# DealFlow360 — API Contract

## 1. Purpose

This document defines the API contract used by DealFlow360 modules.

The objective is to provide stable boundaries between:

- Frontend and backend
- Developer A modules
- Developer B modules
- Internal users and business operations
- Customer portal and quotation services

The API contract defines:

- Endpoints
- Methods
- Authentication requirements
- Permissions
- Request structure
- Response structure
- Validation behavior
- Error format
- State-changing operations
- Cross-module integration rules

This document is an interface contract.

It must not contain implementation-specific database details.

---

# 2. API Design Principles

All APIs must follow these principles:

1. Use real application data.
2. Validate input on the server.
3. Enforce authentication where required.
4. Enforce authorization where required.
5. Return consistent response structures.
6. Return consistent error structures.
7. Do not expose database internals.
8. Do not duplicate business logic across endpoints.
9. Use the centralized business rules.
10. Keep cross-module interfaces stable.

The API must represent actual business operations rather than UI-only actions.

---

# 3. API Base Structure

Use a consistent API prefix.

Recommended:

```text
/api/v1
```

Example:

```text
/api/v1/customers
/api/v1/products
/api/v1/quotations
/api/v1/approvals
```

The exact server prefix may follow the implementation, but it must be consistent throughout the application.

---

# 4. Authentication Model

Protected endpoints require an authenticated user.

Conceptual flow:

```text
Client Request
      ↓
Authentication
      ↓
Identify User
      ↓
Load Role / Permissions
      ↓
Authorization
      ↓
Validation
      ↓
Business Logic
      ↓
Response
```

Authentication is established by:

`00_BASE_IMPLEMENTATION.md`

Do not create a second authentication mechanism inside individual modules.

---

# 5. Authorization Model

Authorization must use the centralized RBAC system.

A protected API operation must verify:

```text
Authenticated?
     ↓
Permission?
     ↓
Resource ownership?
     ↓
Business-rule validity?
```

Examples:

```text
customer.create
product.update
quotation.submit
approval.action
fulfillment.manage
billing.manage
portal.negotiate
portal.confirm
```

Hiding a UI element does not provide API authorization.

---

# 6. Standard Success Response

Successful API responses should use a consistent structure.

Recommended:

```json
{
  "success": true,
  "data": {},
  "message": null,
  "meta": null
}
```

For collections:

```json
{
  "success": true,
  "data": [],
  "message": null,
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

The exact implementation may adapt field names, but the semantic structure should remain consistent.

---

# 7. Standard Error Response

Use a consistent error structure.

Recommended:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": {}
  }
}
```

Possible error codes:

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
FORBIDDEN
NOT_FOUND
CONFLICT
INVALID_STATE
BUSINESS_RULE_VIOLATION
DUPLICATE_RESOURCE
INSUFFICIENT_STOCK
APPROVAL_REQUIRED
INTERNAL_ERROR
```

Do not expose:

- Stack traces
- Database queries
- Secrets
- Passwords
- Tokens
- Internal infrastructure details

---

# 8. HTTP Status Conventions

Use consistent status codes.

```text
200 OK
201 CREATED
204 NO CONTENT
400 BAD REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT FOUND
409 CONFLICT
422 UNPROCESSABLE ENTITY
500 INTERNAL SERVER ERROR
```

The API should use the most appropriate status consistently.

---

# 9. Authentication APIs

## 9.1 Signup

```text
POST /api/v1/auth/signup
```

Permission:

```text
Public
```

Request:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password",
  "confirmPassword": "password"
}
```

Rules:

- Validate required fields.
- Validate email.
- Validate password.
- Validate confirmation.
- Reject duplicate email.
- Do not allow uncontrolled privileged-role self-assignment.

Response:

```json
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

---

# 10. Login

```text
POST /api/v1/auth/login
```

Permission:

```text
Public
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response should provide authenticated user/session information according to the authentication architecture.

Conceptually:

```json
{
  "success": true,
  "data": {
    "user": {},
    "session": {}
  }
}
```

Invalid credentials must return an appropriate authentication error.

---

# 11. Current User

```text
GET /api/v1/auth/me
```

Permission:

```text
Authenticated
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {},
    "role": "SALES_REP",
    "permissions": []
  }
}
```

---

# 12. Logout

```text
POST /api/v1/auth/logout
```

Permission:

```text
Authenticated
```

The endpoint must invalidate/end the relevant authenticated session according to the chosen authentication model.

---

# 13. User Profile APIs

## Get profile

```text
GET /api/v1/profile
```

Permission:

```text
profile.view
```

## Update profile

```text
PATCH /api/v1/profile
```

Permission:

```text
profile.update
```

Users may update only fields they are authorized to change.

---

# 14. Customer APIs

## Create customer

```text
POST /api/v1/customers
```

Permission:

```text
customer.create
```

Request:

```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "1234567890",
  "tier": "GOLD"
}
```

---

## List customers

```text
GET /api/v1/customers
```

Permission:

```text
customer.view
```

Supported query concepts:

```text
page
pageSize
search
tier
status
```

---

## Get customer

```text
GET /api/v1/customers/:customerId
```

Permission:

```text
customer.view
```

---

## Update customer

```text
PATCH /api/v1/customers/:customerId
```

Permission:

```text
customer.update
```

---

## Update customer status

```text
PATCH /api/v1/customers/:customerId/status
```

Permission:

```text
customer.status_update
```

---

# 15. Product APIs

## Create product

```text
POST /api/v1/products
```

Permission:

```text
product.create
```

Request concept:

```json
{
  "name": "Laptop Pro",
  "category": "HARDWARE",
  "costPrice": 70000,
  "sellingPrice": 85000,
  "allowedDiscount": 10,
  "productType": "ONE_TIME",
  "active": true
}
```

---

## List products

```text
GET /api/v1/products
```

Permission:

```text
product.view
```

Supported query concepts:

```text
page
pageSize
search
category
productType
active
```

---

## Get product

```text
GET /api/v1/products/:productId
```

Permission:

```text
product.view
```

---

## Update product

```text
PATCH /api/v1/products/:productId
```

Permission:

```text
product.update
```

---

## Update product status

```text
PATCH /api/v1/products/:productId/status
```

Permission:

```text
product.status_update
```

---

# 16. Quotation APIs

Quotation is the central business object.

---

## Create quotation

```text
POST /api/v1/quotations
```

Permission:

```text
quotation.create
```

Request:

```json
{
  "customerId": "customer-id",
  "salesRepId": "user-id",
  "currency": "INR",
  "lines": []
}
```

The request must be validated before persistence.

---

# 17. List Quotations

```text
GET /api/v1/quotations
```

Permission:

```text
quotation.view
```

Supported query concepts:

```text
page
pageSize
search
customerId
salesRepId
status
dateFrom
dateTo
```

---

# 18. Get Quotation

```text
GET /api/v1/quotations/:quotationId
```

Permission:

```text
quotation.view
```

Response should contain the quotation and its relevant lines/status information.

Do not return unrelated internal data unless the caller has permission.

---

# 19. Update Quotation

```text
PATCH /api/v1/quotations/:quotationId
```

Permission:

```text
quotation.update
```

Editable fields depend on quotation state.

The API must validate the current quotation state before allowing modifications.

---

# 20. Add Quotation Line

```text
POST /api/v1/quotations/:quotationId/lines
```

Permission:

```text
quotation.update
```

Request:

```json
{
  "productId": "product-id",
  "quantity": 2,
  "unitPrice": 85000,
  "discountPercent": 5
}
```

The server must:

1. Validate product.
2. Validate quantity.
3. Validate price.
4. Validate discount.
5. Apply business rules.
6. Persist the line.
7. Recalculate quotation values.

---

# 21. Update Quotation Line

```text
PATCH /api/v1/quotations/:quotationId/lines/:lineId
```

Permission:

```text
quotation.update
```

Changing a line may require recalculation of:

- Line total
- Quotation total
- Cost
- Margin
- Discount risk
- Approval requirement

---

# 22. Remove Quotation Line

```text
DELETE /api/v1/quotations/:quotationId/lines/:lineId
```

Permission:

```text
quotation.update
```

The server must prevent deletion when the current quotation state does not allow modification.

---

# 23. Recalculate Quotation

```text
POST /api/v1/quotations/:quotationId/recalculate
```

Permission:

```text
quotation.view
```

The calculation must be based on actual stored data and centralized business rules.

Response may include:

```json
{
  "subtotal": 0,
  "discountTotal": 0,
  "total": 0,
  "cost": 0,
  "margin": 0,
  "marginPercent": 0
}
```

The exact response must follow the final API implementation.

---

# 24. Submit Quotation

```text
POST /api/v1/quotations/:quotationId/submit
```

Permission:

```text
quotation.submit
```

Processing order:

```text
Validate Quotation
       ↓
Validate Current State
       ↓
Calculate Totals
       ↓
Evaluate Discount
       ↓
Evaluate Risk
       ↓
Determine Approval
       ↓
Transition Quotation State
```

If approval is required:

```text
PENDING_APPROVAL
```

Otherwise:

```text
Continue to the appropriate next state
```

The API must not simply set a status without running the business rules.

---

# 25. Quotation State API

## Get status

```text
GET /api/v1/quotations/:quotationId/status
```

Permission:

```text
quotation.view
```

Response concept:

```json
{
  "status": "PENDING_APPROVAL",
  "approvalRequired": true
}
```

---

# 26. Discount Evaluation APIs

## Evaluate quotation discount

```text
POST /api/v1/quotations/:quotationId/discount-evaluation
```

Permission:

```text
discount.evaluate
```

The result should contain:

```text
line evaluations
allowed discounts
requested discounts
discount differences
risk level
approval requirement
approval level
reasons
```

Conceptual response:

```json
{
  "success": true,
  "data": {
    "riskLevel": "HIGH",
    "approvalRequired": true,
    "requiredApprovalLevel": "SALES_MANAGER",
    "lines": []
  }
}
```

---

# 27. Discount Evaluation Rules

The endpoint must evaluate every quotation line independently.

Example:

```text
Quotation
 ├── Line 1 → Evaluate
 ├── Line 2 → Evaluate
 └── Line 3 → Evaluate
```

Do not evaluate only the total quotation discount.

The business logic is defined in:

`05_BUSINESS_RULES.md`

---

# 28. Approval APIs

## List pending approvals

```text
GET /api/v1/approvals
```

Permission:

```text
approval.view
```

Supported filters may include:

```text
status
approver
quotationId
riskLevel
dateFrom
dateTo
```

---

# 29. Get Approval

```text
GET /api/v1/approvals/:approvalId
```

Permission:

```text
approval.view
```

Response should include:

- Approval request
- Related quotation
- Current step
- Risk information
- Approval history where permitted

---

# 30. Approve

```text
POST /api/v1/approvals/:approvalId/approve
```

Permission:

```text
approval.action
```

Processing:

```text
Authenticate
↓
Authorize
↓
Validate Approval Ownership/Eligibility
↓
Validate Current State
↓
Apply Approval
↓
Determine Next Step
↓
Update Quotation
↓
Create Audit Event
```

---

# 31. Reject

```text
POST /api/v1/approvals/:approvalId/reject
```

Permission:

```text
approval.action
```

Request may include:

```json
{
  "reason": "Discount exceeds acceptable commercial limit."
}
```

The rejection must be persisted and reflected in quotation/approval state.

---

# 32. Return for Revision

```text
POST /api/v1/approvals/:approvalId/return
```

Permission:

```text
approval.action
```

Request:

```json
{
  "reason": "Please revise the discount."
}
```

The quotation must return to an appropriate editable/revision state.

---

# 33. Approval Re-evaluation

```text
POST /api/v1/quotations/:quotationId/approval-re-evaluation
```

Permission:

```text
quotation.update
```

This endpoint/service is especially important for customer negotiation.

Processing:

```text
Current Quotation
       ↓
Discount Evaluation
       ↓
Risk Evaluation
       ↓
Approval Rule Evaluation
       ↓
Required Approval
```

If approval is newly required, the quotation must enter the correct approval state.

---

# 34. Approval State

A quotation must not become:

```text
APPROVED
```

until every required approval step has completed successfully.

---

# 35. Upsell Integration Contract

Developer B owns the upsell module.

Developer A's quotation APIs must support controlled product-line changes.

Developer B should use:

```text
POST /api/v1/quotations/:quotationId/lines
```

or the approved quotation service rather than directly modifying quotation storage.

After adding an upsell item:

```text
Quotation Line Added
      ↓
Recalculate
      ↓
Total Updated
      ↓
Margin Updated
```

---

# 36. Fulfillment Integration Contract

Developer B will consume quotation/order information.

Developer A must provide stable quotation data including:

- Quotation ID
- Customer
- Product lines
- Quantities
- Approved state
- Relevant fulfillment information

Do not expose database internals.

---

# 37. Billing Integration Contract

Developer B's billing module requires:

- Quotation/order
- Product
- Product type
- Quantity
- Pricing
- Relevant dates

The quotation API must expose these values through stable interfaces.

---

# 38. Customer Negotiation Integration Contract

Developer B's portal module may submit negotiated changes.

The preferred flow is:

```text
Customer Request
       ↓
Quotation Update / Negotiation Interface
       ↓
Recalculate
       ↓
Discount Evaluation
       ↓
Approval Re-evaluation
       ↓
State Update
```

The negotiation module must not directly set:

```text
APPROVED
```

or:

```text
CONFIRMED
```

without passing through the required business rules.

---

# 39. Customer Portal APIs

The following APIs belong conceptually to the portal module.

## Get customer's quotation

```text
GET /api/v1/portal/quotations/:quotationId
```

Permission:

```text
portal.view
```

Additional requirement:

```text
Authenticated Customer
+
Quotation Ownership
```

---

## Submit Comment

```text
POST /api/v1/portal/quotations/:quotationId/comments
```

Permission:

```text
portal.negotiate
```

---

## Submit Change Request

```text
POST /api/v1/portal/quotations/:quotationId/change-request
```

Permission:

```text
portal.negotiate
```

---

## Submit Counter Discount

```text
POST /api/v1/portal/quotations/:quotationId/counter-discount
```

Permission:

```text
portal.negotiate
```

Request:

```json
{
  "discountPercent": 15,
  "reason": "Requested commercial adjustment."
}
```

The counter discount must be validated and re-evaluated.

---

## Customer Confirmation

```text
POST /api/v1/portal/quotations/:quotationId/confirm
```

Permission:

```text
portal.confirm
```

Before confirmation:

```text
Verify Ownership
↓
Validate State
↓
Apply Negotiated Terms
↓
Re-evaluate Approval
↓
Check Approval Completion
↓
Confirm
```

---

# 40. Fulfillment API Contract

Developer B owns the fulfillment implementation.

Conceptual APIs:

## Stock availability

```text
GET /api/v1/fulfillment/:quotationId/availability
```

Permission:

```text
fulfillment.view
```

---

## Calculate allocation

```text
POST /api/v1/fulfillment/:quotationId/allocation
```

Permission:

```text
fulfillment.view
```

---

## Accept allocation

```text
POST /api/v1/fulfillment/:quotationId/allocation/confirm
```

Permission:

```text
fulfillment.manage
```

---

## Manual override

```text
PATCH /api/v1/fulfillment/:quotationId/allocation
```

Permission:

```text
fulfillment.manage
```

The endpoint must validate:

- Warehouse
- Product
- Quantity
- Stock
- Allocation consistency

---

# 41. Billing API Contract

Developer B owns billing.

Conceptual APIs:

## Billing summary

```text
GET /api/v1/billing/:quotationId
```

Permission:

```text
billing.view
```

---

## Billing schedule

```text
GET /api/v1/billing/:quotationId/schedule
```

Permission:

```text
billing.view
```

---

## Calculate proration

```text
POST /api/v1/billing/:quotationId/proration
```

Permission:

```text
billing.manage
```

---

## Modify subscription

```text
PATCH /api/v1/billing/subscriptions/:subscriptionId
```

Permission:

```text
billing.manage
```

---

## Cancel subscription

```text
POST /api/v1/billing/subscriptions/:subscriptionId/cancel
```

Permission:

```text
billing.manage
```

The exact endpoint structure may be refined when the billing data model is finalized.

---

# 42. Deal Health API Contract

Developer B owns deal health.

Conceptual APIs:

## Get alerts

```text
GET /api/v1/deal-health/alerts
```

Permission:

```text
deal_health.view
```

---

## Get alert

```text
GET /api/v1/deal-health/alerts/:alertId
```

Permission:

```text
deal_health.view
```

---

## Acknowledge alert

```text
POST /api/v1/deal-health/alerts/:alertId/acknowledge
```

Permission:

```text
deal_health.manage
```

---

## Resolve alert

```text
POST /api/v1/deal-health/alerts/:alertId/resolve
```

Permission:

```text
deal_health.manage
```

---

# 43. Dashboard API Contract

Developer B owns dashboard reporting.

Conceptual endpoint:

```text
GET /api/v1/dashboard
```

Permission:

```text
dashboard.view
```

Supported filter concepts:

```text
period
salesRepId
teamId
approvalStatus
productId
categoryId
```

The result must come from actual application data.

---

# 44. Pagination

Collection endpoints should support consistent pagination.

Recommended:

```text
?page=1&pageSize=20
```

Response metadata:

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 100,
  "totalPages": 5
}
```

Avoid inconsistent pagination models across modules.

---

# 45. Filtering

Filters must be explicit query parameters.

Example:

```text
GET /api/v1/quotations?status=PENDING_APPROVAL
```

Do not encode complex filter logic in undocumented query strings.

---

# 46. Sorting

Where sorting is required:

```text
?sortBy=createdAt&sortOrder=desc
```

Only support documented sortable fields.

Do not allow arbitrary database field names to be exposed directly.

---

# 47. Searching

Search inputs must be validated.

Example:

```text
?search=Acme
```

Do not construct unsafe raw database queries from user input.

---

# 48. API Validation

Every mutating endpoint must validate:

- Required fields
- Field types
- Allowed values
- Relationships
- Current state
- Permissions
- Business rules

Example:

```text
PATCH quotation line
       ↓
Validate payload
       ↓
Validate quotation state
       ↓
Validate product
       ↓
Validate quantity
       ↓
Validate discount
       ↓
Apply business rules
```

---

# 49. Idempotency / Duplicate Action Protection

State-changing APIs must prevent accidental duplicate effects where appropriate.

Examples:

- Double approval
- Duplicate confirmation
- Duplicate billing entry
- Duplicate fulfillment confirmation

Repeated requests should either:

- Return the existing successful result, or
- Return a clear conflict/invalid-state response.

---

# 50. Concurrency Protection

Important state-changing endpoints should verify current state before applying updates.

Especially:

- Approval
- Customer confirmation
- Negotiation
- Fulfillment allocation
- Subscription modification

A stale request must not silently overwrite a newer state.

---

# 51. Transaction Integrity

Where an operation changes multiple related entities, the API/service should preserve transaction consistency.

Example:

Approval:

```text
Approval Step
+
Approval Request
+
Quotation State
+
Audit Event
```

These must not leave contradictory states.

---

# 52. Business Rule Execution Order

For important state-changing requests, use:

```text
Authentication
    ↓
Authorization
    ↓
Input Validation
    ↓
Resource Validation
    ↓
Current State Validation
    ↓
Business Rule Evaluation
    ↓
Database Transaction
    ↓
Audit
    ↓
Response
```

Do not reverse this order unnecessarily.

---

# 53. Error Handling by Module

## Authentication

Possible:

```text
INVALID_CREDENTIALS
AUTHENTICATION_REQUIRED
```

## Customer

Possible:

```text
DUPLICATE_RESOURCE
VALIDATION_ERROR
NOT_FOUND
FORBIDDEN
```

## Product

Possible:

```text
VALIDATION_ERROR
NOT_FOUND
CONFLICT
```

## Quotation

Possible:

```text
INVALID_STATE
VALIDATION_ERROR
BUSINESS_RULE_VIOLATION
NOT_FOUND
```

## Approval

Possible:

```text
FORBIDDEN
INVALID_STATE
APPROVAL_REQUIRED
CONFLICT
```

## Fulfillment

Possible:

```text
INSUFFICIENT_STOCK
INVALID_ALLOCATION
INVALID_STATE
```

## Billing

Possible:

```text
INVALID_SUBSCRIPTION
INVALID_STATE
PRORATION_ERROR
```

## Portal

Possible:

```text
FORBIDDEN
RESOURCE_NOT_FOUND
OWNERSHIP_VIOLATION
INVALID_STATE
```

---

# 54. API Security Rules

Never return:

- Password hashes
- Authentication secrets
- Internal tokens
- Sensitive internal configuration
- Unnecessary private customer data

Return only data required by the caller.

---

# 55. Resource Ownership

Ownership must be checked server-side.

For example:

```text
GET /portal/quotations/123
```

must NOT simply retrieve quotation `123`.

It must verify:

```text
Current Customer
        ↓
Quotation Owner
        ↓
Match?
```

Only then is the quotation returned.

---

# 56. Role-Based Endpoint Access

Examples:

```text
POST /customers
→ customer.create

PATCH /products/:id
→ product.update

POST /quotations/:id/submit
→ quotation.submit

POST /approvals/:id/approve
→ approval.action

POST /portal/quotations/:id/confirm
→ portal.confirm
```

Permissions must be checked server-side.

---

# 57. State-Based API Access

Permission alone is not sufficient.

Example:

A user may have:

```text
quotation.update
```

but cannot update a quotation that is already:

```text
COMPLETED
```

Therefore:

```text
Permission
+
Current State
+
Business Rule
```

must all permit the operation.

---

# 58. API Versioning

The first production-like API contract uses:

```text
/api/v1
```

Breaking changes should result in:

```text
/api/v2
```

rather than silently changing the behavior of existing consumers.

During the hackathon, avoid unnecessary version proliferation.

---

# 59. Cross-Developer Contract Rule

Developer A and Developer B must communicate through documented interfaces.

Developer A provides:

```text
Customer
Product
Quotation
Discount Evaluation
Approval
Audit
```

Developer B provides:

```text
Upsell
Fulfillment
Billing
Negotiation
Deal Health
Dashboard
```

Neither developer should depend on the other's internal implementation.

---

# 60. Shared Contract Change Process

If a module requires a new shared API:

1. Search for an existing endpoint.
2. Confirm the requirement.
3. Define request structure.
4. Define response structure.
5. Define permission.
6. Define errors.
7. Update this document.
8. Implement the endpoint.
9. Add tests.
10. Report the contract change.

Do not create undocumented cross-module interfaces.

---

# 61. No UI-Only APIs

Avoid APIs whose sole purpose is:

```text
Return exactly what one screen currently needs
```

when an existing business resource can provide the information.

Prefer resource/business-operation APIs that can be reused.

---

# 62. No Direct Database APIs

Do not expose database tables directly as public APIs.

The API represents:

```text
Business Resources
+
Business Operations
```

not raw storage.

---

# 63. No Business Logic Duplication

Do not duplicate the same calculation in:

- Frontend
- API controller
- Service
- Another module

For example, discount evaluation must have one authoritative business implementation.

The frontend may display results or perform temporary UX calculations, but the server/business layer remains authoritative.

---

# 64. API Testing Requirements

Every core API must have tests for:

### Success

- Valid request
- Correct response
- Correct state change

### Validation

- Missing fields
- Invalid values
- Invalid relationships

### Authorization

- Unauthenticated request
- Unauthorized role
- Missing permission

### State

- Invalid state transition
- Duplicate operation

### Business rule

- Discount violation
- Approval requirement
- Stock shortage
- Negotiation re-entry
- Billing/proration rules

---

# 65. Critical API Integration Tests

## Quotation

```text
Create
→ Add line
→ Recalculate
→ Submit
```

## Discount

```text
Submit quotation
→ Evaluate discount
→ Approval required
```

## Approval

```text
Pending approval
→ Approve
→ Next step / Approved
```

## Negotiation

```text
Customer change
→ Re-evaluate
→ Approval re-entry if required
```

## Fulfillment

```text
Approved order
→ Stock availability
→ Allocation
→ Confirm
```

## Billing

```text
Order
→ Line classification
→ Billing schedule
→ Proration
```

---

# 66. API Response Consistency

The same concepts should use consistent field names across endpoints.

Examples:

```text
customerId
productId
quotationId
approvalId
createdAt
updatedAt
status
```

Do not switch between:

```text
customer_id
customerId
customerID
```

without an explicit API convention.

---

# 67. Date/Time Format

Use one consistent API date/time format.

Recommended:

```text
ISO 8601
```

Example:

```text
2026-09-05T10:30:00Z
```

The exact timezone strategy must remain consistent across the application.

---

# 68. Monetary API Values

All monetary values must use a consistent representation.

Recommended semantic fields:

```text
unitPrice
discountAmount
subtotal
total
cost
margin
marginPercent
```

The final implementation must use consistent precision/rounding rules.

---

# 69. API Documentation Rule

Whenever an API changes:

Update this document or the generated API documentation.

The implementation must not silently diverge from the documented contract.

---

# 70. Demo-Critical API Flow

The following sequence must work through real APIs:

```text
POST login
      ↓
POST quotation
      ↓
POST quotation line
      ↓
POST discount evaluation
      ↓
POST quotation submit
      ↓
GET approval
      ↓
POST approval approve
      ↓
Upsell integration
      ↓
Fulfillment integration
      ↓
Billing integration
      ↓
Customer portal
      ↓
Negotiation
      ↓
Approval re-evaluation
      ↓
Confirmation
```

This sequence must not rely on frontend-only state changes.

---

# 71. API Definition of Done

An API is considered complete only when:

- Endpoint is documented.
- Permission is defined.
- Request is validated.
- Response is consistent.
- Errors are consistent.
- Business rules are applied.
- State transitions are correct.
- Authentication is enforced where required.
- Authorization is enforced.
- Tests exist.
- No sensitive information is exposed.
- Cross-module consumers can use the contract reliably.

---

# 72. Final API Contract Principle

The API must act as the stable boundary between DealFlow360 modules.

The intended structure is:

```text
                API CONTRACT
                     │
        ┌────────────┴────────────┐
        │                         │
 Developer A                  Developer B
        │                         │
 Customer                   Upsell
 Product                    Fulfillment
 Quotation                  Billing
 Discount                   Negotiation
 Approval                   Deal Health
 Audit                      Dashboard
        │                         │
        └────────────┬────────────┘
                     │
               Shared Business
                  Workflow
```

A module should know WHAT operation another module provides, not HOW the other module implements it.

The API contract exists to minimize coupling, reduce merge conflicts, preserve business-rule consistency, and allow both developers to work in parallel.
