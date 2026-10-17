import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.data) {
      const data = response.data.data;
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      localStorage.setItem('user', JSON.stringify(data));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/getUser');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
    return response.data;
  },
};
