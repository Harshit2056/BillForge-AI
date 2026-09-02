import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowRight, Building2, User, Mail, Lock, MapPin, Receipt, Loader2 } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    taxId: '',
    ownerName: '',
    email: '',
    password: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipcode: '',
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (field, val) => {
    if (field.startsWith('address.')) {
      const addrField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addrField]: val },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(formData);
      toast.success('Registration successful! Please log in with your credentials.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/30">
            BF
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Register Your Shop Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl backdrop-blur-md sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Shop Details */}
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Shop & Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={(e) => handleChange('shopName', e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Apex Retailers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Tax ID / GST Number</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="TAX-99882211"
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Address Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address.street}
                    onChange={(e) => handleChange('address.street', e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="123 Commerce Way"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.address.city}
                      onChange={(e) => handleChange('address.city', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Seattle"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.address.state}
                      onChange={(e) => handleChange('address.state', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="WA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Zipcode *</label>
                    <input
                      type="text"
                      required
                      value={formData.address.zipcode}
                      onChange={(e) => handleChange('address.zipcode', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="98101"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Account Details */}
            <div>
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Owner Credentials
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="mt-1 block w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="jane@apex.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="mt-1 block w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all duration-200 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Shop & Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
