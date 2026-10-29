import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle, ExternalLink, ImagePlus, Loader2, Save, Star, Trash2, X } from 'lucide-react';
import { assetUrl, imgFallback } from '../../lib/api';
import { videoEmbed } from '../../lib/video';
import { adminApi } from '../adminApi';
import { PostVideo } from '../../components/PostMedia';
import { Button, Card, ErrorBox, Field, Input, PageHeader, Select, Spinner, Textarea, errorText } from '../ui';

// Ô datetime-local cần dạng "YYYY-MM-DDTHH:mm" theo giờ máy
const toLocalInput = (d) => {
  const date = d ? new Date(d) : new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const emptyPost = () => ({ title: '', content: '', images: [], videoUrl: '', status: 'PUBLISHED', publishedAt: toLocalInput() });

// Admin → Blog → Viết / sửa bài: tiêu đề, nội dung, nhiều ảnh (ảnh đầu làm ảnh bìa), video
export default function PostFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState(isNew ? emptyPost : null);
  const [loadError, setLoadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [savedSlug, setSavedSlug] = useState(null);

  useEffect(() => {
    if (isNew) return;
    adminApi.posts
      .get(id)
      .then(({ data }) => {
        setForm({ ...data, videoUrl: data.videoUrl || '', publishedAt: toLocalInput(data.publishedAt) });
        setSavedSlug(data.status === 'PUBLISHED' ? data.slug : null);
      })
      .catch(setLoadError);
  }, [id, isNew]);

  if (loadError) return <ErrorBox error={loadError} />;
  if (!form) return <Spinner />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const video = videoEmbed(form.videoUrl);

  // Tải nhiều ảnh: server nhận tối đa 10 ảnh/lần -> chia lượt
  const upload = async (files) => {
    const list = [...(files || [])];
    if (!list.length) return;
    setUploading(true);
    setMessage('');
    try {
      const urls = [];
      for (let i = 0; i < list.length; i += 10) {
        const { data } = await adminApi.upload(list.slice(i, i + 10));
        urls.push(...data.map((f) => f.url));
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 30) }));
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const moveImage = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= form.images.length) return;
    const next = [...form.images];
    [next[i], next[j]] = [next[j], next[i]];
    set('images', next);
  };

  const save = async (e) => {
    e?.preventDefault();
    if (form.videoUrl && !video) return setMessage('❌ Link video chưa đúng – dùng link YouTube, TikTok hoặc Facebook');
    setSaving(true);
    setMessage('');
    const body = {
      title: form.title,
      content: form.content,
      images: form.images,
      videoUrl: form.videoUrl || null,
      status: form.status,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    };
    try {
      const { data } = isNew ? await adminApi.posts.create(body) : await adminApi.posts.update(id, body);
      setSavedSlug(data.status === 'PUBLISHED' ? data.slug : null);
      if (isNew) navigate(`/admin/posts/${data.id}`, { replace: true });
      setMessage(data.status === 'PUBLISHED' ? '✅ Đã đăng bài' : '✅ Đã lưu bản nháp');
    } catch (err) {
      setMessage(`❌ ${errorText(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <PageHeader
        title={isNew ? 'Viết bài mới' : 'Sửa bài viết'}
        subtitle="Viết như đăng Facebook: chữ, nhiều ảnh và 1 video"
        actions={
          <>
            <Link to="/admin/posts"><Button type="button" variant="outline"><ArrowLeft size={16} /> Danh sách</Button></Link>
            {savedSlug && (
              <a href={`/blog/${savedSlug}`} target="_blank" rel="noreferrer">
                <Button type="button" variant="outline"><ExternalLink size={16} /> Xem trên web</Button>
              </a>
            )}
            <Button type="submit" loading={saving}><Save size={16} /> {form.status === 'PUBLISHED' ? 'Đăng bài' : 'Lưu nháp'}</Button>
          </>
        }
      />
      {message && <p className={`mb-4 text-sm font-semibold ${message.startsWith('❌') ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-4 space-y-4">
            <Field label="Tiêu đề" required>
              <Input required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="VD: Đập hộp sạc dự phòng Ugreen 25000mAh 200W" />
            </Field>
            <Field label="Nội dung" hint="Xuống dòng bằng Enter, nội dung hiện đúng như bạn gõ">
              <Textarea rows={12} value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="Bạn muốn chia sẻ gì với khách hàng?" />
            </Field>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-gray-900">Ảnh ({form.images.length}/30)</h2>
                <p className="text-xs text-gray-500">Ảnh đầu tiên (có ★) là ảnh bìa. Dùng mũi tên để đổi thứ tự.</p>
              </div>
              <Button type="button" variant="dark" disabled={uploading || form.images.length >= 30} onClick={() => fileRef.current?.click()}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploading ? 'Đang tải…' : 'Thêm ảnh'}
              </Button>
              <input ref={fileRef} type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => upload(e.target.files)} />
            </div>
            {form.images.length ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {form.images.map((src, i) => (
                  <div key={`${src}-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={assetUrl(src)} onError={imgFallback} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 bg-amber-400 text-black rounded px-1 text-[10px] font-bold flex items-center gap-0.5"><Star size={10} className="fill-black" /> Bìa</span>}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 text-white px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" title="Lên trước" onClick={() => moveImage(i, -1)}><ArrowLeftCircle size={16} /></button>
                      <button type="button" title="Bỏ ảnh" onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}><X size={16} /></button>
                      <button type="button" title="Ra sau" onClick={() => moveImage(i, 1)}><ArrowRightCircle size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-gray-300 py-10 text-sm text-gray-500 hover:border-amber-400 hover:text-gray-700"
              >
                Bấm để chọn ảnh từ máy (chọn được nhiều ảnh cùng lúc)
              </button>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <Field label="Video" hint="Dán link YouTube, TikTok hoặc Facebook (video công khai). Video nằm trên nền tảng đó nên không tốn dung lượng hosting.">
              <div className="flex gap-2">
                <Input value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value.trim())} placeholder="https://www.youtube.com/watch?v=... hoặc https://www.tiktok.com/@.../video/..." />
                {form.videoUrl && <Button type="button" variant="ghost" title="Bỏ video" onClick={() => set('videoUrl', '')}><Trash2 size={16} /></Button>}
              </div>
            </Field>
            {form.videoUrl && (video ? <PostVideo url={form.videoUrl} className="max-w-md" /> : <p className="text-xs text-red-600">Không nhận ra link video này</p>)}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-4 space-y-4">
            <Field label="Trạng thái">
              <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="PUBLISHED">Đăng công khai</option>
                <option value="DRAFT">Bản nháp (chưa hiện trên web)</option>
              </Select>
            </Field>
            <Field label="Ngày đăng" hint="Chọn ngày tương lai để hẹn giờ – bài tự hiện khi đến giờ">
              <Input type="datetime-local" value={form.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} />
            </Field>
          </Card>
          <Card className="p-4 text-xs text-gray-600 space-y-1.5">
            <p className="font-bold text-gray-800">Mẹo</p>
            <p>• Bài đăng hiện ở trang <b>/blog</b> và mục “Blog TriTech” trên trang chủ.</p>
            <p>• Tiêu đề có tên sản phẩm giúp khách tìm thấy bài trên Google.</p>
            <p>• Ảnh nên dưới 5MB, tối đa 30 ảnh mỗi bài.</p>
          </Card>
        </div>
      </div>
    </form>
  );
}
