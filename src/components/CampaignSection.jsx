import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Star, Truck } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { assetUrl, formatPrice, imgFallback } from '../lib/api';

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
    <div className="flex items-center gap-1 md:gap-1.5 text-white">
      <span className="text-[13px] md:text-[15px] font-bold mr-1 md:mr-2">Kết thúc sau:</span>
      {parts.map((v, i) => (
        <span key={i} className="flex items-center gap-1 md:gap-1.5">
          {i > 0 && <span className="font-black text-white/90">:</span>}
          <span className="w-7 md:w-8 rounded-md bg-[#e30019] py-1 text-center text-[13px] md:text-[15px] font-black tabular-nums shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]">
            {pad(v)}
          </span>
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

// Thẻ sản phẩm gọn kiểu khối khuyến mãi: nhãn -%, trả góp, giá, số tiền được giảm, sao, còn hàng
function CampaignCard({ p }) {
  const saving = p.originalPrice > p.price ? p.originalPrice - p.price : 0;
  return (
    <Link
      to={`/product/${p.slug || p.id}`}
      className="group flex h-full flex-col rounded-xl bg-white p-2 md:p-2.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="flex min-h-[20px] flex-wrap items-center gap-1">
        {p.discountPercent > 0 && (
          <span className="rounded bg-[#FFD400] px-1.5 py-0.5 text-[10px] md:text-[11px] font-black leading-none text-black">-{p.discountPercent}%</span>
        )}
        {p.installment && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] md:text-[11px] font-medium leading-none text-gray-600">Trả góp 0%</span>
        )}
      </div>
      <div className="mt-1.5 aspect-square overflow-hidden rounded-lg bg-gray-50">
        <img
          src={assetUrl(p.image)}
          onError={imgFallback}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-contain p-1.5 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-2 line-clamp-2 min-h-[34px] text-[12px] md:text-[13px] font-medium leading-snug text-gray-800 group-hover:text-[#e30019]">
        {p.name}
      </h3>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[14px] md:text-[15px] font-black text-[#e30019]">{formatPrice(p.price)}</span>
        {saving > 0 && <span className="text-[11px] text-gray-400 line-through">{formatPrice(p.originalPrice)}</span>}
      </div>
      <p className="min-h-[16px] text-[10px] md:text-[11px] font-medium text-emerald-600">{saving > 0 && `Giảm ${formatPrice(saving)}`}</p>
      <div className="mt-auto flex items-center justify-between pt-1.5 text-[10px] md:text-[11px]">
        <span className="flex items-center gap-0.5 text-gray-500">
          <Star size={11} className="fill-amber-400 text-amber-400" /> {p.rating || 5}
        </span>
        {p.stock > 0 ? (
          <span className="flex items-center gap-1 font-semibold text-emerald-600">Còn hàng <Truck size={12} /></span>
        ) : (
          <span className="font-semibold text-gray-400">Liên hệ</span>
        )}
      </div>
    </Link>
  );
}

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
    ? 'md:grid-rows-2 md:auto-cols-[calc((100%-48px)/5)]'
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
            <CampaignCard p={p} />
          </div>
        ))}
      </div>
      {canScroll && (
        <>
          <button type="button" aria-label="Xem trước" onClick={() => scroll(-1)} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 h-14 w-8 items-center justify-center rounded-r-lg bg-black/35 text-white hover:bg-black/55">
            <ChevronLeft size={22} />
          </button>
          <button type="button" aria-label="Xem tiếp" onClick={() => scroll(1)} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 h-14 w-8 items-center justify-center rounded-l-lg bg-black/35 text-white hover:bg-black/55">
            <ChevronRight size={22} />
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
    <section className="mb-10 overflow-hidden rounded-2xl md:rounded-[20px] shadow-md" style={{ backgroundColor: c.bgColor }}>
      {c.bannerImage ? (
        <MaybeLink to={c.link} className="block">
          <picture>
            {c.bannerImageMobile && <source media="(max-width: 767px)" srcSet={assetUrl(c.bannerImageMobile)} />}
            <img src={assetUrl(c.bannerImage)} alt={c.name} className="block h-auto w-full" />
          </picture>
        </MaybeLink>
      ) : (
        <h2 className="px-4 pt-6 pb-2 text-center text-2xl md:text-4xl font-black uppercase tracking-wide text-white drop-shadow">{c.name}</h2>
      )}

      <div className="px-2.5 pb-3 pt-3 md:px-4 md:pb-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
          {c.endsAt ? <Countdown endsAt={c.endsAt} /> : <span />}
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {campaigns.length > 1 &&
              campaigns.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setActiveId(x.id)}
                  className={`rounded-md px-3 py-1.5 text-[11px] md:text-xs font-bold uppercase shadow-sm transition-colors ${x.id === c.id ? 'bg-[#FFD400] text-black' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
                >
                  {x.name}
                </button>
              ))}
            {c.link && (
              <MaybeLink to={c.link} className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-[11px] md:text-xs font-bold text-gray-800 shadow-sm hover:bg-gray-100">
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
