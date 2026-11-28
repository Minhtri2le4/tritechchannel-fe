import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, Phone, Mail, MapPin, Store, Printer, Truck } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, imgFallback, formatDate, formatPrice } from '../../lib/api';
import { CARRIERS, STAGE, orderStage, timelineSteps } from '../../lib/orderFlow';
import { adminApi } from '../adminApi';
import HandoverModal from '../HandoverModal';
import ReturnModal from '../ReturnModal';
import { Badge, Button, Card, ErrorBox, Field, Input, Modal, PageHeader, paymentView, Spinner, Textarea } from '../ui';

// Bước tiếp theo theo quy trình: Chờ xác nhận → Đã xác nhận → Đã bàn giao ĐVVC → Đang giao → Hoàn tất
const nextActions = (o) => {
  const stage = orderStage(o);
  const home = o.deliveryMethod === 'HOME';
  if (stage === 'PENDING') return [['CONFIRMED', 'Xác nhận & in phiếu', 'primary']];
  if (stage === 'CONFIRMED') return home ? [['HANDOVER', 'Bàn giao ĐVVC', 'primary'], ['SHIPPING', 'Đang giao', 'outline']] : [['COMPLETED', 'Khách đã nhận hàng', 'primary']];
  if (stage === 'HANDED_OVER') return [['SHIPPING', 'Shipper đã lấy – Đang giao', 'primary'], ['RETURNING', 'Giao thất bại – Hoàn về', 'outline']];
  if (stage === 'SHIPPING') return home ? [['COMPLETED', 'Đã giao xong', 'primary'], ['RETURNING', 'Giao thất bại – Hoàn về', 'outline']] : [['COMPLETED', 'Đã giao xong', 'primary']];
  if (stage === 'RETURNING') return [['RETURNED', 'Đã nhận lại hàng hoàn', 'primary'], ['REDELIVER', 'Liên hệ được – Giao lại', 'outline'], ['COMPLETED', 'Khách đã nhận', 'outline']];
  return [];
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, loading, error, reload } = useFetch(() => adminApi.orders.get(id), [id]);
  const [saving, setSaving] = useState('');
  const [note, setNote] = useState(null); // null = chưa sửa, dùng adminNote từ server
  const [handover, setHandover] = useState(null);
  const [returning, setReturning] = useState(null);
  const [editShip, setEditShip] = useState(null);
  const [editAddr, setEditAddr] = useState(null);

  if (loading && !order) return <Spinner />;
  if (error && !order) return <ErrorBox error={error} onRetry={reload} />;

  const printUrl = `/admin/orders/${order.id}/print`;

  const update = async (patch, label) => {
    // Xác nhận đơn thì mở sẵn tab in phiếu. Phải mở ngay lúc bấm (trước khi chờ API)
    // để trình duyệt không chặn cửa sổ bật lên.
    const printTab = patch.status === 'CONFIRMED' ? window.open('', '_blank') : null;
    setSaving(label);
    try {
      await adminApi.orders.update(order.id, patch);
      if (printTab) printTab.location.href = printUrl;
      reload();
      if (patch.adminNote !== undefined) setNote(null);
      return true;
    } catch (err) {
      printTab?.close();
      alert(err.message);
      return false;
    } finally {
      setSaving('');
    }
  };

  const cancel = () => {
    if (confirm('Hủy đơn này? Hàng sẽ được hoàn lại kho và mã giảm giá được trả lượt.')) update({ status: 'CANCELLED' }, 'cancel');
  };

  const saveAddress = async () => {
    const stamp = new Date().toLocaleString('vi-VN');
    const line = `[Shop đổi thông tin nhận hàng ${stamp}] Cũ: ${order.fullName} · ${order.phone}${order.address ? ` · ${order.address}` : ''}`;
    const patch = { ...editAddr, adminNote: order.adminNote ? `${order.adminNote}\n${line}` : line };
    if (order.deliveryMethod !== 'HOME') delete patch.address;
    if (await update(patch, 'addr')) setEditAddr(null);
  };

  const canCancel = !['COMPLETED', 'CANCELLED'].includes(order.status) && orderStage(order) !== 'RETURNING';

  const onAction = (next) => {
    if (next === 'HANDOVER') return setHandover([order.id]);
    if (next === 'RETURNING') return setReturning([order.id]);
    if (next === 'REDELIVER') return update({ redeliver: true }, next);
    if (next === 'RETURNED') {
      const refund = order.paymentStatus === 'PAID' ? '\n\nĐơn đã thanh toán: nhớ hoàn tiền cho khách rồi bấm "Đã hoàn tiền".' : '';
      if (confirm(`Xác nhận shop đã nhận lại gói hàng hoàn?\nĐơn chuyển Đã hủy, hàng được cộng lại vào kho.${refund}`)) update({ returned: true }, next);
      return null;
    }
    return update({ status: next }, next);
  };
  const open = canCancel;

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{order.code}</span>}
        subtitle={`Đặt lúc ${formatDate(order.createdAt, true)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Quay lại</Button>
            <a href={printUrl} target="_blank" rel="noreferrer">
              <Button variant="dark"><Printer size={16} /> In phiếu</Button>
            </a>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <h2 className="font-bold px-4 py-3 border-b border-gray-100">Sản phẩm</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-4 py-3">
                  <img onError={imgFallback} src={assetUrl(it.image)} alt="" className="w-14 h-14 rounded-lg object-contain bg-gray-50 border border-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {it.productId ? (
                      <Link to={`/admin/products/${it.productId}`} className="font-semibold hover:underline line-clamp-2">{it.productName}</Link>
                    ) : (
                      <p className="font-semibold line-clamp-2">{it.productName}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {[it.variantLabel, it.color].filter(Boolean).join(' · ') || 'Mặc định'}
                    </p>
                  </div>
                  <div className="text-right text-sm shrink-0">
                    <p>{formatPrice(it.unitPrice)} × {it.quantity}</p>
                    <p className="font-bold">{formatPrice(it.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-4 py-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between"><span className="text-gray-500">Giảm giá ({order.couponCode})</span><span className="text-emerald-600">-{formatPrice(order.discount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-500">Phí vận chuyển</span><span>{order.shippingFee ? formatPrice(order.shippingFee) : 'Miễn phí'}</span></div>
              <div className="flex justify-between text-base font-black pt-1"><span>Tổng cộng</span><span className="text-red-600">{formatPrice(order.total)}</span></div>
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold">Khách hàng · Thông tin nhận hàng</h2>
              {open && (
                <button
                  type="button"
                  onClick={() => setEditAddr({ fullName: order.fullName, phone: order.phone, address: order.address || '' })}
                  className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <Pencil size={12} /> Sửa
                </button>
              )}
            </div>
            {order.addressChangedAt && (
              <p className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                Thông tin nhận hàng đã đổi lúc {formatDate(order.addressChangedAt, true)} – lịch sử xem ở ghi chú nội bộ
              </p>
            )}
            <p className="font-semibold">{order.gender ? `${order.gender} ` : ''}{order.fullName}</p>
            <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-sm text-blue-700 hover:underline"><Phone size={14} /> {order.phone}</a>
            {order.email && <p className="flex items-center gap-2 text-sm"><Mail size={14} className="text-gray-400" /> {order.email}</p>}
            <p className="flex items-start gap-2 text-sm">
              {order.deliveryMethod === 'HOME' ? <MapPin size={14} className="text-gray-400 mt-0.5" /> : <Store size={14} className="text-gray-400 mt-0.5" />}
              {order.deliveryMethod === 'HOME' ? order.address : 'Nhận trực tiếp tại Thanh Đa'}
            </p>
            {order.note && <p className="text-sm bg-amber-50 border border-amber-100 rounded-lg p-2"><b>Ghi chú của khách:</b> {order.note}</p>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Trạng thái đơn</h2>
              <Badge map={STAGE} value={orderStage(order)} />
            </div>
            <Timeline order={order} />
            <div className="flex flex-wrap gap-2">
              {nextActions(order).map(([next, label, variant]) => (
                <Button
                  key={next}
                  variant={variant}
                  loading={saving === next}
                  onClick={() => onAction(next)}
                >
                  {label}
                </Button>
              ))}
              {canCancel && <Button variant="outline" className="text-red-600" loading={saving === 'cancel'} onClick={cancel}>Hủy đơn</Button>}
            </div>
          </Card>

          {order.deliveryMethod === 'HOME' && (
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><Truck size={16} /> Vận chuyển</h2>
                {order.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => setEditShip({ carrier: order.carrier || '', trackingCode: order.trackingCode || '' })}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Pencil size={12} /> Sửa
                  </button>
                )}
              </div>
              <p className="text-sm"><span className="text-gray-500">Đơn vị:</span> <b>{order.carrier || '—'}</b></p>
              <p className="text-sm"><span className="text-gray-500">Mã vận đơn:</span> <b className="font-mono">{order.trackingCode || '—'}</b></p>
              {order.returningAt && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-800">
                  <p className="font-bold">{order.returnedAt ? 'Đã nhận lại hàng hoàn' : 'Giao không thành công – đang hoàn về shop'}</p>
                  {order.returnReason && <p>Lý do: {order.returnReason}</p>}
                  <p className="text-orange-700/80">Từ {formatDate(order.returningAt, true)}{order.returnedAt ? ` · nhận lại ${formatDate(order.returnedAt, true)}` : ''}</p>
                </div>
              )}
              {order.handedOverAt ? (
                <p className="text-xs text-gray-500">Bàn giao lúc {formatDate(order.handedOverAt, true)}</p>
              ) : (
                order.status === 'CONFIRMED' && <p className="text-xs text-amber-700">Chưa bàn giao cho đơn vị vận chuyển</p>
              )}
            </Card>
          )}

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Thanh toán</h2>
              {(() => {
                const v = paymentView(order);
                return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${v.className}`}>{v.label}</span>;
              })()}
            </div>
            {order.paymentMethod === 'COD' && order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && (
              <p className="text-xs text-gray-500">Đơn COD: khách trả tiền khi nhận hàng. Bấm <b>Hoàn tất</b> đơn là tự chuyển sang Đã thanh toán.</p>
            )}
            <p className="text-sm text-gray-600">
              {order.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'Thanh toán khi nhận hàng (COD)'}
              {order.transferContent && <> · Nội dung CK: <b className="text-black">{order.transferContent}</b></>}
            </p>
            <div className="flex flex-wrap gap-2">
              {order.paymentStatus !== 'PAID' && (
                <Button variant="dark" loading={saving === 'PAID'} onClick={() => update({ paymentStatus: 'PAID' }, 'PAID')}>Đánh dấu đã thanh toán</Button>
              )}
              {order.paymentStatus === 'PAID' && (
                <Button variant="outline" loading={saving === 'REFUNDED'} onClick={() => confirm('Đánh dấu đã hoàn tiền?') && update({ paymentStatus: 'REFUNDED' }, 'REFUNDED')}>Đã hoàn tiền</Button>
              )}
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <Field label="Ghi chú nội bộ" hint="Khách không nhìn thấy ghi chú này">
              <Textarea value={note ?? order.adminNote ?? ''} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <Button size="sm" disabled={note === null} loading={saving === 'note'} onClick={() => update({ adminNote: note }, 'note')}>Lưu ghi chú</Button>
          </Card>
        </div>
      </div>

      <HandoverModal
        ids={handover}
        withTracking
        busy={saving === 'HANDOVER'}
        onClose={() => setHandover(null)}
        onSubmit={async (carrier, trackingCode) => {
          if (await update({ handover: true, carrier, ...(trackingCode ? { trackingCode } : {}) }, 'HANDOVER')) setHandover(null);
        }}
      />

      <ReturnModal
        ids={returning}
        busy={saving === 'RETURNING'}
        onClose={() => setReturning(null)}
        onSubmit={async (returnReason) => {
          if (await update({ returning: true, returnReason }, 'RETURNING')) setReturning(null);
        }}
      />

      <Modal
        open={Boolean(editShip)}
        title="Sửa thông tin vận chuyển"
        onClose={() => setEditShip(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditShip(null)}>Hủy</Button>
            <Button loading={saving === 'ship'} onClick={async () => (await update(editShip, 'ship')) && setEditShip(null)}>Lưu</Button>
          </>
        }
      >
        {editShip && (
          <div className="space-y-3">
            <Field label="Đơn vị vận chuyển">
              <div className="flex flex-wrap gap-2">
                {CARRIERS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditShip({ ...editShip, carrier: c })}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${editShip.carrier === c ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Mã vận đơn">
              <Input value={editShip.trackingCode} onChange={(e) => setEditShip({ ...editShip, trackingCode: e.target.value })} placeholder="VD: SPXVN0123456789" />
            </Field>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(editAddr)}
        title="Sửa thông tin nhận hàng"
        onClose={() => setEditAddr(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditAddr(null)}>Hủy</Button>
            <Button loading={saving === 'addr'} onClick={saveAddress}><Check size={16} /> Lưu</Button>
          </>
        }
      >
        {editAddr && (
          <div className="space-y-3">
            <Field label="Người nhận">
              <Input value={editAddr.fullName} onChange={(e) => setEditAddr({ ...editAddr, fullName: e.target.value })} />
            </Field>
            <Field label="Số điện thoại">
              <Input value={editAddr.phone} onChange={(e) => setEditAddr({ ...editAddr, phone: e.target.value })} />
            </Field>
            {order.deliveryMethod === 'HOME' && (
              <Field label="Địa chỉ" hint="Số nhà, đường, phường/xã, tỉnh/thành">
                <Textarea value={editAddr.address} onChange={(e) => setEditAddr({ ...editAddr, address: e.target.value })} />
              </Field>
            )}
            {order.handedOverAt && (
              <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                Đơn đã bàn giao {order.carrier || 'ĐVVC'} – nhớ báo đổi địa chỉ trên app của đơn vị vận chuyển{order.trackingCode ? ` (mã ${order.trackingCode})` : ''}.
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

// Dòng thời gian các bước của đơn
function Timeline({ order }) {
  const steps = timelineSteps(order);
  return (
    <ol>
      {steps.map((s, i) => (
        <li key={s.key} className="relative flex gap-3 pb-3 last:pb-0">
          {i < steps.length - 1 && <span className={`absolute left-[9px] top-5 h-[calc(100%-12px)] w-0.5 ${steps[i + 1].done ? (steps[i + 1].warn ? 'bg-orange-400' : 'bg-emerald-500') : 'bg-gray-200'}`} />}
          <span className={`relative z-[1] mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${s.done ? (s.warn ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white') : 'border-2 border-gray-200 bg-white'}`}>
            {s.done && <Check size={12} strokeWidth={3} />}
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${s.done ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
            {s.at && <p className="text-xs text-gray-500">{formatDate(s.at, true)}</p>}
          </div>
        </li>
      ))}
      {order.status === 'CANCELLED' && !order.returningAt && (
        <li className="mt-3 flex gap-3">
          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white">✕</span>
          <div>
            <p className="text-sm font-semibold text-gray-700">Đã hủy</p>
            {order.cancelledAt && <p className="text-xs text-gray-500">{formatDate(order.cancelledAt, true)}</p>}
          </div>
        </li>
      )}
    </ol>
  );
}
