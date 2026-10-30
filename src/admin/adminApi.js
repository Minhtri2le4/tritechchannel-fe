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

  dashboard: (days = 30) => api.get('/admin/dashboard', { params: { days } }),

  // files: FileList | File[] -> trả về [{ url }]
  upload: (files) => {
    const body = new FormData();
    [...files].forEach((f) => body.append('files', f));
    return api.post('/admin/uploads', body);
  },
  // 1 video (tối đa 80MB) -> { url }. onProgress(0..100) để hiện % đang tải
  uploadVideo: (file, onProgress) => {
    const body = new FormData();
    body.append('file', file);
    return api.post('/admin/uploads/video', body, {
      timeout: 0,
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
  },

  products: {
    ...crud('/admin/products'),
    // action: 'delete' | 'hide' | 'show' | 'move' (move cần categoryId)
    bulk: (ids, action, categoryId) => api.post('/admin/products/bulk', { ids, action, categoryId }),
  },
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
  posts: crud('/admin/posts'),
  customers: crud('/admin/customers'),

  // Nội dung trang chủ: banner, video review
  settings: {
    getHome: () => api.get('/admin/settings/home'),
    saveHome: (body) => api.put('/admin/settings/home', body),
    getCampaigns: () => api.get('/admin/settings/campaigns'),
    saveCampaigns: (body) => api.put('/admin/settings/campaigns', body),
  },
};
