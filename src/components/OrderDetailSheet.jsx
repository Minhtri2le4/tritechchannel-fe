import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Check, ClipboardList, CreditCard, MapPin, PackageCheck, PackageX, ShieldCheck, Truck, Undo2, X, XCircle } from 'lucide-react';
import { assetUrl, formatDate, imgFallback } from '../lib/api';
import { canChangeAddress, isUnpaidBank, orderStage, timelineSteps } from '../lib/orderFlow';

const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;

// Các bước của đơn – như Shopee: Đặt hàng → Đã xác nhận → Đã bàn giao ĐVVC → Đang giao → Hoàn thành
const STEP_ICON = { PLACED: ClipboardList, CONFIRMED: PackageCheck, HANDED_OVER: Boxes, SHIPPING: Truck, COMPLETED: Check, RETURNING: Undo2, RETURNED: PackageX };
const STATUS_TEXT = {
  PENDING: ['Chờ shop xác nhận', 'Shop sẽ gọi xác nhận đơn trong ít phút.'],
  CONFIRMED: ['Shop đang chuẩn bị hàng', 'Đơn đã được xác nhận, đang đóng gói để giao cho đơn vị vận chuyển.'],
  HANDED_OVER: ['Đã bàn giao cho đơn vị vận chuyển', 'Shipper sẽ lấy hàng và giao tới bạn trong thời gian sớm nhất.'],
  SHIPPING: ['Đơn đang được giao', 'Đơn đang trên đường tới bạn, nhớ để ý điện thoại nhé.'],
  RETURNING: ['Giao hàng không thành công', 'Shipper không giao được đơn và đang hoàn hàng về shop. Bạn vẫn muốn nhận? Nhắn shop để được giao lại.'],
  RETURNED: ['Đơn đã hoàn về shop', 'Đơn giao không thành công và đã được hoàn về shop.'],
  COMPLETED: ['Giao hàng thành công', 'Cảm ơn bạn đã mua hàng tại TriTech Channel.'],
  CANCELLED: ['Đơn đã huỷ', 'Đơn hàng này đã được huỷ.'],
};

const shortTime = (d) => {
  const x = new Date(d);
  return `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')} ${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}`;
};

