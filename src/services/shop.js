// Các API công khai dùng cho website bán hàng
import { api } from '../lib/api';

export const shopApi = {
  categories: (params) => api.get('/categories', { params }),
  category: (idOrSlug) => api.get(`/categories/${idOrSlug}`),

  products: (params) => api.get('/products', { params }),
  brands: (category) => api.get('/products/brands', { params: { category } }),
  product: (idOrSlug) => api.get(`/products/${idOrSlug}`),

  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  createOrder: (payload) => api.post('/orders', payload),
  lookupOrder: (code, phone) => api.get('/orders/lookup', { params: { code, phone } }),

  // formData: FormData gồm các field form + nhiều file ở key "images"
  createTradeIn: (formData) => api.post('/trade-ins', formData),
  lookupWarranty: (q) => api.get('/warranties/lookup', { params: { q } }),

  // Banner, video review trang chủ chỉnh trong admin (null = chưa cấu hình, dùng mặc định)
  homeSettings: () => api.get('/settings/home'),

  // Tài khoản khách hàng
  customerConfig: () => api.get('/customers/config'),
  register: (body) => api.post('/customers/register', body),
  login: (body) => api.post('/customers/login', body),
  loginGoogle: (credential) => api.post('/customers/google', { credential }),
  loginFacebook: (accessToken) => api.post('/customers/facebook', { accessToken }),
  forgotPassword: (account) => api.post('/customers/forgot-password', { account }),
  resetPassword: (body) => api.post('/customers/reset-password', body),
  me: () => api.get('/customers/me'),
  updateMe: (body) => api.patch('/customers/me', body),
  changeMyPassword: (body) => api.post('/customers/me/password', body),
  myOrders: () => api.get('/customers/me/orders'),
  uploadAvatar: (file) => {
    const body = new FormData();
    body.append('file', file);
    return api.post('/customers/me/avatar', body);
  },
  uploadReviewImages: (files) => {
    const body = new FormData();
    [...files].forEach((f) => body.append('files', f));
    return api.post('/customers/me/uploads', body);
  },
  uploadReviewVideo: (file, onProgress) => {
    const body = new FormData();
    body.append('file', file);
    return api.post('/customers/me/uploads/video', body, {
      timeout: 0,
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
  },

  // Đánh giá sản phẩm
  reviews: (params) => api.get('/reviews', { params }),
  createReview: (body) => api.post('/reviews', body),
  // Chương trình khuyến mãi đang chạy (Halloween, 11.11…)
  campaigns: () => api.get('/settings/campaigns'),

  // Blog
  posts: (params) => api.get('/posts', { params }),
  post: (slug) => api.get(`/posts/${slug}`),
};
