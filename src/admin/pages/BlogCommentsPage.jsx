import { useState } from 'react';
import { BadgeCheck, Eye, EyeOff, Phone, Reply, Send, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { formatDate } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Button, Card, ErrorBox, PageHeader, Pagination } from '../ui';

// Bình luận khách viết dưới bài blog: shop trả lời (hiện nhãn "Shop"), ẩn bình luận xấu hoặc xoá
export default function BlogCommentsPage() {
  const [page, setPage] = useState(1);
  const [replying, setReplying] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const { data, meta, loading, error, reload } = useFetch(() => adminApi.postComments.list({ page, limit: 20 }), [page]);

  const reply = async (c) => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await adminApi.postComments.reply(c.id, text.trim());
      setReplying(null);
      setText('');
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };
  const toggleHide = async (c) => {
    await adminApi.postComments.update(c.id, { isHidden: !c.isHidden });
    reload();
  };
  const remove = async (c) => {
    if (!confirm(c.parentId ? 'Xoá trả lời này?' : 'Xoá bình luận này và các trả lời bên dưới?')) return;
    await adminApi.postComments.remove(c.id);
    reload();
  };

  return (
    <>
      <PageHeader title="Bình luận blog" subtitle="Khách bình luận dưới bài viết – trả lời bằng tên TriTech Channel, ẩn hoặc xoá bình luận không phù hợp" />
      <Card>
        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}
        {!loading && !data?.length && <p className="p-8 text-center text-sm text-gray-500">Chưa có bình luận nào</p>}
        <div className="divide-y divide-gray-100">
          {(data || []).map((c) => (
            <div key={c.id} className={`p-4 ${c.isHidden ? 'opacity-50' : ''} ${c.parentId ? 'pl-10' : ''}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {c.isShop ? (
                  <b className="inline-flex items-center gap-1 text-red-600"><BadgeCheck size={13} /> TriTech Channel (Shop)</b>
                ) : (
                  <b className="text-gray-900">{c.fullName || 'Khách'}</b>
                )}
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="inline-flex items-center gap-0.5 text-blue-700 hover:underline"><Phone size={11} /> {c.phone}</a>
                )}
                <span>· {formatDate(c.createdAt, true)}</span>
                {c.parentId && <span className="rounded bg-gray-100 px-1.5">trả lời</span>}
                {c.isHidden && <span className="rounded bg-gray-200 px-1.5 font-semibold">Đang ẩn</span>}
              </div>
              <a href={`/blog/${c.postSlug}`} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-xs text-blue-700 hover:underline">
                📰 {c.postTitle}
              </a>
              <p className="mt-1.5 whitespace-pre-line text-sm text-gray-800">{c.content}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {!c.isShop && (
                  <Button size="sm" variant="outline" onClick={() => { setReplying(c.id); setText(''); }}>
                    <Reply size={14} /> Trả lời
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => toggleHide(c)}>
                  {c.isHidden ? <><Eye size={14} /> Hiện lại</> : <><EyeOff size={14} /> Ẩn</>}
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(c)}><Trash2 size={14} /> Xoá</Button>
              </div>

              {replying === c.id && (
                <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); reply(c); }}>
                  <input
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={1000}
                    placeholder={`Trả lời ${c.fullName || 'khách'} với tên TriTech Channel…`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400"
                  />
                  <Button size="sm" type="submit" loading={busy}><Send size={14} /> Gửi</Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => setReplying(null)}>Huỷ</Button>
                </form>
              )}
            </div>
          ))}
        </div>
        <Pagination meta={meta} onChange={setPage} />
      </Card>
    </>
  );
}
