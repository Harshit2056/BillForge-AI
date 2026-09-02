import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { invoiceService } from '../services/invoice.service';
import { productService } from '../services/product.service';
import { aiService } from '../services/ai.service';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  Receipt,
  AlertTriangle,
  Package,
  ShoppingCart,
  Sparkles,
  ArrowUpRight,
  Download,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard = () => {
  const { shop } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch sales analytics
      const analyticsRes = await invoiceService.getAnalytics();
      if (analyticsRes?.data) {
        setAnalytics(analyticsRes.data);
      }

      // 2. Fetch recent invoices
      const invoicesRes = await invoiceService.getInvoices({ page: 1, limit: 5 });
      if (invoicesRes?.data?.docs) {
        setRecentInvoices(invoicesRes.data.docs);
      }

      // 3. Fetch products to detect low stock
      const productsRes = await productService.getProducts({ limit: 50 });
      if (productsRes?.data?.docs) {
        const lowStock = productsRes.data.docs.filter(
          (p) => p.stockQuantity <= p.lowStockThreshold
        );
        setLowStockProducts(lowStock);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mock trend data for visualization if analytics data is loading/empty
  const chartData = analytics?.dailySales || [
    { name: 'Mon', revenue: 1200 },
    { name: 'Tue', revenue: 1900 },
    { name: 'Wed', revenue: 1500 },
    { name: 'Thu', revenue: 2800 },
    { name: 'Fri', revenue: 3200 },
    { name: 'Sat', revenue: 4100 },
    { name: 'Sun', revenue: 3700 },
  ];

  return (
    <AppLayout title="Business Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Welcome back, {shop?.shopName || 'Shop Manager'} 👋
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Here is what is happening across your shop's inventory, sales, and AI forecasts today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
              title="Refresh Data"
            >
           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => navigate('/pos')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open POS</span>
            </button>

            <button
              onClick={() => navigate('/ai-hub')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Hub</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white">
                ₹{analytics?.totalRevenue ? analytics.totalRevenue.toLocaleString() : '0'}
              </span>
              <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Updated in real-time</span>
              </div>
            </div>
          </div>

          {/* Invoices Count */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoices Issued</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white">
                {analytics?.totalInvoices || recentInvoices.length || 0}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Completed customer bills</p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white">{lowStockProducts.length}</span>
              <p className="text-xs text-amber-400 mt-1 font-medium">Items near run-out threshold</p>
            </div>
          </div>

          {/* Active Catalog */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Catalog</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white">
                {analytics?.totalProducts || 'Active'}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Available for POS billing</p>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart & Low Stock Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Sales & Revenue Trend</h3>
                <p className="text-xs text-slate-400">Weekly breakdown of shop earnings</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" textAnchor="end" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Items Panel */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Low Stock Warnings
                </h3>
                <button
                  onClick={() => navigate('/inventory')}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  View All
                </button>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  All inventory stock levels are healthy!
                </div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {lowStockProducts.map((prod) => (
                    <div
                      key={prod._id}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-200">{prod.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-400">{prod.stockQuantity} Left</span>
                        <p className="text-[10px] text-slate-500">Min: {prod.lowStockThreshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/ai-hub')}
              className="w-full mt-4 py-2.5 px-3 bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Run AI Stock Run-Out Forecast</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Recent Invoices</h3>
              <p className="text-xs text-slate-400">Latest completed customer checkout transactions</p>
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View Invoice History →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No invoices recorded yet. Open POS to issue your first bill!
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {inv.customer?.name || 'Walk-in Customer'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {inv.paymentMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        ₹{inv.grandTotal?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => invoiceService.downloadPDF(inv._id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
