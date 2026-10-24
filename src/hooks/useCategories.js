import { useEffect, useState } from 'react';
import { shopApi } from '../services/shop';
import { sidebarCategories, quickCategories } from '../data/mockData';

// Danh mục ít thay đổi -> tải 1 lần, dùng chung cho Header / Trang chủ / Trang danh mục.
// Nếu backend lỗi thì dùng tạm dữ liệu mock để menu không bị trống.
let cache = null;
let pending = null;

const load = () => {
  if (!pending) {
    pending = shopApi
      .categories()
      .then(({ data }) => (cache = data))
      .catch(() => {
        pending = null; // cho phép thử lại lần sau
        return null;
      });
  }
  return pending;
};

export default function useCategories() {
  const [all, setAll] = useState(cache);

  useEffect(() => {
    if (!cache) load().then((data) => data && setAll(data));
  }, []);

  if (!all) {
    return { sidebar: sidebarCategories, quick: quickCategories, all: sidebarCategories, loading: !cache };
  }
  return {
    sidebar: all.filter((c) => c.showInSidebar !== false),
    quick: all.filter((c) => c.showInQuick),
    all,
    loading: false,
  };
}