// Chi tiết 1 đơn hàng của khách (trang Tài khoản): trạng thái, địa chỉ, sản phẩm, tiền, thanh toán
export default function OrderDetailSheet({ order: o, onClose, onCancel, onReview, onPay, onChangeAddress }) {
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

  const cancelled = o.status === 'CANCELLED';
  const steps = timelineSteps(o);
  const stepIdx = steps.reduce((n, s, i) => (s.done ? i : n), 0);
  const unpaid = isUnpaidBank(o);
  const [title, sub] = unpaid && o.status === 'PENDING' ? ['Chờ thanh toán', 'Chuyển khoản theo mã QR để shop xác nhận và giao hàng cho bạn.'] : STATUS_TEXT[orderStage(o)] || [o.status, ''];
  const toReview = o.status === 'COMPLETED' && o.items.find((it) => it.productId && !it.reviewed);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 md:items-center" onClick={onClose}>
      <div
        className="sheet-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-gray-100 shadow-2xl md:max-w-[560px] md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="font-bold text-gray-900">Thông tin đơn hàng</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="p-1 text-gray-500 hover:text-black"><X size={22} /></button>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
          {/* Trạng thái */}
          <div className={`rounded-xl px-4 py-3.5 text-white ${cancelled ? 'bg-gray-500' : (unpaid && o.status === 'PENDING') || orderStage(o) === 'RETURNING' ? 'bg-orange-500' : 'bg-[#26aa99]'}`}>
            <p className="font-bold">{title}</p>
            <p className="text-xs opacity-90">{sub}</p>
            {unpaid && (
              <button type="button" onClick={() => onPay?.(o)} className="mt-2 rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-orange-600">
                Thanh toán ngay
              </button>
            )}
          </div>

          {!cancelled && (
            <div className="rounded-xl bg-white px-2 py-4">
              <div className="relative flex justify-between">
                {(() => {
                  const edge = 50 / steps.length;
                  return (
                    <>
                      <span className="absolute top-4 h-0.5 bg-gray-200" style={{ left: `${edge}%`, right: `${edge}%` }} />
                      <span
                        className="absolute top-4 h-0.5 bg-[#26aa99] transition-all duration-700"
                        style={{ left: `${edge}%`, width: `${(stepIdx / (steps.length - 1)) * (100 - 2 * edge)}%` }}
                      />
                    </>
                  );
                })()}
                {steps.map((s) => {
                  const Icon = STEP_ICON[s.key] || Check;
                  return (
                    <div key={s.key} className="relative z-10 flex flex-1 flex-col items-center gap-1 text-center">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${s.done ? 'border-[#26aa99] bg-[#26aa99] text-white' : 'border-gray-200 bg-white text-gray-300'}`}
                      >
                        <Icon size={15} />
                      </span>
                      <span className={`px-0.5 text-[10.5px] leading-tight ${s.done ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                      {s.done && s.at && <span className="text-[9.5px] leading-tight text-gray-400">{shortTime(s.at)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vận chuyển */}
          {o.carrier && !cancelled && (
            <div className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm">
              <Truck size={18} className="mt-0.5 shrink-0 text-cyan-700" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">Đơn vị vận chuyển: {o.carrier}</p>
                {o.trackingCode ? (
                  <p className="flex items-center gap-2 text-gray-600">
                    Mã vận đơn <b className="font-mono text-gray-900">{o.trackingCode}</b>
                    <button type="button" onClick={() => navigator.clipboard?.writeText(o.trackingCode)} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 active:bg-gray-200">
                      Chép
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">Shop sẽ cập nhật mã vận đơn sớm</p>
                )}
              </div>
            </div>
          )}

          {/* Địa chỉ nhận hàng */}
          <div className="flex gap-3 rounded-xl bg-white px-4 py-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-gray-900">{o.deliveryMethod === 'HOME' ? 'Giao tận nơi' : 'Nhận tại cửa hàng Thanh Đa'}</p>
              <p className="text-gray-700">{o.fullName} · {o.phone}</p>
              {o.deliveryMethod === 'HOME' && o.address && <p className="text-gray-500">{o.address}</p>}
              {o.note && <p className="mt-1 text-xs text-gray-500">Ghi chú: {o.note}</p>}
            </div>
            {canChangeAddress(o) && onChangeAddress && (
              <button type="button" onClick={() => onChangeAddress(o)} className="ml-auto shrink-0 self-start text-xs font-semibold text-red-600 hover:underline">
                Thay đổi
              </button>
            )}
          </div>

          {/* Sản phẩm */}
          <div className="rounded-xl bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5 text-sm">
              <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">Yêu thích</span>
              <b className="text-gray-900">TriTech Channel</b>
            </div>
            {o.items.map((it) => (
              <div key={it.id} className="flex gap-3 border-b border-gray-50 px-4 py-3 last:border-0">
                <img src={assetUrl(it.image)} onError={imgFallback} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-gray-100 bg-white object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-gray-800">{it.productName}</p>
                  {(it.color || it.variantLabel) && <p className="text-xs text-gray-500">Phân loại: {[it.color, it.variantLabel].filter(Boolean).join(', ')}</p>}
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>x{it.quantity}</span>
                    <span className="text-sm font-semibold text-gray-900">{vnd(it.lineTotal)}</span>
                  </div>
                  {it.warranty && (
                    <p className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${it.warranty.pending ? 'text-amber-600' : 'text-emerald-600'}`}>
                      <ShieldCheck size={12} />
                      {it.warranty.pending ? 'Bảo hành: đang chờ shop kích hoạt' : `Bảo hành đến ${formatDate(it.warranty.expiryDate)}`}
                    </p>
                  )}
                  {it.productId && (
                    <Link to={`/product/${it.productId}`} onClick={onClose} className="mt-1 inline-block text-[11px] font-semibold text-red-600 hover:underline">
                      Xem sản phẩm
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tiền */}
          <div className="space-y-1.5 rounded-xl bg-white px-4 py-3 text-sm">
            <Row label="Tổng tiền hàng" value={vnd(o.subtotal)} />
            <Row label="Phí vận chuyển" value={o.shippingFee ? vnd(o.shippingFee) : 'Miễn phí'} />
            {o.discount > 0 && <Row label={`Giảm giá${o.couponCode ? ` (${o.couponCode})` : ''}`} value={`-${vnd(o.discount)}`} valueClass="text-emerald-600" />}
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-semibold text-gray-900">Thành tiền</span>
              <span className="text-lg font-black text-red-600">{vnd(o.total)}</span>
            </div>
          </div>

          {/* Thanh toán + mã đơn */}
          <div className="space-y-1.5 rounded-xl bg-white px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-gray-900"><CreditCard size={16} /> Thanh toán</p>
            <Row label="Phương thức" value={o.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'Thanh toán khi nhận hàng (COD)'} />
            {o.paymentMethod === 'BANK' && (
              <Row label="Trạng thái" value={o.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'} valueClass={o.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'} />
            )}
            <Row label="Mã đơn hàng" value={o.code} valueClass="font-mono font-semibold" />
            <Row label="Thời gian đặt" value={formatDate(o.createdAt, true)} />
            {cancelled && <p className="flex items-center gap-1.5 pt-1 text-xs text-gray-500"><XCircle size={13} /> Đơn đã huỷ</p>}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-2 border-t border-gray-200 bg-white p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <a href="https://zalo.me/0325477841" target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Liên hệ shop
          </a>
          {o.status === 'PENDING' && (
            <button type="button" onClick={() => onCancel(o)} className="flex h-11 flex-1 items-center justify-center rounded-lg border border-red-500 text-sm font-semibold text-red-600 hover:bg-red-50">
              Huỷ đơn hàng
            </button>
          )}
          {toReview && (
            <button type="button" onClick={() => onReview(toReview)} className="flex h-11 flex-1 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700">
              Đánh giá
            </button>
          )}
          {!toReview && (o.status === 'COMPLETED' || cancelled) && o.items[0]?.productId && (
            <Link to={`/product/${o.items[0].productId}`} onClick={onClose} className="flex h-11 flex-1 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700">
              Mua lại
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = 'text-gray-900' }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className={`text-right ${valueClass}`}>{value}</span>
    </div>
  );
}
