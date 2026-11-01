// Sản phẩm đăng trong 14 ngày gần nhất -> nhãn "Hàng mới về" (như Shopee). Mốc thời gian lấy 1 lần khi tải trang.
// Chỉ tính sản phẩm đăng từ 01/11/2026: hàng có sẵn lúc mở web (đăng dồn cuối tháng 10) không gắn nhãn.
const NEW_FOR_MS = 14 * 24 * 60 * 60 * 1000;
const NEW_SINCE = Date.parse('2026-11-01T00:00:00+07:00');
const LOADED_AT = Date.now();

export const isNewArrival = (p) => {
  const t = p?.createdAt ? new Date(p.createdAt).getTime() : NaN;
  return t >= NEW_SINCE && LOADED_AT - t < NEW_FOR_MS;
};
