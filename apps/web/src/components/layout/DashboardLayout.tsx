import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.js';
import { 
  Search, Bell, HelpCircle, Settings, LogOut, ChevronDown, 
  Home, Briefcase, FileText, Users, Box, Tag, 
  ShieldAlert, CheckSquare, ShieldCheck, 
  ShoppingCart, Package, Truck, 
  FileSpreadsheet, CreditCard, Activity, 
  BarChart2, PieChart, LayoutDashboard, Menu, X
} from 'lucide-react';
import { Badge } from '../ui/Badge.js';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    FINANCE: 'warning',
    CUSTOMER: 'default',
  };

  interface NavItem {
    name: string;
    icon: React.ElementType;
    path: string;
    badge?: number;
    allowedRoles?: string[];
  }

  interface NavGroup {
    title: string;
    allowedRoles?: string[];
    items: NavItem[];
  }

  const rawNavGroups: NavGroup[] = [
    {
      title: 'SALES',
      allowedRoles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS', 'FINANCE'],
      items: [
        { name: 'Quotations', icon: FileText, path: '/quotations', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS', 'FINANCE'] },
        { name: 'Customers', icon: Users, path: '/customers', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS', 'FINANCE'] },
        { name: 'Products', icon: Box, path: '/products', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP'] },
        { name: 'Price Lists', icon: Tag, path: '/price-lists', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS', 'FINANCE'] },
      ]
    },

    {
      title: 'RISK & APPROVALS',
      allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'],
      items: [
        { name: 'Approvals', icon: CheckSquare, path: '/approvals', badge: 3, allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'] },
        { name: 'Risk Analysis', icon: ShieldAlert, path: '/risk-analysis', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'] },
        { name: 'Policies', icon: ShieldCheck, path: '/policies', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'] },
      ]
    },
    {
      title: 'FULFILLMENT',
      allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE', 'SALES_REP'],
      items: [
        { name: 'Orders', icon: ShoppingCart, path: '/orders', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE', 'SALES_REP'] },
        { name: 'Inventory', icon: Package, path: '/inventory', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'] },
        { name: 'Deliveries', icon: Truck, path: '/deliveries', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'] },
      ]
    },
    {
      title: 'BILLING',
      allowedRoles: ['ADMIN', 'FINANCE_OPERATIONS', 'FINANCE', 'SALES_MANAGER'],
      items: [
        { name: 'Invoices', icon: FileSpreadsheet, path: '/invoices', allowedRoles: ['ADMIN', 'FINANCE_OPERATIONS', 'FINANCE', 'SALES_MANAGER'] },
        { name: 'Payments', icon: CreditCard, path: '/payments', allowedRoles: ['ADMIN', 'FINANCE_OPERATIONS', 'FINANCE'] },
        { name: 'Credit Control', icon: Activity, path: '/credit-control', allowedRoles: ['ADMIN', 'FINANCE_OPERATIONS', 'FINANCE'] },
      ]
    },
    {
      title: 'CUSTOMER PORTAL',
      allowedRoles: ['CUSTOMER', 'ADMIN'],
      items: [
        { name: 'My Quotations', icon: FileText, path: '/portal', allowedRoles: ['CUSTOMER', 'ADMIN'] },
      ]
    },
    {
      title: 'INSIGHTS',
      allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'],
      items: [
        { name: 'Control Tower', icon: LayoutDashboard, path: '/control-tower', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'] },
        { name: 'Analytics', icon: BarChart2, path: '/analytics', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'] },
        { name: 'Audit History', icon: PieChart, path: '/audit-trail', allowedRoles: ['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'FINANCE'] },
      ]
    }
  ];

  // Filter groups and items based on current RBAC role
  const userRole = role || 'SALES_REP';
  const filteredNavGroups = rawNavGroups
    .filter(group => !group.allowedRoles || group.allowedRoles.includes(userRole))
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.allowedRoles || item.allowedRoles.includes(userRole))
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 transform transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link to="/app" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-[#714B67] flex items-center justify-center text-white shadow-sm">
              <LayersIcon />
            </div>
            <div className="flex flex-col">
               <span className="font-bold text-xl leading-tight text-slate-900 tracking-tight">DealFlow<span className="text-[#714B67]">360</span></span>
               <span className="text-[9px] text-slate-500 font-medium">From Quote to Cash. In Control.</span>
            </div>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          <div>
            <Link 
              to="/app" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === '/app' || location.pathname === '/'
                  ? 'bg-[#F3E9F1] text-[#714B67]'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 mr-3" />
              Home
            </Link>
          </div>

          {filteredNavGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 tracking-wider mb-2">{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-[#F3E9F1] text-[#714B67]'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-[#714B67]' : 'text-slate-400'}`} />
                        {item.name}
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* User profile / Logout bottom */}
        <div className="p-4 border-t border-slate-200">
           <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900">
             <LogOut className="w-4 h-4 mr-3 text-slate-400" />
             Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="relative w-full max-w-2xl min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-9 sm:pl-10 pr-8 sm:pr-12 py-2 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] text-xs sm:text-sm transition-colors"
              />
              <div className="absolute inset-y-0 right-0 hidden sm:flex items-center pr-3">
                <span className="text-slate-400 sm:text-sm border border-slate-200 rounded px-1.5 bg-white text-xs font-mono">⌘ K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <button className="text-slate-400 hover:text-slate-500 relative p-1">
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white">
                <span className="text-[8px] absolute inset-0 flex items-center justify-center font-bold">5</span>
              </span>
            </button>
            <button className="text-slate-400 hover:text-slate-500 hidden sm:block p-1">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="text-slate-400 hover:text-slate-500 hidden sm:block p-1">
              <Settings className="h-5 w-5" />
            </button>

            <div className="pl-2 sm:pl-4 border-l border-slate-200 flex items-center">
              <div className="flex items-center space-x-2.5 text-sm">
                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-xs">
                  {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-semibold text-slate-700 leading-tight">{user?.name || 'User'}</span>
                  <Badge variant={roleVariantMap[userRole] || 'default'} size="sm" className="mt-0.5 text-[9px] px-1.5 py-0">
                    {userRole.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1920px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function LayersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 12 12 17 22 12"/>
      <polyline points="2 17 12 22 22 17"/>
    </svg>
  );
}
