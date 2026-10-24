import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, EyeOff, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Badge, Button, Card, ErrorBox, Input, PageHeader, Pagination, Select, Table, useDebounced } from '../ui';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounced(search);

  const { data: categories } = useFetch(() => adminApi.categories.list(), []);
  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.products.list({ search: q || undefined, status: status || undefined, categoryId: categoryId || undefined, page, limit: 20 }),
    [q, status, categoryId, page]
  );

  const filter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const toggleStatus = async (p) => {
    try {
      await adminApi.products.update(p.id, { status: p.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE' });
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Xóa vĩnh viễn "${p.name}"?\nNếu chỉ muốn ngừng bán, hãy bấm nút ẩn.`)) return;
    try {
      await adminApi.products.remove(p.id);
      reload();
    } catch (err) {
      alert(err.message);
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

        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}

        <Table
          rows={data}
          loading={loading}
          onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
          empty="Không có sản phẩm phù hợp"
          columns={[
            {
              key: 'name',
              title: 'Sản phẩm',
              render: (p) => (
                <div className="flex items-center gap-3 min-w-[240px]">
                  <img src={assetUrl(p.image)} alt="" className="w-11 h-11 rounded-lg object-contain bg-gray-50 border border-gray-100 shrink-0" />
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
                  <Button size="sm" variant="ghost" title="Xóa" className="hover:text-red-600" onClick={() => remove(p)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
        <Pagination meta={meta} onChange={setPage} />
      </Card>
    </>
  );
}
