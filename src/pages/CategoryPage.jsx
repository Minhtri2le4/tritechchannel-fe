import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { sidebarCategories } from '../data/mockData';
import { categoryProducts } from '../data/categoryData';
import { ChevronRight, Filter } from 'lucide-react';

const cleanString = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '')
    .toLowerCase();
};

export default function CategoryPage({ onAddToCart }) {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [visibleCount, setVisibleCount] = useState(8);

  const currentCat = sidebarCategories?.find(
    (c) => String(c.id) === String(categoryId) || c.slug === categoryId
  );

  let filtered = categoryProducts || [];

  if (searchQuery.trim() !== '') {
    const key = cleanString(searchQuery);
    filtered = filtered.filter((p) => {
      const name = cleanString(p.name);
      const brand = cleanString(p.brand);
      const catName = cleanString(p.category);
      return name.includes(key) || brand.includes(key) || catName.includes(key);
    });
  } else if (categoryId) {
    filtered = filtered.filter(
      (item) => String(item.categoryId) === String(categoryId) || String(item.category) === String(categoryId)
    );
  }

  if (selectedBrand !== 'ALL') {
    const brandKey = cleanString(selectedBrand);
    filtered = filtered.filter(
      (p) => cleanString(p.brand) === brandKey || cleanString(p.name).includes(brandKey)
    );
  }

  if (sortBy === 'PRICE_ASC') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'PRICE_DESC') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  const brands = ['ALL', 'APPLE', 'SAMSUNG', 'OPPO', 'XIAOMI'];

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
        <div className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80" 
            alt="Banner Xài Trước Trả Sau" 
            className="w-full h-32 sm:h-40 md:h-44 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80" 
            alt="Banner Thu Cũ Đổi Mới" 
            className="w-full h-32 sm:h-40 md:h-44 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 3. Title & Số lượng */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wide">
          {searchQuery ? `KẾT QUẢ TÌM KIẾM: "${searchQuery}"` : (currentCat ? currentCat.name : 'ĐIỆN THOẠI')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Hiển thị {filtered.length} sản phẩm {searchQuery && `cho từ khóa "${searchQuery}"`}
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
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-6">
          {filtered.slice(0, visibleCount).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 text-center rounded-xl my-4 text-gray-500 text-sm">
          Không tìm thấy sản phẩm nào phù hợp.
        </div>
      )}

      {/* 7. Nút "Xem thêm" */}
      {visibleCount < filtered.length && (
        <div className="text-center mb-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="px-8 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xs uppercase rounded-xl shadow-sm transition-all"
          >
            Xem thêm {filtered.length - visibleCount} sản phẩm
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