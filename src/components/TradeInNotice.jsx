import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BadgeDollarSign, X } from 'lucide-react';
import { CUSTOMER_TOKEN_KEY } from '../lib/api';
import { TRADE_IN_EVENT, fetchMyTradeIns, isSeen, markSeen, needsAnswer, savedTokens, vnd } from '../lib/tradeIn';

const EVERY_MS = 90 * 1000;
const hasAny = () => {
  try {
    return savedTokens().length > 0 || !!localStorage.getItem(CUSTOMER_TOKEN_KEY);
  } catch {
    return false;
  }
};

// Thông báo nổi ở mọi trang khi shop đã định giá máy khách gửi thu cũ (chưa trả lời)
export default function TradeInNotice() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    let alive = true;
    const check = () => {
      if (!hasAny() || document.visibilityState !== 'visible') return;
      fetchMyTradeIns().then((list) => {
        if (alive) setItem(list.find((t) => needsAnswer(t) && !isSeen(t)) || null);
      });
    };
    check();
    const t = setInterval(check, EVERY_MS);
    window.addEventListener(TRADE_IN_EVENT, check);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener(TRADE_IN_EVENT, check);
    };
  }, []);

  // Đang ở trang Thu cũ thì danh sách đã hiện sẵn
  if (!item || pathname.startsWith('/thu-cu-doi-moi') || pathname.startsWith('/admin')) return null;

  const close = () => {
    markSeen(item);
    setItem(null);
  };
  const open = () => {
    markSeen(item);
    setItem(null);
    // Mã theo dõi là bí mật -> truyền qua state, không để lộ trên thanh địa chỉ
    navigate('/thu-cu-doi-moi', { state: { focus: item.token } });
  };

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[70] md:bottom-6 md:left-6 md:right-auto md:w-[360px]">
      <div className="toast-in flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <BadgeDollarSign size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">Shop đã định giá máy của bạn</p>
          <p className="truncate text-xs text-gray-600">{item.brand} {item.deviceName}</p>
          <p className="text-lg font-black text-red-600">{vnd(item.quotedPrice)}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={open} className="h-9 flex-1 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700">Xem & trả lời</button>
            <button type="button" onClick={close} className="h-9 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50">Để sau</button>
          </div>
        </div>
        <button type="button" aria-label="Đóng" onClick={close} className="self-start p-0.5 text-gray-400 hover:text-black"><X size={16} /></button>
      </div>
    </div>
  );
}
