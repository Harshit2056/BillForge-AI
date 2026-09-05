import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Sparkles,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/authContext';

export const Sidebar = () => {
  const { user, shop, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'POS / New Bill', path: '/pos', icon: ShoppingCart },
    { label: 'Invoices', path: '/invoices', icon: Receipt },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'AI Hub', path: '/ai-hub', icon: Sparkles, badge: 'Gemini 2.5' },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Top Section: Brand & Shop info */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center flex-shrink-0 items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            BF
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight">BillForge</h1>
            <p className="text-xs text-indigo-400 font-medium">Multi-Tenant AI SaaS</p>
          </div>
        </div>

        {/* Current Active Shop Badge */}
        {shop && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{shop.shopName}</p>
                <p className="text-[10px] text-slate-400 font-mono uppercase truncate">{shop.taxId || 'TAX-ID: N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-slate-200 text-sm flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role || 'Owner'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
