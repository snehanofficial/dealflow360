import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { LoginForm } from '../features/auth/LoginForm.js';
import { SignupForm } from '../features/auth/SignupForm.js';
import { ProfileView } from '../features/auth/ProfileView.js';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
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
import { CustomerPortalPage } from '../features/portal/CustomerPortalPage.js';
import { FulfillmentAllocationPage } from '../features/fulfillment/FulfillmentAllocationPage.js';
import { BillingSchedulePage } from '../features/billing/BillingSchedulePage.js';
import { ControlTowerPage } from '../features/control-tower/ControlTowerPage.js';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/portal/quotes/:token" element={<CustomerPortalPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HomePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QuoteListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotations/new"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QuoteBuilderPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotations/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QuotationViewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotations/:id/fulfillment"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FulfillmentAllocationPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fulfillment"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FulfillmentAllocationPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotations/:id/billing"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BillingSchedulePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BillingSchedulePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfileView />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CustomerListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/price-lists"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PriceListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/price-lists/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PriceListDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/discount-policies"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DiscountPolicyListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/control-tower"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ControlTowerPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ApprovalInboxPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/approvals/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ApprovalDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/discount-policy" element={<Navigate to="/discount-policies" replace />} />
      <Route bg-path="/governance/discount-policies" element={<Navigate to="/discount-policies" replace />} />
      <Route path="/pricelists" element={<Navigate to="/price-lists" replace />} />
      
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
};
