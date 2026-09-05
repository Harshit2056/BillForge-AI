import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { productService } from '../services/product.service';
import { invoiceService } from '../services/invoice.service';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  CheckCircle2,
  Loader2,
  FileText,
  Download,
} from 'lucide-react';

export const POS = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart state
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);

  const toast = useToast();

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.getProducts({ limit: 100 });
      const docs =
        res?.data?.docs ||
        res?.data?.result?.docs ||
        res?.data?.data?.docs ||
        res?.data?.data?.result?.docs ||
        (Array.isArray(res?.data) ? res.data : []);
      setProducts(docs);
    } catch (err) {
      toast.error('Failed to load product catalog.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by search & category
  const categories = ['All', ...new Set(products.map((p) => p.category || 'General'))];
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart management
  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      toast.error(`"${product.name}" is out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.warning(`Cannot add more. Available stock: ${product.stockQuantity}`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            taxRate: product.taxRate || 0,
            quantity: 1,
            maxStock: product.stockQuantity,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              toast.warning(`Max available stock is ${item.maxStock}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Totals calculations
  const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxTotal = cart.reduce((acc, item) => {
    const lineSub = item.price * item.quantity;
    return acc + (lineSub * (item.taxRate || 0)) / 100;
  }, 0);
  const grandTotal = subTotal + taxTotal;

  // Checkout action
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Add products before checking out.');
      return;
    }

    if (!customer.name || !customer.name.trim()) {
      toast.error('Customer Name is mandatory to generate a bill.');
      return;
    }

    setCheckoutSubmitting(true);
    try {
      const payload = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone ? customer.phone.trim() : '',
          email: customer.email ? customer.email.trim() : '',
        },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMode,
      };

      const res = await invoiceService.createInvoice(payload);
      if (res?.data) {
        toast.success('Invoice created & inventory updated successfully!');
        setCompletedInvoice(res.data);
        // Refresh product stock catalog
        fetchProducts();
        // Clear cart & customer
        setCart([]);
        setCustomer({ name: '', phone: '', email: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  return (
    <AppLayout title="Point of Sale (POS)">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)]">
        {/* Left Section: Product Selector Grid (8 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
          {/* Search Bar & Category Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid Container */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loadingProducts ? (
              <div className="h-full flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-xs font-medium">Loading catalog...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <ShoppingCart className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-sm font-medium">No products match your filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((prod) => {
                  const inCart = cart.find((item) => item.productId === prod._id);
                  const isOutOfStock = prod.stockQuantity <= 0;

                  return (
                    <div
                      key={prod._id}
                      onClick={() => !isOutOfStock && addToCart(prod)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                        isOutOfStock
                          ? 'bg-slate-950/40 border-slate-800/40 opacity-50 cursor-not-allowed'
                          : inCart
                          ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-semibold text-xs text-slate-100 line-clamp-1">{prod.name}</h4>
                          {inCart && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              x{inCart.quantity}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {prod.sku}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-white">₹{prod.price}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                              : prod.stockQuantity <= prod.lowStockThreshold
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isOutOfStock ? 'Out of stock' : `${prod.stockQuantity} left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Cart & Checkout (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-0 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              Current Order Cart
            </h3>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-400 hover:underline font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <ShoppingCart className="w-12 h-12 mb-2 text-slate-600 stroke-1" />
                <p className="text-xs font-medium">Click items from the catalog to add to cart</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      ₹{item.price} x {item.quantity} = <span className="font-semibold text-indigo-300">₹{item.price * item.quantity}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="w-6 h-6 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Payment Mode Drawer */}
          <div className="border-t border-slate-800 pt-3 space-y-3">
            {/* Customer Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Customer Name "
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 placeholder-slate-500"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* Payment Mode Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {['Cash', 'Card', 'UPI', 'Credit'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === mode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Tax</span>
                <span>₹{taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white border-t border-slate-800 pt-1.5">
                <span>Grand Total</span>
                <span className="text-emerald-400">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checkoutSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Invoice...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Checkout (₹{grandTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Completed Invoice Success Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Invoice Issued Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">Invoice #{completedInvoice.invoiceNumber}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Customer:</span>
                <span className="font-semibold">{completedInvoice.customer?.name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Payment Mode:</span>
                <span className="font-semibold">{completedInvoice.paymentMode}</span>
              </div>
              <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2 font-bold text-white text-sm">
                <span>Amount Paid:</span>
                <span className="text-emerald-400">₹{completedInvoice.grandTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => invoiceService.downloadPDF(completedInvoice._id)}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Bill</span>
              </button>

              <button
                onClick={() => setCompletedInvoice(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
