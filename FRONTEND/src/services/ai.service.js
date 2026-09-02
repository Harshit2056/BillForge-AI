import api from './api';

export const aiService = {
  scanReceipt: async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const response = await api.post('/ai/scan-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  queryNaturalLanguage: async (prompt) => {
    const response = await api.post('/ai/query', { prompt });
    return response.data;
  },

  getForecast: async () => {
    const response = await api.post('/ai/forecast');
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.post('/ai/recommendations');
    return response.data;
  },
};
