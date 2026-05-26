import api from './api';

export const deductionService = {
  async getAll() {
    const response = await api.get('/deductions');
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/deductions/${id}`, data);
    return response.data;
  },
};
