import api from './api';

export const messageService = {
  async getMy() {
    const response = await api.get('/messages/my');
    return response.data;
  },

  async getAll() {
    const response = await api.get('/messages');
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.put(`/messages/${id}/read`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};
