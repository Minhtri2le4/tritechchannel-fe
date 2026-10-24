import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, Home, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';

// Tab ưu đãi -> điều kiện lọc sản phẩm đang giảm giá
const TABS = {
  android: { label: 'Điện thoại Android', params: { category: '1' }, excludeBrand: 'APPLE' },
  iphone: { label: 'iPhone', params: { category: '1', brand: 'APPLE' } },
  accessory: { label: 'Phụ kiện & Sạc dự phòng', params: { category: '5' } },
};

function ProductGrid({ items, loading, empty }) {
  if (loading && !items) {
    return <div className="flex justify-center py-10 text-gray-400"><Loader2 className="animate-spin" /></div>;
  }
  if (!items?.length) return <p className="text-center text-sm text-gray-500 py-8">{empty}</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export default function Promotions() {
  const [activeTab, setActiveTab] = useState('android');
  const tab = TABS[activeTab];

  // Sản phẩm đang giảm giá của tab, giảm nhiều nhất lên trước
  const { data: tabProducts, loading: dealsLoading } = useFetch(() => shopApi.products({ ...tab.params, limit: 40 }), [activeTab]);
  const deals = tabProducts
    ?.filter((p) => p.discountPercent > 0 && p.brand !== tab.excludeBrand)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 8);
  const { data: newArrivals, loading: newLoading } = useFetch(() => shopApi.products({ sort: 'newest', limit: 8 }), []);

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-16 text-gray-800 overflow-x-hidden w-full">
      
      {/* 1. BREADCRUMB */}
      <div className="max-w-6xl mx-auto px-3 py-2 text-[11px] sm:text-xs text-gray-600 flex items-center gap-1">
        <Link to="/" className="hover:text-yellow-600 flex items-center gap-1">
          <Home size={12} /> Trang chủ
        </Link>
        <ChevronRight size={10} className="text-gray-400" />
        <span className="font-semibold text-gray-800">Khuyến mãi</span>
      </div>

      {/* 2. HERO BANNER CHÍNH - VÀNG ĐẶC CHUẨN TONE HEADER (#FFD400) */}
      <div className="max-w-6xl mx-auto px-3 my-1">
        <div className="w-full rounded-2xl overflow-hidden shadow-sm bg-[#FFD400] p-5 sm:p-8 text-center border border-yellow-500 relative">
          <span className="bg-black text-[#FFD400] font-extrabold text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2 shadow-sm">
            TRITECH CHANNEL SPECIAL
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight uppercase break-words">
            SĂN DEAL SIÊU HOT
          </h1>
          <p className="text-xs sm:text-lg lg:text-xl font-black text-red-600 mt-1 uppercase">
            Giảm Đến 50% Tất Cả Phụ Kiện & Thiết Bị
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 space-y-6 mt-4">
        
        {/* ================= SECTION 1: ƯU ĐÃI HOT ================= */}
        <section className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-200">
          
          {/* Header Banner Vàng Đậm Đồng Bộ Header */}
          <div className="bg-[#FFD400] text-black rounded-xl py-2.5 px-4 text-center shadow-sm mb-4 flex items-center justify-center gap-2 border border-yellow-500">
            <Sparkles size={18} className="text-red-600 fill-red-600 shrink-0" />
            <h2 className="text-base sm:text-xl font-black uppercase tracking-wider">
              ƯU ĐÃI HOT
            </h2>
            <Sparkles size={18} className="text-red-600 fill-red-600 shrink-0" />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none text-xs">
            {Object.entries(TABS).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`whitespace-nowrap font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  activeTab === key ? 'bg-black text-[#FFD400] border-black' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Grid Sản Phẩm */}
          <ProductGrid items={deals} loading={dealsLoading} empty="Hiện chưa có sản phẩm giảm giá trong mục này." />
        </section>


        {/* ================= SECTION BANNERS PHỤ (FIX PHỐI MÀU RÕ NÉT) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Ô 1: Nền Đỏ - Chữ Trắng (Sự Kiện Hot) */}
          <div className="bg-red-600 text-white rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[105px]">
            <span className="bg-black/40 text-[#FFD400] text-[10px] font-black px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              SỰ KIỆN HOT
            </span>
            <div className="mt-2">
              <h3 className="font-black text-sm sm:text-base uppercase text-white">
                CHÀO NĂM HỌC MỚI
              </h3>
              <p className="text-[11px] text-red-100 font-semibold">Ưu đãi HS-SV giảm thêm 500K</p>
            </div>
          </div>

          {/* Ô 2: Nền Đen - Chữ Vàng (Thu Cũ Đổi Mới) */}
          <Link to="/thu-cu-doi-moi" className="bg-black text-white rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[105px] border border-yellow-500/50 hover:border-yellow-400">
            <span className="bg-[#FFD400] text-black text-[10px] font-black px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              THU CŨ ĐỔI MỚI
            </span>
            <div className="mt-2">
              <h3 className="font-black text-sm sm:text-base uppercase text-[#FFD400]">
                BÁN NHANH LÊN ĐỜI
              </h3>
              <p className="text-[11px] text-gray-300 font-semibold">Trợ giá đến 5 Triệu + Trả góp 0%</p>
            </div>
          </Link>

          {/* Ô 3: Nền Vàng Đậm - Chữ Đen (Đối Tác) */}
          <div className="bg-[#FFD400] text-black rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[105px] border border-yellow-500">
            <span className="bg-black text-[#FFD400] text-[10px] font-black px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              ĐỐI TÁC CÔNG NGHỆ
            </span>
            <div className="mt-2">
              <h3 className="font-black text-sm sm:text-base uppercase text-black">
                ƯU ĐÃI TÀI XẾ CÔNG NGHỆ
              </h3>
              <p className="text-[11px] text-gray-900 font-bold">Giảm thêm đến 300K mua máy</p>
            </div>
          </div>

        </div>


        {/* ================= SECTION 2: HÀNG MỚI VỀ ================= */}
        <section className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-200">
          
          <div className="bg-[#FFD400] text-black rounded-xl py-2.5 px-4 text-center shadow-sm mb-4 flex items-center justify-center gap-2 border border-yellow-500">
            <Sparkles size={18} className="text-red-600 fill-red-600 shrink-0" />
            <h2 className="text-base sm:text-xl font-black uppercase tracking-wider">
              HÀNG MỚI VỀ GIÁ SỐC
            </h2>
            <Sparkles size={18} className="text-red-600 fill-red-600 shrink-0" />
          </div>

          <ProductGrid items={newArrivals} loading={newLoading} empty="Chưa có sản phẩm mới." />
        </section>

      </div>
    </div>
  );
}
