import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, Home } from 'lucide-react';

const HOT_DEALS = [
  {
    id: 1,
    name: "Xiaomi Poco C65 6GB/128GB Chính Hãng",
    price: "2.690.000đ",
    oldPrice: "3.690.000đ",
    discount: "-27%",
    tag: "Trả góp 0%",
    subTag: "ƯU ĐÃI MUA TRẢ GÓP GIẢM 100.000Đ",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&fit=crop",
    status: "Còn hàng"
  },
  {
    id: 2,
    name: "Xiaomi Redmi 13C 4GB/128GB Chính Hãng",
    price: "2.990.000đ",
    oldPrice: "4.090.000đ",
    discount: "-26%",
    tag: "Trả góp 0%",
    subTag: "ƯU ĐÃI MUA TRẢ GÓP GIẢM 100.000Đ",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&fit=crop",
    status: "Còn hàng"
  },
  {
    id: 3,
    name: "Xiaomi Redmi 13 6GB/128GB Chính Hãng",
    price: "3.890.000đ",
    oldPrice: "4.790.000đ",
    discount: "-19%",
    tag: "Trả góp 0%",
    subTag: "ƯU ĐÃI MUA TRẢ GÓP GIẢM 100.000Đ",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&fit=crop",
    status: "Còn hàng"
  },
  {
    id: 4,
    name: "Oppo A3x 4GB/64GB Chính Hãng",
    price: "3.990.000đ",
    oldPrice: "4.690.000đ",
    discount: "-15%",
    tag: "Trả góp 0%",
    subTag: "ƯU ĐÃI MUA TRẢ GÓP GIẢM 100.000Đ",
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500&fit=crop",
    status: "Còn hàng"
  },
];

const NEW_ARRIVALS = [
  {
    id: 5,
    name: "Oppo Reno12 F 5G 8GB/256GB Chính Hãng",
    price: "11.490.000đ",
    oldPrice: "15.990.000đ",
    discount: "-28%",
    tag: "Trả góp 0%",
    subTag: "GIÁ SỐC GIẢM 100.000Đ",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&fit=crop",
    status: "Còn hàng"
  },
  {
    id: 6,
    name: "Samsung Galaxy S25 Ultra 12GB/256GB Chính Hãng",
    price: "19.990.000đ",
    oldPrice: "33.990.000đ",
    discount: "-41%",
    tag: "Trả góp 0%",
    subTag: "BÁN NHANH LÊN ĐỜI GIẢM 200.000Đ",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&fit=crop",
    status: "Còn hàng"
  },
  {
    id: 7,
    name: "iPhone 17 Pro Max 512GB Cũ 99%",
    price: "35.290.000đ",
    oldPrice: "44.990.000đ",
    discount: "-21%",
    tag: "Trả góp 0%",
    subTag: "BÁN NHANH LÊN ĐỜI GIẢM 200.000Đ",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&fit=crop",
    status: "Còn hàng"
  },
  {
    id: 8,
    name: "Samsung Galaxy Tab S9 FE WiFi 6GB/128GB",
    price: "6.490.000đ",
    oldPrice: "10.990.000đ",
    discount: "-41%",
    tag: "Trả góp 0%",
    subTag: "GIÁ SỐC GIẢM 100.000Đ",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&fit=crop",
    status: "Còn hàng"
  },
];

export default function Promotions() {
  const [activeTab, setActiveTab] = useState('android');

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
            <button 
              onClick={() => setActiveTab('android')}
              className={`whitespace-nowrap font-bold px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'android' ? 'bg-black text-[#FFD400] border-black' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Điện thoại Android Giảm đến 100K
            </button>
            <button 
              onClick={() => setActiveTab('iphone')}
              className={`whitespace-nowrap font-bold px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'iphone' ? 'bg-black text-[#FFD400] border-black' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              iPhone Giảm Thêm 300K
            </button>
            <button 
              onClick={() => setActiveTab('accessory')}
              className={`whitespace-nowrap font-bold px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'accessory' ? 'bg-black text-[#FFD400] border-black' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sạc dự phòng Giảm đến 100K
            </button>
          </div>

          {/* Grid Sản Phẩm */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {HOT_DEALS.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
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
          <div className="bg-black text-white rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[105px] border border-yellow-500/50">
            <span className="bg-[#FFD400] text-black text-[10px] font-black px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              THU CŨ ĐỔI MỚI
            </span>
            <div className="mt-2">
              <h3 className="font-black text-sm sm:text-base uppercase text-[#FFD400]">
                BÁN NHANH LÊN ĐỜI
              </h3>
              <p className="text-[11px] text-gray-300 font-semibold">Trợ giá đến 5 Triệu + Trả góp 0%</p>
            </div>
          </div>

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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {NEW_ARRIVALS.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// Sub Component Card
function ProductCard({ item }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-[#FFD400] shadow-sm transition-all duration-200 flex flex-col justify-between p-2.5 relative group">
      
      {/* Badges Top */}
      <div className="flex items-center gap-1 absolute top-2 left-2 z-10">
        <span className="bg-red-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-sm">
          {item.discount}
        </span>
        {item.tag && (
          <span className="bg-gray-100 text-gray-600 font-medium text-[9px] px-1 py-0.5 rounded border border-gray-200 hidden sm:inline-block">
            {item.tag}
          </span>
        )}
      </div>

      {/* Ảnh sản phẩm */}
      <div className="h-28 sm:h-36 w-full my-1.5 flex items-center justify-center overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Thông tin */}
      <div className="flex flex-col justify-between flex-grow">
        <h3 className="text-[11px] sm:text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
          {item.name}
        </h3>

        {/* Sub Tag quà tặng/giảm giá */}
        {item.subTag && (
          <div className="mt-1.5 bg-[#FFD400] text-black text-[9px] font-black py-0.5 px-1 rounded text-center truncate">
            {item.subTag}
          </div>
        )}

        {/* Giá */}
        <div className="mt-2">
          <div className="text-xs sm:text-sm font-black text-red-600">
            {item.price}
          </div>
          <div className="text-[10px] text-gray-400 line-through">
            {item.oldPrice}
          </div>
        </div>

        {/* Footer Card */}
        <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[9px] sm:text-[10px] text-emerald-600 font-semibold">
          <span>{item.status}</span>
          <span className="text-gray-400 font-normal">Giao nhanh</span>
        </div>
      </div>

    </div>
  );
}