import api from './api';

export const userService = {
  async getAll() {
    const response = await api.get('/users');
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
