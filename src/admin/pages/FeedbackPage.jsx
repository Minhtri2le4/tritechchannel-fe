import { useState } from 'react';
import { Check, Mail, Phone, Star, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { formatDate } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Button, Card, ErrorBox, PageHeader, Pagination } from '../ui';

const TOPIC_COLOR = {
  'Giao diện': 'bg-violet-100 text-violet-700',
  'Lỗi website': 'bg-red-100 text-red-700',
  'Sản phẩm / giá': 'bg-amber-100 text-amber-800',
  'Giao hàng / dịch vụ': 'bg-blue-100 text-blue-700',
  Khác: 'bg-gray-100 text-gray-600',
};

// Góp ý khách gửi từ nút "Góp ý về website" ở chân trang
export default function FeedbackPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.feedback.list({ page, limit: 20, unread: unreadOnly ? 'true' : undefined }),
    [page, unreadOnly]
  );

  const markRead = async (f, isRead) => {
    await adminApi.feedback.update(f.id, { isRead });
    reload();
  };
  const remove = async (f) => {
    if (!confirm('Xoá góp ý này?')) return;
    await adminApi.feedback.remove(f.id);
    reload();
  };

  return (
    <>
      <PageHeader title="Góp ý website" subtitle={`Khách gửi từ chân trang website${meta?.unread ? ` · ${meta.unread} chưa đọc` : ''}`} />

      <Card>
        <div className="flex gap-2 border-b border-gray-100 p-3">
          {[[false, 'Tất cả'], [true, 'Chưa đọc']].map(([v, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => { setUnreadOnly(v); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${unreadOnly === v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {label}{v && meta?.unread ? ` (${meta.unread})` : ''}
            </button>
          ))}
        </div>

        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}
        {!loading && !data?.length && <p className="p-8 text-center text-sm text-gray-500">Chưa có góp ý nào</p>}

        <div className="divide-y divide-gray-100">
          {(data || []).map((f) => (
            <div key={f.id} className={`flex gap-3 p-4 ${f.isRead ? '' : 'bg-amber-50/50'}`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${f.isRead ? 'bg-transparent' : 'bg-red-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${TOPIC_COLOR[f.topic] || TOPIC_COLOR.Khác}`}>{f.topic}</span>
                  {f.rating && (
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} className={n <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />)}
                    </span>
                  )}
                  <span className="text-gray-400">{formatDate(f.createdAt, true)}</span>
                  {f.page && <span className="text-gray-400">· trang {f.page}</span>}
                </div>
                <p className="mt-1.5 whitespace-pre-line text-sm text-gray-800">{f.message}</p>
                {(f.name || f.contact) && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {f.name && <b className="text-gray-700">{f.name}</b>}
                    {f.contact && (
                      <a
                        href={f.contact.includes('@') ? `mailto:${f.contact}` : `tel:${f.contact.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                      >
                        {f.contact.includes('@') ? <Mail size={12} /> : <Phone size={12} />} {f.contact}
                      </a>
                    )}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-start gap-1">
                <Button size="sm" variant="outline" onClick={() => markRead(f, !f.isRead)}>
                  <Check size={14} /> {f.isRead ? 'Đánh dấu chưa đọc' : 'Đã đọc'}
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(f)} aria-label="Xoá"><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
        <Pagination meta={meta} onChange={setPage} />
      </Card>
    </>
  );
}
