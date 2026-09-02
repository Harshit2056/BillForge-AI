import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { shopService } from '../services/shop.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Users, Plus, Trash2, Save, MapPin, Loader2 } from 'lucide-react';

export const Settings = () => {
  const { shop, refreshShopProfile } = useAuth();
  const [shopForm, setShopForm] = useState({
    shopName: '',
    taxId: '',
    address: { street: '', city: '', state: '', zipcode: '' },
  });

  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [savingShop, setSavingShop] = useState(false);

  // New Staff Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'cashier' });
  const [submittingStaff, setSubmittingStaff] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (shop) {
      setShopForm({
        shopName: shop.shopName || '',
        taxId: shop.taxId || '',
        address: shop.address || { street: '', city: '', state: '', zipcode: '' },
      });
    }
  }, [shop]);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await shopService.getStaff();
      if (res?.data) setStaffList(res.data);
    } catch (err) {
      console.error('Failed to fetch staff members');
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleUpdateShop = async (e) => {
    e.preventDefault();
    setSavingShop(true);
    try {
      await shopService.updateProfile(shopForm);
      toast.success('Shop profile updated!');
      refreshShopProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update shop.');
    } finally {
      setSavingShop(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmittingStaff(true);
    try {
      await shopService.addStaff(newStaff);
      toast.success('New staff member added!');
      setShowStaffModal(false);
      setNewStaff({ name: '', email: '', password: '', role: 'cashier' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff member.');
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleRemoveStaff = async (id, name) => {
    if (!window.confirm(`Remove staff member "${name}"?`)) return;
    try {
      await shopService.removeStaff(id);
      toast.success(`Removed ${name}`);
      fetchStaff();
    } catch (err) {
      toast.error('Failed to remove staff.');
    }
  };

  return (
    <AppLayout title="Shop Settings & Staff">
      <div className="space-y-8 max-w-4xl">
        {/* Shop Profile Form */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Shop Information</h3>
          </div>

          <form onSubmit={handleUpdateShop} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300">Shop Name</label>
                <input
                  type="text"
                  required
                  value={shopForm.shopName}
                  onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300">Tax ID / GSTIN</label>
                <input
                  type="text"
                  value={shopForm.taxId}
                  onChange={(e) => setShopForm({ ...shopForm, taxId: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300">Street Address</label>
              <input
                type="text"
                value={shopForm.address.street}
                onChange={(e) =>
                  setShopForm({
                    ...shopForm,
                    address: { ...shopForm.address, street: e.target.value },
                  })
                }
                className="mt-1 w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-300">City</label>
                <input
                  type="text"
                  value={shopForm.address.city}
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      address: { ...shopForm.address, city: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300">State</label>
                <input
                  type="text"
                  value={shopForm.address.state}
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      address: { ...shopForm.address, state: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300">Zipcode</label>
                <input
                  type="text"
                  value={shopForm.address.zipcode}
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      address: { ...shopForm.address, zipcode: e.target.value },
                    })
                  }
                  className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingShop}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                {savingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Staff Members Management */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Staff Members & Roles</h3>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="bg-slate-950/80 rounded-xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
            {loadingStaff ? (
              <div className="p-6 text-center text-slate-400 text-xs">Loading staff members...</div>
            ) : staffList.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No extra staff members added yet.</div>
            ) : (
              staffList.map((member) => (
                <div key={member._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-200">{member.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase text-slate-300">
                      {member.role}
                    </span>
                    <button
                      onClick={() => handleRemoveStaff(member._id, member.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add New Staff Member</h3>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300">Staff Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100"
                  placeholder="john@shop.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300">Password *</label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300">Assigned Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStaff}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {submittingStaff && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Staff Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
