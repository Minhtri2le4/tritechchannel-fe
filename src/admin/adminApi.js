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
  setAvatar: (avatar) => api.patch('/admin/auth/me/avatar', { avatar }),

  dashboard: (days = 30) => api.get('/admin/dashboard', { params: { days } }),
  presence: () => api.get('/admin/presence'),

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
    activate: (id, body) => api.post(`/admin/warranties/${id}/activate`, body),
    addRecord: (id, body) => api.post(`/admin/warranties/${id}/records`, body),
    updateRecord: (id, recordId, body) => api.patch(`/admin/warranties/${id}/records/${recordId}`, body),
    removeRecord: (id, recordId) => api.delete(`/admin/warranties/${id}/records/${recordId}`),
  },
  users: crud('/admin/users'),
  // Nhân viên: giao việc + chấm công bằng ảnh
  staff: {
    summary: () => api.get('/admin/staff/summary'),
    people: () => api.get('/admin/staff/people'),
    tasks: (params) => api.get('/admin/staff/tasks', { params }),
    task: (id) => api.get(`/admin/staff/tasks/${id}`),
    createTask: (body) => api.post('/admin/staff/tasks', body),
    updateTask: (id, body) => api.patch(`/admin/staff/tasks/${id}`, body),
    removeTask: (id) => api.delete(`/admin/staff/tasks/${id}`),
    start: (id) => api.post(`/admin/staff/tasks/${id}/start`),
    submit: (id, body) => api.post(`/admin/staff/tasks/${id}/submit`, body),
    review: (id, body) => api.post(`/admin/staff/tasks/${id}/review`, body),
    checkins: (params) => api.get('/admin/staff/checkins', { params }),
    checkin: (body) => api.post('/admin/staff/checkins', body),
    upload: (files, onProgress) => {
      const body = new FormData();
      [...files].forEach((f) => body.append('files', f));
      return api.post('/admin/staff/uploads', body, {
        timeout: 0,
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      });
    },
  },
  posts: crud('/admin/posts'),
  customers: crud('/admin/customers'),
  reviews: crud('/admin/reviews'),
  feedback: crud('/admin/feedback'),
  postComments: { ...crud('/admin/post-comments'), reply: (id, content) => api.post(`/admin/post-comments/${id}/reply`, { content }) },

  // Nội dung trang chủ: banner, video review
  settings: {
    getHome: () => api.get('/admin/settings/home'),
    saveHome: (body) => api.put('/admin/settings/home', body),
    getCampaigns: () => api.get('/admin/settings/campaigns'),
    saveCampaigns: (body) => api.put('/admin/settings/campaigns', body),
    getPopularSearches: () => api.get('/admin/settings/popular-searches'),
    savePopularSearches: (body) => api.put('/admin/settings/popular-searches', body),
  },
};
