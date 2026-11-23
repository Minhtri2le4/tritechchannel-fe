import { useEffect, useState } from 'react';
import { shopApi } from '../services/shop';

// Danh mục ít thay đổi -> tải 1 lần, dùng chung cho Header / Trang chủ / Trang danh mục.
// Lưu bản mới nhất vào trình duyệt: lần sau mở web hiện ngay danh mục MỚI (không còn chớp danh mục cũ),
// rồi tải lại ngầm để cập nhật nếu admin vừa sửa. Lần đầu chưa có gì thì trả danh sách rỗng (hiện khung chờ).
const STORE_KEY = 'tritech_categories_v1';

const readStored = () => {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    return Array.isArray(v) && v.length ? v : null;
  } catch {
    return null;
  }
};

let cache = null; // dữ liệu mới tải từ máy chủ trong lần mở web này
let stored = readStored();
let pending = null;
const listeners = new Set();

const load = () => {
  if (!pending) {
    pending = shopApi
      .categories()
      .then(({ data }) => {
        cache = data;
        try {
          localStorage.setItem(STORE_KEY, JSON.stringify(data));
        } catch {
          // hết chỗ / chế độ ẩn danh -> bỏ qua
        }
        listeners.forEach((fn) => fn(data));
        return data;
      })
      .catch(() => {
        pending = null; // cho phép thử lại lần sau
        return null;
      });
  }
  return pending;
};

export default function useCategories() {
  const [all, setAll] = useState(() => cache || stored);

  useEffect(() => {
    listeners.add(setAll);
    if (!cache) load();
    return () => listeners.delete(setAll);
  }, []);

  if (!all) return { sidebar: [], quick: [], all: [], loading: true };
  return {
    sidebar: all.filter((c) => c.showInSidebar !== false),
    quick: all.filter((c) => c.showInQuick),
    all,
    loading: !cache && !stored,
  };
}
