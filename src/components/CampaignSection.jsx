import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { assetUrl } from '../lib/api';
import ProductCard from './ProductCard';

const pad = (n) => String(n).padStart(2, '0');

// Đồng hồ "Kết thúc sau: ngày : giờ : phút : giây"
function Countdown({ endsAt }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.floor((Date.parse(endsAt) - now) / 1000));
  const parts = [Math.floor(left / 86400), Math.floor(left / 3600) % 24, Math.floor(left / 60) % 60, left % 60];
  return (
    <div className="flex items-center gap-1.5 text-white">
      <span className="text-xs md:text-sm font-bold mr-1">Kết thúc sau:</span>
      {parts.map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="font-black">:</span>}
          <span className="min-w-[28px] md:min-w-[32px] rounded-md bg-red-600 px-1 py-1 text-center text-xs md:text-sm font-black tabular-nums">{pad(v)}</span>
        </span>
      ))}
    </div>
  );
}

const MaybeLink = ({ to, className, children }) =>
  !to ? (
    <div className={className}>{children}</div>
  ) : to.startsWith('/') ? (
    <Link to={to} className={className}>{children}</Link>
  ) : (
    <a href={to} target="_blank" rel="noreferrer" className={className}>{children}</a>
  );

function CampaignProducts({ ids }) {
  const scrollRef = useRef(null);
  const key = ids.join(',');
  const { data: products } = useFetch(() => (key ? shopApi.products({ ids: key }) : Promise.resolve({ data: [] })), [key]);
  if (!products?.length) return null;

  const n = products.length;
  // Điện thoại: 2 cột, 2 hàng vuốt ngang. Máy tính: lưới 5 cột; quá 10 sản phẩm thì 2 hàng vuốt ngang + mũi tên
  const canScroll = n > 10;
  const mobileRows = n > 2 ? 'grid-rows-2' : 'grid-rows-1';
  const desktop = canScroll
    ? (n > 5 ? 'md:grid-rows-2' : 'md:grid-rows-1') + ' md:auto-cols-[calc((100%-48px)/5)]'
    : 'md:grid-flow-row md:grid-rows-none md:grid-cols-5 md:auto-cols-auto md:overflow-visible';
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * scrollRef.current.clientWidth, behavior: 'smooth' });

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`grid grid-flow-col ${mobileRows} auto-cols-[calc((100%-8px)/2)] sm:auto-cols-[calc((100%-16px)/3)] ${desktop} gap-2 md:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide`}
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start min-w-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      {canScroll && (
        <>
          <button type="button" aria-label="Xem trước" onClick={() => scroll(-1)} className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white">
            <ChevronLeft size={20} />
          </button>
          <button type="button" aria-label="Xem tiếp" onClick={() => scroll(1)} className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white">
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}

// Khối chương trình khuyến mãi (Halloween, 11.11…) – tạo trong Admin → Chương trình khuyến mãi.
// Nhiều chương trình chạy cùng lúc thì hiện nút chuyển qua lại.
export default function CampaignSection() {
  const { data: campaigns } = useFetch(() => shopApi.campaigns(), []);
  const [activeId, setActiveId] = useState(null);
  if (!campaigns?.length) return null;

  const c = campaigns.find((x) => x.id === activeId) || campaigns[0];

  return (
    <section className="mb-10 rounded-[24px] overflow-hidden shadow-sm" style={{ backgroundColor: c.bgColor }}>
      {c.bannerImage ? (
        <MaybeLink to={c.link} className="block">
          <picture>
            {c.bannerImageMobile && <source media="(max-width: 767px)" srcSet={assetUrl(c.bannerImageMobile)} />}
            <img src={assetUrl(c.bannerImage)} alt={c.name} className="block w-full h-auto" />
          </picture>
        </MaybeLink>
      ) : (
        <h2 className="px-4 pt-5 text-center text-2xl md:text-4xl font-black uppercase text-white">{c.name}</h2>
      )}

      <div className="p-3 md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {c.endsAt ? <Countdown endsAt={c.endsAt} /> : <span />}
          <div className="flex flex-wrap gap-2">
            {campaigns.length > 1 &&
              campaigns.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setActiveId(x.id)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] md:text-xs font-bold uppercase border transition-colors ${x.id === c.id ? 'bg-[#FFD400] border-[#FFD400] text-black' : 'bg-white border-white text-gray-800 hover:bg-gray-100'}`}
                >
                  {x.name}
                </button>
              ))}
            {c.link && (
              <MaybeLink to={c.link} className="rounded-lg bg-white px-3 py-1.5 text-[11px] md:text-xs font-bold text-gray-800 hover:bg-gray-100 flex items-center gap-1">
                Xem tất cả <ArrowRight size={13} />
              </MaybeLink>
            )}
          </div>
        </div>
        <CampaignProducts key={c.id} ids={c.productIds || []} />
      </div>
    </section>
  );
}
