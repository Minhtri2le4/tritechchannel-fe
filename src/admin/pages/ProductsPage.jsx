import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, EyeOff, Trash2, X } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, imgFallback, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Badge, Button, Card, ErrorBox, Input, Modal, PageHeader, Pagination, Select, Table, useDebounced } from '../ui';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  // confirm: { ids, names } – hộp xác nhận xóa (1 hoặc nhiều sản phẩm)
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const q = useDebounced(search);

  const { data: categories } = useFetch(() => adminApi.categories.list(), []);
  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.products.list({ search: q || undefined, status: status || undefined, categoryId: categoryId || undefined, page, limit: 20 }),
    [q, status, categoryId, page]
  );

  const filter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
    setSelected([]);
  };

  const toggleStatus = async (p) => {
    try {
      await adminApi.products.update(p.id, { status: p.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE' });
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const nameOf = (id) => data?.find((p) => p.id === id)?.name;

  const runBulk = async (ids, action, categoryId) => {
    setBusy(true);
    try {
      await adminApi.products.bulk(ids, action, categoryId);
      setSelected((sel) => sel.filter((id) => !ids.includes(id)));
      setConfirm(null);
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Sản phẩm"
        subtitle={meta ? `${meta.total} sản phẩm` : undefined}
        actions={
          <Link to="/admin/products/new">
            <Button><Plus size={16} /> Thêm sản phẩm</Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input className="pl-9" placeholder="Tìm theo tên, hãng (không cần dấu)..." value={search} onChange={filter(setSearch)} />
          </div>
          <Select className="w-auto" value={categoryId} onChange={filter(setCategoryId)}>
            <option value="">Tất cả danh mục</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select className="w-auto" value={status} onChange={filter(setStatus)}>
            <option value="">Mọi trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="HIDDEN">Đang ẩn</option>
          </Select>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm">
            <span className="font-semibold mr-auto">Đã chọn {selected.length} sản phẩm</span>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => runBulk(selected, 'show')}>
              <Eye size={14} /> Hiện
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => runBulk(selected, 'hide')}>
              <EyeOff size={14} /> Ẩn
            </Button>
            {/* Chuyển sang danh mục khác: chọn là chuyển ngay */}
            <Select
              className="w-auto text-xs py-1.5 text-gray-900"
              value=""
              disabled={busy}
              onChange={(e) => {
                const cat = categories?.find((c) => String(c.id) === e.target.value);
                if (cat && confirm(`Chuyển ${selected.length} sản phẩm sang danh mục "${cat.name}"?`)) runBulk(selected, 'move', cat.id);
              }}
            >
              <option value="">Chuyển danh mục…</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => setConfirm({ ids: selected, names: selected.map(nameOf).filter(Boolean) })}>
              <Trash2 size={14} /> Xóa
            </Button>
            <button title="Bỏ chọn" className="p-1.5 rounded-md text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => setSelected([])}>
              <X size={16} />
            </button>
          </div>
        )}

        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}

        <Table
          rows={data}
          loading={loading}
          onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
          selected={selected}
          onSelectChange={setSelected}
          empty="Không có sản phẩm phù hợp"
          columns={[
            {
              key: 'name',
              title: 'Sản phẩm',
              render: (p) => (
                <div className="flex items-center gap-3 min-w-[240px]">
                  <img onError={imgFallback} src={assetUrl(p.image)} alt="" className="w-11 h-11 rounded-lg object-contain bg-gray-50 border border-gray-100 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold line-clamp-2">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.brand || '—'}
                      {p.isHot && <span className="ml-1.5 text-red-600 font-bold">HOT</span>}
                      {p.isFlashSale && <span className="ml-1.5 text-amber-600 font-bold">FLASH</span>}
                    </p>
                  </div>
                </div>
              ),
            },
            { key: 'category', title: 'Danh mục', className: 'whitespace-nowrap text-gray-600', render: (p) => p.category?.name || '—' },
            {
              key: 'price',
              title: 'Giá bán',
              className: 'text-right whitespace-nowrap',
              render: (p) => (
                <>
                  <p className="font-bold text-red-600">{formatPrice(p.price)}</p>
                  {p.discountPercent > 0 && <p className="text-[11px] text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>}
                </>
              ),
            },
            {
              key: 'stock',
              title: 'Kho',
              className: 'text-right',
              render: (p) => (p.hasOptions ? <span className="text-xs text-gray-500">Theo phiên bản</span> : <span className={p.stock <= 5 ? 'font-bold text-red-600' : ''}>{p.stock}</span>),
            },
            { key: 'soldCount', title: 'Đã bán', className: 'text-right' },
            {
              key: 'status',
              title: 'Trạng thái',
              render: (p) => (
                <Badge map={{ ACTIVE: { label: 'Đang bán', className: 'bg-emerald-100 text-emerald-700' }, HIDDEN: { label: 'Đang ẩn', className: 'bg-gray-200 text-gray-600' } }} value={p.status} />
              ),
            },
            {
              key: 'actions',
              title: '',
              className: 'text-right whitespace-nowrap',
              render: (p) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" title={p.status === 'ACTIVE' ? 'Ẩn khỏi website' : 'Hiện lên website'} onClick={() => toggleStatus(p)}>
                    {p.status === 'ACTIVE' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </Button>
                  <Button size="sm" variant="ghost" title="Xóa" className="hover:text-red-600" onClick={() => setConfirm({ ids: [p.id], names: [p.name] })}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
        <Pagination meta={meta} onChange={setPage} />
      </Card>

      <Modal
        open={Boolean(confirm)}
        title={confirm?.ids.length > 1 ? `Xóa ${confirm.ids.length} sản phẩm?` : 'Xóa sản phẩm?'}
        onClose={() => !busy && setConfirm(null)}
        footer={
          <>
            <Button variant="outline" disabled={busy} onClick={() => setConfirm(null)}>Hủy</Button>
            <Button variant="danger" loading={busy} onClick={() => runBulk(confirm.ids, 'delete')}>
              <Trash2 size={15} /> Xóa vĩnh viễn
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">Sản phẩm sẽ bị xóa khỏi hệ thống và không khôi phục được. Đơn hàng cũ vẫn giữ nguyên thông tin.</p>
        {confirm?.names.length > 0 && (
          <ul className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 text-sm">
            {confirm.names.map((n) => <li key={n} className="px-3 py-1.5 truncate">{n}</li>)}
          </ul>
        )}
        <p className="mt-3 text-xs text-gray-500">Chỉ muốn ngừng bán? Dùng nút <b>Ẩn</b> để giữ lại sản phẩm.</p>
      </Modal>
    </>
  );
}
