# Implementation Prompt: Developer A Phase A5 — Audit Trail & Commercial Event History

## Goal
Implement Module A5: Audit Trail & Commercial Event History for DealFlow360.
Build a reliable, server-authoritative, append-only audit trail system and UI that records all major commercial mutations across Developer A modules (Customers, Products & Price Lists, Discount Governance, and Approvals) and establishes an event contract for future Developer B integration.

## Relevant Skills Read
- `skills/domain/SKILL.md`
- `skills/frontend/SKILL.md`
- `skills/prisma/SKILL.md`
- `skills/testing/SKILL.md`

## Inspected Code & Architecture
- `packages/db/prisma/schema.prisma`: AuditLog model will be added with indexes on (entityType, entityId), (createdAt), (actorId), (eventType).
- `packages/contracts/src/auth/index.ts`: `Permissions.AUDIT_VIEW` mapped to `ADMIN`, `SALES_MANAGER`, and `FINANCE_OPERATIONS`.
- `apps/api/src/modules/customers/customer.service.ts`: A1 Customer CRUD operations.
- `apps/api/src/modules/products/product.service.ts`: A2 Product CRUD operations.
- `apps/api/src/services/discountPolicyService.ts`: A3 Discount Policy operations.
- `apps/api/src/services/commercialEvaluationService.ts`: A3 Commercial Deal Evaluation operations.
- `apps/api/src/services/approvalService.ts`: A4 Approval Workflow operations.
- `apps/web/src/components/layout/DashboardLayout.tsx` & `AppRoutes.tsx`: Web UI routes and layout.

## Key Decisions & Assumptions
1. **Append-Only Immutability**: No API endpoints or user interfaces will allow editing, updating, or deleting audit logs. Audit log entries are written strictly through internal server calls.
2. **Server-Derived Actor Identity**: The audit system strictly derives actor identity (`actorId`, `actorName`, `actorRole`) from authenticated server context (`req.user`). Actor fields sent by client in request bodies are ignored.
3. **Sensitive Field Sanitization**: Automatic sanitization strips sensitive fields (`password`, `passwordHash`, `token`, `refreshToken`, `authorization`, `cookie`) before persisting `previousState`, `newState`, or `metadata`.
4. **Structured Changes & Human-Readable Descriptions**: In addition to raw field diffs, audit logs store structured change summaries and human-readable descriptions for UI display.
5. **Transactional Consistency**: For critical commercial state transitions (e.g. Approval decisions), audit logs are written within the same database transaction (`tx`) to prevent missing audit records.
6. **Developer B Compatibility**: The audit service exposes a clean event boundary `recordAuditEvent(...)` that Developer B modules can call for quotation, portal, fulfillment, and billing events without modifying A5.

## Expected Files to Create / Modify
- `prompts/11_developer_a_phase_a5_audit_trail.md` [NEW]
- `packages/db/prisma/schema.prisma` [MODIFY]
- `packages/contracts/src/audit/index.ts` [NEW]
- `packages/contracts/src/index.ts` [MODIFY]
- `packages/domain/src/audit/index.ts` [NEW]
- `packages/domain/src/index.ts` [MODIFY]
- `apps/api/src/services/auditService.ts` [NEW]
- `apps/api/src/controllers/auditController.ts` [NEW]
- `apps/api/src/routes/auditRoutes.ts` [NEW]
- `apps/api/src/routes/index.ts` [MODIFY]
- `apps/api/src/modules/customers/customer.service.ts` [MODIFY]
- `apps/api/src/modules/products/product.service.ts` [MODIFY]
- `apps/api/src/services/discountPolicyService.ts` [MODIFY]
- `apps/api/src/services/commercialEvaluationService.ts` [MODIFY]
- `apps/api/src/services/approvalService.ts` [MODIFY]
- `apps/web/src/features/audit/AuditTrailPage.tsx` [NEW]
- `apps/web/src/components/layout/DashboardLayout.tsx` [MODIFY]
- `apps/web/src/routes/AppRoutes.tsx` [MODIFY]
- `apps/api/src/__tests__/audit.test.ts` [NEW]
- `docs/api-contracts.md` [MODIFY]
- `docs/domain-model.md` [MODIFY]
- `docs/database-contract.md` [MODIFY]

## Security & Domain Considerations
- Audit endpoint `/api/v1/audit` requires `AUDIT_VIEW` permission (`ADMIN`, `SALES_MANAGER`, `FINANCE_OPERATIONS`). `SALES_REP` and `CUSTOMER` roles are rejected with HTTP 403.
- No client-facing mutation endpoints exist for audit logs.
- Sensitive credentials are stripped.

## Verification Plan
### Automated Tests
- Run `pnpm test` (all unit, domain, and API tests including new `audit.test.ts`).
- Run `pnpm typecheck`
- Run `pnpm lint`
- Run `pnpm build`

### Manual Verification
1. Log in as `manager@dealflow.com` (Sales Manager).
2. Perform customer creation and update.
3. Update product price and discount limits.
4. Update discount policy rule.
5. Create commercial evaluation and submit approval request, then approve as Finance.
6. Navigate to `/audit` UI page. Verify events appear in chronological order with correct actor badges, entity tags, readable change summaries, and diff details.
7. Test search, entity filter, event type filter, and date filters on `/audit`.
8. Attempt HTTP POST/PATCH/DELETE to `/api/v1/audit` and verify 404/405.
9. Log in as `rep@dealflow.com` (Sales Rep) and attempt accessing `/audit` API/UI. Verify 403 access denied.
