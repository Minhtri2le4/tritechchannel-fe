import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { assetUrl } from '../lib/api';
import { useHomeContent } from '../lib/homeContent';

// Đã hiện popup này chưa: lưu theo ảnh, nên đổi ảnh voucher mới trong admin thì khách cũ cũng thấy lại
const seenKey = (image) => `tritech_popup_seen:${image}`;
const DAY_MS = 24 * 60 * 60 * 1000;

function alreadySeen(popup) {
  try {
    if (popup.frequency === 'always') return false;
    if (popup.frequency === 'day') {
      const at = Number(localStorage.getItem(seenKey(popup.image)));
      return at > 0 && Date.now() - at < DAY_MS;
    }
    return sessionStorage.getItem(seenKey(popup.image)) === '1';
  } catch {
    return false;
  }
}

function markSeen(popup) {
  try {
    if (popup.frequency === 'day') localStorage.setItem(seenKey(popup.image), String(Date.now()));
    else if (popup.frequency === 'session') sessionStorage.setItem(seenKey(popup.image), '1');
  } catch {
    // Trình duyệt chặn bộ nhớ (ẩn danh…) – bỏ qua, popup vẫn đóng được
  }
}

// Popup ảnh voucher hiện khi khách vào web (cấu hình trong Admin → Giao diện trang chủ → Popup voucher)
export default function VoucherPopup() {
  const { popup } = useHomeContent();
  const [open, setOpen] = useState(false);
  const active = popup?.enabled && popup.image;

  // Đợi 1 giây cho trang hiện xong rồi mới bật popup
  useEffect(() => {
    if (!active || alreadySeen(popup)) return;
    const t = setTimeout(() => {
      setOpen(true);
      markSeen(popup);
    }, 1000);
    return () => clearTimeout(t);
  }, [active, popup]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const close = () => setOpen(false);
  const img = (
    <img
      src={assetUrl(popup.image)}
      alt="Ưu đãi TriTech Channel"
      className="block max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl"
    />
  );
  const link = popup.link;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" onClick={close} role="dialog" aria-modal="true">
      <div className="relative max-w-[min(92vw,520px)] animate-[popup-in_0.25s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Đóng"
          onClick={close}
          className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black/70 text-white shadow-lg hover:bg-black"
        >
          <X size={18} />
        </button>
        {!link ? (
          img
        ) : link.startsWith('/') ? (
          <Link to={link} onClick={close}>{img}</Link>
        ) : (
          <a href={link} target="_blank" rel="noreferrer" onClick={close}>{img}</a>
        )}
      </div>
    </div>
  );
}
