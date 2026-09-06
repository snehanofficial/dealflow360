# Implementation Prompt: Connected Demo Seed Data Implementation

## Goal
Implement a deterministic, relationally connected, idempotent seed script in `packages/db/prisma/seed.ts` that populates the PostgreSQL database with a realistic B2B enterprise dataset for DealFlow360. The seeded dataset will drive the entire sales-to-cash workflow across all modules (Users, Customers, Products, Price Lists, Discount Policy Matrix, Quotations, Lines, Approvals, Upsell/Cross-sell Recommendations, Warehouse Inventory & Fulfillment, Backorders, Hybrid Billing & Subscriptions, Customer Portal & Counter-offers, Deal Health Alerts, Audit Logs, and Invoices).

## Relevant Skills Read
- `skills/prisma/SKILL.md` (Prisma client usage, upserts, transactions, relational consistency)
- `skills/domain/SKILL.md` (Business rules, quotation statuses, risk scoring, discount governance, fulfillment, billing)

## Code & Config Inspected
- `packages/db/prisma/schema.prisma` (Authoritative schema definitions, enums, FK constraints)
- `packages/db/prisma/seed.ts` (Existing seed script structure and database client adapter)
- `packages/db/package.json` (Seed script execution command: `pnpm --filter @dealflow360/db run seed`)

## Decisions & Assumptions
1. **Seed Entrypoint**: `packages/db/prisma/seed.ts` will remain the single, canonical seed entrypoint.
2. **Idempotency Strategy**: Every entity will be upserted using deterministic IDs or unique keys (`email`, `sku`, `code`, `quoteNumber`, `id`) so re-running the seed command is safe, repeatable, and clean.
3. **Password Security**: Use `argon2id` via `argon2.hash('Password123!')` for all seeded demo users.
4. **Data Scale**: 10 Users, 10 Customers, 10 Products, 10 Price Lists/Entries, 7 Discount Policy Rules, 10 Warehouses, 10 Quotations, 6 Recommendation Rules, 10 Inventory Items/Movements, 4 Billing Schedules/Lines, 3 Counter-offers, 3 Invoices/Payments, 3 Deal Health Alerts, and 10 Audit Logs.
5. **Hero Scenarios Built into Seed**:
   - **Hero 1 (Discount Approval)**: `QT-2026-0001` with high hardware/service discounts triggering `PENDING_MANAGER` and an active `ApprovalRequest` with `ApprovalStep` records for `SALES_MANAGER` and `FINANCE_OPERATIONS`.
   - **Hero 2 (Recommendation/Upsell)**: `QT-2026-0002` with Enterprise Server Pro triggering `CO_PURCHASE` (Smart UPS) and `CROSS_SELL` (42U Rack) rules.
   - **Hero 3 (Warehouse Split & Backorder)**: `QT-2026-0003` with multi-warehouse fulfillment allocations across `WH-EAST` and `WH-WEST` plus a `Backorder` record.
   - **Hero 4 (Hybrid Billing & Proration)**: `QT-2026-0004` containing one-time hardware + recurring annual cloud security suite + recurring monthly support with a `BillingSchedule` and prorated `BillingLine` items.
   - **Hero 5 (Customer Portal & Negotiation)**: `QT-2026-0005` in `NEGOTIATING` state with an active `PortalToken` and `CounterOffer` (18% discount).
   - **Hero 6 (Deal Health Alerts)**: `QT-2026-0010` with aged timestamps triggering `STALLED_DEAL`, `DISCOUNT_ANOMALY`, and `DELIVERY_SLIPPAGE` alerts.

## Expected Files to Change
- `packages/db/prisma/seed.ts` [MODIFY]

## Requirements
1. **Deterministic Data**: All entities created using fixed primary keys (`cust-acme-001`, `prod-srv-001`, `quote-demo-001`, etc.).
2. **Relational Consistency**: Quotations link to real Customers and Users; Quote Lines link to real Products; Approvals link to real Quotations and Users; Invoices link to real Quotations and Customers; Allocations link to real Warehouses and Lines.
3. **Role Coverage**: Include `ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`, and `CUSTOMER` roles.
4. **Calculated Field Veracity**: Subtotals, discounts, net values, costs, and margins are accurately computed from line items according to domain rules.
5. **Customer Ownership Restrictions**: Link customer users strictly to their respective customer records.

## Security Considerations
- Demo password is `Password123!` hashed securely with `argon2id`.
- No plain-text passwords stored in the database.
- Refresh tokens and portal tokens use secure deterministic values.

## Domain & Business Rule Considerations
- Customer tiers (`ENTERPRISE`, `GOLD`, `SILVER`, `BRONZE`) map directly to discount policy thresholds.
- Product margins range from low (30% SAN Storage) to high (60% Services / 70% Security).
- Quotation statuses follow the explicit `QuoteStatus` state machine (`DRAFT` -> `PENDING_MANAGER` -> `APPROVED` -> `NEGOTIATING` -> `FULFILLMENT` -> `BILLING` -> `COMPLETED`).

## Acceptance Criteria
- Running `pnpm --filter @dealflow360/db run seed` succeeds with zero errors.
- Running the seed command a second time succeeds identically without duplicating data or throwing unique constraint violations.
- API integration tests (`pnpm --filter @dealflow360/api test`) pass.
- All 10 quotations are accessible through the web app UI and API endpoints with fully populated connected data.

## Verification Checks to Run
1. `pnpm --filter @dealflow360/db run seed` (Initial run)
2. `pnpm --filter @dealflow360/db run seed` (Idempotency verification)
3. `pnpm --filter @dealflow360/api test -- src/__tests__/invoice.test.ts` (API test verification)
