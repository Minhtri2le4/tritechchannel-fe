import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import { shopApi } from '../services/shop';
import { useCustomer } from '../context/CustomerContext';
import SocialLogin from '../components/SocialLogin';

const inputClass = 'w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-amber-400';

// Lỗi từng ô từ server (zod): { field: 'body.phone', message } -> { phone: message }
const fieldErrors = (err) =>
  Object.fromEntries((err.details || []).map((d) => [String(d.field).replace(/^body\./, ''), d.message]));

// Trang Đăng nhập / Đăng ký tài khoản khách hàng
export default function LoginPage() {
  useSeo({ title: 'Đăng nhập', noindex: true });
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { customer, signIn } = useCustomer();
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ fullName: '', phone: '', password: '', email: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Chỉ quay về trang trong web (tránh chuyển hướng ra ngoài)
  const next = params.get('next')?.startsWith('/') ? params.get('next') : '/tai-khoan';
  if (customer) return <Navigate to={next} replace />;

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const done = (session) => {
    signIn(session);
    navigate(next, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});
    setBusy(true);
    try {
      const { data } =
        tab === 'login'
          ? await shopApi.login({ phone: form.phone, password: form.password })
          : await shopApi.register({ fullName: form.fullName, phone: form.phone, password: form.password, email: form.email });
      done(data);
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(err.details?.length ? '' : err.message);
    } finally {
      setBusy(false);
    }
  };

  const tabClass = (t) =>
    `flex-1 pb-2.5 text-sm font-bold border-b-2 transition-colors ${tab === t ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`;

  return (
    <div className="min-h-[70vh] bg-gray-100 px-3 py-6 md:py-10">
      <div className="mx-auto w-full max-w-[420px] rounded-2xl bg-white p-5 md:p-7 shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 mb-5">
          <button type="button" className={tabClass('login')} onClick={() => { setTab('login'); setMessage(''); setErrors({}); }}>Đăng nhập</button>
          <button type="button" className={tabClass('register')} onClick={() => { setTab('register'); setMessage(''); setErrors({}); }}>Đăng ký</button>
        </div>

        <form onSubmit={submit} className="space-y-3" noValidate>
          {tab === 'register' && (
            <div>
              <input className={inputClass} placeholder="Họ và tên" autoComplete="name" value={form.fullName} onChange={set('fullName')} />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>
          )}
          <div>
            <input className={inputClass} placeholder="Số điện thoại" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <div className="relative">
              <input
                className={`${inputClass} pr-10`}
                type={showPass ? 'text' : 'password'}
                placeholder={tab === 'register' ? 'Mật khẩu (tối thiểu 6 ký tự)' : 'Mật khẩu'}
                autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={set('password')}
              />
              <button type="button" aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
          {tab === 'register' && (
            <div>
              <input className={inputClass} placeholder="Email (không bắt buộc)" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          )}

          {message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}

          <button type="submit" disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold uppercase text-white hover:bg-red-700 disabled:opacity-60">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>

          {tab === 'login' && (
            <p className="text-right text-xs text-gray-500">
              Quên mật khẩu?{' '}
              <a href="https://zalo.me/0325477841" target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">Nhắn Zalo shop</a> để được cấp lại
            </p>
          )}
        </form>

        <div className="mt-4">
          <SocialLogin onSession={done} onError={setMessage} />
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Không cần tài khoản vẫn đặt hàng được.{' '}
          <Link to="/cart" className="font-semibold text-red-600 hover:underline">Về giỏ hàng</Link>
        </p>
      </div>
    </div>
  );
}
