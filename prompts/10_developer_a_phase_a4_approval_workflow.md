# Implementation Prompt: Developer A Phase A4 — Approval Workflow Engine & Approval Inbox UI

## Goal
Implement Module A4: Approval Workflow Engine & Approval Inbox UI for DealFlow360.
Build a server-authoritative, deterministic, role-aware commercial approval engine and responsive decision inbox that governs commercial deal evaluations requiring approval, fully independent of Developer B.

## Relevant Skills Read
- `skills/domain/SKILL.md`
- `skills/frontend/SKILL.md`
- `skills/prisma/SKILL.md`
- `skills/testing/SKILL.md`

## Inspected Code & Architecture
- `packages/db/prisma/schema.prisma`: Added `ApprovalRequestStatus`, `ApprovalStepStatus`, `ApprovalRequest`, and `ApprovalStep` models.
- `packages/domain/src/policy/policyEvaluator.ts`: A3 commercial evaluation engine producing `requiredApprovalRoles` (`SALES_MANAGER`, `FINANCE_OPERATIONS`), `requiresApproval`, `violations`, `riskScore`, `riskLevel`.
- `packages/contracts/src/auth/index.ts`: RBAC permissions (`APPROVAL_VIEW`, `APPROVAL_ACTION`) mapped to `ADMIN`, `SALES_MANAGER`, `FINANCE_OPERATIONS`.
- `apps/api/src/services/commercialEvaluationService.ts`: A3 commercial deal evaluation authority.
- `apps/web/src/components/layout/DashboardLayout.tsx` & `AppRoutes.tsx`: UI layout and route structure.

## Key Decisions & Assumptions
1. **Responsibility Boundary**: A3 is the commercial evaluation authority (`CommercialEvaluationDto` -> `requiredApprovalRoles`). A4 consumes `requiredApprovalRoles` and creates the `ApprovalRequest` with sequential `ApprovalStep`s.
2. **Developer B Independence**: `quotationId` on `ApprovalRequest` is optional (`String?`). Approval requests can be created and tested standalone via A3 evaluation payloads or linked to quotations when provided by Developer B.
3. **State Machine**:
   - `ApprovalRequest`: `PENDING` → `APPROVED` | `REJECTED` | `SUPERSEDED`
   - `ApprovalStep`: `PENDING` → `APPROVED` | `REJECTED` | `SUPERSEDED`
4. **Step Sequencing**: When multiple roles are required (e.g. `SALES_MANAGER` and `FINANCE_OPERATIONS`), steps execute sequentially: Step 1 (`SALES_MANAGER`) must be approved before Step 2 (`FINANCE_OPERATIONS`) becomes pending/actionable.
5. **Authorization Enforcement**: Server verifies `approval.action` permission AND checks that the user's role matches `step.requiredRole` (or ADMIN). Forbidden roles receive HTTP 403.
6. **Double-Approval & Concurrency Protection**: Database transactions verify step status is `PENDING` before applying decisions, preventing race conditions or duplicate approvals.

## Expected Files to Create / Modify
- `packages/db/prisma/schema.prisma` [MODIFY]
- `packages/contracts/src/approvals/index.ts` [MODIFY]
- `packages/domain/src/approval/index.ts` [MODIFY]
- `apps/api/src/repositories/approvalRepository.ts` [NEW]
- `apps/api/src/services/approvalService.ts` [NEW]
- `apps/api/src/controllers/approvalController.ts` [NEW]
- `apps/api/src/routes/approvalRoutes.ts` [NEW]
- `apps/api/src/routes/index.ts` [MODIFY]
- `apps/web/src/features/approvals/ApprovalInboxPage.tsx` [NEW]
- `apps/web/src/features/approvals/ApprovalDetailPage.tsx` [NEW]
- `apps/web/src/routes/AppRoutes.tsx` [MODIFY]
- `apps/api/src/__tests__/approvals.test.ts` [NEW]

## Security & Domain Considerations
- All endpoints protected by JWT authentication and permission checks (`approval.view`, `approval.action`).
- Server validates that rejection reasons are captured when rejecting.
- Output sanitized through Zod contract schemas; no raw database errors exposed.

## Verification Plan
### Automated Tests
- Run `pnpm test` (all domain and API tests including new approval test suite).
- Run `pnpm typecheck`
- Run `pnpm lint`
- Run `pnpm build`

### Manual Verification
1. Create a commercial deal evaluation triggering `SALES_MANAGER` and `FINANCE_OPERATIONS` approvals.
2. Create approval request via A4 API.
3. Log in as `SALES_MANAGER` (`manager@dealflow.com`), view `/approvals` inbox, open detail, approve Step 1.
4. Attempt second approval on Step 1 to confirm concurrency rejection.
5. Log in as `FINANCE_OPERATIONS` (`finance@dealflow.com`), view inbox, approve Step 2. Confirm status transitions to `APPROVED`.
6. Test rejection flow with reason as `SALES_MANAGER`. Confirm status transitions to `REJECTED`.
