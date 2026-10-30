import axios from 'axios';

// Đổi địa chỉ backend bằng biến môi trường VITE_API_URL (file .env.local / .env.production)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const API_ORIGIN = new URL(API_URL).origin;

export const ADMIN_TOKEN_KEY = 'tritech_admin_token';
export const CUSTOMER_TOKEN_KEY = 'tritech_customer_token';

export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

// Tự gắn token: API quản trị dùng token admin; tài khoản khách & đặt hàng dùng token khách (nếu đã đăng nhập)
api.interceptors.request.use((config) => {
  const url = config.url || '';
  let token = null;
  try {
    if (url.startsWith('/admin')) token = localStorage.getItem(ADMIN_TOKEN_KEY);
    else if (url.startsWith('/customers/me') || url === '/orders' || (url === '/reviews' && config.method === 'post')) token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
  } catch {
    token = null;
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend trả { success, data, meta } -> trả thẳng { data, meta } cho gọn.
// Lỗi được chuẩn hóa thành Error có message tiếng Việt từ server.
api.interceptors.response.use(
  (res) => (res.status === 204 ? { data: null } : { data: res.data.data, meta: res.data.meta }),
  (err) => {
    const payload = err.response?.data?.error;
    const error = new Error(
      payload?.message || (err.response ? 'Có lỗi xảy ra, vui lòng thử lại' : 'Không kết nối được máy chủ'),
    );
    error.status = err.response?.status;
    error.code = payload?.code;
    error.details = payload?.details;

    // Phiên admin hết hạn -> báo cho AdminAuth đăng xuất
    if (error.status === 401 && err.config?.url?.startsWith('/admin') && !err.config.url.includes('/auth/login')) {
      window.dispatchEvent(new Event('tritech:admin-unauthorized'));
    }
    // Phiên khách hết hạn -> CustomerContext đăng xuất
    if (error.status === 401 && err.config?.url?.startsWith('/customers/me')) {
      window.dispatchEvent(new Event('tritech:customer-unauthorized'));
    }
    return Promise.reject(error);
  },
);

export const NO_IMAGE = '/assets/no-image.svg';

// Ảnh upload lên backend có dạng /uploads/... -> thêm domain backend. Không có ảnh -> ảnh mặc định.
export const assetUrl = (path) => {
  if (!path) return NO_IMAGE;
  return path.startsWith('/uploads/') ? `${API_ORIGIN}${path}` : path;
};

// Gắn vào <img onError={imgFallback}>: ảnh hỏng (link chết) thì thay bằng ảnh mặc định
export const imgFallback = (e) => {
  if (!e.currentTarget.src.endsWith(NO_IMAGE)) e.currentTarget.src = NO_IMAGE;
};

export const formatPrice = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;

export const formatDate = (d, withTime = false) =>
  d
    ? new Date(d).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
    : '';
