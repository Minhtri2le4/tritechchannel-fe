import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Film, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { adminApi } from '../adminApi';
import ImageField from '../ImageField';
import ProductSearch from '../ProductSearch';
import { assetUrl, formatPrice, imgFallback } from '../../lib/api';
import { mergeHome } from '../../lib/homeContent';
import { shopApi } from '../../services/shop';
import { youtubeEmbedUrl, youtubeId } from '../../lib/youtube';
import { Button, Card, ErrorBox, Field, Input, MoneyInput, PageHeader, Select, Spinner, errorText } from '../ui';

const emptyBanner = () => ({ image: '', imageMobile: '', link: '', alt: '' });
const emptyShort = () => ({ url: '', videoFile: '', productId: null, title: '', productName: '', productImage: '', productLink: '', price: null, oldPrice: null });

// Đổi vị trí phần tử i với i+dir trong mảng
const move = (list, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function Section({ title, subtitle, action, children }) {
  return (
    <Card className="mb-5">
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function ItemTools({ index, total, onMove, onRemove }) {
  return (
    <div className="flex gap-1">
      <Button size="sm" variant="ghost" title="Lên trên" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={14} /></Button>
      <Button size="sm" variant="ghost" title="Xuống dưới" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown size={14} /></Button>
      <Button size="sm" variant="ghost" title="Xoá" className="hover:text-red-600" onClick={onRemove}><Trash2 size={14} /></Button>
    </div>
  );
}

function YoutubePreview({ url, vertical }) {
  if (!youtubeId(url)) {
    return <p className="text-xs text-gray-400">{url ? 'Link YouTube không hợp lệ' : 'Dán link để xem trước'}</p>;
  }
  return (
    <div className={`${vertical ? 'aspect-[9/16] w-40' : 'aspect-video w-full max-w-md'} rounded-lg overflow-hidden bg-black`}>
      <iframe src={youtubeEmbedUrl(url)} title="Xem trước" className="w-full h-full border-0" allowFullScreen />
    </div>
  );
}

// Ô video của 1 video review: tải file từ máy (có % tiến độ) hoặc dán link YouTube shorts
function ShortVideoSource({ v, onChange }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file) return;
    if (!/^video\/(mp4|webm|quicktime)$/.test(file.type)) return setError('Chỉ nhận video MP4, WEBM hoặc MOV');
    if (file.size > 80 * 1024 * 1024) return setError('Video tối đa 80MB – hãy nén nhỏ lại hoặc đăng lên YouTube rồi dán link');
    setError('');
    setProgress(0);
    try {
      const { data } = await adminApi.uploadVideo(file, setProgress);
      onChange({ videoFile: data.url, url: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="w-40 shrink-0 space-y-2">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files?.[0]);
        }}
        className="relative block aspect-[9/16] w-40 cursor-pointer overflow-hidden rounded-lg bg-black"
      >
        {v.videoFile ? (
          <video src={assetUrl(v.videoFile)} className="h-full w-full object-cover" muted playsInline controls preload="metadata" />
        ) : youtubeId(v.url) ? (
          <iframe src={youtubeEmbedUrl(v.url)} title="Xem trước" className="h-full w-full border-0 pointer-events-none" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center text-[11px] text-gray-300">
            <Film size={22} /> Bấm hoặc kéo thả video vào đây
          </span>
        )}
        {progress !== null && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 text-sm font-bold text-white">
            <Loader2 size={20} className="animate-spin" /> {progress}%
          </span>
        )}
        <input type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
      </label>
      {v.videoFile && (
        <button type="button" onClick={() => onChange({ videoFile: '' })} className="text-[11px] text-red-600 hover:underline">Bỏ video đã tải</button>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

// Sản phẩm gắn vào video: chọn sản phẩm trong shop (giá, ảnh, link tự lấy) – giống gắn giỏ hàng TikTok
function ShortProduct({ v, onChange, products, onPicked }) {
  const p = v.productId ? products[v.productId] : null;
  if (v.productId) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-2">
        <img src={assetUrl(p?.image)} onError={imgFallback} alt="" className="h-12 w-12 shrink-0 rounded bg-white object-contain" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{p?.name || `Sản phẩm #${v.productId} (đang ẩn hoặc đã xoá)`}</p>
          {p && <p className="text-xs font-bold text-red-600">{formatPrice(p.price)}</p>}
          <p className="text-[11px] text-gray-500">🛒 Khách bấm “Mua ngay” dưới video sẽ vào trang sản phẩm này</p>
        </div>
        <Button size="sm" variant="ghost" title="Bỏ gắn sản phẩm" onClick={() => onChange({ productId: null })}><X size={15} /></Button>
      </div>
    );
  }
  return (
    <ProductSearch
      placeholder="🛒 Gắn sản phẩm trong shop: gõ tên sản phẩm…"
      addLabel="Gắn"
      onAdd={(prod) => {
        onPicked(prod);
        onChange({ productId: prod.id });
      }}
    />
  );
}

// Admin → Giao diện trang chủ: banner chạy, banner 2 bên, video review chính và video shorts
export default function HomeContentPage() {
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState({}); // id -> sản phẩm gắn với video

  useEffect(() => {
    adminApi.settings
      .getHome()
      .then(async ({ data }) => {
        const home = mergeHome(data);
        const ids = [...new Set(home.shorts.map((s) => s.productId).filter(Boolean))];
        if (ids.length) {
          const { data: found } = await shopApi.products({ ids: ids.join(',') }).catch(() => ({ data: [] }));
          setProducts(Object.fromEntries(found.map((p) => [p.id, p])));
        }
        setForm(home);
      })
      .catch(setLoadError);
  }, []);

  if (loadError) return <ErrorBox error={loadError} />;
  if (!form) return <Spinner />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setItem = (key, i, patch) => set(key, form[key].map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const setPopup = (patch) => set('popup', { ...form.popup, ...patch });
  const setSide = (side, patch) => set('sideBanners', { ...form.sideBanners, [side]: { ...(form.sideBanners?.[side] || {}), ...patch } });

  const save = async () => {
    if (form.popup.enabled && !form.popup.image) return setMessage('❌ Popup voucher đang bật nhưng chưa có ảnh');
    const missing = form.banners.findIndex((b) => !b.image);
    if (missing >= 0) return setMessage(`❌ Banner ${missing + 1} chưa có ảnh`);
    const badVideo = form.shorts.findIndex((v) => !v.videoFile && !youtubeId(v.url));
    if (badVideo >= 0) return setMessage(`❌ Video ${badVideo + 1} chưa có video: tải video lên hoặc dán link YouTube`);
    setSaving(true);
    setMessage('');
    try {
      await adminApi.settings.saveHome(form);
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
      <PageHeader title="Giao diện trang chủ" subtitle="Đổi banner và video review mà không cần sửa code" actions={saveButton} />
      {message && <p className={`mb-4 text-sm font-semibold ${message.startsWith('❌') ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>}

      <Section
        title="Popup voucher khi vào web"
        subtitle="Ảnh hiện giữa màn hình khi khách mở web (giống Thế Giới Di Động). Ảnh dọc hoặc vuông, rộng khoảng 600–1000px. Đổi ảnh mới thì khách đã xem cũng thấy lại."
        action={
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer select-none whitespace-nowrap">
            <input type="checkbox" className="w-4 h-4 accent-amber-500" checked={!!form.popup.enabled} onChange={(e) => setPopup({ enabled: e.target.checked })} />
            {form.popup.enabled ? 'Đang bật' : 'Đang tắt'}
          </label>
        }
      >
        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
          <Field label="Ảnh voucher" required={form.popup.enabled}>
            <ImageField value={form.popup.image || ''} onChange={(v) => setPopup({ image: v })} aspect="aspect-[4/5]" previewClass="w-36" />
          </Field>
          <div className="space-y-3">
            <Field label="Bấm vào ảnh thì mở" hint="VD: /promotions, /category/12 hoặc link https:// (Zalo, Shopee…). Trống = bấm không đi đâu">
              <Input value={form.popup.link || ''} onChange={(e) => setPopup({ link: e.target.value })} placeholder="/promotions" />
            </Field>
            <Field label="Bao lâu hiện lại">
              <Select value={form.popup.frequency} onChange={(e) => setPopup({ frequency: e.target.value })}>
                <option value="session">Mỗi lần khách mở web (đóng tab mở lại mới hiện)</option>
                <option value="day">Mỗi ngày 1 lần</option>
                <option value="always">Mỗi lần tải trang (dễ gây khó chịu)</option>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      <Section
        title="Banner chạy đầu trang"
        subtitle="Tự chuyển mỗi 3 giây. Ảnh máy tính khoảng 1600×650px; ảnh điện thoại (tuỳ chọn) khoảng 800×325px cho nhẹ."
        action={<Button size="sm" variant="outline" onClick={() => set('banners', [...form.banners, emptyBanner()])}><Plus size={14} /> Thêm banner</Button>}
      >
        <div className="space-y-4">
          {form.banners.map((b, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Banner {i + 1}</span>
                <ItemTools
                  index={i}
                  total={form.banners.length}
                  onMove={(dir) => set('banners', move(form.banners, i, dir))}
                  onRemove={() => set('banners', form.banners.filter((_, idx) => idx !== i))}
                />
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <Field label="Ảnh máy tính" required>
                  <ImageField value={b.image} onChange={(v) => setItem('banners', i, { image: v })} aspect="aspect-[160/65]" previewClass="w-40" />
                </Field>
                <Field label="Ảnh điện thoại (tuỳ chọn)">
                  <ImageField value={b.imageMobile || ''} onChange={(v) => setItem('banners', i, { imageMobile: v })} aspect="aspect-[160/65]" previewClass="w-40" />
                </Field>
                <Field label="Bấm vào banner thì mở" hint="VD: /promotions, /product/ten-san-pham hoặc link https://">
                  <Input value={b.link || ''} onChange={(e) => setItem('banners', i, { link: e.target.value })} placeholder="Để trống = không bấm được" />
                </Field>
                <Field label="Mô tả ảnh" hint="Giúp Google hiểu banner nói gì">
                  <Input value={b.alt || ''} onChange={(e) => setItem('banners', i, { alt: e.target.value })} placeholder="VD: Sạc dự phòng Anker giảm 30%" />
                </Field>
              </div>
            </div>
          ))}
          {!form.banners.length && <p className="text-sm text-gray-500">Chưa có banner – trang chủ sẽ dùng bộ banner mặc định.</p>}
        </div>
      </Section>

      <Section title="Banner quảng cáo 2 bên" subtitle="Chỉ hiện trên màn hình máy tính rất rộng. Ảnh dọc khoảng 200×500px. Bỏ ảnh để ẩn.">
        <div className="grid gap-4 md:grid-cols-2">
          {[['left', 'Bên trái'], ['right', 'Bên phải']].map(([side, label]) => (
            <div key={side} className="space-y-2">
              <Field label={label}>
                <ImageField value={form.sideBanners?.[side]?.image || ''} onChange={(v) => setSide(side, { image: v })} aspect="aspect-[2/5]" previewClass="w-20" />
              </Field>
              <Field label="Link khi bấm">
                <Input value={form.sideBanners?.[side]?.link || ''} onChange={(e) => setSide(side, { link: e.target.value })} placeholder="/promotions" />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Banner ngang giữa trang" subtitle="Ảnh dài nằm trên mục Blog TriTech. Khoảng 1200×200px. Bỏ ảnh để ẩn banner.">
        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
          <Field label="Ảnh banner">
            <ImageField value={form.promoBanner?.image || ''} onChange={(v) => set('promoBanner', { ...form.promoBanner, image: v })} aspect="aspect-[6/1]" previewClass="w-72" />
          </Field>
          <Field label="Bấm vào banner thì mở" hint="VD: /promotions hoặc /category/12. Trống = không bấm được">
            <Input value={form.promoBanner?.link || ''} onChange={(e) => set('promoBanner', { ...form.promoBanner, link: e.target.value })} placeholder="/promotions" />
          </Field>
        </div>
      </Section>

      <Section title="Review sản phẩm mới nhất" subtitle="Video YouTube lớn dưới mục Đại lý ủy quyền. Dán link video bất kỳ (youtube.com/watch?v=…, youtu.be/…).">
        <div className="space-y-3">
          <Input value={form.reviewVideo?.url || ''} onChange={(e) => set('reviewVideo', { url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
          <YoutubePreview url={form.reviewVideo?.url} />
        </div>
      </Section>

      <Section
        title="Video review về sản phẩm (shorts)"
        subtitle="Video dọc vuốt ngang. Tải video từ máy (MP4 tối đa 80MB) hoặc dán link YouTube shorts, rồi gắn sản phẩm để khách bấm mua."
        action={<Button size="sm" variant="outline" onClick={() => set('shorts', [...form.shorts, emptyShort()])}><Plus size={14} /> Thêm video</Button>}
      >
        <div className="space-y-4">
          {form.shorts.map((v, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Video {i + 1}</span>
                <ItemTools
                  index={i}
                  total={form.shorts.length}
                  onMove={(dir) => set('shorts', move(form.shorts, i, dir))}
                  onRemove={() => set('shorts', form.shorts.filter((_, idx) => idx !== i))}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <ShortVideoSource v={v} onChange={(patch) => setItem('shorts', i, patch)} />
                <div className="flex-1 grid gap-3 sm:grid-cols-2 content-start">
                  <Field label="…hoặc dán link YouTube shorts" hint={v.videoFile ? 'Đang dùng video tải lên' : 'Dạng youtube.com/shorts/…'} className="sm:col-span-2">
                    <Input value={v.url} disabled={!!v.videoFile} onChange={(e) => setItem('shorts', i, { url: e.target.value })} placeholder="https://www.youtube.com/shorts/..." />
                  </Field>
                  <Field label="Tiêu đề video (tuỳ chọn)" className="sm:col-span-2">
                    <Input value={v.title || ''} onChange={(e) => setItem('shorts', i, { title: e.target.value })} placeholder="VD: Review sạc dự phòng Anker A1695" />
                  </Field>
                  <Field label="Gắn sản phẩm (giỏ hàng)" className="sm:col-span-2">
                    <ShortProduct
                      v={v}
                      products={products}
                      onPicked={(prod) => setProducts((m) => ({ ...m, [prod.id]: prod }))}
                      onChange={(patch) => setItem('shorts', i, patch)}
                    />
                  </Field>
                  {!v.productId && (
                    <details className="sm:col-span-2 text-sm">
                      <summary className="cursor-pointer text-xs text-gray-500">Sản phẩm không có trong shop? Nhập tay (link Shopee…)</summary>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Field label="Tên sản phẩm" className="sm:col-span-2">
                          <Input value={v.productName || ''} onChange={(e) => setItem('shorts', i, { productName: e.target.value })} />
                        </Field>
                        <Field label="Giá bán">
                          <MoneyInput value={v.price} onChange={(n) => setItem('shorts', i, { price: n })} />
                        </Field>
                        <Field label="Giá gốc (gạch ngang)">
                          <MoneyInput value={v.oldPrice} onChange={(n) => setItem('shorts', i, { oldPrice: n })} />
                        </Field>
                        <Field label="Nút Mua ngay mở" className="sm:col-span-2">
                          <Input value={v.productLink || ''} onChange={(e) => setItem('shorts', i, { productLink: e.target.value })} placeholder="https://shopee.vn/..." />
                        </Field>
                        <Field label="Ảnh sản phẩm" className="sm:col-span-2">
                          <ImageField value={v.productImage || ''} onChange={(img) => setItem('shorts', i, { productImage: img })} previewClass="w-16" />
                        </Field>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!form.shorts.length && <p className="text-sm text-gray-500">Chưa có video – trang chủ sẽ dùng bộ video mặc định.</p>}
        </div>
      </Section>

      <div className="flex justify-end gap-3 items-center">
        {message && <span className={`text-sm font-semibold ${message.startsWith('❌') ? 'text-red-600' : 'text-emerald-700'}`}>{message}</span>}
        {saveButton}
      </div>
    </>
  );
}
