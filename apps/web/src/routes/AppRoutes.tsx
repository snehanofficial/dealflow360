import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { LoginForm } from '../features/auth/LoginForm.js';
import { SignupForm } from '../features/auth/SignupForm.js';
import { ProfileView } from '../features/auth/ProfileView.js';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { RoleRoute, InternalRoute, CustomerRoute } from '../components/layout/RoleRoute.js';
import { ForbiddenPage, NotFoundPage, ErrorBoundary } from '../components/ui/ErrorPages.js';
import { HomePage } from '../features/dashboard/HomePage.js';
import { CustomerListPage } from '../features/customers/CustomerListPage.js';
import { QuoteListPage } from '../features/quotes/QuoteListPage.js';
import { QuoteBuilderPage } from '../features/quotes/QuoteBuilderPage.js';
import { ProductListPage } from '../features/products/ProductListPage.js';
import { PriceListPage } from '../features/pricelists/PriceListPage.js';
import { PriceListDetailPage } from '../features/pricelists/PriceListDetailPage.js';
import { QuotationViewPage } from '../features/quotes/QuotationViewPage.js';
import { DiscountPolicyListPage } from '../features/governance/DiscountPolicyListPage.js';
import { ApprovalInboxPage } from '../features/approvals/ApprovalInboxPage.js';
import { ApprovalDetailPage } from '../features/approvals/ApprovalDetailPage.js';
import { AuditTrailPage } from '../features/audit/AuditTrailPage.js';
import { CustomerPortalPage } from '../features/portal/CustomerPortalPage.js';
import { CustomerPortalDashboardPage } from '../features/portal/CustomerPortalDashboardPage.js';
import { FulfillmentAllocationPage } from '../features/fulfillment/FulfillmentAllocationPage.js';
import { BillingSchedulePage, InvoiceListPage, InvoiceDetailPage } from '../features/billing/index.js';
import { ControlTowerPage } from '../features/control-tower/ControlTowerPage.js';
import { WarehouseKanbanPage } from '../features/warehouse/WarehouseKanbanPage.js';
import { WarehouseManagementPage } from '../features/warehouse/WarehouseManagementPage.js';
import { InventoryDashboardPage } from '../features/inventory/InventoryDashboardPage.js';
import { BackordersPage } from '../features/inventory/BackordersPage.js';
import { AdminConfigPage } from '../features/admin/AdminConfigPage.js';
import { Loader2 } from 'lucide-react';

// ─── Role-aware catch-all ─────────────────────────────────────────────────
/**
 * Redirects unauthenticated → /login, CUSTOMER → /portal, internal roles → /app.
 * This ensures the * wildcard never silently drops anyone to /app.
 */
const RoleAwareFallback: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role === 'CUSTOMER') {
    return <Navigate to="/portal" replace />;
  }

  return <Navigate to="/app" replace />;
};

