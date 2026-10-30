import { useEffect } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import { imgFallback } from '../lib/api';

const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}₫`;

const optionClass = (active, disabled) =>
  `relative border rounded-md px-3 py-1.5 text-sm transition-colors ${
    active ? 'border-red-500 text-red-600 bg-red-50/40' : 'border-gray-200 text-gray-800 hover:border-red-400'
  } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`;

const Tick = () => <Check size={12} className="absolute -bottom-px -right-px bg-red-500 text-white rounded-tl" />;

// Bảng chọn phân loại kiểu Shopee: trượt từ dưới lên trên điện thoại, hiện giữa màn hình trên máy tính.
// mode: 'cart' (thêm vào giỏ) | 'buy' (mua ngay). Mọi lựa chọn dùng chung state với trang sản phẩm.
export default function VariantSheet({
  mode, confirmLabel, image, priceText, originalPrice, stockText, variants, colors,
  variantId, onVariant, color, onColor, qty, maxQty, onQty, missing, onConfirm, onClose,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const buy = mode === 'buy';

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="sheet-up w-full md:max-w-[520px] max-h-[88vh] flex flex-col bg-white rounded-t-2xl md:rounded-2xl shadow-2xl"
      >
        {/* Ảnh + giá */}
        <div className="flex gap-3 p-4 border-b border-gray-100">
          <img src={image} onError={imgFallback} alt="" className="w-24 h-24 md:w-28 md:h-28 -mt-10 md:mt-0 rounded-lg border border-gray-200 bg-white object-contain shadow-sm" />
          <div className="flex-1 min-w-0 self-end">
            <p className="text-lg md:text-xl font-semibold text-red-600 leading-tight">{priceText}</p>
            {originalPrice ? <p className="text-xs text-gray-400 line-through">{vnd(originalPrice)}</p> : null}
            <p className="text-xs text-gray-500 mt-0.5">{stockText}</p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="self-start p-1 text-gray-500 hover:text-black">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {colors.length > 0 && (
            <div>
              <p className="text-sm text-gray-800 mb-2">Phân loại</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button key={c.id} type="button" onClick={() => onColor(c)} className={`${optionClass(color === c.name, false)} flex items-center gap-2 pl-1.5`}>
                    {c.image ? (
                      <img src={c.imageUrl} onError={imgFallback} alt="" className="w-8 h-8 object-contain rounded" />
                    ) : (
                      c.hex && <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }} />
                    )}
                    {c.name}
                    {color === c.name && <Tick />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {variants.length > 0 && (
            <div>
              <p className="text-sm text-gray-800 mb-2">Phiên bản</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button key={v.id} type="button" disabled={v.stock <= 0} onClick={() => onVariant(v.id)} className={optionClass(variantId === v.id, v.stock <= 0)}>
                    {v.label}
                    {v.stock <= 0 && <span className="ml-1 text-[10px]">(hết)</span>}
                    {variantId === v.id && <Tick />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-800">Số lượng</p>
            <div className="flex items-center border border-gray-300 rounded">
              <button type="button" aria-label="Giảm" disabled={qty <= 1} onClick={() => onQty(qty - 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 disabled:opacity-30">
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-sm text-red-600 font-semibold">{qty}</span>
              <button type="button" aria-label="Tăng" disabled={qty >= maxQty} onClick={() => onQty(qty + 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 disabled:opacity-30">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-gray-100" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          {missing && <p className="text-xs text-red-600 text-center mb-2">Vui lòng chọn {missing}</p>}
          <button
            type="button"
            disabled={Boolean(missing)}
            onClick={onConfirm}
            className={`w-full py-3 rounded-lg text-sm font-bold uppercase transition-colors disabled:bg-gray-200 disabled:text-gray-400 ${
              buy ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-400 hover:bg-amber-500 text-black'
            }`}
          >
            {confirmLabel || (buy ? 'Mua ngay' : 'Thêm vào giỏ hàng')}
          </button>
        </div>
      </div>
    </div>
  );
}
