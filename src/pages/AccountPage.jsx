import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Camera, ChevronLeft, ChevronRight, KeyRound, Loader2, LogOut, Package, PackageOpen, RefreshCw, ShieldCheck, Star, Truck, UserRound, Wallet,
} from 'lucide-react';
import useSeo from '../hooks/useSeo';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { assetUrl, formatDate, imgFallback } from '../lib/api';
import { useCustomer } from '../context/CustomerContext';
import AddressPicker from '../components/AddressPicker';
import ReviewForm from '../components/ReviewForm';
import CancelOrderSheet from '../components/CancelOrderSheet';
import ProductCard from '../components/ProductCard';

// Như Shopee: tên trạng thái phía khách (Đã xác nhận = shop đang chuẩn bị, chờ bên giao lấy hàng)
const ORDER_STATUS = {
  PENDING: ['Chờ xác nhận', 'text-amber-600'],
  CONFIRMED: ['Chờ lấy hàng', 'text-blue-600'],
  SHIPPING: ['Chờ giao hàng', 'text-indigo-600'],
  COMPLETED: ['Hoàn thành', 'text-emerald-600'],
  CANCELLED: ['Đã hủy', 'text-gray-500'],
};
const ORDER_TABS = [
  ['ALL', 'Tất cả'],
  ['PENDING', 'Chờ xác nhận'],
  ['CONFIRMED', 'Chờ lấy hàng'],
  ['SHIPPING', 'Chờ giao hàng'],
  ['COMPLETED', 'Hoàn thành'],
  ['CANCELLED', 'Đã hủy'],
];

const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;
const inputClass = 'w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-amber-400';
const fieldErrors = (err) =>
  Object.fromEntries((err.details || []).map((d) => [String(d.field).replace(/^body\./, ''), d.message]));

