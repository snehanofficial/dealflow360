# DealFlow360 - Database Ownership & Model Contract

## 1. Overview

This document specifies the Prisma database schema ownership between **Shared Foundation**, **Developer A**, and **Developer B** in `packages/db`.

To eliminate schema migration lockouts and simultaneous model editing conflicts during parallel execution:
- Each model has **one explicitly designated write owner**.
- Read consumption across modules occurs via repositories or stable contracts.

---

## 2. Model Allocation Table

| Prisma Model | Write Owner | Read Consumers | Purpose |
| :--- | :--- | :--- | :--- |
| **`User`** | Shared Foundation | Dev A, Dev B | Identity, authentication, and RBAC roles |
| **`RefreshSession`** | Shared Foundation | Auth Service | Refresh token session persistence & rotation |
| **`Customer`** | **Developer A** | Dev A, Dev B (read) | Customer accounts, tiers, and status |
| **`Product`** | **Developer A** | Dev A, Dev B (read) | Product catalog, pricing, base cost, max discount |
| **`DiscountPolicyRule`** | **Developer A** | Dev A (Governance) | Tier & Category allowed discount thresholds |
| **`ApprovalRequest`** | **Developer A** | Dev A, Dev B | Approval routing requests and decisions |
| **`ApprovalStep`** | **Developer A** | Dev A | Approval step hierarchy (Manager, Finance) |
| **`AuditLog`** | **Developer A** | Dev A, Dev B | System governance audit trail |
| **`Quote`** | **Developer B** | Dev B, Dev A (read) | Commercial quotation headers and totals |
| **`QuoteLine`** | **Developer B** | Dev B | Quote line items, unit prices, discounts |
| **`PortalToken`** | **Developer B** | Dev B (Portal) | Secure customer quotation access tokens |
| **`CounterOffer`** | **Developer B** | Dev B | Customer counteroffer proposals and comments |
| **`Warehouse`** | **Developer B** | Dev B | Multi-warehouse physical locations |
| **`InventoryItem`** | **Developer B** | Dev B | Stock quantity per warehouse per product SKU |
| **`FulfillmentAllocation`** | **Developer B** | Dev B | Calculated order shipment allocation split |
| **`BillingSchedule`** | **Developer B** | Dev B | One-time and subscription billing dates |
| **`BillingLine`** | **Developer B** | Dev B | Detailed billing schedule line items |
| **`RecommendationRule`** | **Developer B** | Dev B | Co-purchase & promotion upsell rules |
| **`DealAlert`** | **Developer B** | Dev B (Dashboard) | Stalled deal & margin leakage alerts |

---

## 3. Database Safety Guidelines

1. **No Shared Direct Mutations**: Developer B never directly performs `prisma.customer.update()`. Developer A never directly performs `prisma.quote.update()`.
2. **Seed Data Integrity**: `packages/db/prisma/seed.ts` contains canonical demo records for Users, Customers, Products, and Warehouses to allow immediate offline development for both developers.
3. **Migration Discipline**: Any new migration in `packages/db/prisma/migrations` must be committed to the owner's branch without editing existing migrations.
