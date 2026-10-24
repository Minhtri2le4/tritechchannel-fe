// Các API quản trị (token được api.js tự gắn cho mọi URL bắt đầu bằng /admin)
import { api } from '../lib/api';

const crud = (path) => ({
  list: (params) => api.get(path, { params }),
  get: (id) => api.get(`${path}/${id}`),
  create: (body) => api.post(path, body),
  update: (id, body) => api.patch(`${path}/${id}`, body),
  remove: (id) => api.delete(`${path}/${id}`),
});

export const adminApi = {
  login: (email, password) => api.post('/admin/auth/login', { email, password }),
  me: () => api.get('/admin/auth/me'),
  changePassword: (body) => api.post('/admin/auth/change-password', body),

  dashboard: () => api.get('/admin/dashboard'),

  // files: FileList | File[] -> trả về [{ url }]
  upload: (files) => {
    const body = new FormData();
    [...files].forEach((f) => body.append('files', f));
    return api.post('/admin/uploads', body);
  },

  products: crud('/admin/products'),
  categories: crud('/admin/categories'),
  coupons: crud('/admin/coupons'),
  orders: crud('/admin/orders'),
  tradeIns: crud('/admin/trade-ins'),
  warranties: {
    ...crud('/admin/warranties'),
    addRecord: (id, body) => api.post(`/admin/warranties/${id}/records`, body),
    updateRecord: (id, recordId, body) => api.patch(`/admin/warranties/${id}/records/${recordId}`, body),
    removeRecord: (id, recordId) => api.delete(`/admin/warranties/${id}/records/${recordId}`),
  },
  users: crud('/admin/users'),
};
