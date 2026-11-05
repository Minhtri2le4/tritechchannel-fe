import { useEffect, useRef, useState } from 'react';
import { FileSignature, Loader2, ShieldCheck, X } from 'lucide-react';
import { shopApi } from '../services/shop';
import { moneyInWords, vnd } from '../lib/tradeIn';
import SignaturePad from './SignaturePad';

const SHOP_BUYER = 'Hộ kinh doanh HỒ MINH TRÍ (TriTech Channel)';

// Khách điền thông tin người bán + ký tên vào "Giấy mua bán thiết bị" – shop in ra để lưu hồ sơ nguồn gốc hàng
export default function TradeInContractSheet({ item, onClose, onSigned }) {
  const [form, setForm] = useState({
    fullName: item.fullName || '',
    phone: item.phone || '',
    cccd: '',
    cccdDate: '',
    cccdPlace: 'Cục CS QLHC về TTXH',
    address: '',
    imei: '',
    deviceType: item.category?.replace(/^Khác:\s*/, '') || '',
    model: [item.brand, item.deviceName].filter(Boolean).join(' '),
    condition: item.condition || '',
  });
  const [agree, setAgree] = useState(false);
  const [hasSign, setHasSign] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pad = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const signature = pad.current?.toDataURL();
    if (!signature) return setError('Vui lòng ký tên vào ô bên dưới.');
    if (!agree) return setError('Vui lòng xác nhận cam kết nguồn gốc thiết bị.');
    setSaving(true);
    try {
      const { data } = await shopApi.tradeInSign(item.token, { ...form, signature });
      onSigned(data);
    } catch (err) {
      const detail = err.details?.map((d) => d.message).join(' · ');
      setError(detail || err.message);
      setSaving(false);
    }
  };

  const input = 'w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-yellow-500 focus:bg-white';
  const label = 'mb-1 block text-xs font-bold text-gray-700';

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 md:items-center md:p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        className="sheet-up flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-w-[640px] md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold text-gray-900"><FileSignature size={18} /> Giấy mua bán thiết bị</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="p-1 text-gray-500 hover:text-black"><X size={22} /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Tóm tắt giao dịch */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
            <p>
              Bán <b>{item.brand} {item.deviceName}</b> cho <b>{SHOP_BUYER}</b>
            </p>
            <p className="mt-1">
              Giá: <b className="text-red-600">{vnd(item.quotedPrice)}</b>
              <span className="text-gray-600"> ({moneyInWords(item.quotedPrice)})</span>
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {item.sellMethod === 'STORE' ? 'Hình thức: mang máy tới cửa hàng Thanh Đa, Bình Thạnh.' : 'Hình thức: bán online – gửi máy qua đơn vị vận chuyển.'}
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Thông tin người bán (chủ thiết bị)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className={label}>Họ và tên *</label><input className={input} value={form.fullName} onChange={set('fullName')} required /></div>
            <div><label className={label}>Số điện thoại *</label><input className={input} type="tel" value={form.phone} onChange={set('phone')} required /></div>
            <div><label className={label}>Số CCCD *</label><input className={input} inputMode="numeric" maxLength={12} value={form.cccd} onChange={(e) => setForm({ ...form, cccd: e.target.value.replace(/\D/g, '') })} placeholder="12 chữ số" required /></div>
            <div><label className={label}>Ngày cấp *</label><input className={input} type="date" value={form.cccdDate} onChange={set('cccdDate')} required /></div>
            <div><label className={label}>Nơi cấp *</label><input className={input} value={form.cccdPlace} onChange={set('cccdPlace')} required /></div>
            <div className="sm:col-span-2"><label className={label}>Hộ khẩu thường trú (HKTT) *</label><input className={input} value={form.address} onChange={set('address')} placeholder="Số nhà, đường, phường/xã, tỉnh/thành" required /></div>
          </div>

          <p className="pt-1 text-xs font-bold uppercase tracking-wide text-gray-500">Thông tin thiết bị</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={label}>IMEI / Serial *</label><input className={input} value={form.imei} onChange={set('imei')} placeholder="Cài đặt → Giới thiệu, hoặc *#06#" required /></div>
            <div><label className={label}>Loại máy *</label><input className={input} value={form.deviceType} onChange={set('deviceType')} required /></div>
            <div><label className={label}>Mẫu máy *</label><input className={input} value={form.model} onChange={set('model')} required /></div>
            <div><label className={label}>Tình trạng máy *</label><input className={input} value={form.condition} onChange={set('condition')} required /></div>
          </div>

          <label className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              Tôi cam kết thiết bị trên thuộc quyền sở hữu hợp pháp của tôi, không phải tài sản trộm cắp, tranh chấp hay cầm cố.
              Tôi hoàn toàn chịu trách nhiệm trước pháp luật về nguồn gốc thiết bị và đồng ý chuyển quyền sở hữu cho bên mua khi nhận đủ tiền.
            </span>
          </label>

          <div>
            <label className={label}>Chữ ký người bán *</label>
            <SignaturePad ref={pad} onChange={setHasSign} />
          </div>

          <p className="flex items-start gap-1.5 text-[11px] text-gray-500">
            <ShieldCheck size={13} className="mt-0.5 shrink-0" /> Thông tin CCCD chỉ dùng để lập giấy mua bán, lưu hồ sơ nguồn gốc hàng hoá theo quy định và chỉ shop xem được.
          </p>
          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="border-t border-gray-100 p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button type="submit" disabled={saving || !hasSign || !agree} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
            {saving && <Loader2 size={16} className="animate-spin" />} Ký & gửi giấy mua bán
          </button>
        </div>
      </form>
    </div>
  );
}
