import { shopApi } from '../services/shop';
import { CUSTOMER_TOKEN_KEY } from './api';

// Mã theo dõi các yêu cầu thu cũ khách đã gửi từ trình duyệt này (để xem báo giá mà không cần đăng nhập)
const KEY = 'tritech_tradeins';
const SEEN_KEY = 'tritech_tradein_seen';
export const TRADE_IN_EVENT = 'tritech:tradeins-changed';

const read = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const write = (key, list) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // trình duyệt chặn lưu – vẫn xem được nếu đăng nhập
  }
};

export const savedTokens = () => read(KEY).filter((t) => /^[a-f0-9]{32}$/.test(t));
export const saveToken = (token) => {
  write(KEY, [token, ...savedTokens().filter((t) => t !== token)].slice(0, 20));
  window.dispatchEvent(new Event(TRADE_IN_EVENT));
};

// Lấy mọi yêu cầu của khách: theo mã lưu trong máy + theo tài khoản (nếu đã đăng nhập), bỏ trùng
export const fetchMyTradeIns = async () => {
  const tokens = savedTokens();
  const loggedIn = (() => {
    try {
      return !!localStorage.getItem(CUSTOMER_TOKEN_KEY);
    } catch {
      return false;
    }
  })();
  const [byToken, byAccount] = await Promise.all([
    tokens.length ? shopApi.tradeInTracks(tokens).then((r) => r.data).catch(() => []) : [],
    loggedIn ? shopApi.myTradeIns().then((r) => r.data).catch(() => []) : [],
  ]);
  const map = new Map();
  for (const t of [...byAccount, ...byToken]) map.set(t.token, t);
  return [...map.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Báo giá đang chờ khách trả lời
export const needsAnswer = (t) => t.status === 'QUOTED' && t.quotedPrice != null && !t.decision;
// Đã đồng ý nhưng chưa ký giấy
export const needsSign = (t) => t.status === 'QUOTED' && t.decision === 'ACCEPTED' && !t.signed;

// Đã xem thông báo của lần báo giá này chưa (báo giá lại -> quotedAt đổi -> hiện lại)
const seenKey = (t) => `${t.token}:${t.quotedAt || ''}:${t.decision || ''}`;
export const isSeen = (t) => read(SEEN_KEY).includes(seenKey(t));
export const markSeen = (t) => write(SEEN_KEY, [seenKey(t), ...read(SEEN_KEY)].slice(0, 50));

export const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;

// Đọc số tiền thành chữ cho giấy mua bán: 7500000 -> "Bảy triệu năm trăm nghìn đồng"
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const readTriple = (n, full) => {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const out = [];
  if (full || h > 0) out.push(`${DIGITS[h]} trăm`);
  if (t > 1) {
    out.push(`${DIGITS[t]} mươi`);
    if (u === 1) out.push('mốt');
    else if (u === 5) out.push('lăm');
    else if (u > 0) out.push(DIGITS[u]);
  } else if (t === 1) {
    out.push('mười');
    if (u === 5) out.push('lăm');
    else if (u > 0) out.push(DIGITS[u]);
  } else if (u > 0) {
    if (full || h > 0) out.push('lẻ');
    out.push(DIGITS[u]);
  }
  return out.join(' ');
};
export const moneyInWords = (amount) => {
  let n = Math.round(Number(amount) || 0);
  if (n === 0) return 'Không đồng';
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];
  const groups = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    parts.push(`${readTriple(groups[i], i < groups.length - 1)} ${units[i]}`.trim());
  }
  const s = `${parts.join(' ')} đồng`;
  return s.charAt(0).toUpperCase() + s.slice(1);
};
