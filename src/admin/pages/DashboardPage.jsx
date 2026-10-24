import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Wallet, Receipt, Clock, Package, AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Table2, LineChart } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
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

function Kpi({ icon: Icon, label, value, footer, to }) {
  const body = (
    <Card className="p-4 h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-2 text-lg sm:text-2xl font-black text-gray-900 tabular-nums truncate" title={String(value)}>{value}</p>
      <div className="mt-1">{footer}</div>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
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

  if (loading && !data) return <Spinner />;
  if (error && !data) return <ErrorBox error={error} onRetry={reload} />;

  const { period, previousPeriod: prev } = data;
  const avg = period.orders ? Math.round(period.revenue / period.orders) : 0;
  const prevAvg = prev.orders ? Math.round(prev.revenue / prev.orders) : 0;
  const pending = data.ordersByStatus.PENDING || 0;
  const totalOrders = Object.values(data.ordersByStatus).reduce((s, n) => s + n, 0);
  const rangeLabel = RANGES.find((r) => r.days === days)?.label;

  return (
    <div className={loading ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
      <PageHeader
        title="Tổng quan"
        subtitle={`Hôm nay: ${formatPrice(data.today.revenue)} · ${data.today.orders} đơn · Tháng này: ${formatPrice(data.thisMonth.revenue)}`}
        actions={
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  days === r.days ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <Kpi icon={Wallet} label={`Doanh thu ${rangeLabel}`} value={formatPrice(period.revenue)} footer={<Delta value={change(period.revenue, prev.revenue)} />} />
        <Kpi icon={ShoppingCart} label={`Đơn hàng ${rangeLabel}`} value={period.orders} footer={<Delta value={change(period.orders, prev.orders)} />} />
        <Kpi icon={Receipt} label="Giá trị TB / đơn" value={formatPrice(avg)} footer={<Delta value={change(avg, prevAvg)} />} />
        <Kpi
          icon={Clock}
          label="Chờ xác nhận"
          value={pending}
          to="/admin/orders?status=PENDING"
          footer={<span className="text-[11px] font-semibold text-amber-700">{pending ? 'Bấm để xử lý ngay →' : 'Đã xử lý hết 👍'}</span>}
        />
      </div>

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
          <Link to="/admin/trade-ins?status=NEW">
            <Card className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <span className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center"><RefreshCw size={18} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Yêu cầu thu cũ mới</p>
                <p className="text-xs text-gray-500">{data.activeProducts} sản phẩm đang bán</p>
              </div>
              <span className="text-2xl font-black tabular-nums">{data.newTradeIns}</span>
            </Card>
          </Link>

          <Card>
            <h2 className="font-bold px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Sắp hết hàng
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
  );
}
