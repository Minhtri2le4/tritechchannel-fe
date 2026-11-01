import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Wallet, Receipt, Clock, Package, AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Table2, LineChart,
  PackageCheck, Truck, XCircle, MessageSquareText, Moon, PartyPopper,
} from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useCountUp from '../../hooks/useCountUp';
import { formatDate, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { AreaChart, BarList, ColumnChart, compactVnd } from '../charts';
import { Badge, Card, ErrorBox, ORDER_STATUS, PageHeader, Spinner, Table } from '../ui';

const RANGES = [
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' },
  { days: 90, label: '90 ngày' },
];
const SERIES_COLOR = '#2563eb'; // 1 màu cho mọi biểu đồ 1 chuỗi – không mang ý nghĩa trạng thái

// % thay đổi so với kỳ trước (null khi kỳ trước = 0)
const change = (cur, prev) => (prev ? ((cur - prev) / prev) * 100 : null);

function Delta({ value }) {
  if (value === null) return <span className="text-[11px] text-gray-400">Chưa có số liệu kỳ trước</span>;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${up ? 'text-emerald-700' : 'text-red-600'}`}>
      <Icon size={12} />
      {up ? '+' : ''}
      {value.toFixed(0)}% <span className="font-normal text-gray-500">so với kỳ trước</span>
    </span>
  );
}

// Số tự chạy từ 0 lên khi mở trang, đổi kỳ thì chạy tiếp từ số cũ sang số mới
function CountUp({ value, format = (n) => Math.round(n).toLocaleString('vi-VN'), delay = 0 }) {
  const n = useCountUp(value, true, delay, 1200);
  return format(n);
}
const money = (n) => formatPrice(Math.round(n / 1000) * 1000);

function Kpi({ icon: Icon, label, value, format, footer, to, index = 0 }) {
  const body = (
    <Card className="dash-pop p-4 h-full transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-2 text-lg sm:text-2xl font-black text-gray-900 tabular-nums truncate">
        <CountUp value={value} format={format} delay={index * 120} />
      </p>
      <div className="mt-1">{footer}</div>
    </Card>
  );
  return (
    <div style={{ '--dash-delay': `${index * 80}ms` }}>
      {to ? <Link to={to} className="block h-full">{body}</Link> : body}
    </div>
  );
}

// Nút chọn kỳ có nền trượt theo nút đang chọn
function RangeSwitch({ days, onChange }) {
  const idx = Math.max(0, RANGES.findIndex((r) => r.days === days));
  return (
    <div className="relative inline-grid grid-cols-3 rounded-lg border border-gray-300 bg-white p-0.5">
      <span
        className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-gray-900 transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${idx * 100}%)` }}
      />
      {RANGES.map((r) => (
        <button
          key={r.days}
          onClick={() => onChange(r.days)}
          className={`relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-300 active:scale-95 ${
            days === r.days ? 'text-white' : 'text-gray-600 hover:text-black'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const hhmm = (d) => new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

// Cột "Hôm nay" bên phải – như app Kênh Người Bán của Shopee: hôm nay nổ đơn chưa + việc cần làm
function TodayColumn({ data, freshOrder }) {
  const { today } = data;
  const now = new Date();
  const s = data.ordersByStatus;
  const diff = today.orders - today.yesterday.orders;
  const todo = [
    { icon: Clock, label: 'Chờ xác nhận', value: s.PENDING || 0, to: '/admin/orders?status=PENDING', hot: true },
    { icon: PackageCheck, label: 'Chờ lấy hàng', value: s.CONFIRMED || 0, to: '/admin/orders?status=CONFIRMED' },
    { icon: Truck, label: 'Đang giao', value: s.SHIPPING || 0, to: '/admin/orders?status=SHIPPING' },
    { icon: XCircle, label: 'Huỷ hôm nay', value: today.cancelled, to: '/admin/orders?status=CANCELLED' },
    { icon: MessageSquareText, label: 'Đánh giá chờ trả lời', value: data.reviewsToReply, to: '/admin/reviews' },
    { icon: RefreshCw, label: 'Thu cũ mới', value: data.newTradeIns, to: '/admin/trade-ins?status=NEW' },
  ];

  return (
    <div className="space-y-4 2xl:sticky 2xl:top-20">
      <Card className="dash-pop overflow-hidden" >
        <div
          className="relative px-4 pt-4 pb-5 text-white"
          style={{
            background: today.orders
              ? 'linear-gradient(135deg, #ff7337 0%, #ee4d2d 55%, #d0011b 100%)'
              : 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold opacity-90">Hôm nay · {WEEKDAYS[now.getDay()]} {formatDate(now)}</p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-90">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Trực tiếp
            </span>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <p className={`text-5xl font-black tabular-nums leading-none ${freshOrder ? 'dash-bump' : ''}`}>
              <CountUp value={today.orders} />
            </p>
            <p className="pb-1 text-sm font-semibold">đơn mới</p>
            {today.orders > 0 ? <PartyPopper size={28} className="ml-auto mb-1 opacity-90" /> : <Moon size={26} className="ml-auto mb-1 opacity-70" />}
          </div>
          <p className="mt-2 text-sm">
            {today.orders ? (
              <>Doanh thu <b className="text-lg tabular-nums"><CountUp value={today.revenue} format={money} /></b></>
            ) : (
              'Chưa nổ đơn nào hôm nay – cố lên shop ơi!'
            )}
          </p>
          <p className="mt-1 text-xs opacity-80">
            Hôm qua: {today.yesterday.orders} đơn · {formatPrice(today.yesterday.revenue)}
            {diff !== 0 && <b className="ml-1">({diff > 0 ? `+${diff}` : diff} đơn)</b>}
          </p>
          {freshOrder && (
            <span className="dash-toast absolute right-3 bottom-3 rounded-full bg-white px-3 py-1 text-xs font-black text-[#ee4d2d] shadow-lg">
              Ting ting! Có đơn mới 🎉
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 divide-x divide-y divide-gray-100 border-t border-gray-100">
          {todo.map(({ icon: Icon, label, value, to, hot }, i) => (
            <Link
              key={label}
              to={to}
              className="group flex flex-col items-center gap-1 px-1 py-3 text-center transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <span className="relative">
                <Icon size={22} className="text-gray-700 transition-transform group-hover:scale-110 group-active:scale-90" />
                {value > 0 && hot && <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
              </span>
              <span className={`text-xl font-black tabular-nums ${value > 0 && hot ? 'text-[#ee4d2d]' : 'text-gray-900'}`}>
                <CountUp value={value} delay={300 + i * 80} />
              </span>
              <span className="text-[11px] leading-tight text-gray-500">{label}</span>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="dash-pop" >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold">Đơn hôm nay</h2>
          <span className="text-xs text-gray-500">Tự cập nhật mỗi phút</span>
        </div>
        {today.orderList.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">Chưa có đơn nào hôm nay</p>
        ) : (
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
            {today.orderList.map((o) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50">
                <span className="w-11 shrink-0 font-semibold tabular-nums text-gray-500">{hhmm(o.createdAt)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-gray-900">{o.fullName}</span>
                  <span className="text-xs text-gray-500">{o.code} · {o.items} sản phẩm</span>
                </span>
                <span className="text-right">
                  <span className="block font-bold tabular-nums">{formatPrice(o.total)}</span>
                  <Badge map={ORDER_STATUS} value={o.status} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div>
          <h2 className="font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [asTable, setAsTable] = useState(false);
  const { data, loading, error, reload } = useFetch(() => adminApi.dashboard(days), [days]);

  // Tự tải lại mỗi phút: có đơn mới hôm nay thì báo "Ting ting"
  useEffect(() => {
    const t = setInterval(reload, 60000);
    return () => clearInterval(t);
  }, [reload]);
  const lastToday = useRef(null);
  const [freshOrder, setFreshOrder] = useState(false);
  const todayCount = data?.today.orders;
  useEffect(() => {
    if (todayCount == null) return;
    const prev = lastToday.current;
    lastToday.current = todayCount;
    if (prev == null || todayCount <= prev) return;
    const on = setTimeout(() => setFreshOrder(true), 0);
    const off = setTimeout(() => setFreshOrder(false), 6000);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [todayCount]);

  if (loading && !data) return <Spinner />;
  if (error && !data) return <ErrorBox error={error} onRetry={reload} />;

  const { period, previousPeriod: prev } = data;
  const avg = period.orders ? Math.round(period.revenue / period.orders) : 0;
  const prevAvg = prev.orders ? Math.round(prev.revenue / prev.orders) : 0;
  const pending = data.ordersByStatus.PENDING || 0;
  const totalOrders = Object.values(data.ordersByStatus).reduce((s, n) => s + n, 0);
  const rangeLabel = RANGES.find((r) => r.days === days)?.label;

  // Chỉ làm mờ khi đang đổi kỳ (tự tải lại mỗi phút thì không nhấp nháy)
  const switching = loading && data.days !== days;

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        subtitle={`Hôm nay: ${formatPrice(data.today.revenue)} · ${data.today.orders} đơn · Tháng này: ${formatPrice(data.thisMonth.revenue)}`}
        actions={<RangeSwitch days={days} onChange={setDays} />}
      />

      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
      <div className={`min-w-0 transition-opacity duration-300 ${switching ? 'opacity-60' : ''}`}>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi index={0} icon={Wallet} label={`Doanh thu ${rangeLabel}`} value={period.revenue} format={money} footer={<Delta value={change(period.revenue, prev.revenue)} />} />
        <Kpi index={1} icon={ShoppingCart} label={`Đơn hàng ${rangeLabel}`} value={period.orders} footer={<Delta value={change(period.orders, prev.orders)} />} />
        <Kpi index={2} icon={Receipt} label="Giá trị TB / đơn" value={avg} format={money} footer={<Delta value={change(avg, prevAvg)} />} />
        <Kpi
          index={3}
          icon={Clock}
          label="Chờ xác nhận"
          value={pending}
          to="/admin/orders?status=PENDING"
          footer={<span className="text-[11px] font-semibold text-amber-700">{pending ? 'Bấm để xử lý ngay →' : 'Đã xử lý hết 👍'}</span>}
        />
      </div>

      <div key={data.days} className="dash-swap">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Panel
          className="xl:col-span-2"
          title="Doanh thu theo ngày"
          subtitle={`${rangeLabel} gần nhất · không tính đơn đã hủy`}
          action={
            <button
              onClick={() => setAsTable((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-black px-2 py-1 rounded-md hover:bg-gray-100"
            >
              {asTable ? <><LineChart size={14} /> Biểu đồ</> : <><Table2 size={14} /> Xem bảng</>}
            </button>
          }
        >
          {asTable ? (
            <div className="max-h-[260px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white text-xs text-gray-500 uppercase">
                  <tr><th className="text-left py-1.5">Ngày</th><th className="text-right">Số đơn</th><th className="text-right">Doanh thu</th></tr>
                </thead>
                <tbody>
                  {[...data.series].reverse().map((d) => (
                    <tr key={d.date} className="border-t border-gray-100">
                      <td className="py-1.5">{d.date.split('-').reverse().join('/')}</td>
                      <td className="text-right tabular-nums">{d.orders}</td>
                      <td className="text-right tabular-nums font-semibold">{formatPrice(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AreaChart
              data={data.series}
              valueKey="revenue"
              color={SERIES_COLOR}
              height={260}
              tooltip={(d) => <p className="font-semibold">{formatPrice(d.revenue)} · {d.orders} đơn</p>}
            />
          )}
        </Panel>

        <Panel title="Sản phẩm bán chạy" subtitle={`Theo doanh thu, ${rangeLabel}`}>
          <BarList
            items={data.topProducts}
            valueKey="revenue"
            label={(p) => p.name}
            format={(v) => compactVnd(v) + 'đ'}
            color={SERIES_COLOR}
            empty="Chưa có đơn trong kỳ này"
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Panel className="xl:col-span-2" title="Số đơn theo ngày" subtitle={`${rangeLabel} gần nhất`}>
          <ColumnChart
            data={data.series}
            valueKey="orders"
            color={SERIES_COLOR}
            height={200}
            tooltip={(d) => <p className="font-semibold">{d.orders} đơn · {formatPrice(d.revenue)}</p>}
          />
        </Panel>

        <Panel title="Đơn theo trạng thái" subtitle={`Tất cả ${totalOrders} đơn`}>
          <div className="space-y-2.5">
            {Object.entries(ORDER_STATUS).map(([key, { label }]) => {
              const count = data.ordersByStatus[key] || 0;
              return (
                <Link key={key} to={`/admin/orders?status=${key}`} className="block group">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <Badge map={ORDER_STATUS} value={key}>{label}</Badge>
                    <span className="font-bold tabular-nums group-hover:underline">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full bg-gray-400" style={{ width: `${totalOrders ? (count / totalOrders) * 100 : 0}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold">Đơn hàng mới nhất</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-amber-700 hover:underline">Xem tất cả →</Link>
          </div>
          <Table
            rows={data.recentOrders}
            onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
            columns={[
              { key: 'code', title: 'Mã đơn', render: (o) => <span className="font-mono font-semibold">{o.code}</span> },
              { key: 'fullName', title: 'Khách hàng', render: (o) => <><p className="font-medium">{o.fullName}</p><p className="text-xs text-gray-500">{o.phone}</p></> },
              { key: 'total', title: 'Tổng tiền', className: 'text-right', render: (o) => <span className="font-bold tabular-nums">{formatPrice(o.total)}</span> },
              { key: 'status', title: 'Trạng thái', render: (o) => <Badge map={ORDER_STATUS} value={o.status} /> },
              { key: 'createdAt', title: 'Ngày đặt', className: 'whitespace-nowrap text-gray-500', render: (o) => formatDate(o.createdAt, true) },
            ]}
            empty="Chưa có đơn hàng nào"
          />
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-bold px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Sắp hết hàng
              <span className="ml-auto text-xs font-normal text-gray-500">{data.activeProducts} sản phẩm đang bán</span>
            </h2>
            <div className="p-2">
              {data.lowStock.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">Kho ổn định 👍</p>
              ) : (
                data.lowStock.map((p) => (
                  <Link key={p.id} to={`/admin/products/${p.id}`} className="flex items-center justify-between gap-2 text-sm px-2 py-1.5 rounded hover:bg-gray-50">
                    <span className="flex items-center gap-2 min-w-0">
                      <Package size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </span>
                    <span className={`font-bold shrink-0 tabular-nums ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stock === 0 ? 'Hết' : `Còn ${p.stock}`}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
      </div>

      {/* Màn nhỏ: khung "Hôm nay" lên đầu; màn lớn: cột bên phải */}
      <div className="order-first 2xl:order-none">
        <TodayColumn data={data} freshOrder={freshOrder} />
      </div>
      </div>
    </div>
  );
}
