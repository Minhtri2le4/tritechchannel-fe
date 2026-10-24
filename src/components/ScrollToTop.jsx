import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Chuyển sang trang mới thì cuộn lên đầu trang (React Router không tự làm việc này).
// Bấm nút Quay lại / Tiến tới (POP) thì giữ nguyên để trình duyệt khôi phục vị trí cũ.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, navigationType]);

  return null;
}
