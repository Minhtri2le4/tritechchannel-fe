import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Newspaper, Play } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useSeo from '../hooks/useSeo';
import { shopApi } from '../services/shop';
import { videoEmbed } from '../lib/video';
import { ImageCollage, PostAuthor } from '../components/PostMedia';

const PAGE_SIZE = 10;

function PostCard({ post }) {
  const to = `/blog/${post.slug}`;
  const video = videoEmbed(post.videoUrl);
  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
      <PostAuthor date={post.publishedAt} />
      <Link to={to} className="block group">
        <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-red-600 leading-snug">{post.title}</h2>
        {post.excerpt && (
          <p className="text-sm text-gray-700 mt-1 line-clamp-3">
            {post.excerpt}
            {post.contentLength > 220 && <span className="text-gray-500 font-semibold"> Xem thêm</span>}
          </p>
        )}
      </Link>
      {post.images?.length > 0 ? (
        <Link to={to} className="block">
          <ImageCollage images={post.images} />
        </Link>
      ) : (
        video && (
          <Link to={to} className="relative block rounded-xl overflow-hidden bg-black aspect-video">
            {video.thumb && <img src={video.thumb} alt="" loading="lazy" className="w-full h-full object-cover opacity-90" />}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                <Play size={26} className="fill-white ml-1" />
              </span>
            </span>
          </Link>
        )
      )}
      {post.images?.length > 0 && video && (
        <Link to={to} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
          <Play size={14} /> Bài viết có video
        </Link>
      )}
    </article>
  );
}

// Trang Blog: bài viết shop đăng từ admin, xếp mới nhất trước như bảng tin Facebook
export default function BlogPage() {
  useSeo({
    title: 'Blog TriTech – Review, mẹo hay công nghệ',
    description: 'Bài viết, review, đập hộp và mẹo dùng điện thoại, sạc dự phòng, phụ kiện công nghệ từ TriTech Channel.',
  });
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data: posts, meta, loading, error } = useFetch(() => shopApi.posts({ limit }), [limit]);

  return (
    <div className="max-w-[680px] mx-auto px-2 md:px-4 py-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Link to="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight size={12} />
        <span className="font-medium text-gray-800">Blog</span>
      </div>
      <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
        <Newspaper className="text-red-600" /> BLOG TRITECH
      </h1>

      {error ? (
        <p className="bg-white rounded-xl p-6 text-center text-sm text-red-600">{error.message}</p>
      ) : !posts && loading ? (
        <div className="flex justify-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>
      ) : posts?.length ? (
        <div className="space-y-4">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
          {meta && posts.length < meta.total && (
            <div className="text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                className="px-8 py-2.5 bg-[#FFD400] hover:bg-amber-400 disabled:opacity-60 text-black font-bold text-xs uppercase rounded-xl"
              >
                {loading ? 'Đang tải…' : 'Xem thêm bài viết'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="bg-white rounded-xl p-10 text-center text-sm text-gray-500">Chưa có bài viết nào. Quay lại sau nhé!</p>
      )}
    </div>
  );
}
