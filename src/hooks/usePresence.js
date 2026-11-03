import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { shopApi } from '../services/shop';

const KEY = 'tritech_visitor';
const EVERY_MS = 45 * 1000;

// Mã ngẫu nhiên cho mỗi trình duyệt (không chứa thông tin cá nhân) – để đếm ai đang xem web
const visitorId = () => {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

// Báo "đang xem web" cho admin (chấm xanh như Messenger): gửi khi đổi trang và ~45 giây/lần lúc tab đang mở.
// Tab bị ẩn thì ngừng gửi -> sau ~1-2 phút admin thấy offline.
export default function usePresence() {
  const { pathname } = useLocation();

  useEffect(() => {
    const id = visitorId();
    if (!id) return;
    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      shopApi.presencePing(id, pathname).catch(() => {});
    };
    ping();
    const t = setInterval(ping, EVERY_MS);
    document.addEventListener('visibilitychange', ping);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', ping);
    };
  }, [pathname]);
}
