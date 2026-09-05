# DealFlow360 - Canonical Domain Model Specification

For detailed business entity definitions and workflows, see [`03_ROLES_PERMISSIONS_AND_FLOWS.md`](./03_ROLES_PERMISSIONS_AND_FLOWS.md) and [`05_BUSINESS_RULES.md`](./05_BUSINESS_RULES.md).

---

## 1. Core Domain Entities

```text
       ┌──────────────┐
       │   Customer   │ (Tier: STANDARD, GOLD, PLATINUM)
       └──────┬───────┘
              │ 1:N
              ▼
       ┌──────────────┐          ┌────────────────┐
       │  Quotation   ├─────────►│  PolicyRule    │ (Discount cap, Min margin)
       └──────┬───────┘ 1:N      └────────────────┘
              │
              ├──► 1:N ──► ┌──────────────┐
              │            │  QuoteLine   ├─────────► ┌──────────────┐
              │            └──────────────┘           │   Product    │
              │                                       └──────────────┘
              ├──► 1:N ──► ┌──────────────────┐
              │            │ ApprovalRequest  │ (Roles: SALES_MANAGER, FINANCE_OPERATIONS)
              │            └──────────────────┘
              ├──► 1:N ──► ┌──────────────────┐
              │            │ FulfillmentPlan  ├─────► ┌──────────────┐
              │            └──────────────────┘       │  Warehouse   │
              │                                       └──────────────┘
              ├──► 1:N ──► ┌──────────────────┐
              │            │ BillingSchedule  │ (One-time vs Recurring)
              │            └──────────────────┘
              │
              └──► 1:N ──► ┌──────────────────┐
                           │    DealEvent     │ (Immutable Audit Trail)
                           └──────────────────┘
```

---

## 2. Foundation / Auth Entities (Phase 0)

1. **User**:
   - `id`: String (UUID / CUID)
   - `email`: String (Unique)
   - `passwordHash`: String (Argon2id)
   - `name`: String
   - `role`: Role Enum (`ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`, `CUSTOMER`)
   - `isActive`: Boolean
   - `createdAt`, `updatedAt`: DateTime
2. **RefreshSession**:
   - `id`: String (UUID)
   - `userId`: String (FK User)
   - `tokenHash`: String
   - `expiresAt`: DateTime
   - `isRevoked`: Boolean
   - `ipAddress`, `userAgent`: String (Optional)
   - `createdAt`, `updatedAt`: DateTime
3. **UserPermission**:
   - Explicit permissions array mapped from Role or assigned to User (e.g. `quotation.create`, `approval.action`, `fulfillment.view`).

---

## 3. Commercial & Governance Entities (Developer A)

4. **Customer**: Tier (`STANDARD`, `GOLD`, `PLATINUM`), credit limit, region, account manager.
5. **Product**: SKU, name, category, list price, standard cost, billing type (`ONE_TIME`, `RECURRING`), recurring period (`MONTHLY`, `ANNUAL`).
6. **Quotation**: Quote number, customer reference, state (`DRAFT`, `PENDING_MANAGER`, `PENDING_FINANCE`, `APPROVED`, `NEGOTIATING`, `FULFILLMENT`, `BILLING`, `COMPLETED`), totals (subtotal, total discount, net value, gross margin %, risk score, risk level).
7. **QuoteLine**: Quotation FK, Product FK, quantity, list price, proposed discount %, discount amount, net line price, line cost, line margin %.
8. **PolicyRule**: Tier, category, max allowed discount %, min required margin %, required approval role.
9. **ApprovalRequest**: Quotation FK, commercial snapshot hash, required role (`SALES_MANAGER` | `FINANCE_OPERATIONS`), status (`PENDING`, `APPROVED`, `REJECTED`, `SUPERSEDED`), decision reason, decidedBy User FK.
10. **DealEvent**: Quotation FK, actor User FK, event type (`QUOTE_CREATED`, `DISCOUNT_CHANGED`, `RISK_EVALUATED`, `APPROVAL_REQUESTED`, `APPROVAL_APPROVED`, `APPROVAL_SUPERSEDED`, etc.), payload JSON.

---

## 4. Fulfillment, Billing & Portal Entities (Developer B)

11. **Warehouse**: Code, name, location, capacity.
12. **InventoryItem**: Warehouse FK, Product FK, available quantity, reserved quantity.
13. **FulfillmentPlan**: Quotation FK, QuoteLine FK, Warehouse FK, allocated quantity, status (`PLANNED`, `OVERRIDDEN`, `SHIPPED`).
14. **BillingSchedule**: Quotation FK, QuoteLine FK, billing type (`ONE_TIME` | `RECURRING`), billing date, period start/end, amount, status (`DRAFT`, `INVOICED`).
15. **CustomerPortalSession**: Quotation FK, secure token, expiresAt, status (`ACTIVE`, `SUBMITTED`, `EXPIRED`).
