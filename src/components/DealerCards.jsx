import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';

// Gian hàng chính hãng của TriTech trên các sàn
const STORES = [
  {
    id: 'shopee',
    platform: 'Shopee Mall',
    badge: 'Shop yêu thích',
    rating: 4.8,
    sold: 5000,
    response: 99,
    color: '#ee4d2d',
    band: 'linear-gradient(135deg, #ff7337 0%, #ee4d2d 55%, #d0011b 100%)',
    cta: 'Mua trên Shopee',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO6mQ4kh8Ms7cBHu9ViJWVSBGpAinimxpxZMkVW6FnlFCvcS7-pWAU-ts2&s=10',
    link: 'https://shopee.vn/tritechchannel?entryPoint=ShopBySearch&searchKeyword=tritech%20channel',
  },
  {
    id: 'tiktok',
    platform: 'TikTok Shop',
    badge: 'Shop yêu thích',
    rating: 4.8,
    sold: 3000,
    response: 95,
    color: '#111111',
    band: 'linear-gradient(135deg, #25f4ee 0%, #111111 45%, #111111 60%, #fe2c55 100%)',
    cta: 'Mua trên TikTok Shop',
    logo: 'https://img.icons8.com/color/150/tiktok--v1.png',
    link: 'https://vt.tiktok.com/ZS4C18NFe/?page=TikTokShop',
  },
  {
    id: 'lazada',
    platform: 'LazMall',
    badge: 'Gian hàng tốt',
    rating: 5.0,
    sold: 2000,
    response: 98,
    color: '#0f136d',
    band: 'linear-gradient(135deg, #0f136d 0%, #3b28cc 50%, #f57224 100%)',
    cta: 'Mua trên LazMall',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5dSLzULR90j-8hJJkUTbJk-dejrZdf8FGDWvenMYK1m3-xzC75mXff8A&s=10',
    link: 'https://www.lazada.vn/shop/tritechchannel',
  },
];

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Số chạy từ 0 lên `target` sau `delay` ms, khi `start` = true
function useCountUp(target, start, delay = 0, ms = 1400) {
  const [value, setValue] = useState(() => (reducedMotion() ? target : 0));
  useEffect(() => {
    if (!start || reducedMotion()) return;
    let raf;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        setValue(target * (1 - (1 - p) ** 3));
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

const fmtSold = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 9950 ? 0 : 1).replace('.0', '')}K+` : `${Math.round(n)}`);

function DealerCard({ store, index, visible }) {
  const delay = 350 + index * 180; // số bắt đầu chạy sau khi thẻ "đáp" xuống
  const rating = useCountUp(store.rating, visible, delay);
  const sold = useCountUp(store.sold, visible, delay);
  const response = useCountUp(store.response, visible, delay);
  const tiltRef = useRef(null);

  // Rê chuột: thẻ nghiêng 3D theo vị trí chuột (chỉ máy có chuột)
  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${(((e.clientY - r.top) / r.height) - 0.5) * -10}deg`);
    el.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width) - 0.5) * 12}deg`);
  };
  const onLeave = () => {
    tiltRef.current?.style.setProperty('--rx', '0deg');
    tiltRef.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <div className="deal-card w-[82vw] sm:w-[320px] md:w-auto shrink-0 snap-center" style={{ '--deal-delay': `${index * 180}ms` }}>
      <a
        ref={tiltRef}
        href={store.link}
        target="_blank"
        rel="noopener noreferrer"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="dealer-tilt group relative block h-full overflow-hidden rounded-[22px] bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
        style={{ '--brand': store.color }}
      >
        {/* Dải màu thương hiệu + vệt sáng lướt qua */}
        <div className="dealer-band relative h-[84px] overflow-hidden" style={{ background: store.band }}>
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Đang hoạt động
          </span>
          <span className="dealer-sheen" />
        </div>

        <div className="dealer-logo absolute left-5 top-[48px] flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-white">
          <img src={store.logo} alt={store.platform} className="h-[44px] w-[44px] object-contain" />
        </div>

        <div className="px-5 pb-5 pt-3">
          <div className="ml-[84px] min-h-[44px]">
            <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white" style={{ background: store.color }}>
              {store.badge}
            </span>
            <p className="mt-1 text-xs font-semibold text-gray-500">{store.platform}</p>
          </div>
          <h3 className="mt-2 text-xl font-black tracking-tight text-gray-900">tritechchannel</h3>

          <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 rounded-xl bg-gray-50 py-3 text-center">
            <div>
              <p className="text-base font-black tabular-nums text-gray-900">{rating.toFixed(1)}</p>
              <div className="relative mx-auto mt-0.5 h-3 w-[60px]">
                <div className="absolute inset-0 flex">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={12} className="fill-gray-200 text-gray-200" />)}</div>
                <div className="absolute inset-y-0 left-0 flex overflow-hidden" style={{ width: `${(rating / 5) * 100}%` }}>
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={12} className="shrink-0 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
            </div>
            <div>
              <p className="text-base font-black tabular-nums" style={{ color: store.color === '#111111' ? '#fe2c55' : store.color }}>{fmtSold(sold)}</p>
              <p className="text-[10px] font-bold uppercase text-gray-400">Đã bán</p>
            </div>
            <div>
              <p className="text-base font-black tabular-nums text-gray-900">{Math.round(response)}%</p>
              <p className="text-[10px] font-bold uppercase text-gray-400">Phản hồi</p>
            </div>
          </div>

          <span
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white transition-[filter,transform] group-hover:brightness-110 group-active:scale-[0.98]"
            style={{ background: store.color }}
          >
            {store.cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </a>
    </div>
  );
}

// Mục "Đại lý ủy quyền chính hãng": thẻ bay vào như chia bài khi kéo tới, số liệu tự chạy, rê chuột nghiêng 3D.
// scrollRef: khung cuộn ngang trên điện thoại (HomePage dùng để tự trượt thẻ mỗi 2 giây)
export default function DealerCards({ scrollRef }) {
  const boxRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
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
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={boxRef} className={`dealers ${visible ? 'is-visible' : ''}`}>
      <div
        ref={scrollRef}
        className="flex md:grid md:grid-cols-3 gap-5 md:gap-7 pt-4 pb-8 pl-4 pr-4 md:px-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0 [perspective:1200px]"
      >
        {STORES.map((store, i) => (
          <DealerCard key={store.id} store={store} index={i} visible={visible} />
        ))}
      </div>
    </div>
  );
}