// ─── Root redirect ─────────────────────────────────────────────────────────
/**
 * / → /portal for CUSTOMER, /app for internal roles, /login for unauthenticated.
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={role === 'CUSTOMER' ? '/portal' : '/app'} replace />;
};

// ─── App Routes ────────────────────────────────────────────────────────────
export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* ── Customer portal (public token-based, no auth required) ── */}
        <Route path="/portal/quotes/:token" element={<CustomerPortalPage />} />

        {/* ── Customer-only: authenticated portal dashboard ── */}
        <Route
          path="/portal"
          element={
            <CustomerRoute>
              <DashboardLayout>
                <CustomerPortalDashboardPage />
              </DashboardLayout>
            </CustomerRoute>
          }
        />

        {/* ── Internal dashboard (all non-CUSTOMER roles) ── */}
        <Route
          path="/app"
          element={
            <InternalRoute>
              <DashboardLayout>
                <HomePage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/quotations"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS', 'CUSTOMER']}>
              <DashboardLayout>
                <QuoteListPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/quotations/new"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
              <DashboardLayout>
                <QuoteBuilderPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/quotations/:id"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS', 'CUSTOMER']}>
              <DashboardLayout>
                <QuotationViewPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/quotations/:id/fulfillment"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS']}>
              <DashboardLayout>
                <FulfillmentAllocationPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        {/* ── Fulfillment / Warehouse / Inventory ── */}
        <Route
          path="/fulfillment"
          element={
            <InternalRoute>
              <DashboardLayout>
                <WarehouseKanbanPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/warehouse"
          element={
            <InternalRoute>
              <DashboardLayout>
                <WarehouseKanbanPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/warehouses"
          element={
            <InternalRoute>
              <DashboardLayout>
                <WarehouseManagementPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <InternalRoute>
              <DashboardLayout>
                <InventoryDashboardPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/backorders"
          element={
            <InternalRoute>
              <DashboardLayout>
                <BackordersPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        {/* ── Billing / Invoices ── */}
        <Route
          path="/quotations/:id/billing"
          element={
            <InternalRoute>
              <DashboardLayout>
                <BillingSchedulePage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <InternalRoute>
              <DashboardLayout>
                <BillingSchedulePage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS', 'CUSTOMER']}>
              <DashboardLayout>
                <InvoiceListPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/invoices/:id"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS', 'CUSTOMER']}>
              <DashboardLayout>
                <InvoiceDetailPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        {/* ── Profile (any authenticated user) ── */}
        <Route
          path="/profile"
          element={
            <RoleRoute>
              <DashboardLayout>
                <ProfileView />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        {/* ── Customers & Products (internal only) ── */}
        <Route
          path="/customers"
          element={
            <InternalRoute>
              <DashboardLayout>
                <CustomerListPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/products"
          element={
            <InternalRoute>
              <DashboardLayout>
                <ProductListPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/price-lists"
          element={
            <InternalRoute>
              <DashboardLayout>
                <PriceListPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        <Route
          path="/price-lists/:id"
          element={
            <InternalRoute>
              <DashboardLayout>
                <PriceListDetailPage />
              </DashboardLayout>
            </InternalRoute>
          }
        />

        {/* ── Discount Governance (ADMIN, SALES_MANAGER, FINANCE_OPERATIONS) ── */}
        <Route
          path="/discount-policies"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS']}>
              <DashboardLayout>
                <DiscountPolicyListPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        {/* ── Control Tower (ADMIN, SALES_MANAGER, FINANCE_OPERATIONS) ── */}
        <Route
          path="/control-tower"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS']}>
              <DashboardLayout>
                <ControlTowerPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        {/* ── Approvals (ADMIN, SALES_MANAGER, FINANCE_OPERATIONS, SALES_REP) ── */}
        <Route
          path="/approvals"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'SALES_REP']}>
              <DashboardLayout>
                <ApprovalInboxPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/approvals/:id"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'SALES_REP']}>
              <DashboardLayout>
                <ApprovalDetailPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        {/* ── Audit Trail (ADMIN, SALES_MANAGER, FINANCE_OPERATIONS) ── */}
        <Route
          path="/audit"
          element={
            <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS']}>
              <DashboardLayout>
                <AuditTrailPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        {/* ── System Config (ADMIN only) ── */}
        <Route
          path="/admin/config"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <AdminConfigPage />
              </DashboardLayout>
            </RoleRoute>
          }
        />

        {/* ── Canonical redirects ── */}
        <Route path="/discount-policy" element={<Navigate to="/discount-policies" replace />} />
        <Route path="/governance/discount-policies" element={<Navigate to="/discount-policies" replace />} />
        <Route path="/pricelists" element={<Navigate to="/price-lists" replace />} />

        {/* ── 404 / catch-all ── */}
        <Route path="*" element={<RoleAwareFallback />} />
      </Routes>
    </ErrorBoundary>
  );
};
