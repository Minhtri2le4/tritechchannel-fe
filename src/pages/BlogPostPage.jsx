import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useSeo, { SITE_URL } from '../hooks/useSeo';
import { shopApi } from '../services/shop';
import { PostAuthor, PostGallery, PostVideo } from '../components/PostMedia';

const absUrl = (src) => (src && /^https?:/.test(src) ? src : `${SITE_URL}${src || ''}`);

function PostView({ post }) {
  useSeo({
    title: post.title,
    description: post.content || post.title,
    image: post.images?.[0] ? absUrl(post.images[0]) : undefined,
    path: `/blog/${post.slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      image: (post.images || []).map(absUrl),
      author: { '@type': 'Organization', name: 'TriTech Channel' },
      publisher: { '@type': 'Organization', name: 'TriTech Channel', logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo.png` } },
      mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    },
  });

  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-4">
      <PostAuthor date={post.publishedAt} />
      <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-snug">{post.title}</h1>
      {post.content && <div className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-line break-words">{post.content}</div>}
      <PostVideo url={post.videoUrl} />
      <PostGallery images={post.images} />
    </article>
  );
}

// Trang xem 1 bài blog
export default function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, loading, error } = useFetch(() => shopApi.post(slug), [slug]);

  return (
    <div className="max-w-[760px] mx-auto px-2 md:px-4 py-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight size={12} />
        <Link to="/blog" className="hover:text-red-600">Blog</Link>
        {post && (
          <>
            <ChevronRight size={12} />
            <span className="font-medium text-gray-800 truncate">{post.title}</span>
          </>
        )}
      </div>

      {loading && !post ? (
        <div className="flex justify-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>
      ) : error || !post ? (
        <div className="bg-white rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm text-gray-600">{error?.status === 404 ? 'Bài viết không tồn tại hoặc đã bị gỡ.' : error?.message}</p>
          <Link to="/blog" className="inline-block bg-[#FFD400] px-5 py-2 rounded-xl font-bold text-xs">Xem các bài khác</Link>
        </div>
      ) : (
        <PostView key={post.id} post={post} />
      )}

      <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-600 mt-4">
        <ChevronLeft size={16} /> Tất cả bài viết
      </Link>
    </div>
  );
}
