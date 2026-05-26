import api from './api';

export const payrollService = {
  async getAll(params = {}) {
    const response = await api.get('/payroll', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },

  async generate(data) {
    const response = await api.post('/payroll/generate', data);
    return response.data;
  },

  async generateBulk(data) {
    const response = await api.post('/payroll/generate-bulk', data);
    return response.data;
  },

  async approve(id) {
    const response = await api.put(`/payroll/approve/${id}`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/payroll/${id}`);
    return response.data;
  },
};
