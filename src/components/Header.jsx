import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, ShoppingBag, Grid3X3, Phone, ShieldCheck, Trash2, TrendingUp,
  Smartphone, Tablet, Percent, RefreshCw, Headphones, Speaker, Watch, Laptop, Home, Gift, Newspaper,
  Headset, Wrench, Copy, Check, MessageCircle, ChevronDown
} from 'lucide-react';
import { sidebarCategories } from '../data/mockData';
import { categoryProducts } from '../data/categoryData';
import { useCart } from '../context/CartContext'; // Lấy hook Context

const iconMap = {
  Smartphone: <Smartphone size={16} />,
  Tablet: <Tablet size={16} />,
  Percent: <Percent size={16} />,
  RefreshCw: <RefreshCw size={16} />,
  Headphones: <Headphones size={16} />,
  Speaker: <Speaker size={16} />,
  Watch: <Watch size={16} />,
  Laptop: <Laptop size={16} />,
  Home: <Home size={16} />,
  Gift: <Gift size={16} />,
  Newspaper: <Newspaper size={16} />,
};

export default function Header() {
  // Lấy dữ liệu giỏ hàng trực tiếp từ Context
  const { cartItems } = useCart();
  
  // Tính tổng số lượng item trong giỏ (tính cả thuộc tính quantity)
  const totalCartCount = cartItems ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['iphone', 'samsung', 'macbook']);
  
  // State quản lý Popover Hotline Liên Hệ
  const [showContact, setShowContact] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const contactRef = useRef(null);

  // Danh sách Hotline cửa hàng
  const contactList = [
    {
      title: 'Tư Vấn Bán Hàng & Chốt Đơn',
      phone: '0325 477 841',
      rawPhone: '0325477841',
      time: '8:00 - 21:30 (Cả T7 & CN)',
      icon: <Headset className="w-4 h-4 text-amber-500" />,
      badge: 'HOTLINE 1'
    },
    {
      title: 'Hỗ Trợ Kỹ Thuật & Bảo Hành',
      phone: '0376 152 100',
      rawPhone: '0376152100',
      time: '8:30 - 18:00 (Thứ 2 - Thứ 7)',
      icon: <Wrench className="w-4 h-4 text-blue-500" />,
      badge: 'HOTLINE 2'
    }
  ];

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (contactRef.current && !contactRef.current.contains(event.target)) {
        setShowContact(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý submit tìm kiếm
  const handleSearch = (term) => {
    const query = term || searchTerm;
    if (query.trim()) {
      if (!recentSearches.includes(query.trim())) {
        setRecentSearches([query.trim(), ...recentSearches.slice(0, 4)]);
      }
      setIsOpen(false);
      navigate(`/category/1?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const clearHistory = () => {
    setRecentSearches([]);
  };

  // Hàm Sao chép Số Điện Thoại
  const handleCopy = (e, phone, index) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Lấy danh sách gợi ý xu hướng
  const trendingProducts = categoryProducts?.slice(0, 6) || [];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Banner Đen */}
      <div className="bg-black text-white text-[10px] md:text-xs py-1 px-2 md:px-4 text-center md:text-left">
        <div className="max-w-[1280px] mx-auto flex justify-center md:justify-between items-center font-bold">
          <span>🔥 TRITECH CHANNEL - CHUYÊN CUNG CẤP PHỤ KIỆN CÔNG NGHỆ CHÍNH HÃNG</span>
        </div>
      </div>

      {/* Main Header Vàng */}
      <div className="bg-[#FFD400] px-2 md:px-4 py-2 relative z-50">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-1.5 md:gap-4">
          
          {/* Logo & Cụm DANH MỤC */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <Link to="/" className="flex items-center gap-1 hover:opacity-90 transition-opacity shrink-0">
              <img 
                src="/assets/logo.png" 
                alt="TriTech Logo" 
                className="h-8 md:h-12 w-auto object-contain drop-shadow-sm"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="flex flex-col leading-none justify-center">
                <span className="text-xs md:text-xl font-black text-black tracking-tight flex items-center">
                  TRITECH<span className="text-red-600 ml-0.5">CHANNEL</span>
                </span>
                <span className="text-[5px] md:text-[8px] text-gray-800 font-bold tracking-wider uppercase mt-0.5">
                  Tech & Accessories
                </span>
              </div>
            </Link>

            {/* Cụm Nút DANH MỤC + Dropdown */}
            <div className="relative group ml-0.5">
              <button className="flex items-center gap-1 bg-[#E6BF00] group-hover:bg-[#D4AF00] text-black px-2 py-1.5 md:px-2.5 rounded-lg font-bold text-[10px] md:text-xs transition-colors cursor-pointer relative z-50">
                <Grid3X3 size={14} className="md:w-4 md:h-4" /> 
                <span className="hidden xs:inline sm:inline">DANH MỤC</span>
              </button>

              <div className="fixed inset-0 top-[85px] bg-black/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-40"></div>

              <div className="absolute top-full left-0 pt-3 w-56 md:w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col p-2">
                  {sidebarCategories && sidebarCategories.map((cat) => {
                    // Xử lý điều hướng riêng cho mục Thu Cũ Đổi Mới (id = 4 hoặc theo tên)
                    const categoryPath = (cat.id === 4 || cat.name?.toLowerCase().includes('thu cũ')) 
                      ? '/thu-cu-doi-moi' 
                      : `/category/${cat.id}`;

                    return (
                      <Link
                        key={cat.id}
                        to={categoryPath}
                        className="flex items-center justify-between p-2 hover:bg-yellow-50 rounded-lg transition-colors font-medium text-gray-700 hover:text-black text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-gray-500">{iconMap[cat.icon] || <Smartphone size={16} />}</span>
                          <span>{cat.name}</span>
                        </div>
                        {cat.badge && (
                          <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {cat.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Ô TÌM KIẾM */}
          <div className="flex-1 max-w-[180px] sm:max-w-xs md:max-w-lg relative" ref={searchRef}>
            <form onSubmit={handleFormSubmit} className="relative">
              <input
                type="text"
                placeholder="Bạn muốn tìm gì..."
                value={searchTerm}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-black px-3 py-2 pr-8 rounded-lg text-xs outline-none shadow-inner focus:ring-2 focus:ring-black/20 transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
              >
                <Search size={15} />
              </button>
            </form>

            {/* POPUP DROPDOWN TÌM KIẾM */}
            {isOpen && (
              <div className="
                absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-xs text-gray-800 animate-fadeIn
                w-[calc(100vw-24px)] max-w-[450px]
                -left-20 sm:left-0 sm:w-full
                max-h-[75vh] overflow-y-auto
              ">
                <div className="p-2 border-b border-gray-100 bg-amber-50/50">
                  <div className="rounded-xl overflow-hidden bg-gradient-to-r from-yellow-400 to-amber-500 p-2.5 text-black flex items-center justify-between shadow-sm cursor-pointer">
                    <div>
                      <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        XẢ KHO SIÊU RẺ
                      </span>
                      <p className="font-bold text-xs mt-0.5">BẢO HÀNH ĐẠT CHUẨN 68 BƯỚC</p>
                    </div>
                    <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded-lg shrink-0">
                      XEM NGAY
                    </span>
                  </div>
                </div>

                {recentSearches.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between text-gray-500 mb-2">
                      <span className="font-bold text-[11px]">Tìm kiếm gần đây</span>
                      <button 
                        onClick={clearHistory} 
                        className="flex items-center gap-1 hover:text-red-600 text-[10px] font-medium"
                      >
                        Xóa lịch sử <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(item);
                            handleSearch(item);
                          }}
                          className="bg-gray-100 hover:bg-yellow-100 hover:text-black px-2.5 py-1 rounded-md text-gray-700 text-[11px] font-medium transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3">
                  <div className="flex items-center gap-1 text-red-600 font-bold text-[11px] mb-2.5">
                    <TrendingUp size={14} />
                    <span>Xu hướng tìm kiếm 🔥</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {trendingProducts.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/category/1?search=${encodeURIComponent(prod.name)}`);
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <img 
                          src={prod.image || 'https://via.placeholder.com/40'} 
                          alt={prod.name} 
                          className="w-9 h-9 object-cover rounded-md border border-gray-100 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="font-medium text-[11px] text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-red-600 font-bold">
                            {prod.price?.toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Tiện ích */}
          <div className="flex items-center gap-1.5 md:gap-4 text-black text-xs font-bold shrink-0">
            
            {/* HOTLINE */}
            <div className="hidden lg:block relative" ref={contactRef}>
              <div 
                onClick={() => setShowContact(!showContact)}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity select-none py-1"
              >
                <Phone size={18} />
                <div className="leading-tight">
                  <p className="flex items-center gap-0.5">
                    Liên Hệ
                    <ChevronDown size={12} className={`transition-transform duration-200 ${showContact ? 'rotate-180' : ''}`} />
                  </p>
                  <p className="text-[9px] font-normal">Hotline</p>
                </div>
              </div>

              {showContact && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-2.5">
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wide">
                        Tổng Đài Hỗ Trợ Khách Hàng
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium">
                        TriTech Channel luôn sẵn sàng phục vụ
                      </p>
                    </div>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="Đang trực tuyến"></span>
                  </div>

                  <div className="space-y-2.5">
                    {contactList.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-yellow-50/70 border border-gray-200/80 hover:border-yellow-400 transition-all"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            {item.icon}
                            <span className="text-[11px] font-bold text-gray-800">{item.title}</span>
                          </div>
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-black text-[#FFD400]">
                            {item.badge}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-200/60">
                          <div>
                            <a 
                              href={`tel:${item.rawPhone}`} 
                              className="text-sm font-black text-gray-900 hover:text-amber-600 transition-colors tracking-wide"
                            >
                              {item.phone}
                            </a>
                            <p className="text-[9px] text-gray-500 font-normal">{item.time}</p>
                          </div>

                          <button
                            onClick={(e) => handleCopy(e, item.phone, idx)}
                            className="flex items-center gap-1 text-[10px] font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-2 py-1 rounded-md transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check size={11} className="text-emerald-600" />
                                <span className="text-emerald-600">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-normal">Cần tư vấn trực tiếp?</span>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-bold text-blue-600 hover:underline"
                    >
                      <MessageCircle size={13} /> Chat Zalo ngay
                    </a>
                  </div>

                </div>
              )}
            </div>

            <Link to="/bao-hanh" className="hidden lg:flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
               <ShieldCheck size={18} />
               <div className="leading-tight">
                  <p>Bảo Hành</p>
                  <p className="text-[9px] font-normal">Tra cứu</p>
               </div>
            </Link>

            {/* 🛒 NÚT GIỎ HÀNG */}
            <Link 
              to="/cart" 
              className="relative cursor-pointer flex items-center gap-1 bg-black text-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag size={16} className="text-[#FFD400]" />
              <span className="hidden sm:inline text-xs font-bold">Giỏ hàng</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-[#FFD400]">
                  {totalCartCount}
                </span>
              )}
            </Link>

          </div>

        </div>
      </div>
    </header>
  );
}