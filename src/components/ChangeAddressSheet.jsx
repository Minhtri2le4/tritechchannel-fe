import { useEffect, useState } from 'react';
import { Loader2, MapPin, X } from 'lucide-react';
import { shopApi } from '../services/shop';
import { formatAddress } from '../lib/address';
import AddressPicker from './AddressPicker';

// Địa chỉ đơn lưu dạng "Số nhà đường, Phường/Xã, Tỉnh/Thành" -> tách lại để sửa
const splitAddress = (text) => {
  const parts = String(text || '').split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) return { street: text || '', ward: '', province: '' };
  return { street: parts.slice(0, -2).join(', '), ward: parts[parts.length - 2], province: parts[parts.length - 1] };
};

const inputClass = 'w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-amber-400';

// Khách tự đổi người nhận / địa chỉ (như Shopee) khi shop chưa bàn giao cho đơn vị vận chuyển
export default function ChangeAddressSheet({ order, onDone, onClose }) {
  const home = order.deliveryMethod === 'HOME';
  const [form, setForm] = useState({ fullName: order.fullName, phone: order.phone });
  const [addr, setAddr] = useState(() => splitAddress(order.address));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const submit = async () => {
    setError('');
    if (home && (!addr.province || !addr.ward || addr.street.trim().length < 5)) {
      setError('Vui lòng chọn Tỉnh/Thành, Phường/Xã và ghi rõ số nhà, tên đường');
      return;
    }
    setBusy(true);
    try {
      await shopApi.changeOrderAddress(order.id, { ...form, ...(home ? { address: formatAddress(addr) } : {}) });
      onDone();
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 md:items-center" onClick={onClose}>
      <div className="sheet-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-w-[520px] md:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold text-gray-900"><MapPin size={18} className="text-red-500" /> Đổi thông tin nhận hàng</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="p-1 text-gray-500 hover:text-black"><X size={22} /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Đơn <b>{order.code}</b> chưa giao cho đơn vị vận chuyển nên bạn đổi được. Shop sẽ nhận thông báo địa chỉ mới.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <input className={inputClass} placeholder="Họ tên người nhận" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input className={inputClass} placeholder="Số điện thoại" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          {home && <AddressPicker value={addr} onChange={setAddr} />}
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        </div>
        <div className="flex gap-2 border-t border-gray-200 p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700">Để sau</button>
          <button type="button" disabled={busy} onClick={submit} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white disabled:opacity-60">
            {busy && <Loader2 size={16} className="animate-spin" />} Lưu địa chỉ mới
          </button>
        </div>
      </div>
    </div>
  );
}
