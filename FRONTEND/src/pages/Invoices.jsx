import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { invoiceService } from '../services/invoice.service';
import { useToast } from '../context/ToastContext';
import { Search, Download, Eye, Receipt, Calendar, FileText, Loader2 } from 'lucide-react';

export const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const toast = useToast();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getInvoices({ page: 1, limit: 50 });
      if (res?.data?.docs) {
        setInvoices(res.data.docs);
      }
    } catch (err) {
      toast.error('Failed to load invoice history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inv.paymentMode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Invoices & Transactions">
      <div className="space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div>
            <h3 className="text-base font-bold text-white">Invoice History</h3>
            <p className="text-xs text-slate-400">View and download all customer billing records</p>
          </div>

          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-3.5 px-5">Invoice Number</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Payment Mode</th>
                  <th className="py-3.5 px-5">Grand Total</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                      <span className="text-xs font-medium">Fetching invoices...</span>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-indigo-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-200">
                        {inv.customer?.name || 'Walk-in Customer'}
                        {inv.customer?.phone && (
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {inv.customer.phone}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-400">
                        {new Date(inv.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {inv.paymentMode}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-extrabold text-white">
                        ₹{inv.grandTotal?.toLocaleString()}
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                          {inv.paymentStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => invoiceService.downloadPDF(inv._id)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
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

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Invoice Details</h3>
                <p className="text-xs text-indigo-400 font-mono">#{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {/* Customer & Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                  Customer Information
                </span>
                <p className="text-slate-200 font-medium mt-0.5">
                  {selectedInvoice.customer?.name || 'Walk-in Customer'}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">{selectedInvoice.customer?.phone}</p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                  Transaction Meta
                </span>
                <p className="text-slate-200 font-medium mt-0.5">
                  Payment: {selectedInvoice.paymentMode}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Date: {new Date(selectedInvoice.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Purchased Items</h4>
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 divide-y divide-slate-800 overflow-hidden text-xs">
                {selectedInvoice.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-500">
                        ₹{item.unitPrice} x {item.quantity} (Tax: {item.taxRate || 0}%)
                      </p>
                    </div>
                    <span className="font-extrabold text-white">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{selectedInvoice.subTotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax Total</span>
                <span>₹{selectedInvoice.taxTotal}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white border-t border-slate-800 pt-2">
                <span>Grand Total</span>
                <span className="text-emerald-400">₹{selectedInvoice.grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => invoiceService.downloadPDF(selectedInvoice._id)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Invoice</span>
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
