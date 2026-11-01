import { useEffect, useRef, useState } from 'react';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Số chạy dần tới `target` (easeOutCubic) sau `delay` ms, khi `start` = true.
// Đổi target thì chạy tiếp từ số đang hiện (VD đổi 7 ngày -> 30 ngày ở trang Tổng quan)
export default function useCountUp(target, start = true, delay = 0, ms = 1400) {
  const [value, setValue] = useState(() => (reducedMotion() ? target : 0));
  const shown = useRef(value);

  useEffect(() => {
    if (!start) return;
    if (reducedMotion()) {
      const t = setTimeout(() => setValue((shown.current = target)), 0);
      return () => clearTimeout(t);
    }
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
