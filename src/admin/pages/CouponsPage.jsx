import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { formatDate, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { useAuth } from '../AuthContext';
import { Badge, Button, Card, Checkbox, ErrorBox, Field, Input, Modal, MoneyInput, PageHeader, Select, Table, errorText } from '../ui';

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

// Trạng thái hiển thị của mã: tắt / chưa đến ngày / hết hạn / hết lượt / đang chạy
const couponState = (c) => {
  const now = new Date();
  if (!c.isActive) return ['Đã tắt', 'bg-gray-200 text-gray-600'];
  if (c.startsAt && new Date(c.startsAt) > now) return ['Chưa bắt đầu', 'bg-blue-100 text-blue-700'];
  if (c.endsAt && new Date(c.endsAt) < now) return ['Hết hạn', 'bg-gray-200 text-gray-600'];
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return ['Hết lượt', 'bg-red-100 text-red-700'];
  return ['Đang chạy', 'bg-emerald-100 text-emerald-700'];
};

export default function CouponsPage() {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(null); // null | {} (mới) | coupon
  const { data, loading, error, reload } = useFetch(() => adminApi.coupons.list(), []);

  const remove = async (c) => {
    if (!confirm(`Xóa mã ${c.code}?`)) return;
    try {
      await adminApi.coupons.remove(c.id);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Mã giảm giá"
        subtitle="Khách nhập mã ở bước giỏ hàng"
        actions={isAdmin && <Button onClick={() => setEditing({})}><Plus size={16} /> Tạo mã</Button>}
      />
      <Card>
        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}
        <Table
          rows={data}
          loading={loading}
          empty="Chưa có mã giảm giá"
          columns={[
            { key: 'code', title: 'Mã', render: (c) => <><p className="font-mono font-bold">{c.code}</p><p className="text-xs text-gray-500">{c.description}</p></> },
            { key: 'value', title: 'Giảm', className: 'whitespace-nowrap', render: (c) => (c.type === 'PERCENT' ? `${c.value}%${c.maxDiscount ? ` (tối đa ${formatPrice(c.maxDiscount)})` : ''}` : formatPrice(c.value)) },
            { key: 'minOrder', title: 'Đơn tối thiểu', className: 'whitespace-nowrap', render: (c) => (c.minOrder ? formatPrice(c.minOrder) : '—') },
            { key: 'usage', title: 'Đã dùng', className: 'text-center', render: (c) => `${c.usedCount}${c.usageLimit != null ? `/${c.usageLimit}` : ''}` },
            { key: 'time', title: 'Thời gian', className: 'whitespace-nowrap text-xs text-gray-600', render: (c) => (c.startsAt || c.endsAt ? `${formatDate(c.startsAt) || '…'} → ${formatDate(c.endsAt) || '…'}` : 'Không giới hạn') },
            { key: 'state', title: 'Trạng thái', render: (c) => { const [label, cls] = couponState(c); return <Badge className={cls}>{label}</Badge>; } },
            {
              key: 'actions',
              title: '',
              className: 'text-right whitespace-nowrap',
              render: (c) =>
                isAdmin && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(c)}><Pencil size={15} /></Button>
                    <Button size="sm" variant="ghost" className="hover:text-red-600" onClick={() => remove(c)}><Trash2 size={15} /></Button>
                  </>
                ),
            },
          ]}
        />
      </Card>

      {editing && (
        <CouponModal
          coupon={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function CouponModal({ coupon, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    code: coupon?.code || '',
    description: coupon?.description || '',
    type: coupon?.type || 'PERCENT',
    value: coupon?.value ?? '',
    maxDiscount: coupon?.maxDiscount ?? null,
    minOrder: coupon?.minOrder ?? 0,
    usageLimit: coupon?.usageLimit ?? '',
    startsAt: toDateInput(coupon?.startsAt),
    endsAt: toDateInput(coupon?.endsAt),
    isActive: coupon?.isActive ?? true,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      ...form,
      value: Number(form.value),
      maxDiscount: form.type === 'PERCENT' ? form.maxDiscount || null : null,
      minOrder: form.minOrder || 0,
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      startsAt: form.startsAt || null,
      // Hết hạn vào cuối ngày đã chọn
      endsAt: form.endsAt ? `${form.endsAt}T23:59:59` : null,
    };
    try {
      if (coupon) await adminApi.coupons.update(coupon.id, body);
      else await adminApi.coupons.create(body);
      onSaved();
    } catch (err) {
      setError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={coupon ? `Sửa mã ${coupon.code}` : 'Tạo mã giảm giá'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" form="coupon-form" loading={saving}>Lưu</Button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={save} className="grid grid-cols-2 gap-3">
        <Field label="Mã" required className="col-span-2 sm:col-span-1">
          <Input required className="uppercase font-mono" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="TRITECH10" />
        </Field>
        <Field label="Loại giảm" className="col-span-2 sm:col-span-1">
          <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="PERCENT">Theo %</option>
            <option value="FIXED">Số tiền cố định</option>
          </Select>
        </Field>
        <Field label="Mô tả" className="col-span-2">
          <Input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Giảm 10% cho đơn từ 1 triệu" />
        </Field>
        <Field label={form.type === 'PERCENT' ? 'Giảm (%)' : 'Giảm (VND)'} required>
          {form.type === 'PERCENT' ? (
            <Input type="number" required min={1} max={100} value={form.value} onChange={(e) => set('value', e.target.value)} />
          ) : (
            <MoneyInput required value={form.value} onChange={(v) => set('value', v ?? '')} />
          )}
        </Field>
        {form.type === 'PERCENT' ? (
          <Field label="Giảm tối đa (VND)"><MoneyInput value={form.maxDiscount} onChange={(v) => set('maxDiscount', v)} /></Field>
        ) : <div />}
        <Field label="Đơn tối thiểu (VND)"><MoneyInput value={form.minOrder} onChange={(v) => set('minOrder', v)} /></Field>
        <Field label="Số lượt dùng tối đa" hint="Để trống = không giới hạn">
          <Input type="number" min={1} value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} />
        </Field>
        <Field label="Bắt đầu"><Input type="date" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} /></Field>
        <Field label="Kết thúc"><Input type="date" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} /></Field>
        <div className="col-span-2"><Checkbox label="Đang bật" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /></div>
        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
}
