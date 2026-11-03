import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck, ShoppingBag, Star, Ticket, Wallet, X, XCircle, CheckCircle2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { assetUrl, formatDate, formatPrice } from '../lib/api';
import { formatAddress } from '../lib/address';
import { adminApi } from './adminApi';
import { Badge, ORDER_STATUS, Spinner } from './ui';

const GENDER = { male: 'Nam', female: 'Nữ', other: 'Khác' };
const STAT_TONES = {
  amber: ['#f59e0b', 'rgba(245,158,11,0.14)'],
  emerald: ['#10b981', 'rgba(16,185,129,0.14)'],
  sky: ['#0ea5e9', 'rgba(14,165,233,0.14)'],
  rose: ['#f43f5e', 'rgba(244,63,94,0.14)'],
  violet: ['#8b5cf6', 'rgba(139,92,246,0.14)'],
  teal: ['#14b8a6', 'rgba(20,184,166,0.14)'],
};

// Bấm 1 khách ở Admin → Khách hàng: khung trượt từ phải hiện thông tin, thống kê mua hàng, đơn gần đây, voucher
export default function CustomerDrawer({ id, onClose }) {
  const { data: c, loading, error } = useFetch(() => adminApi.customers.get(id), [id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const address = !c?.address ? '' : typeof c.address === 'string' ? c.address : formatAddress({ street: '', ward: '', province: '', ...c.address });
  const zaloPhone = c?.phone?.replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose} style={{ animation: 'cat-fade 0.2s ease-out' }}>
      <div
        className="flex h-full w-full max-w-[460px] flex-col bg-gray-50 shadow-2xl"
        style={{ animation: 'customer-drawer-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="font-bold text-gray-900">Thông tin khách hàng</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black"><X size={20} /></button>
        </div>

        {loading && !c ? (
          <div className="flex-1"><Spinner /></div>
        ) : error ? (
          <p className="p-4 text-sm text-red-600">{error.message}</p>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {/* Thẻ khách */}
            <div className="cust-pop rounded-xl border border-gray-200 bg-white p-4" style={{ '--d': '0ms' }}>
              <div className="flex items-center gap-3">
                {c.avatar ? (
                  <img src={assetUrl(c.avatar)} alt="" referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover ring-2 ring-[#FFD400]" />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFD400] text-xl font-black text-black">
                    {c.fullName.trim().split(/\s+/).pop()?.[0]}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-gray-900">{c.fullName}</p>
                  <p className="text-xs text-gray-500">
                    Đăng ký {formatDate(c.createdAt)} · {c.loginWith.join(', ') || '—'}
                  </p>
                  <span
                    className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={c.isActive ? { background: 'rgba(16,185,129,0.14)', color: '#10b981' } : { background: 'rgba(244,63,94,0.14)', color: '#f43f5e' }}
                  >
                    {c.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {c.isActive ? 'Đang hoạt động' : 'Đã khoá'}
                  </span>
                </div>
              </div>

              {/* Liên hệ nhanh */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { href: c.phone && `tel:${c.phone}`, icon: Phone, label: 'Gọi điện' },
                  { href: zaloPhone && `https://zalo.me/${zaloPhone}`, icon: MessageCircle, label: 'Nhắn Zalo' },
                  { href: c.email && `mailto:${c.email}`, icon: Mail, label: 'Gửi email' },
                ].map(({ href, icon: Icon, label }) =>
                  href ? (
                    <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="cust-action flex flex-col items-center gap-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700">
                      <Icon size={16} /> {label}
                    </a>
                  ) : (
                    <span key={label} className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-gray-200 py-2 text-xs text-gray-400">
                      <Icon size={16} /> {label}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Thống kê mua hàng */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: ShoppingBag, label: 'Đơn hàng', value: c.stats.orders, tone: 'amber' },
                { icon: Wallet, label: 'Đã chi', value: formatPrice(c.stats.spent), tone: 'emerald' },
                { icon: CheckCircle2, label: 'Hoàn tất', value: c.stats.completed, tone: 'sky' },
                { icon: XCircle, label: 'Đã huỷ', value: c.stats.cancelled, tone: 'rose' },
                { icon: Star, label: 'Đánh giá', value: c.stats.reviews, tone: 'violet' },
                { icon: ShieldCheck, label: 'Bảo hành', value: c.stats.warranties, tone: 'teal' },
              ].map(({ icon: Icon, label, value, tone }, i) => {
                const [fg, bg] = STAT_TONES[tone];
                return (
                  <div key={label} className="cust-pop rounded-xl border border-gray-200 bg-white p-2.5" style={{ '--d': `${80 + i * 50}ms` }}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: bg, color: fg }}><Icon size={16} /></span>
                    <p className="mt-1.5 truncate text-sm font-black tabular-nums text-gray-900">{value}</p>
                    <p className="text-[11px] text-gray-500">{label}</p>
                  </div>
                );
              })}
            </div>

            {/* Thông tin liên hệ */}
            <div className="cust-pop space-y-2 rounded-xl border border-gray-200 bg-white p-4 text-sm" style={{ '--d': '380ms' }}>
              <InfoRow icon={Phone} label="Số điện thoại" value={c.phone || 'Chưa có'} />
              <InfoRow icon={Mail} label="Email" value={c.email || 'Chưa có'} />
              <InfoRow icon={MapPin} label="Địa chỉ" value={address || 'Chưa lưu địa chỉ'} />
              {c.gender && <InfoRow icon={CheckCircle2} label="Giới tính" value={GENDER[c.gender] || c.gender} />}
              <InfoRow icon={ShoppingBag} label="Mua gần nhất" value={c.stats.lastOrderAt ? formatDate(c.stats.lastOrderAt, true) : 'Chưa mua'} />
            </div>

            {/* Voucher */}
            {c.vouchers.length > 0 && (
              <div className="cust-pop rounded-xl border border-gray-200 bg-white p-4" style={{ '--d': '440ms' }}>
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900"><Ticket size={16} /> Voucher của khách</p>
                {c.vouchers.map((v) => (
                  <div key={v.code} className="flex items-center justify-between gap-2 border-t border-gray-100 py-1.5 text-sm first:border-0">
                    <span className="font-mono text-xs font-semibold text-gray-700">{v.code}</span>
                    <span className="text-xs text-gray-500">Giảm {formatPrice(v.value)} · đơn từ {formatPrice(v.minOrder)}</span>
                    <span className="text-xs font-bold" style={{ color: v.used ? '#94a3b8' : '#10b981' }}>{v.used ? 'Đã dùng' : 'Chưa dùng'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Đơn hàng */}
            <div className="cust-pop rounded-xl border border-gray-200 bg-white" style={{ '--d': '500ms' }}>
              <p className="border-b border-gray-100 px-4 py-3 text-sm font-bold text-gray-900">Đơn hàng ({c.orders.length})</p>
              {c.orders.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">Khách chưa đặt đơn nào</p>
              ) : (
                c.orders.map((o) => (
                  <Link key={o.id} to={`/admin/orders/${o.id}`} onClick={onClose} className="cust-row flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-sm last:border-0">
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-xs font-semibold text-gray-900">{o.code}</span>
                      <span className="text-xs text-gray-500">{formatDate(o.createdAt, true)} · {o.qty} sản phẩm</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-bold tabular-nums text-gray-900">{formatPrice(o.total)}</span>
                      <Badge map={ORDER_STATUS} value={o.status} />
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="mt-0.5 shrink-0 text-gray-400" />
      <span className="w-28 shrink-0 text-gray-500">{label}</span>
      <span className="min-w-0 flex-1 break-words text-gray-900">{value}</span>
    </div>
  );
}
