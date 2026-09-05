# DealFlow360 - Documentation Governance & Source-of-Truth Map

This document establishes the official governance hierarchy, ownership boundaries, and canonical relationships for all DealFlow360 documentation.

---

## 1. Documentation Authority Matrix

| Document | Authority Domain | Purpose & Scope | Must NOT Contain | Depends On | Owner | Update Trigger |
|---|---|---|---|---|---|---|
| `01_PROJECT_VISION.md` | Product Truth | Core vision, commercial governance philosophy, non-negotiable principles. | Implementation details, DB schemas, API endpoints. | Problem Statement | Product / Lead | Product direction change |
| `02_REQUIREMENTS_AND_SCOPE.md` | Product Truth | MVP boundaries, in-scope/out-of-scope features, acceptance criteria. | Low-level code, specific SQL tables. | `01_PROJECT_VISION.md` | Product / Lead | Scope adjustments |
| `03_ROLES_PERMISSIONS_AND_FLOWS.md` | Business Truth | RBAC roles (`ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`, `CUSTOMER`), permission matrices, state machines. | Framework-specific auth logic. | `02_REQUIREMENTS_AND_SCOPE.md` | Business Lead | Role/Permission changes |
| `05_BUSINESS_RULES.md` | Business Truth | Commercial engine rules (pricing, margin, policy, risk scoring matrix, approvals, fulfillment splitting, billing proration). | Controller HTTP routes, React components. | `03_ROLES_PERMISSIONS_AND_FLOWS.md` | Business Lead | Commercial policy updates |
| `06_API_CONTRACT.md` | Interface Truth | Full REST API endpoints, request/response formats, status codes, validation rules. | Internal SQL queries, React UI state. | `05_BUSINESS_RULES.md` | Tech Lead / Both Devs | API route/payload changes |
| `07_FEATURE_MODULES.md` | Architecture Truth | System module breakdown across monorepo packages, cross-module rules. | Unrelated CRM features, temporary hack logic. | `architecture.md` | Tech Lead | Package/Module boundary changes |
| `08_DEVELOPER_A.md` | Execution Truth | Developer A ownership (Customer, Product Catalog, Discount Governance, Approvals, Audit) & phase plan. | Developer B implementation logic. | `06_API_CONTRACT.md`, `07_FEATURE_MODULES.md` | Developer A | Developer A progress |
| `09_DEVELOPER_B.md` | Execution Truth | Developer B ownership (Quotation, Portal, Fulfillment, Billing, Upsell, Control Tower) & phase plan. | Developer A implementation logic. | `06_API_CONTRACT.md`, `07_FEATURE_MODULES.md` | Developer B | Developer B progress |
| `developer-dependency-matrix.md` | Ownership Matrix | Matrix proving 100% independence of Developer A & B features, DB models, and API routes. | Code implementation details. | `08_DEVELOPER_A.md`, `09_DEVELOPER_B.md` | Tech Lead / Both Devs | Ownership adjustments |
| `parallel-development-plan.md` | Parallel Execution | Detailed stage-by-stage parallel execution strategy, contract freeze, and integration protocol. | Specific feature unit specs. | `developer-dependency-matrix.md` | Tech Lead / Both Devs | Phase changes |
| `shared-contracts.md` | Interface Contract | Frozen cross-developer interfaces (CustomerReference, ProductReference, CommercialEvaluation). | Low-level internal service classes. | `06_API_CONTRACT.md` | Tech Lead / Both Devs | Contract changes |
| `database-contract.md` | Persistence Contract | Prisma model ownership table and database safety rules. | Migration SQL details. | `packages/db/prisma/schema.prisma` | DB Owner / Both Devs | Schema changes |
| `00_BASE_IMPLEMENTATION.md` | Foundation Truth | Shared infrastructure phase plan (Auth, RBAC, Shell, API client, DB seed, base tests). | Vertical business module logic. | `03_ROLES_PERMISSIONS_AND_FLOWS.md`, `06_API_CONTRACT.md` | Base Owner (Dev 0) | Foundation changes |
| `11_ANTIGRAVITY_RULES.md` | Control Truth | AI agent operating rules, execution loop, prompt requirements, verification standards. | Product feature specs. | Project Rules | Lead / Agent | Operating rule changes |
| `architecture.md` | Architecture Ref | Concise summary of stack, layers, dependency rules, modular monolith design. | Volatile endpoint details. | `07_FEATURE_MODULES.md` | Tech Lead | Architectural shift |
| `domain-model.md` | Data Ref | Concise summary of primary entities, relations, persistence boundaries. | Low-level SQL migration scripts. | `05_BUSINESS_RULES.md`, `packages/db` | Database Owner | Schema changes |
| `business-rules.md` | Business Ref | Concise summary of core governance principles and calculation sequence. | Long verbose examples. | `05_BUSINESS_RULES.md` | Business Lead | Core rule updates |
| `api-contracts.md` | Interface Ref | Quick reference list of standard API endpoints and envelope formats. | Duplicate field-by-field payload docs. | `06_API_CONTRACT.md` | Tech Lead | Endpoint additions |
| `demo-script.md` | Demo Truth | Step-by-step judge demonstration flow proving end-to-end commercial governance. | Out-of-scope feature walkthroughs. | `01_PROJECT_VISION.md`, `TASKS.md` | Lead / Demo Owner | Demo flow adjustments |
| `DOCUMENTATION_AUDIT.md` | Audit Record | Record of doc inspection, conflicts found, duplications, and resolutions. | Active runtime specs. | All docs | AntiGravity Agent | Audit updates |
| `AGENTS.md` | System Governance | Primary operating manual for developers and AI agents in the repository. | Code-level implementations. | `11_ANTIGRAVITY_RULES.md` | Lead / Agent | System rule updates |


---

## 2. Shared Boundaries & Non-Negotiable Governance

1. **Authentication is Universal**: Auth is implemented strictly in `00_BASE_IMPLEMENTATION.md` (`apps/api/src/auth` and `apps/web/src/features/auth`). Neither Developer A nor Developer B may build custom auth mechanisms.
2. **Backend is Authoritative**: Frontend presentation (`apps/web`) displays calculations, but all pricing, margin, policy evaluation, risk scoring, approval requirements, inventory checks, and billing schedules are derived authoritatively by `packages/domain` and `apps/api`.
3. **State Machine Integrity**: Commercial quotes transition deterministically:
   `DRAFT → PENDING_MANAGER → PENDING_FINANCE → APPROVED → NEGOTIATING → FULFILLMENT → BILLING → COMPLETED`.
   Direct arbitrary status updates via API are forbidden.
4. **Governed Mutation Re-evaluation**: Any price, discount, quantity, or line item mutation forces full re-evaluation (`Pricing → Margin → Policy → Risk → Approvals`). Pre-existing approvals are superseded if commercial state changes.
