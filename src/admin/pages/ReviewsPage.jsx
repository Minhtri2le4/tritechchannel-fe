import { useState } from 'react';
import { Eye, EyeOff, MessageSquareReply, Play, Search, Star, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, formatDate, imgFallback } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Button, Card, ErrorBox, Input, Modal, PageHeader, Pagination, Select, Spinner, Textarea, errorText, useDebounced } from '../ui';

// Admin → Đánh giá: đánh giá sản phẩm của khách đã mua – ẩn/hiện, trả lời, xoá
export default function ReviewsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);
  const [replying, setReplying] = useState(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);
  const q = useDebounced(search);
  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.reviews.list({ search: q || undefined, status: status || undefined, rating: rating || undefined, page, limit: 20 }),
    [q, status, rating, page]
  );

  const update = async (r, body) => {
    try {
      await adminApi.reviews.update(r.id, body);
      reload();
    } catch (err) {
      alert(errorText(err));
    }
  };

  const remove = async (r) => {
    if (!confirm('Xoá hẳn đánh giá này? Không khôi phục được. (Muốn tạm ẩn thì bấm biểu tượng con mắt)')) return;
    try {
      await adminApi.reviews.remove(r.id);
      reload();
    } catch (err) {
      alert(errorText(err));
    }
  };

  const saveReply = async () => {
    setSaving(true);
    try {
      await adminApi.reviews.update(replying.id, { shopReply: reply });
      setReplying(null);
      reload();
    } catch (err) {
      alert(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Đánh giá sản phẩm" subtitle={meta ? `${meta.total} đánh giá từ khách đã mua` : 'Đánh giá của khách sau khi đơn hoàn tất'} />
      <Card>
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input className="pl-9" placeholder="Tìm theo sản phẩm, khách, nội dung..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select className="w-auto" value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}>
            <option value="">Mọi số sao</option>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} sao</option>)}
          </Select>
          <Select className="w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Đang hiện & đã ẩn</option>
            <option value="VISIBLE">Đang hiện</option>
            <option value="HIDDEN">Đã ẩn</option>
          </Select>
        </div>
        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <p className="p-8 text-center text-sm text-gray-500">Chưa có đánh giá nào.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((r) => (
              <div key={r.id} className={`flex flex-col gap-3 p-3 md:flex-row ${r.status === 'HIDDEN' ? 'bg-gray-50 opacity-70' : ''}`}>
                <a href={`/product/${r.productSlug || r.productId}#reviews`} target="_blank" rel="noreferrer" className="flex w-full shrink-0 items-start gap-2 md:w-56">
                  <img src={assetUrl(r.productImage)} onError={imgFallback} alt="" className="h-12 w-12 rounded border border-gray-100 object-contain" />
                  <span className="line-clamp-3 text-xs text-gray-700 hover:text-red-600">{r.productName || 'Sản phẩm đã xoá'}</span>
                </a>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    <span className="flex">
                      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />)}
                    </span>
                    <span className="font-semibold text-gray-800">{r.fullName}</span>
                    {r.isAnonymous && <span className="rounded bg-gray-200 px-1">ẩn tên</span>}
                    <span>{r.phone}</span>
                    <span>· Đơn {r.orderCode}</span>
                    <span>· {formatDate(r.createdAt, true)}</span>
                    {r.status === 'HIDDEN' && <span className="rounded bg-red-100 px-1.5 font-semibold text-red-700">Đang ẩn</span>}
                  </div>
                  {r.variantLabel && <p className="text-xs text-gray-400">Phân loại: {r.variantLabel}</p>}
                  {r.content && <p className="mt-1 whitespace-pre-line text-sm text-gray-800">{r.content}</p>}
                  {(r.images.length > 0 || r.videoUrl) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.videoUrl && (
                        <a href={assetUrl(r.videoUrl)} target="_blank" rel="noreferrer" className="relative h-14 w-14 overflow-hidden rounded bg-black">
                          <video src={assetUrl(r.videoUrl)} muted preload="metadata" className="h-full w-full object-cover" />
                          <Play size={16} className="absolute inset-0 m-auto fill-white text-white" />
                        </a>
                      )}
                      {r.images.map((src) => (
                        <a key={src} href={assetUrl(src)} target="_blank" rel="noreferrer">
                          <img src={assetUrl(src)} alt="" className="h-14 w-14 rounded border border-gray-100 object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  {r.shopReply && (
                    <div className="mt-2 rounded bg-amber-50 px-2 py-1.5 text-xs text-gray-700">
                      <b>Shop trả lời:</b> {r.shopReply}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <Button size="sm" variant="ghost" title={r.shopReply ? 'Sửa câu trả lời' : 'Trả lời khách'} onClick={() => { setReplying(r); setReply(r.shopReply || ''); }}>
                    <MessageSquareReply size={15} />
                  </Button>
                  <Button size="sm" variant="ghost" title={r.status === 'VISIBLE' ? 'Ẩn khỏi website' : 'Hiện lại'} onClick={() => update(r, { status: r.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE' })}>
                    {r.status === 'VISIBLE' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </Button>
                  <Button size="sm" variant="ghost" title="Xoá" className="hover:text-red-600" onClick={() => remove(r)}><Trash2 size={15} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination meta={meta} onChange={setPage} />
      </Card>

      <Modal
        open={!!replying}
        title="Trả lời đánh giá"
        onClose={() => setReplying(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setReplying(null)}>Huỷ</Button>
            <Button loading={saving} onClick={saveReply}>Lưu câu trả lời</Button>
          </>
        }
      >
        <p className="mb-2 text-xs text-gray-500">Câu trả lời hiện dưới đánh giá trên trang sản phẩm ("Phản hồi của Người bán"). Để trống rồi lưu để xoá.</p>
        <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="VD: Cảm ơn anh/chị đã tin tưởng TriTech!" />
      </Modal>
    </>
  );
}
