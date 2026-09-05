import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'SALES',
      items: [
        { name: 'Opportunities', icon: Briefcase, path: '#' },
        { name: 'Quotations', icon: FileText, path: '/app' },
        { name: 'Customers', icon: Users, path: '#' },
        { name: 'Products', icon: Box, path: '#' },
        { name: 'Price Lists', icon: Tag, path: '#' },
      ]
    },
    {
      title: 'RISK & APPROVALS',
      items: [
        { name: 'Risk Analysis', icon: ShieldAlert, path: '#' },
        { name: 'Approvals', icon: CheckSquare, path: '#', badge: 3 },
        { name: 'Policies', icon: ShieldCheck, path: '#' },
      ]
    },
    {
      title: 'FULFILLMENT',
      items: [
        { name: 'Orders', icon: ShoppingCart, path: '#' },
        { name: 'Inventory', icon: Package, path: '#' },
        { name: 'Deliveries', icon: Truck, path: '#' },
      ]
    },
    {
      title: 'BILLING',
      items: [
        { name: 'Invoices', icon: FileSpreadsheet, path: '#' },
        { name: 'Payments', icon: CreditCard, path: '#' },
        { name: 'Credit Control', icon: Activity, path: '#' },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { name: 'Analytics', icon: BarChart2, path: '#' },
        { name: 'Reports', icon: PieChart, path: '#' },
        { name: 'Control Tower', icon: LayoutDashboard, path: '#' },
      ]
    }
  ];

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
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-[#F3E9F1] text-[#714B67]"
            >
              <Home className="w-4 h-4 mr-3" />
              Home
            </Link>
          </div>

          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 tracking-wider mb-2">{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-4 h-4 mr-3 text-slate-400" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
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
              <button className="flex items-center space-x-2 text-sm focus:outline-none">
                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-xs">
                  {user?.name?.substring(0, 2).toUpperCase() || 'JD'}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-semibold text-slate-700 leading-tight">{user?.name || 'John Doe'}</span>
                  <span className="text-[10px] text-slate-500 leading-tight">Acme Corporation</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
              </button>
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
