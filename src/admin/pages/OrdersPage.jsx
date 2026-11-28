import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HandoverModal from '../HandoverModal';
import ReturnModal from '../ReturnModal';
import { Ban, CheckCheck, CircleDollarSign, PackageCheck, PackageOpen, Printer, Search, Truck, Undo2, X } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, formatDate, formatPrice, imgFallback } from '../../lib/api';
import { ORDER_TABS, STAGE, orderStage } from '../../lib/orderFlow';
import { adminApi } from '../adminApi';
import { Badge, Button, Card, ErrorBox, Input, Modal, PAYMENT_STATUS, PageHeader, Pagination, Select, Table, paymentView, useDebounced } from '../ui';

// Thao tác hàng loạt – hiện nút nào tuỳ trạng thái các đơn đang chọn
const BULK_ACTIONS = [
  { action: 'CONFIRM', label: 'Xác nhận đơn', icon: CheckCheck, when: (o) => o.status === 'PENDING', variant: 'primary' },
  { action: 'HANDOVER', label: 'Bàn giao ĐVVC', icon: PackageCheck, when: (o) => o.status === 'CONFIRMED' && !o.handedOverAt && o.deliveryMethod === 'HOME', variant: 'dark' },
  { action: 'SHIP', label: 'Đang giao', icon: Truck, when: (o) => o.status === 'CONFIRMED' && !o.returningAt, variant: 'outline' },
  { action: 'COMPLETE', label: 'Hoàn tất', icon: CheckCheck, when: (o) => ['CONFIRMED', 'SHIPPING'].includes(o.status), variant: 'outline' },
  { action: 'RETURNING', label: 'Giao thất bại – Hoàn về', icon: Undo2, when: (o) => ['HANDED_OVER', 'SHIPPING'].includes(orderStage(o)) && o.deliveryMethod === 'HOME', variant: 'outline' },
  { action: 'RETURNED', label: 'Đã nhận hàng hoàn', icon: PackageOpen, when: (o) => orderStage(o) === 'RETURNING', variant: 'dark' },
  { action: 'MARK_PAID', label: 'Đã nhận tiền', icon: CircleDollarSign, when: (o) => o.paymentStatus === 'UNPAID' && o.status !== 'CANCELLED', variant: 'outline' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  // Lưu bộ lọc trên URL để bấm "quay lại" từ chi tiết đơn vẫn giữ nguyên
  const [params, setParams] = useSearchParams();
  const tab = params.get('status') || '';
  const paymentStatus = params.get('paymentStatus') || '';
  const unpaidBank = params.get('unpaid') === '1';
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState(params.get('search') || '');
  const q = useDebounced(search);
  const [selected, setSelected] = useState([]);
  const [selKey, setSelKey] = useState('');
  const [busy, setBusy] = useState('');
  const [handover, setHandover] = useState(null); // danh sách id chờ chọn ĐVVC
  const [returning, setReturning] = useState(null); // danh sách id chờ chọn lý do hoàn
  const [result, setResult] = useState(null);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const tabParams = ORDER_TABS.find((t) => t[0] === tab)?.[3] || {};
  const listKey = JSON.stringify([tab, paymentStatus, unpaidBank, q, page]);
  // Đổi tab / trang / bộ lọc thì bỏ chọn
  if (selKey !== listKey) {
    setSelKey(listKey);
    setSelected([]);
  }
  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.orders.list({ ...tabParams, paymentStatus: paymentStatus || undefined, unpaidBank: unpaidBank ? '1' : undefined, search: q || undefined, page, limit: 20 }),
    [listKey]
  );
  const { data: counts, reload: reloadCounts } = useFetch(() => adminApi.orders.counts(), []);

  const picked = (data || []).filter((o) => selected.includes(o.id));
  const actions = BULK_ACTIONS.filter((a) => picked.some(a.when));
  const cancellable = picked.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status) && orderStage(o) !== 'RETURNING');

  const run = async (action, ids, extra = {}) => {
    setBusy(action);
    try {
      const { data: r } = await adminApi.orders.bulk({ ids, action, ...extra });
      setResult({ action, ...r });
      setSelected([]);
      reload();
      reloadCounts();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy('');
    }
  };

  const onAction = (a) => {
    const ids = picked.filter(a.when).map((o) => o.id);
    if (a.action === 'HANDOVER') return setHandover(ids);
    if (a.action === 'RETURNING') return setReturning(ids);
    if (a.action === 'RETURNED' && !confirm(`Xác nhận đã nhận lại ${ids.length} gói hàng hoàn? Đơn chuyển Đã hủy và hàng cộng lại vào kho.`)) return null;
    run(a.action, ids);
  };
  const cancelSelected = () => {
    if (confirm(`Hủy ${cancellable.length} đơn đã chọn? Hàng được hoàn kho và mã giảm giá được trả lượt.`)) run('CANCEL', cancellable.map((o) => o.id));
  };
  const printIds = (ids) => window.open(`/admin/orders/print?ids=${ids.join(',')}`, '_blank');

  return (
    <>
      <PageHeader title="Đơn hàng" subtitle={meta ? `${meta.total} đơn` : undefined} />

      {/* Tab trạng thái kèm số đơn như Shopee */}
      <div className="mb-2 flex gap-1 overflow-x-auto border-b border-gray-200">
        {ORDER_TABS.map(([key, label, countKey]) => {
          const n = counts?.[countKey];
          const active = tab === key;
          return (
            <button
              key={key || 'all'}
              type="button"
              onClick={() => setParam('status', key)}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${active ? 'border-red-500 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              {label}
              {key && n > 0 ? <span className="ml-1">({n})</span> : null}
            </button>
          );
        })}
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-3">
          <div className="relative min-w-[200px] flex-1">
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
          <button
            type="button"
            onClick={() => setParam('unpaid', unpaidBank ? '' : '1')}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${unpaidBank ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
          >
            Chờ khách chuyển khoản{counts?.UNPAID_BANK ? ` (${counts.UNPAID_BANK})` : ''}
          </button>
          <Select className="w-auto" value={paymentStatus} onChange={(e) => setParam('paymentStatus', e.target.value)}>
            <option value="">Mọi thanh toán</option>
            {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>

        {/* Thanh xử lý hàng loạt */}
        {selected.length > 0 && (
          <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2">
            <span className="mr-1 text-sm font-bold text-gray-900">Đã chọn {selected.length} đơn</span>
            {actions.map((a) => {
              const n = picked.filter(a.when).length;
              return (
                <Button key={a.action} size="sm" variant={a.variant} loading={busy === a.action} onClick={() => onAction(a)}>
                  <a.icon size={14} /> {a.label} ({n})
                </Button>
              );
            })}
            <Button size="sm" variant="outline" onClick={() => printIds(selected)}>
              <Printer size={14} /> In phiếu ({selected.length})
            </Button>
            {cancellable.length > 0 && (
              <Button size="sm" variant="outline" className="text-red-600" loading={busy === 'CANCEL'} onClick={cancelSelected}>
                <Ban size={14} /> Hủy ({cancellable.length})
              </Button>
            )}
            <button type="button" onClick={() => setSelected([])} className="ml-auto flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800">
              <X size={14} /> Bỏ chọn
            </button>
          </div>
        )}

        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}

        <Table
          rows={data}
          loading={loading}
          selected={selected}
          onSelectChange={setSelected}
          onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
          empty="Không có đơn hàng"
          columns={[
            { key: 'code', title: 'Mã đơn', render: (o) => <span className="font-mono font-semibold">{o.code}</span> },
            { key: 'customer', title: 'Khách hàng', render: (o) => <><p className="font-medium">{o.fullName}</p><p className="text-xs text-gray-500">{o.phone}</p></> },
            {
              key: 'items',
              title: 'Sản phẩm',
              render: (o) => (
                <div className="flex items-center gap-2">
                  <div className="flex shrink-0 -space-x-3">
                    {(o.items || []).slice(0, 3).map((it, i) => (
                      <img
                        key={i}
                        src={assetUrl(it.image)}
                        onError={imgFallback}
                        alt=""
                        title={`${it.productName}${[it.variantLabel, it.color].filter(Boolean).length ? ` (${[it.variantLabel, it.color].filter(Boolean).join(' · ')})` : ''} x${it.quantity}`}
                        className="h-11 w-11 shrink-0 rounded-lg border-2 border-white bg-white object-cover shadow-sm" style={{ minWidth: 44 }}
                      />
                    ))}
                  </div>
                  <div className="min-w-0 max-w-[220px]">
                    <p className="line-clamp-2 text-xs text-gray-700">{o.items?.[0]?.productName}</p>
                    {(() => {
                      const it = o.items?.[0];
                      const opt = [it?.variantLabel, it?.color].filter(Boolean).join(' · ');
                      return opt || it?.quantity > 1 ? (
                        <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px]">
                          {opt && <span className="rounded bg-amber-100 px-1.5 py-px font-semibold text-amber-800">{opt}</span>}
                          {it.quantity > 1 && <span className="font-semibold text-gray-500">x{it.quantity}</span>}
                        </p>
                      ) : null;
                    })()}
                    {o._count?.items > 1 && <p className="text-[11px] text-gray-400">+{o._count.items - 1} sản phẩm khác</p>}
                  </div>
                </div>
              ),
            },
            {
              key: 'delivery',
              title: 'Vận chuyển',
              className: 'whitespace-nowrap text-xs hidden md:table-cell',
              render: (o) => (
                <div>
                  <p>{o.deliveryMethod === 'HOME' ? '🚚 Giao tận nhà' : '🤝 Nhận tại shop'}</p>
                  {o.carrier && <p className="mt-0.5 font-semibold text-gray-800">{o.carrier}</p>}
                  {o.trackingCode && <p className="font-mono text-[11px] text-gray-500">{o.trackingCode}</p>}
                </div>
              ),
            },
            { key: 'total', title: 'Tổng tiền', className: 'text-right whitespace-nowrap font-bold', render: (o) => formatPrice(o.total) },
            {
              key: 'payment',
              title: 'Thanh toán',
              className: 'hidden sm:table-cell',
              render: (o) => (
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[11px] text-gray-500">{o.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'COD'}</span>
                  <PayBadge o={o} />
                </div>
              ),
            },
            {
              key: 'status',
              title: 'Trạng thái',
              render: (o) => (
                <div className="flex flex-col items-start gap-0.5">
                  <Badge map={STAGE} value={orderStage(o)} />
                  {o.returnReason && <span className="max-w-[140px] text-[11px] leading-tight text-orange-700">{o.returnReason}</span>}
                </div>
              ),
            },
            { key: 'createdAt', title: 'Ngày đặt', className: 'whitespace-nowrap text-gray-500 text-xs hidden lg:table-cell', render: (o) => formatDate(o.createdAt, true) },
          ]}
        />
        <Pagination meta={meta} onChange={(p) => setParam('page', String(p))} />
      </Card>

      <HandoverModal
        ids={handover}
        busy={busy === 'HANDOVER'}
        onClose={() => setHandover(null)}
        onSubmit={(carrier) => {
          const ids = handover;
          setHandover(null);
          run('HANDOVER', ids, { carrier });
        }}
      />

      <ReturnModal
        ids={returning}
        busy={busy === 'RETURNING'}
        onClose={() => setReturning(null)}
        onSubmit={(returnReason) => {
          const ids = returning;
          setReturning(null);
          run('RETURNING', ids, { returnReason });
        }}
      />

      <Modal
        open={Boolean(result)}
        title="Kết quả xử lý"
        onClose={() => setResult(null)}
        footer={
          <>
            {result?.done.length > 0 && ['CONFIRM', 'HANDOVER'].includes(result.action) && (
              <Button variant="dark" onClick={() => printIds(result.done)}>
                <Printer size={16} /> In phiếu {result.done.length} đơn
              </Button>
            )}
            <Button variant="outline" onClick={() => setResult(null)}>Đóng</Button>
          </>
        }
      >
        {result && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-emerald-700">✓ Thành công {result.done.length} đơn</p>
            {result.failed.length > 0 && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="mb-1 font-semibold text-red-700">Không xử lý được {result.failed.length} đơn:</p>
                <ul className="space-y-0.5 text-xs text-red-700">
                  {result.failed.map((f) => (
                    <li key={f.id}><b className="font-mono">{f.code}</b> – {f.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function PayBadge({ o }) {
  const v = paymentView(o);
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${v.className}`}>{v.label}</span>;
}
