import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { shopApi } from '../services/shop';

const REASONS = [
  'Muốn thay đổi địa chỉ giao hàng',
  'Muốn thay đổi sản phẩm (phân loại, số lượng…)',
  'Muốn nhập / đổi mã giảm giá',
  'Thủ tục thanh toán rắc rối',
  'Tìm thấy giá rẻ hơn ở chỗ khác',
  'Đổi ý, không muốn mua nữa',
];

// Khách huỷ đơn (khi shop chưa xác nhận) – chọn lý do như Shopee
export default function CancelOrderSheet({ order, onDone, onClose }) {
  const [reason, setReason] = useState('');
  const [other, setOther] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const text = reason === 'other' ? other.trim() : reason;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await shopApi.cancelMyOrder(order.id, text);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="sheet-up flex max-h-[90vh] w-full md:max-w-[480px] flex-col rounded-t-2xl md:rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="font-bold text-gray-900">Chọn lý do huỷ đơn</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="p-1 text-gray-500 hover:text-black"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Đơn <b>{order.code}</b> sẽ bị huỷ ngay. Nếu đã chuyển khoản, shop sẽ liên hệ hoàn tiền cho bạn.
          </p>
          {[...REASONS, 'other'].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-3 border-b border-gray-100 py-3 text-sm text-gray-800 last:border-0">
              <input type="radio" name="cancel-reason" checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-red-500" />
              {r === 'other' ? 'Lý do khác' : r}
            </label>
          ))}
          {reason === 'other' && (
            <textarea
              rows={2}
              maxLength={200}
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="Nhập lý do của bạn…"
              className="mb-2 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-red-400"
            />
          )}
          {error && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>
        <div className="flex gap-2 border-t border-gray-100 p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Không huỷ</button>
          <button
            type="button"
            disabled={busy || !text}
            onClick={submit}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} Huỷ đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
