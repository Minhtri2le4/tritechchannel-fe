import { useEffect } from 'react';
import { Clock3, X } from 'lucide-react';
import BankTransferBox from './BankTransferBox';

// "Thanh toán ngay" trong Đơn mua: mở lại mã QR chuyển khoản của đơn chưa thanh toán
export default function PayOrderSheet({ order, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 md:items-center" onClick={onClose}>
      <div className="sheet-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-w-[440px] md:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock3 size={20} className="text-amber-600" />
            <div>
              <h2 className="font-bold text-gray-900">Thanh toán đơn {order.code}</h2>
              <p className="text-[11px] text-gray-600">Chuyển khoản để shop xác nhận và giao hàng</p>
            </div>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="p-1 text-gray-500 hover:text-black"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <BankTransferBox code={order.transferContent || order.code} total={order.total} phone={order.phone} />
          <button type="button" onClick={onClose} className="mt-4 h-11 w-full rounded-xl bg-[#FFD400] text-sm font-black text-black hover:bg-amber-400">
            Tôi đã chuyển khoản
          </button>
        </div>
      </div>
    </div>
  );
}
