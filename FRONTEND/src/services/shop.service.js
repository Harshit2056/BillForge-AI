import api from './api';

export const shopService = {
  getProfile: async () => {
    const response = await api.get('/shops/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/shops/profile', data);
    return response.data;
  },

  getStaff: async () => {
    const response = await api.get('/shops/staff');
    return response.data;
  },

  addStaff: async (staffData) => {
    const response = await api.post('/shops/staff', staffData);
    return response.data;
  },

  removeStaff: async (staffId) => {
    const response = await api.delete(`/shops/staff/${staffId}`);
    return response.data;
  },
};
