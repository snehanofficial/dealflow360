# DealFlow360 — Customer Portal Dashboard Implementation Spec (/portal)

## Goal
Implement `/portal` as the actual dedicated Customer Portal/Dashboard entry point for authenticated CUSTOMER users in DealFlow360. Eliminate the automatic redirect from `/portal` → `/quotations`, while preserving internal-user dashboards (`ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`) and maintaining strict commercial security and server-authoritative data scoping.

---

## Relevant Skills & Docs Read
- `AGENTS.md` (Product Principles, Architecture Boundaries, UI Rules, Display Adaptability)
- `skills/frontend/SKILL.md` (Design tokens, component state, responsiveness)
- `skills/domain/SKILL.md` (Commercial rules, customer role permissions)
- `docs/business-rules.md` (Customer portal negotiation & data isolation)

---

## Code & Config Inspected
- `apps/web/src/routes/AppRoutes.tsx` (Route definitions & `/portal` redirect logic)
- `apps/web/src/components/layout/DashboardLayout.tsx` (Sidebar & topbar navigation, role filtering)
- `apps/web/src/features/dashboard/HomePage.tsx` (Current dashboard view)
- `apps/web/src/features/portal/CustomerPortalPage.tsx` (Token-based quotation review page)
- `apps/api/src/modules/dashboard/dashboardService.ts` (`getCustomerDashboard` backend projection)
- `apps/api/src/__tests__/customerPortalAuth.test.ts` (Customer authentication & scope integration tests)

---

## Key Decisions & Assumptions
1. **/portal is a dedicated page**: Renders `<CustomerPortalDashboardPage />` wrapped in `<ProtectedRoute>` and `<DashboardLayout>`.
2. **Backend Engine Reuse**: Reuses `GET /api/v1/dashboard` via the existing `useDashboard()` hook without creating secondary endpoints or client-side calculation hacks.
3. **Role-Aware Landing Navigation**:
   - For `CUSTOMER` role: Post-login landing page and Home nav target is `/portal`. If a customer visits `/app`, `HomePage.tsx` will render `<CustomerPortalDashboardPage />` or navigate to `/portal`.
   - For internal roles (`ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`): Visiting `/app` continues rendering their existing internal executive dashboards.
4. **Dedicated Customer Sidebar**:
   - Sidebar for `CUSTOMER` shows ONLY:
     - Portal Overview (`/portal`)
     - Quotations (`/quotations`)
     - Invoices (`/invoices`)
   - Excludes all internal options (`Create Quotation`, `Customers`, `Products`, `Price Lists`, `Discount Policies`, `Approvals`, `Audit Trail`, `Control Tower`, `Warehouse Kanban`, `Inventory Stock`).
5. **Customer-Facing UI Character**:
   - Displays clear executive summary cards for customer quotes, total quotation value, active orders, and issued invoices.
   - Excludes standard costs, gross margin percentages, risk scores, internal approval thresholds, and internal audit streams.

---

## Expected Files to Change
1. `prompts/customer-portal-dashboard-fix.md` [NEW]
2. `apps/web/src/features/portal/CustomerPortalDashboardPage.tsx` [NEW]
3. `apps/web/src/routes/AppRoutes.tsx` [MODIFY]
4. `apps/web/src/features/dashboard/HomePage.tsx` [MODIFY]
5. `apps/web/src/components/layout/DashboardLayout.tsx` [MODIFY]
6. `apps/api/src/__tests__/customerPortalAuth.test.ts` [MODIFY]

---

## Acceptance Criteria
1. Navigating to `/portal` as an authenticated CUSTOMER loads the dedicated Customer Portal Overview page and does NOT redirect to `/quotations`.
2. Logging in as a CUSTOMER lands the user on `/portal`.
3. Clicking the logo or "Home" link as a CUSTOMER navigates to `/portal`.
4. `/portal` displays real backend data fetched from `GET /api/v1/dashboard` (KPIs, active alerts, recent quotations, recent invoices).
5. All internal fields (`standardCost`, gross profit, margin %, risk level scores, internal approval requirements) remain completely hidden on `/portal`.
6. Internal dashboards (`ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`) remain 100% functional without breakage.
7. Customer sidebar presents only customer-authorized routes (`Portal Overview`, `Quotations`, `Invoices`).
8. `pnpm typecheck`, `pnpm test`, and `pnpm build` pass cleanly with 0 errors.

---

## Verification Plan & Manual Test Steps
1. **Automated Checks**:
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
2. **Manual Test Steps**:
   - Log in as `customer@dealflow360.com` (`Password123!`).
   - Verify post-login landing URL is `/portal`.
   - Verify page renders "Acme Enterprise Solutions Workspace" with KPI cards ("My Quotations", "Total Quotation Value", "Counteroffers Awaiting Action", "Active Orders", "My Invoices").
   - Verify sidebar displays: `Portal Overview` (`/portal`), `Quotations` (`/quotations`), and `Invoices` (`/invoices`), with no internal governance links.
   - Click "Quotations" in sidebar; verify navigation to `/quotations`.
   - Click "Portal Overview" or logo; verify navigation back to `/portal`.
   - Log in as `manager@dealflow360.com` or `admin@dealflow360.com`; verify internal dashboard at `/app` continues rendering pipeline charts, risk breakdowns, and approval inbox items.
