import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { assetUrl, formatDate, imgFallback } from '../lib/api';
import { videoEmbed } from '../lib/video';

// Khung video nhúng (YouTube / TikTok / Facebook)
export function PostVideo({ url, className = '' }) {
  const v = videoEmbed(url);
  if (!v) return null;
  return (
    <div className={`mx-auto bg-black rounded-xl overflow-hidden ${v.vertical ? 'aspect-[9/16] max-w-[360px]' : 'aspect-video w-full'} ${className}`}>
      <iframe
        src={v.src}
        title="Video"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

// Xem ảnh phóng to, bấm mũi tên / phím ← → để chuyển ảnh, Esc để đóng
function Lightbox({ images, index, onClose, onMove }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onMove]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button type="button" aria-label="Đóng" className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={onClose}>
        <X size={28} />
      </button>
      {images.length > 1 && (
        <>
          <button type="button" aria-label="Ảnh trước" className="absolute left-2 md:left-6 text-white/80 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); onMove(-1); }}>
            <ChevronLeft size={36} />
          </button>
          <button type="button" aria-label="Ảnh sau" className="absolute right-2 md:right-6 text-white/80 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); onMove(1); }}>
            <ChevronRight size={36} />
          </button>
        </>
      )}
      <img src={assetUrl(images[index])} alt="" onClick={(e) => e.stopPropagation()} className="max-h-[90vh] max-w-[92vw] object-contain" />
      <span className="absolute bottom-4 text-white/70 text-sm">{index + 1} / {images.length}</span>
    </div>
  );
}

// Lưới ảnh kiểu Facebook: 1 ảnh to; 2 ảnh chia đôi; 3+ ảnh = 1 to + các ô nhỏ, ô cuối hiện "+N"
export function ImageCollage({ images, onOpen, max = 5 }) {
  if (!images?.length) return null;
  const shown = images.slice(0, Math.min(images.length, max));
  const extra = images.length - shown.length;

  const tile = (src, i, className = '') => (
    <button key={i} type="button" onClick={() => onOpen?.(i)} className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <img src={assetUrl(src)} onError={imgFallback} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300" />
      {extra > 0 && i === shown.length - 1 && (
        <span className="absolute inset-0 bg-black/50 text-white text-2xl md:text-3xl font-bold flex items-center justify-center">+{extra}</span>
      )}
    </button>
  );

  if (shown.length === 1) {
    return (
      <button type="button" onClick={() => onOpen?.(0)} className="block w-full rounded-xl overflow-hidden bg-gray-50">
        <img src={assetUrl(shown[0])} onError={imgFallback} alt="" loading="lazy" className="w-full max-h-[600px] object-contain" />
      </button>
    );
  }
  if (shown.length === 2) return <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden aspect-[2/1]">{shown.map((s, i) => tile(s, i, 'h-full'))}</div>;

  const [first, ...rest] = shown;
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden aspect-[4/3]">
      {tile(first, 0, 'h-full')}
      <div className={`grid gap-1 h-full grid-rows-2 ${rest.length >= 3 ? 'grid-cols-2' : ''}`}>
        {rest.map((s, i) => tile(s, i + 1, `h-full ${rest.length === 3 && i === 0 ? 'col-span-2' : ''}`))}
      </div>
    </div>
  );
}

// Lưới ảnh + xem phóng to
export function PostGallery({ images }) {
  const [open, setOpen] = useState(null);
  if (!images?.length) return null;
  return (
    <>
      <ImageCollage images={images} onOpen={setOpen} />
      {open !== null && (
        <Lightbox
          images={images}
          index={open}
          onClose={() => setOpen(null)}
          onMove={(d) => setOpen((i) => (i + d + images.length) % images.length)}
        />
      )}
    </>
  );
}

// Đầu bài viết giống Facebook: logo shop + tên + ngày đăng
export function PostAuthor({ date }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/assets/logo.png" alt="" className="w-10 h-10 rounded-full border border-gray-200 bg-white object-contain p-0.5" />
      <div className="leading-tight">
        <p className="text-sm font-bold text-gray-900">TriTech Channel</p>
        <p className="text-xs text-gray-500">{formatDate(date, true)}</p>
      </div>
    </div>
  );
}
