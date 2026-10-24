import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Wallet, RefreshCw, Package, AlertTriangle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { formatDate, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Badge, Card, ErrorBox, ORDER_STATUS, PageHeader, Spinner, Table } from '../ui';

function Stat({ icon: Icon, label, value, sub, to, accent }) {
  const body = (
    <Card className="p-4 flex items-start gap-3 hover:shadow-md transition-shadow h-full">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-black text-gray-900 truncate">{value}</p>
        {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
      </div>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => adminApi.dashboard(), []);

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const pending = data.ordersByStatus.PENDING || 0;

  return (
    <>
      <PageHeader title="Tổng quan" subtitle="Tình hình kinh doanh của cửa hàng" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <Stat icon={Wallet} label="Doanh thu hôm nay" value={formatPrice(data.today.revenue)} sub={`${data.today.orders} đơn`} accent="bg-emerald-100 text-emerald-700" />
        <Stat icon={Wallet} label="Doanh thu tháng này" value={formatPrice(data.thisMonth.revenue)} sub={`${data.thisMonth.orders} đơn (không tính đơn hủy)`} accent="bg-blue-100 text-blue-700" />
        <Stat icon={ShoppingCart} label="Đơn chờ xác nhận" value={pending} sub="Bấm để xử lý" to="/admin/orders?status=PENDING" accent="bg-amber-100 text-amber-700" />
        <Stat icon={RefreshCw} label="Yêu cầu thu cũ mới" value={data.newTradeIns} sub={`${data.activeProducts} sản phẩm đang bán`} to="/admin/trade-ins?status=NEW" accent="bg-red-100 text-red-700" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold">Đơn hàng mới nhất</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-amber-700 hover:underline">Xem tất cả</Link>
          </div>
          <Table
            rows={data.recentOrders}
            onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
            columns={[
              { key: 'code', title: 'Mã đơn', render: (o) => <span className="font-mono font-semibold">{o.code}</span> },
              { key: 'fullName', title: 'Khách hàng', render: (o) => <><p className="font-medium">{o.fullName}</p><p className="text-xs text-gray-500">{o.phone}</p></> },
              { key: 'total', title: 'Tổng tiền', className: 'text-right', render: (o) => <span className="font-bold">{formatPrice(o.total)}</span> },
              { key: 'status', title: 'Trạng thái', render: (o) => <Badge map={ORDER_STATUS} value={o.status} /> },
              { key: 'createdAt', title: 'Ngày đặt', className: 'whitespace-nowrap text-gray-500', render: (o) => formatDate(o.createdAt, true) },
            ]}
            empty="Chưa có đơn hàng nào"
          />
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-bold px-4 py-3 border-b border-gray-100">Đơn theo trạng thái</h2>
            <div className="p-4 space-y-2">
              {Object.entries(ORDER_STATUS).map(([key, { label }]) => (
                <Link key={key} to={`/admin/orders?status=${key}`} className="flex items-center justify-between text-sm hover:bg-gray-50 rounded px-1 py-0.5">
                  <Badge map={ORDER_STATUS} value={key}>{label}</Badge>
                  <span className="font-bold">{data.ordersByStatus[key] || 0}</span>
                </Link>
              ))}
            </div>
          </Card>

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
                    <span className={`font-bold shrink-0 ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock}</span>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
