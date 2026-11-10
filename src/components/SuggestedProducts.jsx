import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { isSoldOut } from '../lib/stock';
import ProductCard from './ProductCard';

const STEP = 12;

// "Có thể bạn cũng thích" dưới giỏ hàng (như Shopee): sản phẩm bán chạy còn hàng, bỏ những món đã có trong giỏ
export default function SuggestedProducts({ excludeIds = [], title = 'Có thể bạn cũng thích' }) {
  const [limit, setLimit] = useState(STEP);
  const { data, meta, loading } = useFetch(() => shopApi.products({ sort: 'best_selling', limit: limit + excludeIds.length }), [limit, excludeIds.length]);
  const skip = new Set(excludeIds);
  const items = (data || []).filter((p) => !skip.has(p.id) && !isSoldOut(p)).slice(0, limit);
  const more = (meta?.total ?? 0) > limit + excludeIds.length;

  if (!loading && !items.length) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 md:text-base">{title}</h2>
        <Link to="/" className="flex items-center gap-0.5 text-xs font-semibold text-red-600 hover:underline md:text-sm">
          Xem tất cả <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {loading && !items.length && (
        <div className="flex justify-center py-8 text-gray-400"><Loader2 className="animate-spin" /></div>
      )}
      {more && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => setLimit((n) => n + STEP)}
            className="flex min-w-[220px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />} Xem thêm
          </button>
        </div>
      )}
    </section>
  );
}
