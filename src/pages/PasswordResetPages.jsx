import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { useCustomer } from '../context/CustomerContext';

const inputClass = 'w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-amber-400';
const ZALO = 'https://zalo.me/0325477841';

function Box({ title, children }) {
  return (
    <div className="min-h-[70vh] bg-gray-100 px-3 py-6 md:py-10">
      <div className="mx-auto w-full max-w-[420px] rounded-2xl bg-white p-5 md:p-7 shadow-sm border border-gray-200">
        <h1 className="mb-1 text-lg font-black text-gray-900">{title}</h1>
        {children}
      </div>
    </div>
  );
}

// Quên mật khẩu: nhập SĐT hoặc email -> shop gửi link đặt lại vào email của tài khoản
export function ForgotPasswordPage() {
  useSeo({ title: 'Quên mật khẩu', noindex: true });
  const { data: config } = useFetch(() => shopApi.customerConfig(), []);
  const [account, setAccount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const byEmail = config?.passwordResetByEmail;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await shopApi.forgotPassword(account);
      setDone(true);
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (config && !byEmail) {
    return (
      <Box title="Quên mật khẩu">
        <p className="mt-2 text-sm text-gray-600">Nhắn Zalo cho shop kèm số điện thoại đã đăng ký, shop sẽ cấp lại mật khẩu cho bạn trong ít phút.</p>
        <a href={ZALO} target="_blank" rel="noreferrer" className="mt-4 flex h-11 items-center justify-center rounded-lg bg-[#0068FF] text-sm font-bold text-white hover:bg-[#005AE0]">
          Nhắn Zalo 0325 477 841
        </a>
        <Link to="/dang-nhap" className="mt-4 block text-center text-sm text-gray-500 hover:text-gray-800">← Quay lại đăng nhập</Link>
      </Box>
    );
  }

  if (done) {
    return (
      <Box title="Kiểm tra email của bạn">
        <MailCheck className="mx-auto my-4 text-emerald-500" size={48} />
        <p className="text-sm text-gray-600">
          Nếu tài khoản có email, TriTech đã gửi link đặt lại mật khẩu (hết hạn sau 30 phút). Nhớ xem cả mục <b>Thư rác / Spam</b>.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Tài khoản chưa có email hoặc không nhận được thư?{' '}
          <a href={ZALO} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">Nhắn Zalo shop</a> để được cấp lại.
        </p>
        <Link to="/dang-nhap" className="mt-5 block text-center text-sm font-semibold text-red-600 hover:underline">Về trang đăng nhập</Link>
      </Box>
    );
  }

  return (
    <Box title="Quên mật khẩu">
      <p className="mb-4 text-sm text-gray-500">Nhập số điện thoại hoặc email đã đăng ký. Shop sẽ gửi link đặt mật khẩu mới vào email của tài khoản.</p>
      <form onSubmit={submit} className="space-y-3">
        <input className={inputClass} placeholder="Số điện thoại hoặc email" autoComplete="username" value={account} onChange={(e) => setAccount(e.target.value)} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy || !config} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold uppercase text-white hover:bg-red-700 disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" />} Gửi link đặt lại
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-gray-500">
        Đăng ký bằng Google? Chỉ cần bấm <b>Tiếp tục với Google</b> ở trang đăng nhập.
      </p>
      <Link to="/dang-nhap" className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-800">← Quay lại đăng nhập</Link>
    </Box>
  );
}

// Mở từ link trong email: đặt mật khẩu mới rồi đăng nhập luôn
export function ResetPasswordPage() {
  useSeo({ title: 'Đặt lại mật khẩu', noindex: true });
  const navigate = useNavigate();
  const { signIn } = useCustomer();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự');
    if (password !== confirm) return setError('Hai mật khẩu chưa giống nhau');
    setBusy(true);
    try {
      const { data } = await shopApi.resetPassword({ token, newPassword: password });
      signIn(data);
      setDone(true);
      setTimeout(() => navigate('/tai-khoan', { replace: true }), 1500);
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return (
      <Box title="Link không hợp lệ">
        <p className="mt-2 text-sm text-gray-600">Link đặt lại mật khẩu bị thiếu hoặc sai. Hãy mở lại đúng link trong email, hoặc yêu cầu link mới.</p>
        <Link to="/quen-mat-khau" className="mt-4 flex h-11 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white">Yêu cầu link mới</Link>
      </Box>
    );
  }

  if (done) {
    return (
      <Box title="Đã đổi mật khẩu">
        <CheckCircle2 className="mx-auto my-4 text-emerald-500" size={48} />
        <p className="text-center text-sm text-gray-600">Mật khẩu mới đã được lưu. Đang chuyển tới tài khoản của bạn…</p>
      </Box>
    );
  }

  return (
    <Box title="Đặt mật khẩu mới">
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="relative">
          <input className={`${inputClass} pr-10`} type={show ? 'text' : 'password'} placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <input className={inputClass} type={show ? 'text' : 'password'} placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            {/hết hạn/.test(error) && <Link to="/quen-mat-khau" className="ml-1 font-semibold underline">Yêu cầu link mới</Link>}
          </p>
        )}
        <button type="submit" disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold uppercase text-white hover:bg-red-700 disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" />} Lưu mật khẩu mới
        </button>
      </form>
    </Box>
  );
}
