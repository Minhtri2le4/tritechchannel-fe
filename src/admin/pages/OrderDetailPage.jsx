import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Store } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, formatDate, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Badge, Button, Card, ErrorBox, Field, ORDER_STATUS, PAYMENT_STATUS, PageHeader, Spinner, Textarea } from '../ui';

// Bước tiếp theo hợp lệ (khớp quy tắc chuyển trạng thái ở backend)
const NEXT_ACTIONS = {
  PENDING: [['CONFIRMED', 'Xác nhận đơn', 'primary']],
  CONFIRMED: [['SHIPPING', 'Bắt đầu giao', 'dark'], ['COMPLETED', 'Hoàn tất', 'outline']],
  SHIPPING: [['COMPLETED', 'Đã giao xong', 'primary']],
  COMPLETED: [],
  CANCELLED: [],
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, loading, error, reload } = useFetch(() => adminApi.orders.get(id), [id]);
  const [saving, setSaving] = useState('');
  const [note, setNote] = useState(null); // null = chưa sửa, dùng adminNote từ server

  if (loading && !order) return <Spinner />;
  if (error && !order) return <ErrorBox error={error} onRetry={reload} />;

  const update = async (patch, label) => {
    setSaving(label);
    try {
      await adminApi.orders.update(order.id, patch);
      reload();
      setNote(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving('');
    }
  };

  const cancel = () => {
    if (confirm('Hủy đơn này? Hàng sẽ được hoàn lại kho và mã giảm giá được trả lượt.')) update({ status: 'CANCELLED' }, 'cancel');
  };

  const canCancel = !['COMPLETED', 'CANCELLED'].includes(order.status);

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{order.code}</span>}
        subtitle={`Đặt lúc ${formatDate(order.createdAt, true)}`}
        actions={<Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Quay lại</Button>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <h2 className="font-bold px-4 py-3 border-b border-gray-100">Sản phẩm</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-4 py-3">
                  <img src={assetUrl(it.image)} alt="" className="w-14 h-14 rounded-lg object-contain bg-gray-50 border border-gray-100 shrink-0" />
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
            <h2 className="font-bold">Khách hàng</h2>
            <p className="font-semibold">{order.gender ? `${order.gender} ` : ''}{order.fullName}</p>
            <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-sm text-blue-700 hover:underline"><Phone size={14} /> {order.phone}</a>
            {order.email && <p className="flex items-center gap-2 text-sm"><Mail size={14} className="text-gray-400" /> {order.email}</p>}
            <p className="flex items-start gap-2 text-sm">
              {order.deliveryMethod === 'HOME' ? <MapPin size={14} className="text-gray-400 mt-0.5" /> : <Store size={14} className="text-gray-400 mt-0.5" />}
              {order.deliveryMethod === 'HOME' ? order.address : 'Nhận tại cửa hàng'}
            </p>
            {order.note && <p className="text-sm bg-amber-50 border border-amber-100 rounded-lg p-2"><b>Ghi chú của khách:</b> {order.note}</p>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Trạng thái đơn</h2>
              <Badge map={ORDER_STATUS} value={order.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              {NEXT_ACTIONS[order.status].map(([next, label, variant]) => (
                <Button key={next} variant={variant} loading={saving === next} onClick={() => update({ status: next }, next)}>
                  {label}
                </Button>
              ))}
              {canCancel && <Button variant="outline" className="text-red-600" loading={saving === 'cancel'} onClick={cancel}>Hủy đơn</Button>}
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Thanh toán</h2>
              <Badge map={PAYMENT_STATUS} value={order.paymentStatus} />
            </div>
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
    </>
  );
}
