// Quy trình đơn kiểu Shopee (khớp backend):
// Chờ xác nhận → Đã xác nhận → Đã bàn giao ĐVVC → Đang giao → Hoàn tất (hoặc Đã hủy).
// "Đã bàn giao ĐVVC" vẫn là status CONFIRMED nhưng đã có handedOverAt.

export const CARRIERS = ['SPX', 'GHN', 'GHTK', 'J&T', 'Viettel Post', 'Ahamove', 'Grab', 'Shop tự giao'];

export const STAGE = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
  HANDED_OVER: { label: 'Đã bàn giao ĐVVC', className: 'bg-cyan-100 text-cyan-800' },
  SHIPPING: { label: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Hoàn tất', className: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-gray-200 text-gray-600' },
};

export const orderStage = (o) => (o.status === 'CONFIRMED' && o.handedOverAt ? 'HANDED_OVER' : o.status);

// Tab trang Đơn hàng: [giá trị trên URL, nhãn, khoá trong /counts, tham số gửi API]
export const ORDER_TABS = [
  ['', 'Tất cả', 'ALL', {}],
  ['PENDING', 'Chờ xác nhận', 'PENDING', { status: 'PENDING' }],
  ['CONFIRMED', 'Đã xác nhận', 'CONFIRMED', { stage: 'WAIT_HANDOVER' }],
  ['HANDED_OVER', 'Đã bàn giao ĐVVC', 'HANDED_OVER', { stage: 'HANDED_OVER' }],
  ['SHIPPING', 'Đang giao', 'SHIPPING', { status: 'SHIPPING' }],
  ['COMPLETED', 'Hoàn tất', 'COMPLETED', { status: 'COMPLETED' }],
  ['CANCELLED', 'Đã hủy', 'CANCELLED', { status: 'CANCELLED' }],
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
  COMPLETED: ['Hoàn thành', 'text-emerald-600'],
  CANCELLED: ['Đã hủy', 'text-gray-500'],
};

// Tab "Đơn mua" như Shopee
export const CUSTOMER_TABS = [
  ['ALL', 'Tất cả', () => true],
  ['UNPAID', 'Chờ thanh toán', isUnpaidBank],
  ['PENDING', 'Chờ xác nhận', (o) => o.status === 'PENDING'],
  ['CONFIRMED', 'Chờ lấy hàng', (o) => orderStage(o) === 'CONFIRMED'],
  ['SHIPPING', 'Chờ giao hàng', (o) => ['HANDED_OVER', 'SHIPPING'].includes(orderStage(o))],
  ['COMPLETED', 'Hoàn thành', (o) => o.status === 'COMPLETED'],
  ['CANCELLED', 'Đã hủy', (o) => o.status === 'CANCELLED'],
];
export const matchTab = (key) => CUSTOMER_TABS.find((t) => t[0] === key)?.[2] || (() => true);

// Các bước cho dòng thời gian (giao tận nhà có bước bàn giao ĐVVC, nhận tại shop thì không)
export const timelineSteps = (o) => {
  const home = o.deliveryMethod === 'HOME';
  const steps = [
    { key: 'PLACED', label: 'Đã đặt hàng', at: o.createdAt },
    { key: 'CONFIRMED', label: 'Đã xác nhận', at: o.confirmedAt },
    ...(home ? [{ key: 'HANDED_OVER', label: 'Đã bàn giao ĐVVC', at: o.handedOverAt }] : []),
    { key: 'SHIPPING', label: home ? 'Đang giao' : 'Chờ khách nhận', at: o.shippingAt },
    { key: 'COMPLETED', label: 'Hoàn thành', at: o.completedAt },
  ];
  const rank = { PENDING: 0, CONFIRMED: 1, HANDED_OVER: 2, SHIPPING: home ? 3 : 2, COMPLETED: home ? 4 : 3, CANCELLED: -1 };
  const reached = rank[orderStage(o)] ?? 0;
  return steps.map((s, i) => ({ ...s, done: o.status !== 'CANCELLED' ? i <= reached : Boolean(s.at) || i === 0 }));
};