function Orders({ orders, loading, error, reload, filter, onFilter }) {
  const [reviewing, setReviewing] = useState(null); // sản phẩm đang viết đánh giá
  const [thanks, setThanks] = useState(false);
  const [cancelling, setCancelling] = useState(null); // đơn đang chọn lý do huỷ
  const [cancelled, setCancelled] = useState('');
  if (loading && !orders) return <div className="flex justify-center py-10 text-gray-400"><Loader2 className="animate-spin" /></div>;
  if (error) return <p className="py-6 text-center text-sm text-red-600">{error.message}</p>;
  const shown = (orders || []).filter((o) => filter === 'ALL' || o.status === filter);
  return (
    <div className="space-y-3">
      {/* Thanh trạng thái như mục "Đơn mua" của Shopee */}
      <div className="-mx-3 -mt-3 md:-mx-5 md:-mt-5 mb-1 flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
        {ORDER_TABS.map(([key, label]) => {
          const n = key === 'ALL' ? 0 : (orders || []).filter((o) => o.status === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilter(key)}
              className={`relative flex flex-1 shrink-0 items-center justify-center gap-1 whitespace-nowrap px-3 py-3 text-sm transition-colors ${
                filter === key ? 'font-semibold text-red-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
              {n > 0 && ['PENDING', 'CONFIRMED', 'SHIPPING'].includes(key) && <span className="text-xs text-red-600">({n})</span>}
              <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-red-600 transition-transform duration-300 ${filter === key ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          );
        })}
      </div>
      {!shown.length && (
        <div className="py-10 text-center space-y-3">
          <Package className="mx-auto text-gray-300" size={44} />
          <p className="text-sm text-gray-500">
            {orders?.length ? 'Chưa có đơn hàng nào ở mục này' : 'Bạn chưa có đơn hàng nào (chỉ hiện đơn đặt khi đã đăng nhập).'}
          </p>
          <Link to="/" className="inline-block rounded-lg bg-[#FFD400] px-5 py-2 text-xs font-bold">Mua sắm ngay</Link>
        </div>
      )}
      {thanks && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">✅ Cảm ơn bạn đã đánh giá! Đánh giá đã hiện trên trang sản phẩm.</p>
      )}
      {cancelled && (
        <p className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">Đã huỷ đơn {cancelled}.</p>
      )}
      {cancelling && (
        <CancelOrderSheet
          order={cancelling}
          onClose={() => setCancelling(null)}
          onDone={() => {
            setCancelled(cancelling.code);
            setCancelling(null);
            reload();
          }}
        />
      )}
      {reviewing && (
        <ReviewForm
          item={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null);
            setThanks(true);
            reload();
          }}
        />
      )}
      {shown.map((o, i) => {
        const [label, color] = ORDER_STATUS[o.status] || [o.status, 'text-gray-500'];
        const toReview = o.status === 'COMPLETED' && o.items.find((it) => it.productId && !it.reviewed);
        return (
          <div key={`${filter}-${o.id}`} className="acc-order rounded-xl border border-gray-200 overflow-hidden bg-white" style={{ '--acc-delay': `${Math.min(i, 6) * 60}ms` }}>
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 text-xs">
              <span className="flex min-w-0 items-center gap-2">
                <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">Yêu thích</span>
                <b className="truncate text-sm text-gray-900">TriTech Channel</b>
              </span>
              <span className={`shrink-0 font-bold uppercase ${color}`}>{label}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {o.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Link to={`/product/${it.productId}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
                    <img src={assetUrl(it.image)} onError={imgFallback} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 bg-white object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-gray-800">{it.productName}</p>
                      <p className="text-xs text-gray-500">
                        {[it.color, it.variantLabel].filter(Boolean).join(', ')} {it.quantity > 1 && `x${it.quantity}`}
                      </p>
                      {/* Phiếu bảo hành tự tạo khi nhận hàng */}
                      {it.warranty && (
                        <p className={`mt-0.5 flex items-center gap-1 text-[11px] font-semibold ${it.warranty.pending ? 'text-amber-600' : 'text-emerald-600'}`}>
                          <ShieldCheck size={12} />
                          {it.warranty.pending ? 'Bảo hành: đang chờ shop kích hoạt' : `Bảo hành đến ${formatDate(it.warranty.expiryDate)}`}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm font-semibold text-gray-900">{vnd(it.lineTotal)}</span>
                    {o.status === 'COMPLETED' && it.productId && (
                      it.reviewed ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600"><Star size={12} className="fill-emerald-500 text-emerald-500" /> Đã đánh giá</span>
                      ) : (
                        <button type="button" onClick={() => setReviewing(it)} className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700">
                          Đánh giá
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-2 border-t border-gray-100 px-3 py-2.5 text-xs text-gray-500">
              <span>
                Mã đơn {o.code} · {formatDate(o.createdAt, true)}
                <br />
                {o.deliveryMethod === 'HOME' ? 'Giao tận nơi' : 'Nhận tại Thanh Đa'} · {o.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'COD'}
                {o.paymentMethod === 'BANK' && (o.paymentStatus === 'PAID' ? ' · Đã thanh toán' : ' · Chưa thanh toán')}
              </span>
              <span className="text-right text-gray-700">
                Tổng số tiền ({o.items.reduce((n, it) => n + it.quantity, 0)} sản phẩm): <b className="text-base text-red-600">{vnd(o.total)}</b>
              </span>
            </div>
            {/* Nút hành động theo trạng thái – như Shopee */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-3 py-2.5">
              <span className="basis-full text-[11px] text-gray-500 sm:mr-auto sm:basis-auto">
                {o.status === 'PENDING' && 'Shop sẽ gọi xác nhận đơn trong ít phút'}
                {o.status === 'CONFIRMED' && 'Shop đang chuẩn bị hàng cho bạn'}
                {o.status === 'SHIPPING' && 'Đơn đang trên đường giao tới bạn'}
                {o.status === 'COMPLETED' && (toReview ? 'Đánh giá sản phẩm để giúp người mua khác nhé!' : 'Cảm ơn bạn đã mua hàng')}
              </span>
              <a
                href="https://zalo.me/0325477841"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 transition-transform hover:bg-gray-50 active:scale-95"
              >
                Liên hệ shop
              </a>
              {/* Shop chưa xác nhận thì khách được tự huỷ */}
              {o.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => setCancelling(o)}
                  className="rounded-md border border-red-500 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 transition-transform hover:bg-red-50 active:scale-95"
                >
                  Huỷ đơn hàng
                </button>
              )}
              {toReview && (
                <button
                  type="button"
                  onClick={() => setReviewing(toReview)}
                  className="rounded-md border border-red-500 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 transition-transform hover:bg-red-50 active:scale-95"
                >
                  Đánh giá
                </button>
              )}
              {(o.status === 'COMPLETED' || o.status === 'CANCELLED') && o.items[0]?.productId && (
                <Link
                  to={`/product/${o.items[0].productId}`}
                  className="rounded-md bg-red-600 px-5 py-1.5 text-xs font-bold text-white transition-transform hover:bg-red-700 active:scale-95"
                >
                  Mua lại
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Profile({ customer, onSaved }) {
  const [form, setForm] = useState({
    fullName: customer.fullName || '',
    phone: customer.phone || '',
    email: customer.email || '',
    gender: customer.gender || 'Anh',
  });
  const [addr, setAddr] = useState(customer.address || { province: '', ward: '', street: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setErrors({});
    try {
      const { data } = await shopApi.updateMe({
        ...form,
        phone: form.phone || undefined,
        address: addr.province || addr.street ? addr : null,
      });
      onSaved(data);
      setMessage('✅ Đã lưu – lần sau đặt hàng sẽ tự điền sẵn');
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(`❌ ${err.details?.[0]?.message || err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-3 max-w-xl">
      <div className="flex gap-4 text-sm">
        {['Anh', 'Chị'].map((g) => (
          <label key={g} className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="gender" checked={form.gender === g} onChange={() => setForm((f) => ({ ...f, gender: g }))} className="accent-amber-400" /> {g}
          </label>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input className={inputClass} placeholder="Họ và tên" value={form.fullName} onChange={set('fullName')} />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>
        <div>
          <input className={inputClass} placeholder="Số điện thoại" inputMode="tel" value={form.phone} onChange={set('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          {!customer.phone && <p className="mt-1 text-[11px] text-amber-700">Thêm số điện thoại để shop liên hệ giao hàng</p>}
        </div>
        <div className="sm:col-span-2">
          <input className={inputClass} placeholder="Email (không bắt buộc)" type="email" value={form.email} onChange={set('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-800">Địa chỉ giao hàng mặc định</p>
        <AddressPicker value={addr} errors={{}} onChange={setAddr} />
      </div>
      {message && <p className={`text-sm font-semibold ${message.startsWith('❌') ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>}
      <button type="submit" disabled={busy} className="flex h-10 items-center gap-2 rounded-lg bg-[#FFD400] px-6 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-60">
        {busy && <Loader2 size={15} className="animate-spin" />} Lưu thông tin
      </button>
    </form>
  );
}

function Password({ customer, onSaved }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await shopApi.changeMyPassword({ currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      onSaved({ ...customer, hasPassword: true });
      setMessage('✅ Đã cập nhật mật khẩu');
    } catch (err) {
      setMessage(`❌ ${err.details?.[0]?.message || err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-3 max-w-sm">
      {!customer.hasPassword && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Bạn đang đăng nhập bằng Google/Facebook. Đặt mật khẩu để có thể đăng nhập bằng số điện thoại{customer.phone ? '' : ' (cần thêm số điện thoại ở mục Thông tin)'}.
        </p>
      )}
      {customer.hasPassword && (
        <input className={inputClass} type="password" placeholder="Mật khẩu hiện tại" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      )}
      <input className={inputClass} type="password" placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
      {message && <p className={`text-sm font-semibold ${message.startsWith('❌') ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>}
      <button type="submit" disabled={busy} className="flex h-10 items-center gap-2 rounded-lg bg-gray-900 px-6 text-sm font-bold text-white hover:bg-black disabled:opacity-60">
        {busy && <Loader2 size={15} className="animate-spin" />} {customer.hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'}
      </button>
    </form>
  );
}

// "Có thể bạn cũng thích" cuối trang Tài khoản (như Shopee): sản phẩm bán chạy, bấm Xem thêm để tải tiếp
const SUGGEST_PAGE = 10;
function Suggestions() {
  const [limit, setLimit] = useState(SUGGEST_PAGE);
  const { data: products, meta, loading } = useFetch(() => shopApi.products({ sort: 'best_selling', limit }), [limit]);
  if (!products?.length) return null;
  return (
    <div className="pt-3">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-300" />
        <h2 className="text-sm md:text-base font-semibold text-gray-700">Có thể bạn cũng thích</h2>
        <span className="h-px flex-1 bg-gray-300" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-3">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {meta && meta.total > products.length && (
        <div className="mt-4 text-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => setLimit((n) => n + SUGGEST_PAGE)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />} Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}

const TABS = [
  ['orders', 'Đơn mua', Package],
  ['profile', 'Thông tin & địa chỉ', UserRound],
  ['password', 'Mật khẩu', KeyRound],
];

// Hàng icon "Đơn mua" như trang Tôi của Shopee – số đỏ = số đơn ở trạng thái đó
const ORDER_SHORTCUTS = [
  ['PENDING', 'Chờ xác nhận', Wallet],
  ['CONFIRMED', 'Chờ lấy hàng', PackageOpen],
  ['SHIPPING', 'Chờ giao hàng', Truck],
  ['REVIEW', 'Đánh giá', Star],
];

// Trang Tài khoản của khách hàng
export default function AccountPage() {
  useSeo({ title: 'Tài khoản của tôi', noindex: true });
  const { customer, loading, logout, setCustomer } = useCustomer();
  const [tab, setTab] = useState('orders');
  const [filter, setFilter] = useState('ALL');
  const avatarRef = useRef(null);
  const listRef = useRef(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const ordersFetch = useFetch(() => (customer ? shopApi.myOrders() : Promise.resolve({ data: null })), [customer?.id]);
  const orders = ordersFetch.data || [];

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>;
  if (!customer) return <Navigate to="/dang-nhap?next=/tai-khoan" replace />;

  const changeAvatar = async (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|heic)$/.test(file.type)) return alert('Chỉ nhận ảnh JPG, PNG, WEBP');
    if (file.size > 3 * 1024 * 1024) return alert('Ảnh tối đa 3MB');
    setAvatarBusy(true);
    try {
      const { data } = await shopApi.uploadAvatar(file);
      setCustomer(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setAvatarBusy(false);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  };

  const methods = [customer.hasPassword && customer.phone && 'Số điện thoại', customer.googleLinked && 'Google', customer.facebookLinked && 'Facebook'].filter(Boolean);
  const countOf = (key) =>
    key === 'REVIEW'
      ? orders.filter((o) => o.status === 'COMPLETED').reduce((n, o) => n + o.items.filter((it) => it.productId && !it.reviewed).length, 0)
      : orders.filter((o) => o.status === key).length;
  const openOrders = (key) => {
    setTab('orders');
    setFilter(key === 'REVIEW' ? 'COMPLETED' : key);
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const tools = [
    { label: 'Thông tin & địa chỉ', icon: UserRound, onClick: () => setTab('profile') },
    { label: 'Đổi mật khẩu', icon: KeyRound, onClick: () => setTab('password') },
    { label: 'Thu cũ đổi mới', icon: RefreshCw, to: '/thu-cu-doi-moi' },
    { label: 'Tra cứu bảo hành', icon: ShieldCheck, to: '/bao-hanh' },
  ];

  return (
    <div className="bg-gray-100 px-2 py-4 md:px-4 min-h-[70vh]">
      <div className="mx-auto max-w-[1000px] space-y-3">
        <div className="acc-pop flex items-center gap-3 rounded-2xl border border-amber-200 p-4"
          style={{ background: 'linear-gradient(100deg, #FFD400 0%, #ffe14d 55%, #fff3b0 100%)' }}
        >
          <button
            type="button"
            title="Đổi ảnh đại diện"
            onClick={() => avatarRef.current?.click()}
            className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-full"
          >
            {customer.avatar ? (
              <img src={assetUrl(customer.avatar)} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[#FFD400] text-xl font-black text-black">
                {customer.fullName.trim().split(/\s+/).pop()?.[0]?.toUpperCase()}
              </span>
            )}
            <span className={`absolute inset-x-0 bottom-0 flex h-5 items-center justify-center bg-black/55 text-white ${avatarBusy ? '' : 'opacity-80 group-hover:opacity-100'}`}>
              {avatarBusy ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            </span>
            <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" hidden onChange={(e) => changeAvatar(e.target.files?.[0])} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-gray-900">{customer.fullName}</p>
            <p className="text-xs text-gray-500">{customer.phone || 'Chưa có số điện thoại'}{methods.length > 0 && ` · Đăng nhập bằng ${methods.join(', ')}`}</p>
          </div>
          <button type="button" onClick={logout} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-white">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>

        {/* Đơn mua – như trang Tôi của Shopee */}
        <div className="acc-pop rounded-2xl border border-gray-200 bg-white" style={{ '--acc-delay': '80ms' }}>
          <div className="flex items-center justify-between px-4 pt-3.5">
            <h2 className="font-bold text-gray-900">Đơn mua</h2>
            <button type="button" onClick={() => openOrders('ALL')} className="flex items-center text-xs text-gray-500 hover:text-gray-900">
              Xem lịch sử mua hàng <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-4 px-2 pb-3 pt-2">
            {ORDER_SHORTCUTS.map(([key, label, Icon]) => {
              const n = countOf(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => openOrders(key)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl py-2 text-center hover:bg-gray-50 active:scale-95 transition-transform"
                >
                  <span className="relative">
                    <Icon size={28} strokeWidth={1.5} className="text-gray-800 transition-transform group-hover:-translate-y-0.5" />
                    {n > 0 && (
                      <span className="acc-badge absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {n > 99 ? '99+' : n}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] md:text-xs text-gray-700">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tiện ích của tôi */}
        <div className="acc-pop rounded-2xl border border-gray-200 bg-white px-4 py-3.5" style={{ '--acc-delay': '160ms' }}>
          <h2 className="mb-2 font-bold text-gray-900">Tiện ích của tôi</h2>
          <div className="grid grid-cols-4 gap-1">
            {tools.map(({ label, icon: Icon, onClick, to }) => {
              const inner = (
                <>
                  <Icon size={24} strokeWidth={1.6} className="text-gray-800 transition-transform group-hover:-translate-y-0.5" />
                  <span className="text-[11px] md:text-xs leading-tight text-gray-700">{label}</span>
                </>
              );
              const cls = 'group flex flex-col items-center gap-1.5 rounded-xl py-2 text-center hover:bg-gray-50 active:scale-95 transition-transform';
              return to ? (
                <Link key={label} to={to} className={cls}>{inner}</Link>
              ) : (
                <button key={label} type="button" onClick={onClick} className={cls}>{inner}</button>
              );
            })}
          </div>
        </div>

        <div ref={listRef} className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white">
          {/* Thông tin / Mật khẩu mở từ "Tiện ích của tôi" – có nút quay lại Đơn mua */}
          {tab !== 'orders' && (
            <div className="flex items-center gap-2 border-b border-gray-200 px-2 py-2">
              <button type="button" onClick={() => setTab('orders')} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
                <ChevronLeft size={18} /> Đơn mua
              </button>
              <h2 className="font-bold text-gray-900">{TABS.find(([key]) => key === tab)?.[1]}</h2>
            </div>
          )}
          <div key={tab} className="acc-order p-3 md:p-5">
            {tab === 'orders' && (
              <Orders
                orders={ordersFetch.data}
                loading={ordersFetch.loading}
                error={ordersFetch.error}
                reload={ordersFetch.reload}
                filter={filter}
                onFilter={setFilter}
              />
            )}
            {tab === 'profile' && <Profile customer={customer} onSaved={setCustomer} />}
            {tab === 'password' && <Password customer={customer} onSaved={setCustomer} />}
          </div>
        </div>

        <Suggestions />
      </div>
    </div>
  );
}
