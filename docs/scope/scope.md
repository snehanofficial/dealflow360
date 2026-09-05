# Scope: DealFlow360 - B2B Sales-to-Cash Policy Governance Platform

DealFlow360 is an enterprise sales-to-cash platform governed by strict commercial risk, policy evaluation, multi-warehouse fulfillment, hybrid billing, customer negotiation, and deal control tower monitoring.

**Build approach:** Tracer Bullet (vertical end-to-end slice per phase).
**Workflow:** GA (requires `/architect` spec capture, `/develop` implementation, `/check verify` verification, `/test` automated testing, `/check review` fresh model review, and `/document` prose generation).

---

## At a glance

### Shared Foundation (Phase 0)
| # | Feature | Phase | Owner | Status |
|---|---------|-------|-------|--------|
| 0.1 | Monorepo & Infrastructure Bootstrap | Foundation | Shared | done |
| 0.2 | Shared Auth & RBAC Foundation | Foundation | Shared | in-progress |

### Developer A Owned Modules
| # | Feature | Phase | Owner | Status |
|---|---------|-------|-------|--------|
| A.1 | Customer Management | Dev A - Phase 1 | Developer A | done |
| A.2 | Product & Pricing Management | Dev A - Phase 2 | Developer A | planned |
| A.3 | Quotation Core & Lifecycle | Dev A - Phase 3 | Developer A | planned |
| A.4 | Quotation Pricing, Margin & Shared Interfaces | Dev A - Phase 4 | Developer A | planned |
| A.5 | Discount Governance Foundation | Dev A - Phase 5 | Developer A | planned |
| A.6 | Approval Workflow Foundation | Dev A - Phase 6 | Developer A | planned |
| A.7 | Approval UI & Quotation Integration | Dev A - Phase 7 | Developer A | planned |
| A.8 | Audit Trail & Event Logging | Dev A - Phase 8 | Developer A | planned |
| A.9 | Customer-to-Quotation Integration | Dev A - Phase 9 | Developer A | planned |
| A.10 | Dev A / Dev B Contract Integration | Dev A - Phase 10 | Developer A | planned |
| A.11 | Dev A Full Flow Regression & Demo | Dev A - Phase 11 | Developer A | planned |
| A.12 | Dev A Hardening & Handoff | Dev A - Phase 12 | Developer A | planned |

### Developer B Owned Modules
| # | Feature | Phase | Owner | Status |
|---|---------|-------|-------|--------|
| B.1 | Upsell & Cross-sell Foundation | Dev B - Phase 1 | Developer B | planned |
| B.2 | Upsell Margin Integration | Dev B - Phase 2 | Developer B | planned |
| B.3 | Warehouse Fulfillment Foundation | Dev B - Phase 3 | Developer B | planned |
| B.4 | Warehouse Split, Override & Backorder | Dev B - Phase 4 | Developer B | planned |
| B.5 | Subscription & Hybrid Billing Foundation | Dev B - Phase 5 | Developer B | planned |
| B.6 | Proration, Modification & Cancellation | Dev B - Phase 6 | Developer B | planned |
| B.7 | Customer Negotiation Portal Foundation | Dev B - Phase 7 | Developer B | planned |
| B.8 | Negotiation, Re-evaluation & Confirmation | Dev B - Phase 8 | Developer B | planned |
| B.9 | Deal Health & Alerts Foundation | Dev B - Phase 9 | Developer B | planned |
| B.10 | Operational Dashboard Foundation | Dev B - Phase 10 | Developer B | planned |
| B.11 | Dashboard Filters & Full Integration | Dev B - Phase 11 | Developer B | planned |
| B.12 | Dev B Hardening & Final Demo Readiness | Dev B - Phase 12 | Developer B | planned |

---

## Foundations

### 0.1 Monorepo & Infrastructure Bootstrap · done
Setup pnpm monorepo workspace (`apps/web`, `apps/api`, `packages/contracts`, `packages/domain`, `packages/db`).
**Done when:** root workspace builds, typechecks, lints, and passes bootstrap tests.
- [x] Scaffold monorepo configuration: `pnpm-workspace.yaml`, `package.json`, `tsconfig.json`
- [x] Configure applications and packages
code in `apps/` and `packages/`

### 0.2 Shared Auth & RBAC Foundation · in-progress
Implement JWT access tokens, HttpOnly refresh cookies, password hashing (Argon2id), and RBAC authorization middleware.
**Done when:** authentication lifecycle functions end-to-end securely with role checks.
- [x] Design auth architecture: `/architect shared auth`
- [ ] Build auth endpoints & UI: `/develop shared auth`
- [ ] Verify auth security: `/check verify shared auth`
- [ ] Test auth flow: `/test shared auth`
code in `apps/api/src/auth/` and `apps/web/src/features/auth/`

---

## Developer A Owned Modules

### A.1 Customer Management (Dev A Phase 1) · done · GA
Implement Customer Management vertical slice (CRUD, listing, tier management, status management, search).
**Done when:** Customer CRUD, tiers, status management, validation, authorization, and customer unit/API tests pass.
- [x] Design customer specification: `/architect customer management`
- [x] Build customer backend & UI: `/develop customer management`
- [ ] Verify customer management: `/check verify customer management`
- [x] Test customer suite: `/test customer management`
- [ ] Review customer module: `/check review customer management`
- [ ] Document customer module: `/document customer management`
code in `apps/api/src/modules/customer/` and `apps/web/src/features/customers/`

### A.2 Product & Pricing Management (Dev A Phase 2) · planned · GA
Implement Product & Pricing vertical slice (creation, search/filtering, pricing tier, cost price, allowed discount, product type classification).
**Done when:** Product CRUD, allowed discount storage, one-time vs subscription product classifications, RBAC, and tests pass.
- [ ] Design product spec: `/architect product pricing management`

---

## Legend

- **needs a decision**: run `/architect` first to produce a build spec.
- **Workflow (GA)**: `/architect` spec capture -> `/develop` implementation -> `/check verify` -> `/test` -> `/check review` -> `/document`.
- **Developer Boundaries**: Developer A owns Modules A.1 to A.12; Developer B owns Modules B.1 to B.12.
