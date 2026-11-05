import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { imgFallback } from '../lib/api';

// Xem ảnh phóng to như Shopee: ảnh lớn bên trái có nút trái/phải, tên + lưới ảnh nhỏ bên phải.
// Điện thoại: toàn màn hình nền đen, vuốt ngang để đổi ảnh.
export default function ImageLightbox({ images: initialImages, start = 0, title, onClose, onChange }) {
  // Giữ nguyên danh sách lúc mở (ảnh chính đổi theo không làm lệch thứ tự)
  const [images] = useState(initialImages);
  const [idx, setIdx] = useState(start);
  const touchX = useRef(null);
  const n = images.length;

  const go = (i) => {
    const next = (i + n) % n;
    setIdx(next);
  };

  // Đóng xem ảnh thì ảnh chính trên trang cũng là ảnh đang xem
  useEffect(() => {
    onChange?.(images[idx]);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % n);
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + n) % n);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [n, onClose]);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? idx + 1 : idx - 1);
  };

  const arrow = 'absolute top-1/2 flex h-14 w-9 items-center justify-center bg-black/25 text-white hover:bg-black/45 transition-colors';

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black md:bg-black/60 md:p-6" onClick={onClose}>
      <div
        className="lightbox-in relative flex h-full w-full flex-col md:h-auto md:max-h-[90vh] md:w-auto md:max-w-[960px] md:flex-row md:gap-4 md:bg-white md:p-3 md:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" aria-label="Đóng" onClick={onClose} className="absolute right-3 top-3 z-20 rounded-full bg-black/50 p-1.5 text-white md:-right-3 md:-top-3 md:bg-white md:text-gray-700 md:shadow">
          <X size={20} />
        </button>

        {/* Ảnh lớn */}
        <div
          className="relative flex flex-1 items-center justify-center md:h-[min(640px,80vh)] md:w-[min(640px,80vh)] md:flex-none md:bg-white"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <img key={idx} src={images[idx]} onError={imgFallback} alt={title} className="lightbox-img max-h-full max-w-full select-none object-contain" draggable={false} />
          {n > 1 && (
            <>
              <button type="button" aria-label="Ảnh trước" onClick={() => go(idx - 1)} className={`${arrow} left-0`} style={{ transform: 'translateY(-50%)' }}><ChevronLeft size={30} /></button>
              <button type="button" aria-label="Ảnh sau" onClick={() => go(idx + 1)} className={`${arrow} right-0`} style={{ transform: 'translateY(-50%)' }}><ChevronRight size={30} /></button>
            </>
          )}
          <span style={{ transform: 'translateX(-50%)' }} className="absolute bottom-4 left-1/2 rounded-full bg-black/50 px-3 py-0.5 text-xs text-white md:hidden">
            {idx + 1}/{n}
          </span>
        </div>

        {/* Tên + lưới ảnh nhỏ (máy tính) */}
        <div className="hidden w-[220px] shrink-0 flex-col md:flex">
          <p className="mt-2 line-clamp-2 text-sm text-gray-800">{title}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 overflow-y-auto thin-scroll pr-1">
            {images.map((img, i) => (
              <button
                type="button"
                key={img}
                onClick={() => go(i)}
                onMouseEnter={() => go(i)}
                className={`aspect-square overflow-hidden border-2 bg-white ${i === idx ? 'border-red-500' : 'border-transparent hover:border-gray-300'}`}
              >
                <img src={img} onError={imgFallback} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Dải ảnh nhỏ (điện thoại) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-3 pb-4 md:hidden">
          {images.map((img, i) => (
            <button
              type="button"
              key={img}
              onClick={() => go(i)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded border-2 bg-white ${i === idx ? 'border-red-500' : 'border-transparent opacity-70'}`}
            >
              <img src={img} onError={imgFallback} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
