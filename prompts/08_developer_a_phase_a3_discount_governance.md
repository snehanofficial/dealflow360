# Developer A - Phase A3 Discount Governance & Margin Engine Implementation Plan

## Goal
Build a deterministic, server-authoritative Discount Governance & Margin Engine for DealFlow360.
The module must evaluate deal lines against customer tier and product category discount policies, calculate margins accurately, detect policy violations, compute explainable risk scores/levels, and derive required approval roles (`SALES_MANAGER`, `FINANCE`). Includes database models, shared contracts, domain logic, REST API endpoints, policy management & scenario simulation UI, and automated test suite.

## Relevant Skills Read
- `AGENTS.md` (Product principles, governance differentiator, modular monolith, UI display adaptability, REST API standards, permission rules)
- `.agents/skills/develop/SKILL.md` (Implementation workflow)
- `.agents/skills/test/SKILL.md` (Testing guidelines)
- `.agents/skills/prisma-cli/SKILL.md` & `prisma-client-api` (Prisma schema & queries)

## Code and Config Inspected
- `packages/db/prisma/schema.prisma` (`Product`, `Customer`, `CustomerTier`, `PriceList`, `Role`)
- `packages/contracts/src/auth/index.ts` (`Role`, `Permissions`, `ROLE_PERMISSIONS`)
- `packages/contracts/src/product/index.ts` (`ProductReferenceDto`, `ProductCategory`, `ProductType`)
- `packages/contracts/src/customer/index.ts` (`CustomerReferenceDto`)
- `packages/contracts/src/common/index.ts` (API envelope)
- `apps/api/src/repositories/priceListRepository.ts` (`findEffectivePriceEntry`)
- `apps/api/src/modules/products/product.service.ts` (`getProductById`, `roundMoney`)
- `apps/api/src/middleware/auth.ts` (`authenticate`, `requirePermission`, `requireRole`)
- `apps/web/src/routes/AppRoutes.tsx`
- `apps/web/src/components/layout/DashboardLayout.tsx`

## Decisions and Assumptions
1. **Reusing A2 Effective Pricing**:
   - A3 reuses `priceListRepository.findEffectivePriceEntry` for price list resolution (Customer Tier + Currency -> Currency Default -> Base Product List Price). A3 does NOT recreate/duplicate price-list logic.
2. **Database Model**:
   - Add `DiscountPolicyRule` model in `schema.prisma` with `customerTier`, `category`, `productId`, `maxDiscountPercent`, `minMarginPercent`, `requiredApprovalRole`, `priority`, `isActive`.
3. **Domain Engine**:
   - Framework-independent `marginEngine.ts` and `policyEvaluator.ts` in `packages/domain`.
   - Precedence: Specificity (Product > Category > Customer Tier > Global) then Priority (descending).
   - Deterministic risk scoring formula (+2.5 per policy violation, total discount depth / margin erosion penalty, deal size penalty). Risk levels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
   - Approval routing: derive `SALES_MANAGER` and/or `FINANCE` requirements.
4. **Permissions**:
   - Add `DISCOUNT_VIEW`, `DISCOUNT_CONFIGURE`, `DISCOUNT_EVALUATE` to `packages/contracts/src/auth/index.ts`.
5. **API**:
   - `/api/v1/discount-policies/*` for CRUD and status toggles.
   - `/api/v1/commercial-evaluations/evaluate` (and alias `/api/v1/discount-policies/evaluate`) for scenario evaluation.
6. **Frontend**:
   - Policy Management page (`/discount-policies`) with Policy List, Filter/Search, Create/Edit Modal, Status Toggle.
   - Scenario Simulator section (`PolicySimulatorSection.tsx`) to test customer, currency, products, quantities, proposed discounts against backend evaluator.

## Expected Files to Change
- `[MODIFY] packages/db/prisma/schema.prisma`
- `[MODIFY] packages/db/prisma/seed.ts`
- `[MODIFY] packages/contracts/src/auth/index.ts`
- `[NEW] packages/contracts/src/policy/index.ts`
- `[MODIFY] packages/contracts/src/index.ts`
- `[NEW] packages/domain/src/margin/marginEngine.ts`
- `[NEW] packages/domain/src/policy/policyEvaluator.ts`
- `[NEW] packages/domain/src/policy/__tests__/policyEngine.test.ts`
- `[NEW] packages/domain/src/margin/__tests__/marginEngine.test.ts`
- `[MODIFY] packages/domain/src/index.ts`
- `[NEW] apps/api/src/repositories/discountPolicyRepository.ts`
- `[NEW] apps/api/src/services/discountPolicyService.ts`
- `[NEW] apps/api/src/services/commercialEvaluationService.ts`
- `[NEW] apps/api/src/controllers/discountPolicyController.ts`
- `[NEW] apps/api/src/routes/discountPolicyRoutes.ts`
- `[NEW] apps/api/src/routes/commercialEvaluationRoutes.ts`
- `[MODIFY] apps/api/src/app.ts`
- `[NEW] apps/api/src/__tests__/discountPolicy.test.ts`
- `[NEW] apps/web/src/features/governance/DiscountPolicyListPage.tsx`
- `[NEW] apps/web/src/features/governance/PolicySimulatorSection.tsx`
- `[NEW] apps/web/src/features/governance/DiscountPolicyFormModal.tsx`
- `[NEW] apps/web/src/features/governance/useDiscountPolicies.ts`
- `[MODIFY] apps/web/src/routes/AppRoutes.tsx`
- `[MODIFY] apps/web/src/components/layout/DashboardLayout.tsx`

## Acceptance Criteria
1. `DiscountPolicyRule` model created & seeded in PostgreSQL via Prisma.
2. Shared contracts export `CommercialEvaluationDto`, `PolicyViolationDto`, and Zod validation schemas.
3. Domain `marginEngine` computes line subtotals, discount amounts, net values, costs, margin $, margin %, safely handling zero-cost/zero-price edge cases.
4. Domain `policyEvaluator` checks proposed discount against product max allowed discount and active policy rules, derives explainable violations, risk score/level, and required approval roles.
5. `/api/v1/discount-policies` CRUD REST endpoints implemented with Zod validation & RBAC permission checks.
6. `/api/v1/commercial-evaluations/evaluate` REST endpoint evaluates deal scenarios using A2 effective pricing and domain engines.
7. Dedicated UI at `/discount-policies` enables policy CRUD, filtering, status toggles, and interactive scenario simulation.
8. Role-based security enforced server-side (`CUSTOMER` and unauthorized roles forbidden).
9. All unit, integration, typecheck, lint, and build checks pass (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`).

## Checks to Run
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
