import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { adminApi } from '../adminApi';
import ImageField from '../ImageField';
import { shopApi } from '../../services/shop';
import { assetUrl, formatPrice, imgFallback } from '../../lib/api';
import { Button, Card, ErrorBox, Field, Input, PageHeader, Spinner, errorText, useDebounced } from '../ui';

// Ô datetime-local cần dạng "YYYY-MM-DDTHH:mm" theo giờ máy
const toLocalInput = (d) => (d ? new Date(new Date(d).getTime() - new Date(d).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
const toIso = (v) => (v ? new Date(v).toISOString() : null);

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
const emptyCampaign = () => ({
  id: newId(),
  name: '',
  enabled: true,
  bannerImage: '',
  bannerImageMobile: '',
  bgColor: '#7a1f0e',
  startsAt: toLocalInput(new Date()),
  endsAt: '',
  productIds: [],
  link: '',
});

const STATUS = {
  off: ['Đang tắt', 'bg-gray-200 text-gray-600'],
  upcoming: ['Sắp diễn ra', 'bg-blue-100 text-blue-700'],
  running: ['Đang chạy', 'bg-emerald-100 text-emerald-700'],
  ended: ['Đã kết thúc', 'bg-red-100 text-red-700'],
};

const statusOf = (c) => {
  const now = Date.now();
  if (!c.enabled) return 'off';
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return 'upcoming';
  if (c.endsAt && new Date(c.endsAt).getTime() <= now) return 'ended';
  return 'running';
};

const move = (list, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

// Tìm sản phẩm theo tên rồi bấm để thêm vào chương trình
function ProductSearch({ selectedIds, onAdd }) {
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    adminApi.products
      .list({ search: q, limit: 8 })
      .then(({ data }) => !cancelled && setResults(data))
      .catch(() => !cancelled && setResults([]));
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
      <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Gõ tên sản phẩm để thêm vào chương trình…" />
      {q && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.length ? (
            results.map((p) => {
              const added = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={added}
                  onClick={() => onAdd(p)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-amber-50 disabled:opacity-50"
                >
                  <img src={assetUrl(p.image)} onError={imgFallback} alt="" className="h-10 w-10 rounded object-contain bg-gray-50" />
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-red-600 font-semibold">{formatPrice(p.price)}</span>
                    {p.status === 'HIDDEN' && <span className="ml-2 text-xs text-gray-500">(đang ẩn – sẽ không hiện)</span>}
                  </span>
                  <span className="text-xs font-bold text-amber-600">{added ? 'Đã thêm' : '+ Thêm'}</span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-3 text-sm text-gray-500">Không tìm thấy sản phẩm</p>
          )}
        </div>
      )}
    </div>
  );
}

function CampaignEditor({ c, index, total, products, onChange, onMove, onRemove, onAddProduct }) {
  const set = (patch) => onChange({ ...c, ...patch });
  const [label, badge] = STATUS[statusOf({ ...c, startsAt: toIso(c.startsAt), endsAt: toIso(c.endsAt) })];

  return (
    <Card className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-4 w-4 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: c.bgColor }} />
          <h2 className="font-bold text-gray-900 truncate">{c.name || 'Chương trình mới'}</h2>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge}`}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer select-none whitespace-nowrap">
            <input type="checkbox" className="w-4 h-4 accent-amber-500" checked={c.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
            Bật
          </label>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" title="Lên trên" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={14} /></Button>
            <Button size="sm" variant="ghost" title="Xuống dưới" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown size={14} /></Button>
            <Button size="sm" variant="ghost" title="Xoá chương trình" className="hover:text-red-600" onClick={onRemove}><Trash2 size={14} /></Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Tên chương trình" required hint="Hiện trên nút chuyển khi có nhiều chương trình cùng chạy">
            <Input value={c.name} onChange={(e) => set({ name: e.target.value })} placeholder="VD: Tiệc Halloween" />
          </Field>
          <Field label="Màu nền khối" hint="Chọn màu hợp với banner">
            <div className="flex gap-2">
              <input type="color" value={c.bgColor} onChange={(e) => set({ bgColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded border border-gray-200" />
              <Input value={c.bgColor} onChange={(e) => set({ bgColor: e.target.value.trim() })} className="font-mono" />
            </div>
          </Field>
          <Field label="Bắt đầu" hint="Trống = chạy ngay">
            <Input type="datetime-local" value={c.startsAt} onChange={(e) => set({ startsAt: e.target.value })} />
          </Field>
          <Field label="Kết thúc" hint="Đồng hồ đếm ngược tới giờ này, hết giờ khối tự ẩn">
            <Input type="datetime-local" value={c.endsAt} onChange={(e) => set({ endsAt: e.target.value })} />
          </Field>
          <Field label="Banner máy tính" hint="Ảnh ngang khoảng 1200×300px">
            <ImageField value={c.bannerImage || ''} onChange={(v) => set({ bannerImage: v })} aspect="aspect-[4/1]" previewClass="w-48" />
          </Field>
          <Field label="Banner điện thoại (tuỳ chọn)" hint="Khoảng 800×300px. Trống = dùng banner máy tính">
            <ImageField value={c.bannerImageMobile || ''} onChange={(v) => set({ bannerImageMobile: v })} aspect="aspect-[8/3]" previewClass="w-40" />
          </Field>
          <Field label="Bấm banner / nút Xem tất cả thì mở" hint="VD: /promotions hoặc /category/1. Trống = không có nút" className="md:col-span-2">
            <Input value={c.link || ''} onChange={(e) => set({ link: e.target.value })} placeholder="/promotions" />
          </Field>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm trong chương trình ({c.productIds.length}/60)</p>
          <ProductSearch selectedIds={c.productIds} onAdd={onAddProduct} />
          {c.productIds.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {c.productIds.map((id, i) => {
                const p = products[id];
                return (
                  <div key={id} className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 p-2">
                    <img src={assetUrl(p?.image)} onError={imgFallback} alt="" className="h-10 w-10 rounded object-contain bg-gray-50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{p?.name || `Sản phẩm #${id} (đang ẩn hoặc đã xoá)`}</p>
                      {p && <p className="text-xs text-red-600 font-semibold">{formatPrice(p.price)}</p>}
                    </div>
                    <div className="flex shrink-0">
                      <button type="button" title="Lên trước" disabled={i === 0} onClick={() => set({ productIds: move(c.productIds, i, -1) })} className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30"><ArrowUp size={13} /></button>
                      <button type="button" title="Ra sau" disabled={i === c.productIds.length - 1} onClick={() => set({ productIds: move(c.productIds, i, 1) })} className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30"><ArrowDown size={13} /></button>
                      <button type="button" title="Bỏ khỏi chương trình" onClick={() => set({ productIds: c.productIds.filter((x) => x !== id) })} className="p-1 text-gray-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-xs text-gray-500">Chưa có sản phẩm – khối chương trình chỉ hiện khi có ít nhất 1 sản phẩm.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Admin → Chương trình khuyến mãi: khối banner + đếm ngược + sản phẩm trên trang chủ (Halloween, 11.11, Tết…)
export default function CampaignsPage() {
  const [list, setList] = useState(null);
  const [products, setProducts] = useState({}); // id -> sản phẩm, để hiện tên/ảnh
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminApi.settings
      .getCampaigns()
      .then(async ({ data }) => {
        const campaigns = (data?.campaigns || []).map((c) => ({ ...c, startsAt: toLocalInput(c.startsAt), endsAt: toLocalInput(c.endsAt), bannerImage: c.bannerImage || '', bannerImageMobile: c.bannerImageMobile || '', link: c.link || '' }));
        const ids = [...new Set(campaigns.flatMap((c) => c.productIds))];
        if (ids.length) {
          const { data: found } = await shopApi.products({ ids: ids.slice(0, 60).join(',') }).catch(() => ({ data: [] }));
          setProducts(Object.fromEntries(found.map((p) => [p.id, p])));
        }
        setList(campaigns);
      })
      .catch(setLoadError);
  }, []);

  if (loadError) return <ErrorBox error={loadError} />;
  if (!list) return <Spinner />;

  const update = (i, c) => setList(list.map((x, idx) => (idx === i ? c : x)));

  const save = async () => {
    const unnamed = list.findIndex((c) => !c.name.trim());
    if (unnamed >= 0) return setMessage(`❌ Chương trình ${unnamed + 1} chưa có tên`);
    setSaving(true);
    setMessage('');
    try {
      await adminApi.settings.saveCampaigns({
        campaigns: list.map((c) => ({ ...c, startsAt: toIso(c.startsAt), endsAt: toIso(c.endsAt) })),
      });
      setMessage('✅ Đã lưu – trang chủ cập nhật ngay');
    } catch (err) {
      setMessage(`❌ ${errorText(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const saveButton = (
    <Button onClick={save} loading={saving}>
      <Save size={16} /> Lưu thay đổi
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Chương trình khuyến mãi"
        subtitle="Khối banner + đếm ngược + sản phẩm trên trang chủ, nằm giữa Đại lý ủy quyền và Review sản phẩm"
        actions={
          <>
            <Button variant="outline" onClick={() => setList([emptyCampaign(), ...list])}><Plus size={16} /> Thêm chương trình</Button>
            {saveButton}
          </>
        }
      />
      {message && <p className={`mb-4 text-sm font-semibold ${message.startsWith('❌') ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>}

      {list.length ? (
        list.map((c, i) => (
          <CampaignEditor
            key={c.id}
            c={c}
            index={i}
            total={list.length}
            products={products}
            onChange={(next) => update(i, next)}
            onMove={(dir) => setList(move(list, i, dir))}
            onRemove={() => confirm(`Xoá chương trình "${c.name || 'mới'}"?`) && setList(list.filter((_, idx) => idx !== i))}
            onAddProduct={(p) => {
              setProducts((m) => ({ ...m, [p.id]: p }));
              if (c.productIds.length < 60) update(i, { ...c, productIds: [...c.productIds, p.id] });
            }}
          />
        ))
      ) : (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-gray-600">Chưa có chương trình nào. Tạo chương trình đầu tiên, ví dụ “Tiệc Halloween”.</p>
          <Button onClick={() => setList([emptyCampaign()])}><Plus size={16} /> Thêm chương trình</Button>
        </Card>
      )}

      {list.length > 0 && <div className="flex justify-end">{saveButton}</div>}
    </>
  );
}
