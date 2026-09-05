import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { productService } from '../services/product.service';
import { useToast } from '../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [paginationMeta, setPaginationMeta] = useState({
    totalDocs: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockAdjustmentModal, setStockAdjustmentModal] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    price: '',
    costPrice: '',
    taxRate: 0,
    stockQuantity: 0,
    lowStockThreshold: 5,
    unit: 'pcs',
  });

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchProducts = async (pageNumber = page, pageLimit = limit) => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        page: pageNumber,
        limit: pageLimit,
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });

      const responseData = res?.data?.data || res?.data?.result || res?.data || {};
      const docs = responseData.docs || (Array.isArray(responseData) ? responseData : []);

      setProducts(docs);
      setPaginationMeta({
        totalDocs: responseData.totalDocs || docs.length,
        totalPages: responseData.totalPages || 1,
        page: responseData.page || pageNumber,
        hasPrevPage: responseData.hasPrevPage || false,
        hasNextPage: responseData.hasNextPage || false,
      });
    } catch (err) {
      toast.error('Failed to fetch inventory catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, limit);
  }, [page, limit, selectedCategory, searchQuery]);

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'General',
      price: '',
      costPrice: '',
      taxRate: 0,
      stockQuantity: 0,
      lowStockThreshold: 5,
      unit: 'pcs',
    });
    setEditingProduct(null);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category || 'General',
      price: product.price,
      costPrice: product.costPrice || 0,
      taxRate: product.taxRate || 0,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold || 5,
      unit: product.unit || 'pcs',
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success('Product updated successfully!');
      } else {
        await productService.createProduct(formData);
        toast.success('New product added to inventory catalog!');
      }
      setShowAddModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockAdjustmentModal) return;
    try {
      await productService.adjustStock(stockAdjustmentModal._id, {
        quantity: Number(adjustAmount),
        adjustment: Number(adjustAmount),
      });
      toast.success(`Stock adjusted by ${adjustAmount} units.`);
      setStockAdjustmentModal(null);
      setAdjustAmount(0);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stock adjustment failed.');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      toast.success(`"${name}" deleted.`);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const categories = ['All', ...new Set(products.map((p) => p.category || 'General'))];
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <AppLayout title="Inventory & Stock Catalog">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div>
            <h3 className="text-base font-bold text-white">Product Catalog</h3>
            <p className="text-xs text-slate-400">Manage stock quantities, prices, and low-stock alerts</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">SKU</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Price</th>
                  <th className="py-3.5 px-5">Stock Level</th>
                  <th className="py-3.5 px-5">Tax Rate</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                      <span className="text-xs font-medium">Loading inventory...</span>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      No products found in catalog.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const isLowStock = prod.stockQuantity <= prod.lowStockThreshold;

                    return (
                      <tr key={prod._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-100">{prod.name}</p>
                          <p className="text-[10px] text-slate-500">Unit: {prod.unit || 'pcs'}</p>
                        </td>
                        <td className="py-4 px-5 font-mono text-xs font-semibold text-indigo-400">
                          {prod.sku}
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-300">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-semibold">
                            {prod.category || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-extrabold text-white">
                          ₹{prod.price}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                prod.stockQuantity <= 0
                                  ? 'text-rose-400'
                                  : isLowStock
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {prod.stockQuantity} {prod.unit || 'pcs'}
                            </span>

                            {isLowStock && (
                              <span title="Low stock warning">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-400">
                          {prod.taxRate ? `${prod.taxRate}%` : '0%'}
                        </td>
                        <td className="py-4 px-5 text-right space-x-1">
                          <button
                            onClick={() => {
                              setStockAdjustmentModal(prod);
                              setAdjustAmount(0);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Quick Stock Adjust"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod._id, prod.name)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-400">
              <span>
                Showing <strong className="text-white">{products.length}</strong> of{' '}
                <strong className="text-white">{paginationMeta.totalDocs}</strong> products
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Page <strong className="text-white">{page}</strong> of{' '}
                <strong className="text-white">{paginationMeta.totalPages}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={!paginationMeta.hasPrevPage}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!paginationMeta.hasNextPage}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Wireless Mouse"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                    placeholder="WM-9001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Electronics"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300">Unit Type</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="pcs / kg / box"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="999"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="650"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="18"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300">Initial Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Adjust Stock Level</h3>
            <p className="text-xs text-slate-400">
              Enter positive number to add stock or negative to reduce stock for{' '}
              <span className="text-indigo-300 font-bold">{stockAdjustmentModal.name}</span>.
            </p>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300">Adjustment (+/- Quantity)</label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                  placeholder="+10 or -5"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockAdjustmentModal(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
