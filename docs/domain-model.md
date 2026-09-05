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

11. **Warehouse**: Code, name, location, priority hierarchy (1 = top priority), description, active status (`isActive`).
12. **InventoryItem**: Warehouse FK, Product FK, ProductVariant FK (optional), `onHandQuantity`, `reservedQuantity`, and derived `availableQuantity = onHandQuantity - reservedQuantity`.
13. **InventoryMovement**: Warehouse FK, Product FK, ProductVariant FK (optional), `movementType` (`RECEIPT`, `RESERVATION`, `RESERVATION_RELEASE`, `SHIPMENT`, `RETURN`, `ADJUSTMENT`, `TRANSFER_IN`, `TRANSFER_OUT`), quantity, `onHandBefore`, `onHandAfter`, `reservedBefore`, `reservedAfter`, reference details, reason, actor info.
14. **FulfillmentAllocation**: Quotation FK, QuoteLine FK, Warehouse FK, allocated quantity, backordered quantity, status (`RESERVED`, `PICKING`, `PACKED`, `SHIPPED`, `BACKORDERED`), explanation reasons JSON, manual override flag & reason.
15. **Backorder**: Quotation FK, QuoteLine FK, FulfillmentAllocation FK (optional), Product FK, requested quantity, allocated quantity, backordered quantity, status (`BACKORDERED`, `PARTIALLY_REALLOCATED`, `RESOLVED`, `CANCELLED`), notes.
16. **BillingSchedule**: Quotation FK, QuoteLine FK, billing type (`ONE_TIME` | `RECURRING`), billing date, period start/end, amount, status (`DRAFT`, `INVOICED`).
17. **CustomerPortalSession**: Quotation FK, secure token, expiresAt, status (`ACTIVE`, `SUBMITTED`, `EXPIRED`).
18. **Invoice**: Quotation FK, Customer FK, invoice number, status (`DRAFT`, `ISSUED`, `PAID`, `VOID`), customer snapshot details, financial snapshot totals (subtotal, total discount, taxable amount, tax amount, net total).
19. **InvoiceLine**: Invoice FK, Product FK, item name, SKU, quantity, list price, approved selling price snapshot (`unitPrice`), discount %, discount amount, tax rate, tax amount, line total.
