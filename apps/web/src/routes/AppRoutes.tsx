import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { LoginForm } from '../features/auth/LoginForm.js';
import { SignupForm } from '../features/auth/SignupForm.js';
import { ProfileView } from '../features/auth/ProfileView.js';
import { Navbar } from '../components/ui/Navbar.js';
import { Card, CardHeader, CardBody } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { ShieldCheck, Layers, Users, ShoppingCart, Truck, CreditCard, Activity, Loader2 } from 'lucide-react';

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

const DashboardShell: React.FC = () => {
  const { user, role, permissions } = useAuth();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Badge variant="purple" size="sm">
              Phase 0 — Shared Foundation Active
            </Badge>
            <span className="text-xs text-slate-400 font-mono">v0.1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            DealFlow360 Commercial Governance Platform — Authenticated Workspace Shell
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80">
          <div className="w-10 h-10 rounded-full bg-[#714B67] flex items-center justify-center font-bold text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Assigned Role</div>
            <div className="text-sm font-bold text-white">{role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Developer A — Governance & Quotation Scope"
            subtitle="Customer, Catalog, Pricing/Margin, Risk & Approval Engine"
            action={<Badge variant="info">Developer A</Badge>}
          />
          <CardBody className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-slate-800">Customer & Product Catalog</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-slate-800">Quotation Workspace & Pricing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-slate-800">Discount Governance & Risk Matrix</span>
            </div>
            <p className="text-slate-500 pt-2 border-t border-slate-100 italic">
              Ready for Phase 1 vertical implementation using shared auth context.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Developer B — Operations & Portal Scope"
            subtitle="Upsell, Fulfillment, Hybrid Billing, Portal & Control Tower"
            action={<Badge variant="purple">Developer B</Badge>}
          />
          <CardBody className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#714B67]" />
              <span className="font-semibold text-slate-800">Multi-Warehouse Fulfillment</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#714B67]" />
              <span className="font-semibold text-slate-800">Subscription & Hybrid Billing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#714B67]" />
              <span className="font-semibold text-slate-800">Customer Negotiation Portal & Control Tower</span>
            </div>
            <p className="text-slate-500 pt-2 border-t border-slate-100 italic">
              Ready for Phase 1 vertical implementation using shared auth context.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Current Session Permissions" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {permissions.map((perm) => (
              <Badge key={perm} variant="default" size="sm">
                {perm}
              </Badge>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardShell />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>
    </div>
  );
};
