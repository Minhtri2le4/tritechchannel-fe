import { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { formatDate } from '../../lib/api';
import { adminApi } from '../adminApi';
import { useAuth } from '../AuthContext';
import { Badge, Button, Card, ErrorBox, Field, Input, Modal, PageHeader, Pagination, Select, Spinner, Table, Textarea, errorText, useDebounced } from '../ui';

const STATE_BADGE = {
  true: { label: 'Còn hạn', className: 'bg-emerald-100 text-emerald-700' },
  false: { label: 'Hết hạn', className: 'bg-gray-200 text-gray-600' },
};

const RECORD_BADGE = {
  'Hoàn tất': { className: 'bg-emerald-100 text-emerald-700' },
  'Đang xử lý': { className: 'bg-amber-100 text-amber-800' },
};

// yyyy-MM-dd cho <input type="date">
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return toDateInput(d);
};

export default function WarrantiesPage() {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const q = useDebounced(search);

  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.warranties.list({ search: q || undefined, state: state || undefined, page, limit: 20 }),
    [q, state, page]
  );

  return (
    <>
      <PageHeader
        title="Bảo hành"
        subtitle="Khách tra cứu bằng SĐT hoặc IMEI trên trang Bảo hành"
        actions={<Button onClick={() => setEditing('new')}><Plus size={16} /> Tạo phiếu bảo hành</Button>}
      />

      <Card>
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input className="pl-9" placeholder="Tìm IMEI, SĐT, tên khách, sản phẩm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select className="w-auto" value={state} onChange={(e) => { setState(e.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            <option value="active">Còn hạn</option>
            <option value="expired">Hết hạn</option>
          </Select>
        </div>

        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}

        <Table
          rows={data}
          loading={loading}
          onRowClick={(w) => setEditing(w.id)}
          empty="Chưa có phiếu bảo hành"
          columns={[
            { key: 'imei', title: 'IMEI / Serial', render: (w) => <span className="font-mono text-xs font-semibold">{w.imei}</span> },
            { key: 'productName', title: 'Sản phẩm', className: 'font-medium' },
            { key: 'customer', title: 'Khách hàng', render: (w) => <><p>{w.customerName}</p><p className="text-xs text-gray-500">{w.phone}</p></> },
            { key: 'purchaseDate', title: 'Ngày mua', className: 'whitespace-nowrap text-gray-600', render: (w) => formatDate(w.purchaseDate) },
            { key: 'expiryDate', title: 'Hết hạn', className: 'whitespace-nowrap text-gray-600', render: (w) => formatDate(w.expiryDate) },
            { key: 'isActive', title: 'Trạng thái', render: (w) => <Badge map={STATE_BADGE} value={String(w.isActive)} /> },
          ]}
        />
        <Pagination meta={meta} onChange={setPage} />
      </Card>

      {editing && (
        <WarrantyModal
          key={editing}
          id={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onChanged={reload}
        />
      )}
    </>
  );
}

function WarrantyModal({ id, onClose, onChanged }) {
  const { data, loading, reload } = useFetch(() => (id ? adminApi.warranties.get(id) : Promise.resolve({ data: null })), [id]);
  if (id && loading && !data) {
    return <Modal open onClose={onClose} title="Phiếu bảo hành"><Spinner /></Modal>;
  }
  return <WarrantyForm warranty={data} onClose={onClose} onChanged={() => { onChanged(); reload(); }} />;
}

function WarrantyForm({ warranty, onClose, onChanged }) {
  const { isAdmin } = useAuth();
  const today = toDateInput(new Date());
  const [form, setForm] = useState(() =>
    warranty
      ? { imei: warranty.imei, productName: warranty.productName, customerName: warranty.customerName, phone: warranty.phone, purchaseDate: toDateInput(warranty.purchaseDate), expiryDate: toDateInput(warranty.expiryDate), note: warranty.note || '' }
      : { imei: '', productName: '', customerName: '', phone: '', purchaseDate: today, expiryDate: addMonths(today, 12), note: '' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState({ note: '', status: 'Đang xử lý' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (warranty) await adminApi.warranties.update(warranty.id, form);
      else await adminApi.warranties.create(form);
      onChanged();
      onClose();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm('Xóa phiếu bảo hành này?')) return;
    try {
      await adminApi.warranties.remove(warranty.id);
      onChanged();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  const addRecord = async () => {
    if (!record.note.trim()) return;
    try {
      await adminApi.warranties.addRecord(warranty.id, record);
      setRecord({ note: '', status: 'Đang xử lý' });
      onChanged();
    } catch (err) {
      alert(errorText(err));
    }
  };

  const markDone = async (r) => {
    try {
      await adminApi.warranties.updateRecord(warranty.id, r.id, { status: 'Hoàn tất' });
      onChanged();
    } catch (err) {
      alert(err.message);
    }
  };

  const removeRecord = async (r) => {
    if (!confirm('Xóa dòng lịch sử này?')) return;
    try {
      await adminApi.warranties.removeRecord(warranty.id, r.id);
      onChanged();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={warranty ? `Phiếu bảo hành · ${warranty.imei}` : 'Tạo phiếu bảo hành'}
      footer={
        <>
          {warranty && isAdmin && <Button variant="ghost" className="mr-auto text-red-600" onClick={remove}><Trash2 size={15} /> Xóa phiếu</Button>}
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button type="submit" form="warranty-form" loading={saving}>Lưu</Button>
        </>
      }
    >
      <form id="warranty-form" onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="IMEI / Serial" required><Input required value={form.imei} onChange={set('imei')} /></Field>
        <Field label="Sản phẩm" required><Input required value={form.productName} onChange={set('productName')} /></Field>
        <Field label="Tên khách hàng" required><Input required value={form.customerName} onChange={set('customerName')} /></Field>
        <Field label="Số điện thoại" required><Input required value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Ngày mua" required>
          <Input type="date" required value={form.purchaseDate} onChange={set('purchaseDate')} />
        </Field>
        <Field label="Ngày hết hạn" required>
          <div className="flex gap-1">
            <Input type="date" required value={form.expiryDate} onChange={set('expiryDate')} />
            {[6, 12].map((m) => (
              <Button key={m} type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, expiryDate: addMonths(form.purchaseDate, m) })}>
                {m}T
              </Button>
            ))}
          </div>
        </Field>
        <Field label="Ghi chú" className="sm:col-span-2"><Textarea rows={2} value={form.note} onChange={set('note')} /></Field>
        {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      </form>

      {warranty && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-sm mb-2">Lịch sử bảo hành / sửa chữa</h3>
          <div className="space-y-1.5 mb-3">
            {warranty.history.length === 0 && <p className="text-sm text-gray-500">Chưa có lần bảo hành nào.</p>}
            {warranty.history.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-gray-500 whitespace-nowrap">{formatDate(r.date)}</span>
                <span className="flex-1">{r.note}</span>
                <Badge map={RECORD_BADGE} value={r.status} />
                {r.status !== 'Hoàn tất' && <Button size="sm" variant="outline" onClick={() => markDone(r)}>Xong</Button>}
                <button type="button" onClick={() => removeRecord(r)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Input className="flex-1 min-w-[200px]" placeholder="VD: Thay pin, vệ sinh máy..." value={record.note} onChange={(e) => setRecord({ ...record, note: e.target.value })} />
            <Select className="w-auto" value={record.status} onChange={(e) => setRecord({ ...record, status: e.target.value })}>
              <option>Đang xử lý</option>
              <option>Hoàn tất</option>
            </Select>
            <Button type="button" variant="dark" onClick={addRecord}><Plus size={15} /> Thêm</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
