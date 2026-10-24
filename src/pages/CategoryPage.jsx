import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import useCategories from '../hooks/useCategories';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';
import { ChevronRight, Filter, Loader2 } from 'lucide-react';

const PAGE_SIZE = 10;
const SORT_PARAM = { DEFAULT: 'default', PRICE_ASC: 'price_asc', PRICE_DESC: 'price_desc' };
const initialFilters = (key) => ({ key, brand: 'ALL', sortBy: 'DEFAULT', visibleCount: PAGE_SIZE });

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Đổi danh mục / từ khóa thì bộ lọc tự đặt lại
  const filterKey = `${categoryId}|${searchQuery}`;
  const [filters, setFilters] = useState(() => initialFilters(filterKey));
  const current = filters.key === filterKey ? filters : initialFilters(filterKey);
  const { brand: selectedBrand, sortBy, visibleCount } = current;
  const update = (patch) => setFilters({ ...current, ...patch });
  const setSelectedBrand = (brand) => update({ brand, visibleCount: PAGE_SIZE });
  const setSortBy = (s) => update({ sortBy: s });
  const setVisibleCount = (fn) => update({ visibleCount: fn(visibleCount) });

  const { all: categories } = useCategories();
  const currentCat = categories?.find(
    (c) => String(c.id) === String(categoryId) || c.slug === categoryId
  );

  // Tìm kiếm thì tìm trên toàn bộ sản phẩm, không giới hạn trong danh mục
  const categoryParam = searchQuery.trim() ? undefined : categoryId;

  const { data: products, meta, loading, error } = useFetch(
    () =>
      shopApi.products({
        category: categoryParam,
        search: searchQuery.trim() || undefined,
        brand: selectedBrand === 'ALL' ? undefined : selectedBrand,
        sort: SORT_PARAM[sortBy],
        limit: visibleCount,
      }),
    [categoryParam, searchQuery, selectedBrand, sortBy, visibleCount]
  );
  const { data: brandList } = useFetch(() => shopApi.brands(categoryParam), [categoryParam]);

  const filtered = products || [];
  const total = meta?.total ?? 0;
  const brands = ['ALL', ...(brandList || [])];

  return (
    <div className="max-w-[1280px] mx-auto px-2 md:px-4 py-3">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Link to="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight size={12} />
        <span className="font-medium text-gray-800">
          {searchQuery ? 'Tìm kiếm' : (currentCat ? currentCat.name : 'Danh mục')}
        </span>
      </div>

      {/* 2. CỤM BANNER ĐÔI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
        <Link to="/thu-cu-doi-moi" className="block overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <img
            src="/assets/thucu-sm.webp"
            alt="Banner Thu Cũ Đổi Mới"
            className="w-full aspect-[160/65] object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {/* Banner thứ 2 chỉ hiện trên màn hình rộng để điện thoại không phải cuộn qua 2 banner lớn */}
        <Link to="/promotions" className="hidden md:block overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <img
            src="/assets/best-sm.webp"
            alt="Banner Khuyến Mãi"
            className="w-full aspect-[160/65] object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* 3. Title & Số lượng */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wide">
          {searchQuery ? `KẾT QUẢ TÌM KIẾM: "${searchQuery}"` : (currentCat ? currentCat.name : 'ĐIỆN THOẠI')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Hiển thị {total} sản phẩm {searchQuery && `cho từ khóa "${searchQuery}"`}
        </p>
      </div>

      {/* 4. Quick Brand Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {brands.map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBrand(b)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
              selectedBrand === b
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            {b === 'ALL' ? 'TẤT CẢ' : b}
          </button>
        ))}
      </div>

      {/* 5. Filter & Sort Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm mb-4 border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Filter size={14} /> Sắp xếp theo:
          </span>
          <button
            onClick={() => setSortBy('PRICE_ASC')}
            className={`px-3 py-1 text-xs rounded-md border font-medium ${
              sortBy === 'PRICE_ASC' ? 'bg-yellow-400 border-yellow-500 text-black font-bold' : 'bg-gray-50 border-gray-200'
            }`}
          >
            Giá tăng dần
          </button>
          <button
            onClick={() => setSortBy('PRICE_DESC')}
            className={`px-3 py-1 text-xs rounded-md border font-medium ${
              sortBy === 'PRICE_DESC' ? 'bg-yellow-400 border-yellow-500 text-black font-bold' : 'bg-gray-50 border-gray-200'
            }`}
          >
            Giá giảm dần
          </button>
        </div>
      </div>

      {/* 6. Product Grid */}
      {error ? (
        <div className="bg-white p-8 text-center rounded-xl my-4 text-red-600 text-sm">
          {error.message}
        </div>
      ) : filtered.length > 0 ? (
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : loading ? (
        <div className="bg-white p-8 flex justify-center rounded-xl my-4 text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="bg-white p-8 text-center rounded-xl my-4 text-gray-500 text-sm">
          Không tìm thấy sản phẩm nào phù hợp.
        </div>
      )}

      {/* 7. Nút "Xem thêm" */}
      {filtered.length < total && (
        <div className="text-center mb-8">
          <button
            disabled={loading}
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-black font-bold text-xs uppercase rounded-xl shadow-sm transition-all"
          >
            Xem thêm {total - filtered.length} sản phẩm
          </button>
        </div>
      )}

      {/* 8. SEO Content */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-gray-700 text-xs leading-relaxed space-y-3 mb-8">
        <h2 className="text-base font-bold text-gray-900">
          Điện thoại di động & Phụ kiện công nghệ chính hãng
        </h2>
        <p>
          Tritech Channel chuyên cung cấp các sản phẩm phụ kiện, thiết bị công nghệ chính hãng với mức giá cạnh tranh nhất...
        </p>
      </div>
    </div>
  );
}