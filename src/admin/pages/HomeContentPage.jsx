import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../adminApi';
import ImageField from '../ImageField';
import { mergeHome } from '../../lib/homeContent';
import { youtubeEmbedUrl, youtubeId } from '../../lib/youtube';
import { Button, Card, ErrorBox, Field, Input, MoneyInput, PageHeader, Select, Spinner, errorText } from '../ui';

const emptyBanner = () => ({ image: '', imageMobile: '', link: '', alt: '' });
const emptyShort = () => ({ url: '', title: '', productName: '', productImage: '', productLink: '', price: null, oldPrice: null });

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

// Admin → Giao diện trang chủ: banner chạy, banner 2 bên, video review chính và video shorts
export default function HomeContentPage() {
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminApi.settings
      .getHome()
      .then(({ data }) => setForm(mergeHome(data)))
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
    const badVideo = form.shorts.findIndex((v) => !youtubeId(v.url));
    if (badVideo >= 0) return setMessage(`❌ Video shorts ${badVideo + 1} chưa có link YouTube hợp lệ`);
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

      <Section title="Review sản phẩm mới nhất" subtitle="Video YouTube lớn dưới mục Đại lý ủy quyền. Dán link video bất kỳ (youtube.com/watch?v=…, youtu.be/…).">
        <div className="space-y-3">
          <Input value={form.reviewVideo?.url || ''} onChange={(e) => set('reviewVideo', { url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
          <YoutubePreview url={form.reviewVideo?.url} />
        </div>
      </Section>

      <Section
        title="Video review về sản phẩm (shorts)"
        subtitle="Các video dọc vuốt ngang, mỗi video kèm 1 sản phẩm gợi ý. Link shorts dạng youtube.com/shorts/…"
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
                <YoutubePreview url={v.url} vertical />
                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                  <Field label="Link video YouTube" required className="sm:col-span-2">
                    <Input value={v.url} onChange={(e) => setItem('shorts', i, { url: e.target.value })} placeholder="https://www.youtube.com/shorts/..." />
                  </Field>
                  <Field label="Tên sản phẩm gợi ý" className="sm:col-span-2">
                    <Input value={v.productName || ''} onChange={(e) => setItem('shorts', i, { productName: e.target.value })} />
                  </Field>
                  <Field label="Giá bán">
                    <MoneyInput value={v.price} onChange={(n) => setItem('shorts', i, { price: n })} />
                  </Field>
                  <Field label="Giá gốc (gạch ngang)">
                    <MoneyInput value={v.oldPrice} onChange={(n) => setItem('shorts', i, { oldPrice: n })} />
                  </Field>
                  <Field label="Nút Mua ngay mở" hint="Link sản phẩm trên web hoặc Shopee. Trống = mở video trên YouTube" className="sm:col-span-2">
                    <Input value={v.productLink || ''} onChange={(e) => setItem('shorts', i, { productLink: e.target.value })} placeholder="/product/ten-san-pham" />
                  </Field>
                  <Field label="Ảnh sản phẩm" className="sm:col-span-2">
                    <ImageField value={v.productImage || ''} onChange={(img) => setItem('shorts', i, { productImage: img })} previewClass="w-16" />
                  </Field>
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
