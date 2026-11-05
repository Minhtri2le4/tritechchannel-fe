import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileSignature, Phone, Printer, Search, Trash2 } from 'lucide-react';
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
            <Input className="pl-9" placeholder="Tìm SĐT, tên khách, tên máy, IMEI / Serial, CCCD..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
            { key: 'status', title: 'Trạng thái', render: (t) => <><Badge map={TRADE_IN_STATUS} value={t.status} /><CustomerStep t={t} /></> },
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

// Khách đã trả lời báo giá chưa / đã ký giấy chưa
const DECISION = {
  ACCEPTED: 'text-emerald-700',
  DECLINED: 'text-gray-500',
};
function CustomerStep({ t }) {
  if (t.signedAt) return <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-700"><FileSignature size={12} /> Đã ký giấy</p>;
  if (t.decision === 'ACCEPTED') return <p className={`mt-1 text-[11px] font-semibold ${DECISION.ACCEPTED}`}>Khách đồng ý · {t.sellMethod === 'STORE' ? 'tại cửa hàng' : 'online'}</p>;
  if (t.decision === 'DECLINED') return <p className={`mt-1 text-[11px] font-semibold ${DECISION.DECLINED}`}>Khách không bán</p>;
  if (t.status === 'QUOTED' && t.quotedPrice != null) return <p className="mt-1 text-[11px] text-amber-700">Chờ khách trả lời</p>;
  return null;
}

function TradeInModal({ item: row, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  // Bản đầy đủ (có giấy mua bán đã ký) lấy riêng
  const { data: full } = useFetch(() => adminApi.tradeIns.get(row.id), [row.id]);
  const item = full || row;
  const [form, setForm] = useState({ status: item.status, quotedPrice: item.quotedPrice, adminNote: item.adminNote || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      // Nhập giá mà chưa chọn trạng thái -> tự chuyển "Đã báo giá" để khách thấy giá trên web
      const body = { ...form };
      if (body.quotedPrice != null && body.quotedPrice !== item.quotedPrice && ['NEW', 'CONTACTED'].includes(body.status)) body.status = 'QUOTED';
      await adminApi.tradeIns.update(item.id, body);
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
          <p className="-mt-1 text-xs text-gray-500">
            Lưu giá với trạng thái <b>Đã báo giá</b> → khách thấy giá trên web và bấm Đồng ý bán / Không bán. Đổi giá thì khách phải xác nhận & ký lại.
          </p>

          {/* Khách trả lời + giấy mua bán */}
          <div className="rounded-xl border border-gray-200 p-3 text-sm">
            <p className="font-semibold">Phản hồi của khách</p>
            {item.decision === 'ACCEPTED' ? (
              <p className="mt-1 text-emerald-700">
                Đồng ý bán · {item.sellMethod === 'STORE' ? 'mang máy tới cửa hàng' : 'bán online (gửi máy)'}
                {item.decidedAt && <span className="text-gray-500"> · {formatDate(item.decidedAt, true)}</span>}
              </p>
            ) : item.decision === 'DECLINED' ? (
              <p className="mt-1 text-gray-600">Không bán{item.decidedAt && ` · ${formatDate(item.decidedAt, true)}`}</p>
            ) : (
              <p className="mt-1 text-gray-500">{item.status === 'QUOTED' && item.quotedPrice != null ? 'Chờ khách trả lời báo giá' : 'Chưa báo giá'}</p>
            )}
            {item.signedAt ? (
              <div className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-xs">
                <p className="font-semibold text-blue-700">Đã ký giấy mua bán · {formatDate(item.signedAt, true)}</p>
                {item.sellerInfo && (
                  <p className="text-gray-600">
                    {item.sellerInfo.fullName} · CCCD {item.sellerInfo.cccd} · IMEI {item.sellerInfo.imei}
                  </p>
                )}
                {item.signature && <img src={item.signature} alt="Chữ ký" className="h-16 rounded border border-gray-100 bg-white" />}
              </div>
            ) : null}
            <a
              href={`/admin/trade-ins/${item.id}/print`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700"
            >
              <Printer size={14} /> In giấy mua bán (A5){!item.signedAt && ' – bản trống để khách ký tay'}
            </a>
          </div>
          <Field label="Ghi chú nội bộ">
            <Textarea rows={4} value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </Modal>
  );
}
