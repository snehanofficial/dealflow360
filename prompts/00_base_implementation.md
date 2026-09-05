# Implementation Prompt - Phase 0: Base Implementation & Authentication Foundation

## 1. Goal
Establish the shared technical foundation and authentication infrastructure for DealFlow360 before Developer A and Developer B begin vertical feature implementation. This includes monorepo scaffold verification, database schema for auth/users, JWT + HttpOnly refresh cookie authentication, Argon2id password hashing, permission-based RBAC, centralized Axios client with refresh handling, responsive application shell UI, shared design tokens/primitives, API error/loading/notification handling, development seed users, and base tests.

---

## 2. Relevant Skills Read
- `skills/domain/SKILL.md` - Domain engine boundaries & pure TypeScript business layer rules.
- `skills/frontend/SKILL.md` - Visual guidelines, Odoo-inspired light professional UI design tokens, components, state management.
- `skills/prisma/SKILL.md` - Prisma 7 schema management, migrations, client configuration, and PostgreSQL safety.
- `skills/testing/SKILL.md` - Vitest unit, API integration, and auth workflow testing.

---

## 3. Code & Config Inspected
- `AGENTS.md`, `DESIGN.md`, `TASKS.md`, `README.md`, `package.json`, `pnpm-workspace.yaml`.
- `docs/00_BASE_IMPLEMENTATION.md`, `docs/03_ROLES_PERMISSIONS_AND_FLOWS.md`, `docs/06_API_CONTRACT.md`, `docs/architecture.md`, `docs/domain-model.md`, `docs/api-contracts.md`.
- `apps/api/src/app.ts`, `apps/web/src/app/App.tsx`, `packages/db/prisma/schema.prisma`, `packages/contracts/src/auth/index.ts`.

---

## 4. Decisions & Assumptions
1. **Modular Monolith**: Auth code belongs strictly in `apps/api/src/auth`, `packages/contracts/src/auth`, `packages/db/prisma/schema.prisma`, and `apps/web/src/features/auth`.
2. **Auth Security Model**:
   - Access tokens: Short-lived JWT (15 min) sent via `Authorization: Bearer <token>` header. Contains minimal claims (`sub`, `email`, `role`, `iat`, `exp`).
   - Refresh tokens: Stored in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie. Token rotation on use + database `RefreshSession` table tracking for revocation.
   - Password Hashing: `argon2` (Argon2id).
3. **RBAC Roles**: `ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`, `CUSTOMER`. Permission checks are evaluated server-side (`quotation.create`, `approval.action`, `fulfillment.view`, etc.).
4. **No Premature Business Logic**: Phase 0 includes NO customer, product, quote, risk engine, approval, fulfillment, billing, or deal health business logic.

---

## 5. Expected Files to Change / Create

### Database (`packages/db/`)
- `prisma/schema.prisma` - Add `User`, `RefreshSession`, `Role` enum, and password hash fields.
- `prisma/seed.ts` - Seed default users for each role (`admin@dealflow360.com`, `sales.manager@dealflow360.com`, `sales.rep@dealflow360.com`, `finance@dealflow360.com`, `customer@dealflow360.com`).

### Shared Contracts (`packages/contracts/`)
- `src/auth/index.ts` - Zod schemas & types for Signup, Login, Refresh, Logout, and User/Me responses.

### Backend API (`apps/api/`)
- `src/config/env.ts` - Environment variables configuration (JWT secrets, DB URL, CORS).
- `src/auth/token.ts` - JWT generation, verification, refresh cookie options.
- `src/auth/password.ts` - Argon2id password hashing and verification.
- `src/middleware/auth.ts` - Bearer token authentication & permission/role authorization middleware.
- `src/controllers/authController.ts` - Signup, Login, Refresh, Logout, Me endpoints.
- `src/services/authService.ts` - User creation, authentication logic, refresh rotation.
- `src/repositories/userRepository.ts` - User persistence operations via Prisma.
- `src/routes/authRoutes.ts` - Express route bindings for `/api/v1/auth/*`.
- `src/app.ts` - Register auth routes, error handling middleware.

### Frontend Presentation (`apps/web/`)
- `src/styles/index.css` - Design system CSS custom properties & utility classes based on `DESIGN.md`.
- `src/lib/api/client.ts` - Centralized Axios instance with Bearer token injection & automatic 401 refresh interceptor.
- `src/features/auth/AuthContext.tsx` - Auth state provider (login, signup, logout, refresh session initialization).
- `src/components/ui/` - Reusable UI primitives (Button, Input, Badge, Alert, Card, Navbar).
- `src/routes/AppRoutes.tsx` - Protected routes & Public/Auth routing logic.
- `src/app/App.tsx` - Root application wrapper with QueryClientProvider & AuthProvider.
- `src/features/auth/LoginForm.tsx`, `src/features/auth/SignupForm.tsx` - Auth forms with React Hook Form & Zod validation.
- `src/features/auth/ProfileView.tsx` - Authenticated profile & role/permissions dashboard.

### Tests (`apps/api/src/auth/__tests__/`, `apps/web/src/`)
- Integration tests for auth signup, login, refresh, me, logout, and protected route RBAC middleware.

---

## 6. Requirements & Scope
- Implement working `/api/v1/auth/signup`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/auth/me`.
- Implement responsive layout with navigation header, user profile dropdown, role badge, and logout.
- Enforce strict server-side permission checks.
- Zero mock auth or hardcoded user checks.

---

## 7. Security Considerations
- Refresh token must never be exposed to frontend JavaScript or returned in API body.
- Prevent infinite refresh loops in Axios interceptor.
- Argon2id for password hashing.
- Standardized security headers (`helmet`) & CORS credentials.

---

## 8. Domain & Business-Rule Considerations
- Role permissions are derived according to `03_ROLES_PERMISSIONS_AND_FLOWS.md`.
- Auth foundation is ready for Developer A (Quote/Pricing/Approvals) and Developer B (Fulfillment/Billing/Portal) without modification.

---

## 9. Acceptance Criteria
1. Signup creates user with hashed password and default role.
2. Login verifies credentials, issues access JWT in response, sets HttpOnly cookie for refresh token.
3. Accessing `/api/v1/auth/me` with Bearer token returns current user and permission list.
4. Calling `/api/v1/auth/refresh` rotates refresh token and issues new access token.
5. Logout revokes refresh session and clears cookie.
6. Web frontend supports Login, Signup, Session persistence on reload, Protected Route redirect, Role display, and Logout.
7. Automated Vitest suite passes for auth endpoints & middleware.

---

## 10. Checks to Run
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

---

## 11. Exact Manual Verification Steps
1. Start API and Web servers (`pnpm dev`).
2. Open web app in browser at `http://localhost:5173`.
3. Submit Signup form with new user credentials.
4. Verify redirection to `/app` dashboard showing user profile and role.
5. Refresh browser tab; verify session is restored automatically via `/api/v1/auth/me` or `/api/v1/auth/refresh`.
6. Click Logout; verify cookie cleared and redirected to `/login`.
7. Attempt accessing `/app` directly while logged out; verify redirect to `/login`.
