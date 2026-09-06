import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.js';
import { Role, Permission } from '@dealflow360/contracts';
import { ForbiddenPage } from '../ui/ErrorPages.js';
import { Loader2 } from 'lucide-react';

interface RoleRouteProps {
  /**
   * The element to render if the user passes the authorization check.
   */
  children: React.ReactNode;

  /**
   * If provided, the user must have at least one of these roles.
   * Leave empty to allow any authenticated role.
   */
  allowedRoles?: readonly Role[];

  /**
   * If provided, the user must have at least one of these permissions.
   * Takes precedence over allowedRoles when both are supplied.
   */
  requiredPermissions?: readonly Permission[];

  /**
   * Where to redirect an unauthenticated user. Defaults to /login.
   */
  loginRedirect?: string;
}

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader2 className="w-8 h-8 animate-spin text-[#714B67]" />
  </div>
);

/**
 * RoleRoute wraps a route element and enforces:
 *   1. Authentication — unauthenticated users are redirected to /login.
 *   2. Role/permission authorization — forbidden users see ForbiddenPage (not a redirect to /app).
 *
 * This is the replacement for the bare ProtectedRoute which only checked isAuthenticated.
 */
export const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  loginRedirect = '/login',
}) => {
  const { isAuthenticated, isLoading, role, permissions } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 1. Must be authenticated
  if (!isAuthenticated) {
    return <Navigate to={loginRedirect} state={{ from: location }} replace />;
  }

  // 2. Permission check (takes precedence)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some((p) => permissions.includes(p));
    if (!hasPermission) {
      if (role === 'CUSTOMER') {
        return <Navigate to="/portal" replace />;
      }
      return <ForbiddenPage />;
    }
  }

  // 3. Role check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      if (role === 'CUSTOMER') {
        return <Navigate to="/portal" replace />;
      }
      return <ForbiddenPage />;
    }
  }

  return <>{children}</>;
};

/**
 * CustomerRoute — shorthand for a route that only CUSTOMER role can access.
 */
export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute allowedRoles={['CUSTOMER']}>{children}</RoleRoute>
);

/**
 * InternalRoute — shorthand for a route that any non-CUSTOMER, authenticated role can access.
 * Covers ADMIN, SALES_MANAGER, SALES_REP, FINANCE_OPERATIONS.
 */
export const InternalRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS']}>
    {children}
  </RoleRoute>
);
