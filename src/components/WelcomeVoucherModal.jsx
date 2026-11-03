import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Gift, X } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;

// Hộp quà hiện ngay sau khi khách đăng ký tài khoản lần đầu: voucher 50K cho đơn từ 150K
export default function WelcomeVoucherModal() {
  const { welcomeVoucher: v, dismissWelcome } = useCustomer();
  const [copied, setCopied] = useState(false);
  if (!v) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(v.code);
      setCopied(true);
    } catch {
      // trình duyệt chặn copy – khách tự chép mã
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4" onClick={dismissWelcome}>
      <div className="relative w-full max-w-[360px] overflow-hidden rounded-3xl bg-white shadow-2xl" style={{ animation: 'popup-in 0.35s ease-out' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Đóng" onClick={dismissWelcome} className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1 text-gray-600 hover:text-black">
          <X size={18} />
        </button>

        <div className="px-6 pb-5 pt-7 text-center text-white" style={{ background: 'linear-gradient(135deg, #ff7337 0%, #ee4d2d 55%, #d0011b 100%)' }}>
          <Gift size={44} className="mx-auto mb-2 drop-shadow" />
          <p className="text-lg font-black">Chào mừng bạn đến TriTech!</p>
          <p className="mt-1 text-sm opacity-90">Shop tặng bạn voucher thành viên mới</p>
        </div>

        <div className="px-5 py-5">
          {/* Vé voucher */}
          <div className="relative flex items-stretch overflow-hidden rounded-xl border-2 border-dashed border-red-300 bg-red-50">
            <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-red-600 py-3 text-white">
              <span className="text-[10px] font-bold uppercase">Giảm</span>
              <span className="text-2xl font-black leading-none">{Math.round(v.value / 1000)}K</span>
            </div>
            <div className="min-w-0 flex-1 px-3 py-2.5">
              <p className="text-sm font-bold text-gray-900">Giảm {vnd(v.value)}</p>
              <p className="text-xs text-gray-600">Cho đơn từ {vnd(v.minOrder)} · dùng 1 lần</p>
              <button type="button" onClick={copy} className="mt-1.5 flex items-center gap-1.5 rounded-md bg-white px-2 py-1 font-mono text-xs font-bold text-red-600 ring-1 ring-red-200">
                {v.code} {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-gray-500">
            Voucher đã lưu vào <b>Kho voucher</b> trong tài khoản. Ở giỏ hàng, bấm <b>Dùng</b> là áp dụng ngay.
          </p>

          <div className="mt-4 flex gap-2">
            <Link to="/tai-khoan?tab=vouchers" onClick={dismissWelcome} className="flex h-11 flex-1 items-center justify-center rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Xem kho voucher
            </Link>
            <Link to="/" onClick={dismissWelcome} className="flex h-11 flex-1 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700">
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
