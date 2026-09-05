# DealFlow360 — Implementation Tasks

## Phase 0: Monorepo & Infrastructure Bootstrap
- [x] Monorepo workspace configuration (`pnpm-workspace.yaml`, `package.json`, `tsconfig.json`)
- [x] Agent skills discovery & installation
- [x] Packages setup (`packages/contracts`, `packages/domain`, `packages/db`)
- [x] Applications setup (`apps/web`, `apps/api`)
- [x] Bootstrap verification (typecheck, lint, test, build)

## Phase 1: Core Domain Engines (Pending Approval)
- [ ] Pricing engine
- [ ] Margin engine
- [ ] Policy engine
- [ ] Risk engine
- [ ] Approval engine
- [ ] Quote state machine

## Phase 2: Backend API & Auth (Pending Approval)
- [ ] JWT Authentication & Refresh token rotation
- [ ] RBAC authorization middleware
- [ ] Express endpoints for Quote & Approval lifecycles
- [ ] Customer Portal endpoints & fulfillment allocation logic

## Phase 3: Web Frontend & Customer Portal (Pending Approval)
- [ ] UI Design system & theme setup
- [ ] Centralized Axios client & TanStack Query setup
- [ ] Quote workspace & line item editor
- [ ] Risk summary panel & approval request routing
- [ ] Customer quotation portal
- [ ] Control Tower dashboard
