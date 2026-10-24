import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { formatDate, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Badge, Card, ErrorBox, Input, ORDER_STATUS, PAYMENT_STATUS, PageHeader, Pagination, Select, Table, useDebounced } from '../ui';

export default function OrdersPage() {
  const navigate = useNavigate();
  // Lưu bộ lọc trên URL để bấm "quay lại" từ chi tiết đơn vẫn giữ nguyên
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const paymentStatus = params.get('paymentStatus') || '';
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState(params.get('search') || '');
  const q = useDebounced(search);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.orders.list({ status: status || undefined, paymentStatus: paymentStatus || undefined, search: q || undefined, page, limit: 20 }),
    [status, paymentStatus, q, page]
  );

  return (
    <>
      <PageHeader title="Đơn hàng" subtitle={meta ? `${meta.total} đơn` : undefined} />

      {/* Tab trạng thái */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2">
        {[['', 'Tất cả'], ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button
            key={key || 'all'}
            onClick={() => setParam('status', key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border ${status === key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Tìm mã đơn, SĐT, tên khách..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setParam('page', '');
              }}
            />
          </div>
          <Select className="w-auto" value={paymentStatus} onChange={(e) => setParam('paymentStatus', e.target.value)}>
            <option value="">Mọi thanh toán</option>
            {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>

        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}

        <Table
          rows={data}
          loading={loading}
          onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
          empty="Không có đơn hàng"
          columns={[
            { key: 'code', title: 'Mã đơn', render: (o) => <span className="font-mono font-semibold">{o.code}</span> },
            { key: 'customer', title: 'Khách hàng', render: (o) => <><p className="font-medium">{o.fullName}</p><p className="text-xs text-gray-500">{o.phone}</p></> },
            { key: 'items', title: 'SP', className: 'text-center', render: (o) => o._count?.items },
            { key: 'delivery', title: 'Nhận hàng', className: 'whitespace-nowrap text-xs', render: (o) => (o.deliveryMethod === 'HOME' ? '🚚 Giao tận nhà' : '🏪 Tại cửa hàng') },
            { key: 'total', title: 'Tổng tiền', className: 'text-right whitespace-nowrap font-bold', render: (o) => formatPrice(o.total) },
            {
              key: 'payment',
              title: 'Thanh toán',
              render: (o) => (
                <div className="flex flex-col gap-0.5 items-start">
                  <span className="text-[11px] text-gray-500">{o.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'COD'}</span>
                  <Badge map={PAYMENT_STATUS} value={o.paymentStatus} />
                </div>
              ),
            },
            { key: 'status', title: 'Trạng thái', render: (o) => <Badge map={ORDER_STATUS} value={o.status} /> },
            { key: 'createdAt', title: 'Ngày đặt', className: 'whitespace-nowrap text-gray-500 text-xs', render: (o) => formatDate(o.createdAt, true) },
          ]}
        />
        <Pagination meta={meta} onChange={(p) => setParam('page', String(p))} />
      </Card>
    </>
  );
}
