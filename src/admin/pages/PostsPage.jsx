import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Pencil, Play, Plus, Search, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, formatDate, imgFallback } from '../../lib/api';
import { videoEmbed } from '../../lib/video';
import { adminApi } from '../adminApi';
import { Badge, Button, Card, ErrorBox, Input, PageHeader, Pagination, Select, Table, useDebounced } from '../ui';

const POST_STATUS = {
  PUBLISHED: { label: 'Đã đăng', className: 'bg-emerald-100 text-emerald-700' },
  DRAFT: { label: 'Bản nháp', className: 'bg-gray-200 text-gray-600' },
};

// Admin → Blog: danh sách bài viết
export default function PostsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const { data, meta, loading, error, reload } = useFetch(
    () => adminApi.posts.list({ search: q || undefined, status: status || undefined, page, limit: 20 }),
    [q, status, page]
  );

  const remove = async (p) => {
    if (!confirm(`Xoá bài "${p.title}"? Không khôi phục được.`)) return;
    try {
      await adminApi.posts.remove(p.id);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Blog"
        subtitle={meta ? `${meta.total} bài viết` : 'Bài viết hiện ở trang /blog và trang chủ'}
        actions={
          <Link to="/admin/posts/new">
            <Button><Plus size={16} /> Viết bài mới</Button>
          </Link>
        }
      />
      <Card>
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input className="pl-9" placeholder="Tìm theo tiêu đề..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select className="w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Mọi trạng thái</option>
            <option value="PUBLISHED">Đã đăng</option>
            <option value="DRAFT">Bản nháp</option>
          </Select>
        </div>
        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}
        <Table
          rows={data}
          loading={loading}
          onRowClick={(p) => navigate(`/admin/posts/${p.id}`)}
          empty="Chưa có bài viết – bấm Viết bài mới để đăng bài đầu tiên"
          columns={[
            {
              key: 'title',
              title: 'Bài viết',
              render: (p) => {
                const cover = p.images?.[0] ? assetUrl(p.images[0]) : videoEmbed(p.videoUrl)?.thumb;
                return (
                  <div className="flex items-center gap-3 min-w-[260px]">
                    <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                      {cover && <img src={cover} onError={imgFallback} alt="" className="w-full h-full object-cover" />}
                      {p.videoUrl && <Play size={14} className="absolute bottom-1 right-1 text-white fill-white drop-shadow" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold line-clamp-1">{p.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{p.excerpt || `${p.images?.length || 0} ảnh`}</p>
                    </div>
                  </div>
                );
              },
            },
            { key: 'images', title: 'Ảnh', className: 'text-right', render: (p) => p.images?.length || 0 },
            { key: 'status', title: 'Trạng thái', render: (p) => <Badge map={POST_STATUS} value={p.status} /> },
            { key: 'publishedAt', title: 'Ngày đăng', className: 'whitespace-nowrap text-gray-500', render: (p) => formatDate(p.publishedAt, true) },
            {
              key: 'actions',
              title: '',
              className: 'text-right whitespace-nowrap',
              render: (p) => (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {p.status === 'PUBLISHED' && (
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" title="Xem trên web" className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <Button size="sm" variant="ghost" title="Sửa" onClick={() => navigate(`/admin/posts/${p.id}`)}><Pencil size={15} /></Button>
                  <Button size="sm" variant="ghost" title="Xoá" className="hover:text-red-600" onClick={() => remove(p)}><Trash2 size={15} /></Button>
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
