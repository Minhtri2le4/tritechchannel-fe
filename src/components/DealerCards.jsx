import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import useCountUp from '../hooks/useCountUp';

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
    cta: 'Mua trên LazMall',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5dSLzULR90j-8hJJkUTbJk-dejrZdf8FGDWvenMYK1m3-xzC75mXff8A&s=10',
    link: 'https://www.lazada.vn/shop/tritechchannel',
  },
];

const fmtSold = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 9950 ? 0 : 1).replace('.0', '')}K+` : `${Math.round(n)}`);

function Stat({ icon: Icon, anim, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-3">
      <Icon size={18} strokeWidth={1.8} className={`dealer-ico ${anim} text-[var(--brand)]`} />
      <span className="text-[15px] font-bold tabular-nums leading-none text-gray-900">{value}</span>
      <span className="text-[11px] text-gray-500">{label}</span>
    </div>
  );
}

function DealerCard({ store, index, visible }) {
  const delay = 300 + index * 150; // số bắt đầu chạy sau khi thẻ hiện ra
  const rating = useCountUp(store.rating, visible, delay);
  const sold = useCountUp(store.sold, visible, delay);
  const response = useCountUp(store.response, visible, delay);

  return (
    <div className="deal-card w-[82vw] sm:w-[320px] md:w-auto shrink-0 snap-center" style={{ '--deal-delay': `${index * 120}ms` }}>
      <a
        href={store.link}
        target="_blank"
        rel="noopener noreferrer"
        className="dealer-card group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
        style={{ '--brand': store.color, borderTopColor: store.color, borderTopWidth: 3 }}
      >
        <div className="flex items-center gap-3 px-4 pt-4">
          <span className="dealer-logo flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-gray-100 bg-white">
            <img src={store.logo} alt={store.platform} className="h-8 w-8 object-contain" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-tight text-gray-900">{store.platform}</p>
            <p className="text-xs text-gray-500">@tritechchannel</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Online
          </span>
        </div>

        <p className="mt-3 flex items-center gap-1 px-4 text-xs font-semibold" style={{ color: store.color === '#111111' ? '#fe2c55' : store.color }}>
          <BadgeCheck size={14} className="dealer-ico dealer-ico-pop" /> {store.badge} · Chính hãng TriTech
        </p>

        <div className="mx-4 mt-3 grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100">
          <Stat icon={Star} anim="dealer-ico-spin" value={rating.toFixed(1)} label="Đánh giá" />
          <Stat icon={ShoppingBag} anim="dealer-ico-bounce" value={fmtSold(sold)} label="Đã bán" />
          <Stat icon={MessageCircle} anim="dealer-ico-wiggle" value={`${Math.round(response)}%`} label="Phản hồi" />
        </div>

        <div className="mt-auto p-4">
          <span className="dealer-cta flex items-center justify-center gap-1.5 rounded-md border py-2.5 text-sm font-semibold">
            {store.cta}
            <ArrowRight size={16} className="dealer-arrow" />
          </span>
        </div>
      </a>
    </div>
  );
}

// Mục "Đại lý ủy quyền chính hãng": thẻ hiện lần lượt khi kéo tới, số liệu tự chạy, icon chuyển động khi rê chuột.
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
        className="flex md:grid md:grid-cols-3 gap-4 md:gap-5 pt-2 pb-6 pl-4 pr-4 md:px-0 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0"
      >
        {STORES.map((store, i) => (
          <DealerCard key={store.id} store={store} index={i} visible={visible} />
        ))}
      </div>
    </div>
  );
}
