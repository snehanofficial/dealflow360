# DealFlow360 - Implementation Tasks & Ownership Blueprint

## Phase 0: Shared Foundation & Infrastructure (Completed)
- [x] Monorepo workspace configuration (`pnpm-workspace.yaml`, `package.json`, `tsconfig.json`)
- [x] Agent skills discovery & installation
- [x] Monorepo packages setup (`packages/contracts`, `packages/domain`, `packages/db`)
- [x] Applications setup (`apps/web`, `apps/api`)
- [x] JWT Authentication & Refresh token rotation with HttpOnly cookie
- [x] RBAC authorization middleware & roles (`ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`, `CUSTOMER`)
- [x] Centralized Axios API client with automatic refresh & retry
- [x] App shell, Navbar, Dashboard layout & theme setup
- [x] Bootstrap verification (typecheck, lint, test, build)

---

## Phase 1: Developer A - Master Data & Governance Vertical Slices
- [x] Phase A1: Customer Management (Prisma model, CRUD API, Tier/Status, UI, Tests)
- [ ] Phase A2: Product Catalog & Base Pricing (Prisma model, CRUD API, Allowed Discount limits, UI, Tests)
- [ ] Phase A3: Discount Policy Matrix & Margin Engine (Domain pricing/margin calculation, Policy evaluation API, Tests)
- [ ] Phase A4: Approval Workflow Engine (Approval request/step models, Automatic routing, Approval Inbox UI, Tests)
- [ ] Phase A5: Audit Trail & Event History (Audit log model, Audit logging service, Audit Trail UI, Tests)

---

## Phase 2: Developer B - Deal Execution & Operations Vertical Slices
- [x] Phase B1: Quotation Management & Quote Builder UI (Quote & Line models, Quote Builder UI, State machine, Tests)

- [x] Phase B2: Customer Negotiation Portal (Portal token security, Counteroffer submission, Responsive Portal UI, Tests)

- [x] Phase B3: Multi-Warehouse Fulfillment & Splitting (Inventory models, Split allocation logic, Override UI, Tests)

- [x] Phase B4: Subscription & Hybrid Billing Engine (Hybrid billing schedules, Proration formula, Billing UI, Tests)
- [x] Phase B5: Upsell & Cross-sell Engine (Deterministic suggestions, Commercial impact calculation, UI, Tests)
- [x] Phase B6: Deal Health & Control Tower Dashboard (Stalled deal alerts, Live operational metrics, Filterable Dashboard UI, Tests)

---

## Phase 3: Contract Integration & End-to-End Governance Verification
- [ ] Wire Quotation Builder to Developer A's live Customer & Product endpoints
- [ ] Wire Customer Portal counteroffers to Developer A's live Policy & Approval engines
- [ ] Execute complete Sales-to-Cash governance integration suite
- [ ] Execute 5-minute judge demo script (`docs/demo-script.md`)
