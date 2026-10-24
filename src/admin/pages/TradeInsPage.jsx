import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Phone, Search, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, imgFallback, formatDate, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { useAuth } from '../AuthContext';
import {
  Badge, Button, Card, ErrorBox, Field, Input, Modal, MoneyInput, PageHeader, Pagination, Select, TRADE_IN_STATUS, Table,
  Textarea, errorText, useDebounced,
} from '../ui';

export default function TradeInsPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const q = useDebounced(search);

  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.tradeIns.list({ status: status || undefined, search: q || undefined, page, limit: 20 }),
    [status, q, page]
  );

  const setStatus = (value) => {
    setParams(value ? { status: value } : {}, { replace: true });
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Thu cũ đổi mới" subtitle="Yêu cầu định giá khách gửi từ website" />

      <Card>
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input className="pl-9" placeholder="Tìm SĐT, tên khách, tên máy..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select className="w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Mọi trạng thái</option>
            {Object.entries(TRADE_IN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>

        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}

        <Table
          rows={data}
          loading={loading}
          onRowClick={setSelected}
          empty="Chưa có yêu cầu nào"
          columns={[
            {
              key: 'images',
              title: 'Ảnh',
              render: (t) =>
                t.images[0] ? (
                  <img onError={imgFallback} src={assetUrl(t.images[0])} alt="" className="w-11 h-11 rounded-lg object-cover border border-gray-100" />
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                ),
            },
            { key: 'device', title: 'Thiết bị', render: (t) => <><p className="font-semibold">{t.deviceName}</p><p className="text-xs text-gray-500">{t.brand} · {t.condition} · {t.accessoryIncluded}</p></> },
            { key: 'customer', title: 'Khách hàng', render: (t) => <><p className="font-medium">{t.fullName}</p><p className="text-xs text-gray-500">{t.phone}</p></> },
            { key: 'targetDevice', title: 'Muốn lên đời', className: 'text-gray-600', render: (t) => t.targetDevice || '—' },
            { key: 'quotedPrice', title: 'Giá báo', className: 'text-right whitespace-nowrap', render: (t) => (t.quotedPrice != null ? <b>{formatPrice(t.quotedPrice)}</b> : '—') },
            { key: 'status', title: 'Trạng thái', render: (t) => <Badge map={TRADE_IN_STATUS} value={t.status} /> },
            { key: 'createdAt', title: 'Ngày gửi', className: 'whitespace-nowrap text-xs text-gray-500', render: (t) => formatDate(t.createdAt, true) },
          ]}
        />
        <Pagination meta={meta} onChange={setPage} />
      </Card>

      {selected && (
        <TradeInModal
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function TradeInModal({ item, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({ status: item.status, quotedPrice: item.quotedPrice, adminNote: item.adminNote || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await adminApi.tradeIns.update(item.id, form);
      onSaved();
    } catch (err) {
      setError(errorText(err));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm('Xóa yêu cầu này và toàn bộ ảnh đính kèm?')) return;
    try {
      await adminApi.tradeIns.remove(item.id);
      onSaved();
    } catch (err) {
      alert(err.message);
    }
  };

  const info = [
    ['Loại thiết bị', item.category],
    ['Hãng', item.brand],
    ['Tên máy', item.deviceName],
    ['Tình trạng', item.condition],
    ['Phụ kiện', item.accessoryIncluded],
    ['Muốn lên đời', item.targetDevice || '—'],
  ];

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={`Yêu cầu #${item.id} · ${item.fullName}`}
      footer={
        <>
          {isAdmin && <Button variant="ghost" className="mr-auto text-red-600" onClick={remove}><Trash2 size={15} /> Xóa</Button>}
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button loading={saving} onClick={save}>Lưu</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <a href={`tel:${item.phone}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
            <Phone size={14} /> {item.phone} — gọi / Zalo báo giá
          </a>
          <dl className="grid grid-cols-3 gap-y-1.5 text-sm">
            {info.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-gray-500">{k}</dt>
                <dd className="col-span-2 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {item.note && <p className="text-sm bg-amber-50 border border-amber-100 rounded-lg p-2"><b>Ghi chú:</b> {item.note}</p>}
          {item.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {item.images.map((img) => (
                <a key={img} href={assetUrl(img)} target="_blank" rel="noreferrer">
                  <img onError={imgFallback} src={assetUrl(img)} alt="" className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:opacity-80" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Khách không gửi ảnh.</p>
          )}
        </div>

        <div className="space-y-3">
          <Field label="Trạng thái">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(TRADE_IN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </Field>
          <Field label="Giá thu báo cho khách (VND)">
            <MoneyInput value={form.quotedPrice} onChange={(v) => setForm({ ...form, quotedPrice: v })} />
          </Field>
          <Field label="Ghi chú nội bộ">
            <Textarea rows={4} value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </Modal>
  );
}
