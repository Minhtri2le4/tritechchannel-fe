import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Play, Star, X } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { assetUrl, formatDate, imgFallback } from '../lib/api';

const PAGE = 10;

function Stars({ value, size = 14 }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
      ))}
    </span>
  );
}

// Xem ảnh / video đánh giá phóng to, ← → để chuyển
function MediaViewer({ media, index, onClose, onMove }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onMove]);
  const m = media[index];
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/90" onClick={onClose}>
      <button type="button" aria-label="Đóng" className="absolute right-4 top-4 text-white/80 hover:text-white" onClick={onClose}><X size={28} /></button>
      {media.length > 1 && (
        <>
          <button type="button" aria-label="Trước" className="absolute left-2 p-2 text-white/80 hover:text-white md:left-6" onClick={(e) => { e.stopPropagation(); onMove(-1); }}><ChevronLeft size={36} /></button>
          <button type="button" aria-label="Sau" className="absolute right-2 p-2 text-white/80 hover:text-white md:right-6" onClick={(e) => { e.stopPropagation(); onMove(1); }}><ChevronRight size={36} /></button>
        </>
      )}
      <div onClick={(e) => e.stopPropagation()}>
        {m.type === 'video' ? (
          <video key={m.src} src={assetUrl(m.src)} controls autoPlay playsInline className="max-h-[85vh] max-w-[92vw]" />
        ) : (
          <img src={assetUrl(m.src)} alt="" className="max-h-[85vh] max-w-[92vw] object-contain" />
        )}
      </div>
    </div>
  );
}

function ReviewItem({ r }) {
  const [open, setOpen] = useState(null);
  const media = [...(r.videoUrl ? [{ type: 'video', src: r.videoUrl }] : []), ...r.images.map((src) => ({ type: 'image', src }))];
  return (
    <div className="flex gap-3 border-b border-gray-100 py-4 last:border-0">
      {r.avatar ? (
        <img src={assetUrl(r.avatar)} alt="" referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">{r.author?.[0]?.toUpperCase()}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-800">{r.author}</p>
        <Stars value={r.rating} size={12} />
        <p className="mt-0.5 text-xs text-gray-400">
          {formatDate(r.createdAt, true)}
          {r.variantLabel && ` | Phân loại: ${r.variantLabel}`}
        </p>
        {r.content && <p className="mt-2 whitespace-pre-line break-words text-sm text-gray-800">{r.content}</p>}
        {media.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {media.map((m, i) => (
              <button key={m.src} type="button" onClick={() => setOpen(i)} className="relative h-20 w-20 overflow-hidden rounded-md border border-gray-200 bg-black">
                {m.type === 'video' ? (
                  <>
                    <video src={assetUrl(m.src)} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center"><Play size={22} className="fill-white text-white drop-shadow" /></span>
                  </>
                ) : (
                  <img src={assetUrl(m.src)} onError={imgFallback} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
        {r.shopReply && (
          <div className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
            <p className="font-semibold text-gray-800">Phản hồi của Người bán</p>
            <p className="mt-0.5 whitespace-pre-line text-gray-600">{r.shopReply}</p>
          </div>
        )}
      </div>
      {open !== null && (
        <MediaViewer media={media} index={open} onClose={() => setOpen(null)} onMove={(d) => setOpen((i) => (i + d + media.length) % media.length)} />
      )}
    </div>
  );
}

// Khung "Đánh giá sản phẩm" kiểu Shopee trên trang chi tiết
export default function ProductReviews({ productId }) {
  const [filter, setFilter] = useState({ star: null, media: false });
  const [limit, setLimit] = useState(PAGE);
  const { data, meta, loading } = useFetch(
    () => shopApi.reviews({ productId, star: filter.star || undefined, media: filter.media ? '1' : undefined, limit }),
    [productId, filter.star, filter.media, limit]
  );

  const summary = data?.summary;
  if (!summary || summary.total === 0) {
    return (
      <div id="reviews" className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold uppercase text-gray-900">Đánh giá sản phẩm</h2>
        <p className="mt-3 text-sm text-gray-500">{loading && !data ? 'Đang tải…' : 'Chưa có đánh giá. Mua hàng và đánh giá trong mục Tài khoản → Đơn hàng của tôi sau khi nhận hàng nhé!'}</p>
      </div>
    );
  }

  const pick = (next) => {
    setFilter(next);
    setLimit(PAGE);
  };
  const chip = (active) =>
    `rounded-md border px-3 py-1.5 text-sm transition-colors ${active ? 'border-red-500 bg-white text-red-600' : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'}`;

  return (
    <div id="reviews" className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6 scroll-mt-24">
      <h2 className="text-base md:text-lg font-semibold uppercase text-gray-900">Đánh giá sản phẩm</h2>

      <div className="mt-4 flex flex-col gap-4 rounded-lg border border-red-100 bg-red-50/40 p-4 md:flex-row md:items-center md:gap-8">
        <div className="text-center md:text-left">
          <p className="text-red-600"><span className="text-3xl font-semibold">{summary.average}</span> <span className="text-lg">trên 5</span></p>
          <div className="mt-1 flex justify-center md:justify-start"><Stars value={summary.average} size={20} /></div>
          <p className="mt-1 text-xs text-gray-500">{summary.total} đánh giá</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(!filter.star && !filter.media)} onClick={() => pick({ star: null, media: false })}>Tất cả</button>
          {[5, 4, 3, 2, 1].map((n) => (
            <button key={n} type="button" className={chip(filter.star === n)} onClick={() => pick({ star: n, media: false })}>
              {n} Sao ({summary.stars[n]})
            </button>
          ))}
          <button type="button" className={chip(filter.media)} onClick={() => pick({ star: null, media: true })}>
            Có Hình Ảnh / Video ({summary.withMedia})
          </button>
        </div>
      </div>

      <div className="mt-2">
        {data.items.map((r) => <ReviewItem key={r.id} r={r} />)}
        {!data.items.length && <p className="py-8 text-center text-sm text-gray-500">Chưa có đánh giá phù hợp bộ lọc này.</p>}
      </div>

      {meta && meta.total > data.items.length && (
        <div className="mt-3 text-center">
          <button type="button" disabled={loading} onClick={() => setLimit((n) => n + PAGE)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Xem thêm đánh giá
          </button>
        </div>
      )}
    </div>
  );
}
