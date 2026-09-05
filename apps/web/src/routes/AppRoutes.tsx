import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { LoginForm } from '../features/auth/LoginForm.js';
import { SignupForm } from '../features/auth/SignupForm.js';
import { ProfileView } from '../features/auth/ProfileView.js';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { HomePage } from '../features/dashboard/HomePage.js';
import { QuotationViewPage } from '../features/quotes/QuotationViewPage.js';
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
        path="/app/quotes/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QuotationViewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/quotes"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QuotationViewPage />
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
      
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
};

