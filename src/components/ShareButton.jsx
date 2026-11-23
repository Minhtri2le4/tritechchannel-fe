import { useEffect, useRef, useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';

// Nút chia sẻ kiểu Shopee: điện thoại mở bảng chia sẻ của máy (Zalo, Messenger, Facebook, tin nhắn…),
// máy tính mở menu nhỏ: chép link / Facebook.
export default function ShareButton({ url, title, text, className = 'relative' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement('textarea');
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1500);
  };

  const onClick = async (e) => {
    e.stopPropagation();
    const touch = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (touch && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // khách huỷ
      }
      return;
    }
    setOpen((v) => !v);
  };

  const facebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, 'fbshare', 'width=620,height=560');
    setOpen(false);
  };

  return (
    <div ref={box} className={className} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
      <button
        type="button"
        aria-label="Chia sẻ sản phẩm"
        title="Chia sẻ"
        onClick={onClick}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md ring-1 ring-black/5 backdrop-blur transition active:scale-90 hover:bg-white"
      >
        <Share2 size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-sm shadow-xl">
          <button type="button" onClick={copy} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left font-medium hover:bg-gray-50">
            {copied ? <Check size={16} className="text-emerald-600" /> : <Link2 size={16} className="text-gray-500" />}
            {copied ? 'Đã chép link!' : 'Sao chép liên kết'}
          </button>
          <button type="button" onClick={facebook} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left font-medium hover:bg-gray-50">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877F2] text-[10px] font-black text-white">f</span>
            Chia sẻ lên Facebook
          </button>
        </div>
      )}
    </div>
  );
}
