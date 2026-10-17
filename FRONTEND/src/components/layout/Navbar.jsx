import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Sparkles, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ title = 'Dashboard' }) => {
  const { shop } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Page Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
      </div>

      {/* Right Side Quick Actions & Widgets */}
      <div className="flex items-center gap-4">
        {/* Quick Action Buttons */}
        <button
          onClick={() => navigate('/pos')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all duration-150"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Quick POS</span>
        </button>

        <button
          onClick={() => navigate('/ai-hub')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all duration-150"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AI Receipt OCR</span>
        </button>

        {/* Tenant/Shop Tag */}
        {shop && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-slate-400 text-[11px]">{shop.slug}</span>
          </div>
        )}
      </div>
    </header>
  );
};
