import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Camera, KeyRound, Loader2, LogOut, Package, Star, UserRound } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { assetUrl, formatDate, imgFallback } from '../lib/api';
import { useCustomer } from '../context/CustomerContext';
import AddressPicker from '../components/AddressPicker';
import ReviewForm from '../components/ReviewForm';
import CancelOrderSheet from '../components/CancelOrderSheet';
import ProductCard from '../components/ProductCard';

const ORDER_STATUS = {
  PENDING: ['Chờ xác nhận', 'bg-amber-100 text-amber-800'],
  CONFIRMED: ['Đã xác nhận', 'bg-blue-100 text-blue-800'],
  SHIPPING: ['Đang giao', 'bg-indigo-100 text-indigo-800'],
  COMPLETED: ['Hoàn tất', 'bg-emerald-100 text-emerald-800'],
  CANCELLED: ['Đã hủy', 'bg-gray-200 text-gray-600'],
};

const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;
const inputClass = 'w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-amber-400';
const fieldErrors = (err) =>
  Object.fromEntries((err.details || []).map((d) => [String(d.field).replace(/^body\./, ''), d.message]));

function Orders() {
  const { data: orders, loading, error, reload } = useFetch(() => shopApi.myOrders(), []);
  const [reviewing, setReviewing] = useState(null); // sản phẩm đang viết đánh giá
  const [thanks, setThanks] = useState(false);
  const [cancelling, setCancelling] = useState(null); // đơn đang chọn lý do huỷ
  const [cancelled, setCancelled] = useState('');
  if (loading && !orders) return <div className="flex justify-center py-10 text-gray-400"><Loader2 className="animate-spin" /></div>;
  if (error) return <p className="py-6 text-center text-sm text-red-600">{error.message}</p>;
  if (!orders?.length) {
    return (
      <div className="py-10 text-center space-y-3">
        <Package className="mx-auto text-gray-300" size={40} />
        <p className="text-sm text-gray-500">Bạn chưa có đơn hàng nào (chỉ hiện đơn đặt khi đã đăng nhập).</p>
        <Link to="/" className="inline-block rounded-lg bg-[#FFD400] px-5 py-2 text-xs font-bold">Mua sắm ngay</Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
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
      {orders.map((o) => {
        const [label, badge] = ORDER_STATUS[o.status] || [o.status, 'bg-gray-100'];
        return (
          <div key={o.id} className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-3 py-2 text-xs">
              <span>
                Mã đơn <b className="text-gray-900">{o.code}</b> · {formatDate(o.createdAt, true)}
              </span>
              <span className={`rounded-full px-2 py-0.5 font-bold ${badge}`}>{label}</span>
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-2.5 text-xs text-gray-600">
              <span>
                {o.deliveryMethod === 'HOME' ? 'Giao tận nơi' : 'Nhận tại Thanh Đa'} · {o.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'COD'}
                {o.paymentMethod === 'BANK' && (o.paymentStatus === 'PAID' ? ' · Đã thanh toán' : ' · Chưa thanh toán')}
              </span>
              <span>
                Thành tiền: <b className="text-base text-red-600">{vnd(o.total)}</b>
              </span>
            </div>
            {/* Shop chưa xác nhận thì khách được tự huỷ (như Shopee) */}
            {o.status === 'PENDING' && (
              <div className="flex justify-end gap-2 border-t border-gray-100 px-3 py-2.5">
                <a href="https://zalo.me/0325477841" target="_blank" rel="noreferrer" className="rounded-md border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  Liên hệ shop
                </a>
                <button type="button" onClick={() => setCancelling(o)} className="rounded-md border border-red-500 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                  Huỷ đơn hàng
                </button>
              </div>
            )}
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
  ['orders', 'Đơn hàng của tôi', Package],
  ['profile', 'Thông tin & địa chỉ', UserRound],
  ['password', 'Mật khẩu', KeyRound],
];

// Trang Tài khoản của khách hàng
export default function AccountPage() {
  useSeo({ title: 'Tài khoản của tôi', noindex: true });
  const { customer, loading, logout, setCustomer } = useCustomer();
  const [tab, setTab] = useState('orders');
  const avatarRef = useRef(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

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

  return (
    <div className="bg-gray-100 px-2 py-4 md:px-4 min-h-[70vh]">
      <div className="mx-auto max-w-[1000px] space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
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
          <button type="button" onClick={logout} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
            {TABS.map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold ${tab === key ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
          <div className="p-3 md:p-5">
            {tab === 'orders' && <Orders />}
            {tab === 'profile' && <Profile customer={customer} onSaved={setCustomer} />}
            {tab === 'password' && <Password customer={customer} onSaved={setCustomer} />}
          </div>
        </div>

        <Suggestions />
      </div>
    </div>
  );
}
