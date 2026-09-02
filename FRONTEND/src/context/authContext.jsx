import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { shopService } from '../services/shop.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and shop profile on initial render
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userRes = await authService.getCurrentUser();
        if (userRes?.data) {
          setUser(userRes.data);
          localStorage.setItem('user', JSON.stringify(userRes.data));

          // Fetch shop profile
          try {
            const shopRes = await shopService.getProfile();
            if (shopRes?.data) {
              setShop(shopRes.data);
            }
          } catch (shopErr) {
            console.error('Shop fetch error:', shopErr);
          }
        }
      } catch (err) {
        console.warn('Initial auth check failed or user not logged in');
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.data) {
      setUser(res.data);
      // Fetch shop details
      try {
        const shopRes = await shopService.getProfile();
        if (shopRes?.data) setShop(shopRes.data);
      } catch (e) {}
    }
    return res;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setShop(null);
  };

  const refreshShopProfile = async () => {
    try {
      const res = await shopService.getProfile();
      if (res?.data) setShop(res.data);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        loading,
        login,
        register,
        logout,
        refreshShopProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
