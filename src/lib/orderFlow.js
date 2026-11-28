// Quy trình đơn kiểu Shopee (khớp backend):
// Chờ xác nhận → Đã xác nhận → Đã bàn giao ĐVVC → Đang giao → Hoàn tất (hoặc Đã hủy).
// "Đã bàn giao ĐVVC" vẫn là status CONFIRMED nhưng đã có handedOverAt.
// Giao không thành công: Đang giao → Đang hoàn về (returningAt) → Đã nhận hàng hoàn (returnedAt, status CANCELLED).

export const CARRIERS = ['SPX', 'GHN', 'GHTK', 'J&T', 'Viettel Post', 'Ahamove', 'Grab', 'Shop tự giao'];

export const RETURN_REASONS = [
  'Không liên hệ được khách',
  'Khách từ chối nhận hàng',
  'Sai địa chỉ / không tìm được địa chỉ',
  'Khách hẹn lại quá số lần giao',
  'Hàng hư hỏng khi vận chuyển',
];

export const STAGE = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
  HANDED_OVER: { label: 'Đã bàn giao ĐVVC', className: 'bg-cyan-100 text-cyan-800' },
  SHIPPING: { label: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
  RETURNING: { label: 'Đang hoàn về', className: 'bg-orange-100 text-orange-800' },
  RETURNED: { label: 'Đã nhận hàng hoàn', className: 'bg-rose-100 text-rose-700' },
  COMPLETED: { label: 'Hoàn tất', className: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-gray-200 text-gray-600' },
};

export const orderStage = (o) => {
  if (o.returnedAt) return 'RETURNED';
  if (o.returningAt && o.status !== 'COMPLETED' && o.status !== 'CANCELLED') return 'RETURNING';
  return o.status === 'CONFIRMED' && o.handedOverAt ? 'HANDED_OVER' : o.status;
};

// Tab trang Đơn hàng: [giá trị trên URL, nhãn, khoá trong /counts, tham số gửi API]
export const ORDER_TABS = [
  ['', 'Tất cả', 'ALL', {}],
  ['PENDING', 'Chờ xác nhận', 'PENDING', { status: 'PENDING' }],
  ['CONFIRMED', 'Đã xác nhận', 'CONFIRMED', { stage: 'WAIT_HANDOVER' }],
  ['HANDED_OVER', 'Đã bàn giao ĐVVC', 'HANDED_OVER', { stage: 'HANDED_OVER' }],
  ['SHIPPING', 'Đang giao', 'SHIPPING', { stage: 'SHIPPING' }],
  ['COMPLETED', 'Hoàn tất', 'COMPLETED', { status: 'COMPLETED' }],
  ['RETURNS', 'Hoàn hàng', 'RETURNS', { stage: 'RETURNS' }],
  ['CANCELLED', 'Đã hủy', 'CANCELLED', { stage: 'CANCELLED' }],
];

// ─── Phía khách (mục Đơn mua) ───
export const isUnpaidBank = (o) => o.paymentMethod === 'BANK' && o.paymentStatus === 'UNPAID' && !['CANCELLED', 'COMPLETED'].includes(o.status);
// Khách tự đổi địa chỉ được khi shop chưa bàn giao cho đơn vị vận chuyển
export const canChangeAddress = (o) => (o.status === 'PENDING' || o.status === 'CONFIRMED') && !o.handedOverAt;

export const CUSTOMER_STAGE = {
  PENDING: ['Chờ xác nhận', 'text-amber-600'],
  CONFIRMED: ['Đã xác nhận', 'text-blue-600'],
  HANDED_OVER: ['Đã bàn giao ĐVVC', 'text-cyan-700'],
  SHIPPING: ['Đang giao', 'text-indigo-600'],
  RETURNING: ['Giao không thành công', 'text-orange-600'],
  RETURNED: ['Đã hoàn về shop', 'text-gray-500'],
  COMPLETED: ['Hoàn thành', 'text-emerald-600'],
  CANCELLED: ['Đã hủy', 'text-gray-500'],
};

// Tab "Đơn mua" như Shopee
export const CUSTOMER_TABS = [
  ['ALL', 'Tất cả', () => true],
  ['UNPAID', 'Chờ thanh toán', isUnpaidBank],
  ['PENDING', 'Chờ xác nhận', (o) => o.status === 'PENDING'],
  ['CONFIRMED', 'Chờ lấy hàng', (o) => orderStage(o) === 'CONFIRMED'],
  ['SHIPPING', 'Chờ giao hàng', (o) => ['HANDED_OVER', 'SHIPPING', 'RETURNING'].includes(orderStage(o))],
  ['COMPLETED', 'Hoàn thành', (o) => o.status === 'COMPLETED'],
  ['CANCELLED', 'Đã hủy', (o) => o.status === 'CANCELLED'],
];
export const matchTab = (key) => CUSTOMER_TABS.find((t) => t[0] === key)?.[2] || (() => true);

// Các bước cho dòng thời gian (giao tận nhà có bước bàn giao ĐVVC, nhận tại shop thì không)
export const timelineSteps = (o) => {
  const home = o.deliveryMethod === 'HOME';
  const head = [
    { key: 'PLACED', label: 'Đã đặt hàng', at: o.createdAt },
    { key: 'CONFIRMED', label: 'Đã xác nhận', at: o.confirmedAt },
    ...(home ? [{ key: 'HANDED_OVER', label: 'Đã bàn giao ĐVVC', at: o.handedOverAt }] : []),
    { key: 'SHIPPING', label: home ? 'Đang giao' : 'Chờ khách nhận', at: o.shippingAt },
  ];
  const stage = orderStage(o);
  // Giao không thành công: thay bước Hoàn thành bằng các bước hoàn hàng
  if (stage === 'RETURNING' || stage === 'RETURNED') {
    return [
      ...head.map((s) => ({ ...s, done: true })),
      { key: 'RETURNING', label: 'Giao thất bại – đang hoàn về', at: o.returningAt, done: true, warn: true },
      { key: 'RETURNED', label: 'Shop đã nhận lại hàng', at: o.returnedAt, done: stage === 'RETURNED', warn: true },
    ];
  }
  const steps = [...head, { key: 'COMPLETED', label: 'Hoàn thành', at: o.completedAt }];
  const rank = { PENDING: 0, CONFIRMED: 1, HANDED_OVER: 2, SHIPPING: home ? 3 : 2, COMPLETED: home ? 4 : 3, CANCELLED: -1 };
  const reached = rank[stage] ?? 0;
  return steps.map((s, i) => ({ ...s, done: o.status !== 'CANCELLED' ? i <= reached : Boolean(s.at) || i === 0 }));
};
