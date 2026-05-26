import api from './api';

export const payslipService = {
  async getMy() {
    const response = await api.get('/payslips/my');
    return response.data;
  },

  async getAll(params = {}) {
    const response = await api.get('/payslips', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/payslips/${id}`);
    return response.data;
  },
};
