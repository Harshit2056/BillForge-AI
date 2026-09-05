import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { invoiceService } from '../services/invoice.service';
import { useToast } from '../context/ToastContext';
import { BarChart3, TrendingUp, DollarSign, CreditCard, PieChart, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await invoiceService.getAnalytics();
        if (res?.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        toast.error('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const paymentModesData =
    (analytics?.paymentMethodBreakdown && analytics.paymentMethodBreakdown.length > 0)
      ? analytics.paymentMethodBreakdown.map((item) => ({
          name: item._id,
          value: item.totalAmount,
        }))
      : [
          { name: 'Cash', value: 45 },
          { name: 'Card', value: 25 },
          { name: 'UPI', value: 20 },
          { name: 'Credit', value: 10 },
        ];

  const totalRev = analytics?.summary?.totalRevenue ?? analytics?.totalRevenue ?? 0;
  const totalInv = analytics?.summary?.totalInvoices ?? analytics?.totalInvoices ?? 0;
  const avgTicket = analytics?.summary?.avgOrderValue ?? (totalInv > 0 ? Math.round(totalRev / totalInv) : 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <AppLayout title="Sales & Revenue Analytics">
      <div className="space-y-6">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white">Financial & Sales Metrics</h3>
          <p className="text-xs text-slate-400">Comprehensive overview of revenue streams and payment breakdowns</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
            <span className="text-xs font-medium">Computing revenue metrics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Mode Distribution */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
              <h4 className="font-bold text-white text-sm mb-4">Payment Method Breakdown</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={paymentModesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentModesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#334155' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {paymentModesData.map((mode, idx) => (
                  <div key={mode.name} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="w-2.5 h-2.5 rounded-full inline-block mr-1.5" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-xs font-bold text-slate-200">{mode.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Insights */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm mb-3">Key Performance Highlights</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Total Gross Sales</span>
                    <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                      ₹{totalRev.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Average Ticket Size</span>
                    <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">
                      ₹{avgTicket.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
