import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Plus, Star, Trash2, X } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Button, Card, Checkbox, ErrorBox, Field, Input, MoneyInput, PageHeader, Select, Spinner, Textarea, errorText } from '../ui';

const EMPTY = {
  name: '', slug: '', brand: '', categoryId: '', price: null, originalPrice: null, stock: 0,
  image: '', images: [], description: '', perks: [], rating: 5, reviewsCount: 0, soldCount: 0,
  isHot: false, isFlashSale: false, installment: false, status: 'ACTIVE', variants: [], colors: [],
};

// Chuyển dữ liệu API -> state form
const toForm = (p) => ({
  ...EMPTY,
  ...p,
  brand: p.brand || '',
  categoryId: p.categoryId ?? '',
  image: p.image || '',
  description: p.description || '',
  variants: p.variants.map(({ label, price, originalPrice, stock }) => ({ label, price, originalPrice, stock })),
  colors: p.colors.map(({ name, hex, image }) => ({ name, hex: hex || '#000000', image: image || '' })),
});

export default function ProductFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const { data: product, loading, error } = useFetch(() => (isNew ? Promise.resolve({ data: null }) : adminApi.products.get(id)), [id]);

  if (!isNew && loading) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  // key: chuyển giữa các sản phẩm thì form khởi tạo lại
  return <ProductForm key={id || 'new'} initial={product ? toForm(product) : EMPTY} productId={product?.id} />;
}

