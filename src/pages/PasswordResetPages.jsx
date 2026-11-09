import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { useCustomer } from '../context/CustomerContext';

const inputClass = 'w-full h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-amber-400';
const ZALO = 'https://zalo.me/0325477841';
const RESEND_SECONDS = 60;

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

// Ô nhập mã 6 số: 6 ô riêng, tự nhảy ô, dán cả mã một lần được
function CodeInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');
  const setAt = (i, d) => {
    const next = digits.slice();
    next[i] = d || ' ';
    onChange(next.join('').replace(/\s+$/, ''));
  };
  const onInput = (i, e) => {
    const v = e.target.value.replace(/\D/g, '');
    if (v.length > 1) {
      // Dán cả mã
      onChange(v.slice(0, 6));
      refs.current[Math.min(v.length, 6) - 1]?.focus();
      return;
    }
    setAt(i, v);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && digits[i] === ' ' && i > 0) refs.current[i - 1]?.focus();
  };
  return (
    <div className="flex justify-between gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d.trim()}
          onChange={(e) => onInput(i, e)}
          onKeyDown={(e) => onKey(i, e)}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          aria-label={`Số thứ ${i + 1}`}
          className="h-12 w-full rounded-lg border border-gray-300 text-center text-xl font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
      ))}
    </div>
  );
}

// Quên mật khẩu: nhập SĐT/email -> shop gửi mã 6 số vào email của tài khoản -> nhập mã + mật khẩu mới
export function ForgotPasswordPage() {
  useSeo({ title: 'Quên mật khẩu', noindex: true });
  const navigate = useNavigate();
  const { signIn } = useCustomer();
  const { data: config } = useFetch(() => shopApi.customerConfig(), []);
  const [step, setStep] = useState('account'); // account -> code -> done
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0);
  const byEmail = config?.passwordResetByEmail;

  // Đếm ngược nút "Gửi lại mã"
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = async (e) => {
    e?.preventDefault();
    setError('');
    if (account.trim().length < 3) return setError('Nhập số điện thoại hoặc email đã đăng ký');
    setBusy(true);
    try {
      await shopApi.forgotPassword(account.trim());
      setStep('code');
      setCode('');
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) return setError('Nhập đủ 6 số trong email');
    if (password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự');
    if (password !== confirm) return setError('Hai mật khẩu chưa giống nhau');
    setBusy(true);
    try {
      const { data } = await shopApi.resetPassword({ account: account.trim(), code, newPassword: password });
      signIn(data);
      setStep('done');
      setTimeout(() => navigate('/tai-khoan', { replace: true }), 1500);
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

  if (step === 'done') {
    return (
      <Box title="Đã đổi mật khẩu">
        <CheckCircle2 className="mx-auto my-4 text-emerald-500" size={48} />
        <p className="text-center text-sm text-gray-600">Mật khẩu mới đã được lưu. Đang chuyển tới tài khoản của bạn…</p>
      </Box>
    );
  }

  if (step === 'code') {
    return (
      <Box title="Nhập mã xác thực">
        <MailCheck className="mx-auto my-3 text-emerald-500" size={40} />
        <p className="text-sm text-gray-600">
          Nếu tài khoản <b>{account.trim()}</b> có email, TriTech đã gửi <b>mã 6 số</b> tới email đó (hết hạn sau 10 phút). Nhớ xem cả mục <b>Thư rác / Spam</b>.
        </p>
        <form onSubmit={reset} className="mt-4 space-y-3">
          <CodeInput value={code} onChange={setCode} />
          <div className="relative">
            <input className={`${inputClass} pr-10`} type={show ? 'text' : 'password'} placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 text-gray-400" style={{ transform: 'translateY(-50%)' }}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <input className={inputClass} type={show ? 'text' : 'password'} placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold uppercase text-white hover:bg-red-700 disabled:opacity-60">
            {busy && <Loader2 size={16} className="animate-spin" />} Đổi mật khẩu
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <button type="button" onClick={() => { setStep('account'); setError(''); }} className="text-gray-500 hover:text-gray-800">← Đổi SĐT / email</button>
          <button type="button" disabled={wait > 0 || busy} onClick={sendCode} className="font-semibold text-red-600 hover:underline disabled:text-gray-400 disabled:no-underline">
            {wait > 0 ? `Gửi lại mã (${wait}s)` : 'Gửi lại mã'}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          Tài khoản chưa có email hoặc không nhận được mã? <a href={ZALO} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">Nhắn Zalo shop</a>
        </p>
      </Box>
    );
  }

  return (
    <Box title="Quên mật khẩu">
      <p className="mb-4 text-sm text-gray-500">Nhập số điện thoại hoặc email đã đăng ký. Shop sẽ gửi <b>mã xác thực 6 số</b> vào email của tài khoản.</p>
      <form onSubmit={sendCode} className="space-y-3">
        <input className={inputClass} placeholder="Số điện thoại hoặc email" autoComplete="username" value={account} onChange={(e) => setAccount(e.target.value)} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy || !config} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold uppercase text-white hover:bg-red-700 disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" />} Gửi mã xác thực
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-gray-500">
        Đăng ký bằng Google? Chỉ cần bấm <b>Tiếp tục với Google</b> ở trang đăng nhập.
      </p>
      <Link to="/dang-nhap" className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-800">← Quay lại đăng nhập</Link>
    </Box>
  );
}

// Link cũ trong email (kiểu link đặt lại) -> chuyển sang trang nhập mã
export function ResetPasswordPage() {
  return <Navigate to="/quen-mat-khau" replace />;
}
