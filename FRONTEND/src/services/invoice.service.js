import api from './api';

export const invoiceService = {
  createInvoice: async (invoiceData) => {
    const response = await api.post('/invoice', invoiceData);
    return response.data;
  },

  getInvoices: async (params = {}) => {
    const response = await api.get('/invoice', { params });
    return response.data;
  },

  getInvoiceById: async (id) => {
    const response = await api.get(`/invoice/${id}`);
    return response.data;
  },

  getAnalytics: async (params = {}) => {
    const response = await api.get('/invoice/reports/analytics', { params });
    return response.data;
  },

  downloadPDF: async (id) => {
    const response = await api.get(`/invoice/${id}/pdf`, {
      responseType: 'blob',
    });
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
