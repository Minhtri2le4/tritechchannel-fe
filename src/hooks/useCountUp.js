import { useEffect, useRef, useState } from 'react';

// Số chạy dần tới `target` (easeOutCubic) sau `delay` ms, khi `start` = true.
// Đổi target thì chạy tiếp từ số đang hiện (VD đổi 7 ngày -> 30 ngày ở trang Tổng quan).
// Luôn chạy kể cả khi Windows tắt hiệu ứng (prefers-reduced-motion): chỉ là số đổi nhẹ, không lắc/trượt.
export default function useCountUp(target, start = true, delay = 0, ms = 1400) {
  const [value, setValue] = useState(0);
  const shown = useRef(0);

  useEffect(() => {
    if (!start) return undefined;
    let raf;
    const from = shown.current;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        shown.current = from + (target - from) * (1 - (1 - p) ** 3);
        setValue(shown.current);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [start, target, delay, ms]);

  return value;
}
