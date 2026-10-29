import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, imgFallback } from '../../lib/api';
import { adminApi } from '../adminApi';
import { useAuth } from '../AuthContext';
import { Badge, Button, Card, Checkbox, ErrorBox, Field, Input, Modal, PageHeader, Table, errorText } from '../ui';
import ImageField from '../ImageField';

export default function CategoriesPage() {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useFetch(() => adminApi.categories.list(), []);

  const remove = async (c) => {
    const count = c._count?.products || 0;
    if (!confirm(`Xóa danh mục "${c.name}"?${count ? `\n${count} sản phẩm trong danh mục sẽ chuyển sang "không có danh mục".` : ''}`)) return;
    try {
      await adminApi.categories.remove(c.id);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Danh mục"
        subtitle="Menu bên trái và các icon tròn ở trang chủ"
        actions={isAdmin && <Button onClick={() => setEditing({})}><Plus size={16} /> Thêm danh mục</Button>}
      />
      <Card>
        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}
        <Table
          rows={data}
          loading={loading}
          columns={[
            { key: 'sortOrder', title: '#', className: 'text-gray-400 w-10' },
            {
              key: 'name',
              title: 'Tên',
              render: (c) => (
                <div className="flex items-center gap-2.5">
                  {c.image ? <img onError={imgFallback} src={assetUrl(c.image)} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="w-8 h-8 rounded-full bg-gray-100" />}
                  <div>
                    <p className="font-semibold">{c.name} {c.badge && <span className="text-[10px] text-red-600 font-black">{c.badge}</span>}</p>
                    <p className="text-xs text-gray-500">{c.path || `/category/${c.id}`}</p>
                  </div>
                </div>
              ),
            },
            { key: 'icon', title: 'Icon', className: 'text-xs text-gray-500' },
            { key: 'products', title: 'Sản phẩm', className: 'text-center', render: (c) => c._count?.products ?? 0 },
            {
              key: 'show',
              title: 'Hiển thị',
              render: (c) => (
                <div className="flex flex-wrap gap-1">
                  {!c.isActive && <Badge className="bg-gray-200 text-gray-600">Đã ẩn</Badge>}
                  {c.isActive && c.showInSidebar && <Badge className="bg-blue-50 text-blue-700">Menu</Badge>}
                  {c.isActive && c.showInQuick && <Badge className="bg-amber-50 text-amber-700">Icon trang chủ</Badge>}
                </div>
              ),
            },
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
        <CategoryModal
          category={editing.id ? editing : null}
          nextOrder={(data?.length || 0) + 1}
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

function CategoryModal({ category, nextOrder, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    name: category?.name || '',
    slug: category?.slug || '',
    icon: category?.icon || '',
    image: category?.image || '',
    badge: category?.badge || '',
    path: category?.path || '',
    sortOrder: category?.sortOrder ?? nextOrder,
    showInSidebar: category?.showInSidebar ?? true,
    showInQuick: category?.showInQuick ?? false,
    isActive: category?.isActive ?? true,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const text = (k) => ({ value: form[k], onChange: (e) => set(k, e.target.value) });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = { ...form, sortOrder: Number(form.sortOrder) || 0, slug: form.slug || undefined };
    try {
      if (category) await adminApi.categories.update(category.id, body);
      else await adminApi.categories.create(body);
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
      title={category ? `Sửa danh mục ${category.name}` : 'Thêm danh mục'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" form="category-form" loading={saving}>Lưu</Button>
        </>
      }
    >
      <form id="category-form" onSubmit={save} className="grid grid-cols-2 gap-3">
        <Field label="Tên danh mục" required className="col-span-2"><Input required {...text('name')} /></Field>
        {/* Sản phẩm gắn với danh mục theo mã, không theo tên: đổi tên = đổi cho mọi sản phẩm đang ở đây */}
        {category && (category._count?.products || 0) > 0 && form.name.trim() !== category.name && (
          <p className="col-span-2 -mt-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
            ⚠️ Danh mục này đang có <b>{category._count.products} sản phẩm</b>. Đổi tên thì cả {category._count.products} sản phẩm đó sẽ nằm trong
            danh mục “{form.name.trim() || '…'}”. Muốn có danh mục <b>mới</b> thì bấm Hủy rồi chọn “Thêm danh mục”, sau đó vào
            Sản phẩm → tick sản phẩm → “Chuyển danh mục”.
          </p>
        )}
        <Field label="Slug" hint="Để trống sẽ tự tạo"><Input {...text('slug')} /></Field>
        <Field label="Thứ tự"><Input type="number" {...text('sortOrder')} /></Field>
        <Field label="Icon (lucide)" hint="VD: Smartphone, Laptop, Watch"><Input {...text('icon')} /></Field>
        <Field label="Nhãn" hint="VD: HOT"><Input {...text('badge')} /></Field>
        <Field label="Ảnh icon trang chủ" className="col-span-2">
          <ImageField value={form.image} onChange={(v) => set('image', v)} hint="Nên dùng ảnh PNG đã tách nền (vuông, ~300×300px) – sẽ hiện trên vệt sơn vàng" />
        </Field>
        <Field label="Đường dẫn riêng" hint="Để trống = /category/:id" className="col-span-2"><Input {...text('path')} placeholder="/thu-cu-doi-moi" /></Field>
        <div className="col-span-2 flex flex-col gap-2">
          <Checkbox label="Hiện trong menu danh mục" checked={form.showInSidebar} onChange={(e) => set('showInSidebar', e.target.checked)} />
          <Checkbox label="Hiện icon tròn ở trang chủ" checked={form.showInQuick} onChange={(e) => set('showInQuick', e.target.checked)} />
          <Checkbox label="Đang hoạt động" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
        </div>
        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
}
