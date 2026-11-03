import { useEffect, useRef, useState } from 'react';

// Khung "hiện khi kéo tới": các phần tử con có class .reveal-item sẽ nảy ra lần lượt (như domino)
// khi khung lọt vào màn hình. Mỗi con đặt style={{ '--reveal-delay': '140ms' }} để so le.
export default function Reveal({ className = '', children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Trình duyệt quá cũ không có IntersectionObserver: hiện luôn
    if (typeof IntersectionObserver === 'undefined') {
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
