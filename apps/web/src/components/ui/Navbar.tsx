import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.js';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { ShieldCheck, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleVariantMap: Record<
    string,
    'purple' | 'success' | 'warning' | 'info' | 'default' | 'danger'
  > = {
    ADMIN: 'danger',
    SALES_MANAGER: 'purple',
    SALES_REP: 'info',
    FINANCE_OPERATIONS: 'warning',
    CUSTOMER: 'default',
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-6">
            <Link to="/app" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded bg-[#714B67] flex items-center justify-center font-bold text-white shadow-xs group-hover:bg-[#5F3D56] transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-50 tracking-tight">
                DealFlow<span className="text-[#714B67]">360</span>
              </span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
                <Link
                  to="/app"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Workspace Shell
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Profile & Permissions
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{user.email}</div>
                </div>
                {role && (
                  <Badge variant={roleVariantMap[role] || 'default'} size="sm">
                    {role.replace('_', ' ')}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-300">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
