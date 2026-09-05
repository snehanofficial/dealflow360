# 0001. Customer Management Vertical Slice (Developer A Phase 1)

**Date**: 2026-09-05
**Status**: Accepted

## Summary

This specification defines the complete vertical slice implementation for Customer Management, owned exclusively by Developer A as outlined in Developer A Phase 1 instructions (`docs/08_DEVELOPER_A.md`). It establishes customer persistence, account tiering (Gold, Silver, Bronze, Enterprise), status lifecycle, RBAC enforcement, and Zod validation.

## Context

DealFlow360 relies on customer accounts and customer tiers to drive discount governance matrix rules, commercial risk scoring, and customer quotation portal access. Without a dedicated, governed Customer Management vertical slice, quotation creation, tier-based discount checks, and portal authorization cannot function.

## Requirements

**User stories**:
- As a Sales Rep or Admin, I want to create, update, search, and view customer accounts so that deals can be associated with valid enterprise customers.
- As a Sales Manager or Admin, I want to configure customer tiers (e.g. Enterprise, Gold) and account status (Active, Inactive, Suspended) so that pricing and policy rules apply accurately.

**Acceptance criteria**:
- **AC-1**: Customer records support `name`, `code`, `email`, `phone`, `tier` (`ENTERPRISE`, `GOLD`, `SILVER`, `BRONZE`), and `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- **AC-2**: Search and filter endpoints allow searching customers by name, code, tier, and status with pagination.
- **AC-3**: Customer status transitions (e.g., `ACTIVE` -> `SUSPENDED`) are audited and enforced server-side.
- **AC-4**: RBAC permits only authorized roles (`SALES_REP`, `SALES_MANAGER`, `ADMIN`) to mutate customer records, while `FINANCE` and `CUSTOMER` have appropriate read/restricted access.
- **AC-5**: Customer unit, API integration, and validation tests confirm all CRUD and boundary conditions pass cleanly.

## Options considered

### Option 1: Modular Customer Vertical Slice (Chosen)
Implement Customer domain logic in `apps/api/src/modules/customer` with clean Prisma database persistence and dedicated React UI views in `apps/web/src/features/customers`.

**Pros**:
- Strictly respects Developer A ownership boundaries (`docs/08_DEVELOPER_A.md`).
- Provides stable API contracts for quotation and discount governance modules.

**Cons**:
- Requires creating initial Prisma migration and API endpoints.

## Decision

**Chosen option**: Option 1: Modular Customer Vertical Slice.

## Rationale

A clean vertical slice provides a solid, isolated foundation for Customer Management that complies with Developer A's Phase 1 mandate without leaking logic or touching Developer B modules or core domain packages.

## Feature design

**Data model sketch**:
- Entity: `Customer`
- Fields: `id` (UUID), `name` (String), `code` (String, Unique), `email` (String), `phone` (String?), `tier` (Enum: `ENTERPRISE` | `GOLD` | `SILVER` | `BRONZE`), `status` (Enum: `ACTIVE` | `INACTIVE` | `SUSPENDED`), `createdAt`, `updatedAt`.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/api/v1/customers` | GET | `search`, `tier`, `status`, `page`, `limit` | `items`, `total` | Bearer (`SALES_REP`, `SALES_MANAGER`, `FINANCE`, `ADMIN`) | 401, 403 |
| `/api/v1/customers` | POST | `name`, `code`, `email`, `phone`, `tier` | Customer object | Bearer (`SALES_REP`, `SALES_MANAGER`, `ADMIN`) | 400, 401, 403, 409 |
| `/api/v1/customers/:id` | GET | `id` | Customer object | Bearer | 401, 403, 404 |
| `/api/v1/customers/:id` | PATCH | `id`, `name`, `email`, `tier`, `status` | Updated Customer | Bearer (`SALES_MANAGER`, `ADMIN`) | 400, 401, 403, 404 |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Create customer | `Customer` record | Request body + Zod schema validation |
| Customer list | Paginated customer array | Database query filter |
| Get customer tier | Customer tier enum | Database column `Customer.tier` |

**Key invariants**:
- Customer code must be unique across the organization.
- Suspended or Inactive customers cannot be attached to new Quotations.

**Critical test scenarios**:
- Happy path: Create customer, search customer by name, update customer tier, verifies **AC-1**, **AC-2**.
- Duplicate code failure: Attempt to create customer with existing code returns HTTP 409, verifies **AC-1**, **AC-5**.
- Auth/permission: Customer role user attempting to mutate customer details returns HTTP 403, verifies **AC-4**.

## Build plan

1. Ensure Customer entity in Prisma schema matches `04_DATA_MODEL_AND_DATABASE.md`, satisfies **AC-1**.
2. Implement backend Customer Zod schemas in `packages/contracts`, satisfies **AC-1**, **AC-5**.
3. Implement Customer repository and service in `apps/api/src/modules/customer/`, satisfies **AC-1**, **AC-2**, **AC-3**.
4. Implement Customer Express controllers and router with RBAC authorization middleware in `apps/api/src/routes/customers.ts`, satisfies **AC-2**, **AC-4**.
5. Implement Customer list, details, creation, and editing UI in `apps/web/src/features/customers/`, satisfies **AC-1**, **AC-2**.
6. Write unit, API integration, and verification tests for Customer Management, satisfies **AC-5**.

## Consequences

**Positive**:
- Establishes Developer A Phase 1 Customer Foundation cleanly.
- Provides customer tier information required for Phase 5 Discount Governance.

**Negative / tradeoffs**:
- None.

## References

**Project sources**:
- `docs/08_DEVELOPER_A.md` (Developer A Phase 1 specification)
- `docs/04_DATA_MODEL_AND_DATABASE.md`
- `docs/06_API_CONTRACT.md`
