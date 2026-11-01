import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';

// "Mọi người cũng tìm kiếm" cuối trang chủ: từ khoá shop ghim + từ khoá khách tìm nhiều trong 30 ngày.
// Bấm vào là tìm luôn (giống ô tìm kiếm trên đầu trang)
export default function PopularSearches() {
  const { data: terms } = useFetch(() => shopApi.popularSearches(), []);
  if (!terms?.length) return null;

  return (
    <section className="mb-10 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <h2 className="mb-3 text-base font-black text-gray-900 md:text-lg">Mọi người cũng tìm kiếm</h2>
      <div className="flex flex-wrap gap-2">
        {terms.map((t) => (
          <Link
            key={t}
            to={`/category/1?search=${encodeURIComponent(t)}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-[#FFD400] hover:text-black active:scale-95 md:text-sm"
          >
            {t}
          </Link>
        ))}
      </div>
    </section>
  );
}
