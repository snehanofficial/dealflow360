# DealFlow360 — Parallel Development & Execution Plan

## 1. Overview & Strategy

This document outlines the parallel development execution strategy for **Developer A** and **Developer B**.

To ensure zero blocking dependencies during feature implementation, development proceeds in four strict stages:

```text
STAGE 1: Shared Contract Freeze & Seeding
STAGE 2: Independent Parallel Feature Development (Branch A / Branch B)
STAGE 3: Contract-Based Integration & End-to-End Verification
STAGE 4: Demo Freeze & Final Handoff
```

---

## 2. Execution Timeline & Phases

```text
TIMELINE / STAGES
│
├── STAGE 1: Shared Contract Freeze
│   ├── Freeze packages/contracts interfaces (CustomerReference, ProductReference, CommercialEvaluation)
│   └── Freeze deterministic seed data (Users, Customers, Products, Warehouses)
│
├── STAGE 2: Independent Parallel Execution
│   │
│   ├── DEVELOPER A (Branch: dev-a-master-data-governance)
│   │   ├── Phase A1: Customer Management Vertical Slice
│   │   ├── Phase A2: Product Catalog & Pricing Setup Vertical Slice
│   │   ├── Phase A3: Discount Policy Matrix & Margin Engine
│   │   ├── Phase A4: Approval Workflow Engine & Inbox UI
│   │   └── Phase A5: Audit Trail & Commercial Event History
│   │
│   └── DEVELOPER B (Branch: dev-b-quotes-execution)
│       ├── Phase B1: Quotation Management & Line Item Builder
│       ├── Phase B2: Customer Negotiation Portal & Counteroffers
│       ├── Phase B3: Multi-Warehouse Fulfillment & Allocation
│       ├── Phase B4: Subscription & Hybrid Billing Engine
│       ├── Phase B5: Upsell & Cross-sell Recommendation Engine
│       └── Phase B6: Deal Health Alerts & Control Tower Dashboard
│
├── STAGE 3: Contract-Based Integration
│   ├── Merge Branch A and Branch B into integration branch
│   ├── Wire Quotation Builder to real Customer/Product APIs
│   ├── Wire Customer Negotiation to real Policy & Approval Engines
│   └── Run End-to-End Sales-to-Cash Governance Flow tests
│
└── STAGE 4: Demo Freeze
    ├── Run pnpm typecheck && pnpm lint && pnpm test && pnpm build
    └── Execute 5-minute judge demo script (docs/demo-script.md)
```

---

## 3. Local Development Setup for Each Developer

### Developer A Workspace Setup:
1. `git checkout -b dev-a-master-data-governance`
2. `pnpm install`
3. `npx prisma db seed` (Populates base users, demo customers, products)
4. Implement Developer A scope: Customer, Product, Discount Governance, Approvals, Audit Trail.
5. Run Dev A tests: `pnpm test apps/api/src/__tests__/customer.test.ts` (and new Dev A test suites).

### Developer B Workspace Setup:
1. `git checkout -b dev-b-quotes-execution`
2. `pnpm install`
3. `npx prisma db seed` (Populates base users, demo customers, products)
4. Implement Developer B scope: Quotation, Portal, Fulfillment, Billing, Upsell, Control Tower.
5. Run Dev B tests: test quote calculation, fulfillment splitting, proration, and portal access independently against seeded contract data.

---

## 4. Final Integration Protocol

1. Both developers confirm their feature-level Definition of Done (code, UI, unit/integration tests).
2. Create PRs against `main`.
3. Verify that `packages/contracts` types remain untouched or backward compatible.
4. Execute `pnpm build` across monorepo workspace.
5. Perform end-to-end demo script validation.