function ProductForm({ initial, productId }) {
  const navigate = useNavigate();
  const { data: categories } = useFetch(() => adminApi.categories.list(), []);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const bind = (key) => ({ value: form[key], onChange: (e) => set(key, e.target.value) });

  // ── Ảnh ──
  const allImages = [...new Set([form.image, ...form.images].filter(Boolean))];
  const uploadImages = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const { data } = await adminApi.upload(files);
      const urls = data.map((f) => f.url);
      setForm((f) => ({ ...f, image: f.image || urls[0], images: [...f.images, ...urls] }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };
  const addImageUrl = () => {
    const url = prompt('Dán link ảnh (https://...)');
    if (url?.trim()) setForm((f) => ({ ...f, image: f.image || url.trim(), images: [...f.images, url.trim()] }));
  };
  const removeImage = (url) =>
    setForm((f) => {
      const images = f.images.filter((i) => i !== url);
      return { ...f, images, image: f.image === url ? images[0] || '' : f.image };
    });

  // ── Danh sách con (phiên bản, màu, ưu đãi) ──
  const updateItem = (key, idx, patch) => set(key, form[key].map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (key, idx) => set(key, form[key].filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.price == null) return setError('Vui lòng nhập giá bán');
    if (form.variants.some((v) => !v.label.trim() || v.price == null)) return setError('Phiên bản cần có tên và giá');
    if (form.colors.some((c) => !c.name.trim())) return setError('Màu sắc cần có tên');

    const body = {
      name: form.name,
      ...(form.slug ? { slug: form.slug } : {}),
      brand: form.brand || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      price: form.price,
      originalPrice: form.originalPrice || null,
      stock: Number(form.stock) || 0,
      image: form.image || null,
      images: allImages,
      description: form.description || null,
      perks: form.perks.map((p) => p.trim()).filter(Boolean),
      rating: Number(form.rating),
      reviewsCount: Number(form.reviewsCount) || 0,
      soldCount: Number(form.soldCount) || 0,
      isHot: form.isHot,
      isFlashSale: form.isFlashSale,
      installment: form.installment,
      status: form.status,
      variants: form.variants.map((v, i) => ({ label: v.label, price: v.price, originalPrice: v.originalPrice || null, stock: Number(v.stock) || 0, sortOrder: i })),
      colors: form.colors.map((c, i) => ({ name: c.name, hex: c.hex || null, image: c.image || null, sortOrder: i })),
    };

    setSaving(true);
    try {
      if (productId) await adminApi.products.update(productId, body);
      else await adminApi.products.create(body);
      navigate('/admin/products');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <PageHeader
        title={productId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        subtitle={productId ? form.name : undefined}
        actions={
          <>
            <Link to="/admin/products"><Button type="button" variant="outline"><ArrowLeft size={16} /> Quay lại</Button></Link>
            {productId && <a href={`/product/${productId}`} target="_blank" rel="noreferrer"><Button type="button" variant="outline">Xem trên web</Button></a>}
            <Button type="submit" loading={saving}>Lưu sản phẩm</Button>
          </>
        }
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Card className="p-4 space-y-3">
            <h2 className="font-bold">Thông tin cơ bản</h2>
            <Field label="Tên sản phẩm" required>
              <Input required {...bind('name')} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Hãng" hint="VD: APPLE, SAMSUNG">
                <Input {...bind('brand')} />
              </Field>
              <Field label="Danh mục">
                <Select {...bind('categoryId')}>
                  <option value="">— Không có —</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Slug (đường dẫn)" hint="Để trống sẽ tự tạo từ tên">
                <Input {...bind('slug')} placeholder="iphone-15-pro-max" />
              </Field>
            </div>
            <Field label="Mô tả">
              <Textarea rows={5} {...bind('description')} />
            </Field>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Hình ảnh</h2>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={addImageUrl}>Thêm bằng link</Button>
                <Button type="button" size="sm" variant="dark" loading={uploading} onClick={() => fileRef.current?.click()}>
                  <ImagePlus size={14} /> Tải ảnh lên
                </Button>
                <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => uploadImages(e.target.files)} />
              </div>
            </div>
            {allImages.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có ảnh nào.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {allImages.map((url) => (
                  <div key={url} className={`relative aspect-square rounded-lg border-2 bg-gray-50 ${form.image === url ? 'border-amber-400' : 'border-gray-200'}`}>
                    <img src={assetUrl(url)} alt="" className="w-full h-full object-contain p-1" />
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button type="button" title="Đặt làm ảnh đại diện" onClick={() => set('image', url)} className="bg-white/90 rounded p-0.5 text-amber-500">
                        <Star size={14} fill={form.image === url ? 'currentColor' : 'none'} />
                      </button>
                      <button type="button" title="Bỏ ảnh" onClick={() => removeImage(url)} className="bg-white/90 rounded p-0.5 text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-gray-500">Ảnh có ngôi sao là ảnh đại diện hiển thị ở danh sách sản phẩm.</p>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Phiên bản (dung lượng / tình trạng)</h2>
                <p className="text-[11px] text-gray-500">Có phiên bản thì khách phải chọn trước khi mua; giá & kho tính theo từng phiên bản.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => set('variants', [...form.variants, { label: '', price: form.price, originalPrice: form.originalPrice, stock: 0 }])}>
                <Plus size={14} /> Thêm
              </Button>
            </div>
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <Field label={i === 0 ? 'Tên phiên bản' : undefined} className="col-span-12 sm:col-span-4">
                  <Input value={v.label} placeholder="512GB - Máy Đẹp" onChange={(e) => updateItem('variants', i, { label: e.target.value })} />
                </Field>
                <Field label={i === 0 ? 'Giá bán' : undefined} className="col-span-4 sm:col-span-3">
                  <MoneyInput value={v.price} onChange={(val) => updateItem('variants', i, { price: val })} />
                </Field>
                <Field label={i === 0 ? 'Giá gốc' : undefined} className="col-span-4 sm:col-span-3">
                  <MoneyInput value={v.originalPrice} onChange={(val) => updateItem('variants', i, { originalPrice: val })} />
                </Field>
                <Field label={i === 0 ? 'Kho' : undefined} className="col-span-3 sm:col-span-1">
                  <Input type="number" min={0} value={v.stock} onChange={(e) => updateItem('variants', i, { stock: e.target.value })} />
                </Field>
                <Button type="button" size="sm" variant="ghost" className="col-span-1 mb-1 hover:text-red-600" onClick={() => removeItem('variants', i)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Màu sắc</h2>
              <Button type="button" size="sm" variant="outline" onClick={() => set('colors', [...form.colors, { name: '', hex: '#000000', image: '' }])}>
                <Plus size={14} /> Thêm
              </Button>
            </div>
            {form.colors.map((c, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <Field label={i === 0 ? 'Mã màu' : undefined} className="col-span-2 sm:col-span-1">
                  <input type="color" value={c.hex} onChange={(e) => updateItem('colors', i, { hex: e.target.value })} className="h-[38px] w-full rounded-lg border border-gray-300 cursor-pointer" />
                </Field>
                <Field label={i === 0 ? 'Tên màu' : undefined} className="col-span-10 sm:col-span-4">
                  <Input value={c.name} placeholder="Titan Tự Nhiên" onChange={(e) => updateItem('colors', i, { name: e.target.value })} />
                </Field>
                <Field label={i === 0 ? 'Ảnh của màu (tùy chọn)' : undefined} className="col-span-11 sm:col-span-6">
                  <Select value={c.image} onChange={(e) => updateItem('colors', i, { image: e.target.value })}>
                    <option value="">— Dùng ảnh đại diện —</option>
                    {allImages.map((url, idx) => <option key={url} value={url}>Ảnh {idx + 1}</option>)}
                  </Select>
                </Field>
                <Button type="button" size="sm" variant="ghost" className="col-span-1 mb-1 hover:text-red-600" onClick={() => removeItem('colors', i)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h2 className="font-bold">Giá & kho</h2>
            <Field label="Giá bán (VND)" required hint={form.variants.length ? 'Giá hiển thị ở danh sách; giá thật theo phiên bản' : undefined}>
              <MoneyInput value={form.price} onChange={(v) => set('price', v)} />
            </Field>
            <Field label="Giá gốc (gạch ngang)">
              <MoneyInput value={form.originalPrice} onChange={(v) => set('originalPrice', v)} />
            </Field>
            {form.variants.length === 0 && (
              <Field label="Số lượng trong kho">
                <Input type="number" min={0} {...bind('stock')} />
              </Field>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <h2 className="font-bold">Hiển thị</h2>
            <Field label="Trạng thái">
              <Select {...bind('status')}>
                <option value="ACTIVE">Đang bán</option>
                <option value="HIDDEN">Ẩn khỏi website</option>
              </Select>
            </Field>
            <div className="flex flex-col gap-2">
              <Checkbox label="Sản phẩm HOT (trang chủ)" checked={form.isHot} onChange={(e) => set('isHot', e.target.checked)} />
              <Checkbox label="Flash Sale" checked={form.isFlashSale} onChange={(e) => set('isFlashSale', e.target.checked)} />
              <Checkbox label="Hỗ trợ trả góp 0%" checked={form.installment} onChange={(e) => set('installment', e.target.checked)} />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Ưu đãi đi kèm</h2>
              <Button type="button" size="sm" variant="outline" onClick={() => set('perks', [...form.perks, ''])}><Plus size={14} /></Button>
            </div>
            {form.perks.map((perk, i) => (
              <div key={i} className="flex gap-1">
                <Input value={perk} onChange={(e) => set('perks', form.perks.map((p, j) => (j === i ? e.target.value : p)))} />
                <Button type="button" size="sm" variant="ghost" className="hover:text-red-600" onClick={() => removeItem('perks', i)}><X size={15} /></Button>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <h2 className="font-bold">Đánh giá hiển thị</h2>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Sao"><Input type="number" min={0} max={5} step={0.1} {...bind('rating')} /></Field>
              <Field label="Lượt đánh giá"><Input type="number" min={0} {...bind('reviewsCount')} /></Field>
              <Field label="Đã bán"><Input type="number" min={0} {...bind('soldCount')} /></Field>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
