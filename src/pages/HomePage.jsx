import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext'; 
import ProductCard from '../components/ProductCard.jsx';
import { Link } from 'react-router-dom';
import { products, sidebarCategories, quickCategories } from "../data/mockData";
import { 
  ShieldCheck, RefreshCw, Truck, RotateCcw, 
  ChevronLeft, ChevronRight, PhoneCall, Star, Play, Flame, Zap, Clock,
  Smartphone, Tablet, Percent, Headphones, Speaker, Watch, Laptop, Home, Gift, Newspaper, 
  ArrowRight, Sparkles, Bot
} from 'lucide-react';

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

const bannerImages = [
  "/assets/A1695.jpg",
  "/assets/why.jpg",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=1200&h=600&fit=crop",
  "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?w=1200&h=600&fit=crop"
];

const ecomStores = [
  {
    id: 'shopee',
    name: 'tritechchannel',
    platform: 'Shopee Mall',
    shopBadge: 'SHOP YÊU THÍCH',
    badgeColor: 'bg-[#ee4d2d]',
    rating: '4.8',
    sold: '5K',
    response: '99%',
    borderColor: 'border-orange-200 hover:border-[#ee4d2d]',
    shadowHover: 'hover:shadow-[0_20px_40px_-15px_rgba(238,77,45,0.35)]',
    glowBg: 'from-orange-500/5 to-transparent',
    buttonHover: 'group-hover:bg-[#ee4d2d] group-hover:text-white group-hover:border-[#ee4d2d]',
    buttonText: 'Vào Shop Shopee Mall',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO6mQ4kh8Ms7cBHu9ViJWVSBGpAinimxpxZMkVW6FnlFCvcS7-pWAU-ts2&s=10',
    link: 'https://shopee.vn/tritechchannel?entryPoint=ShopBySearch&searchKeyword=tritech%20channel'
  },
  {
    id: 'tiktok',
    name: 'tritechchannel',
    platform: 'TikTok Shop',
    shopBadge: 'shop yêu thích',
    badgeColor: 'bg-black',
    rating: '4.8',
    sold: '3K',
    response: '95%',
    borderColor: 'border-gray-200 hover:border-black',
    shadowHover: 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]',
    glowBg: 'from-black/5 to-transparent',
    buttonHover: 'group-hover:bg-black group-hover:text-white group-hover:border-black',
    buttonText: 'Vào Shop TikTok Shop',
    logo: 'https://img.icons8.com/color/150/tiktok--v1.png',
    link: 'https://vt.tiktok.com/ZS4C18NFe/?page=TikTokShop'
  },
  {
    id: 'lazada',
    name: 'tritechchannel',
    platform: 'LazMall',
    shopBadge: 'GIAN HÀNG TỐT',
    badgeColor: 'bg-[#0f136d]',
    rating: '5.0',
    sold: '2K',
    response: '98%',
    borderColor: 'border-blue-100 hover:border-[#0f136d]',
    shadowHover: 'hover:shadow-[0_20px_40px_-15px_rgba(15,19,109,0.3)]',
    glowBg: 'from-blue-600/5 to-transparent',
    buttonHover: 'group-hover:bg-[#0f136d] group-hover:text-white group-hover:border-[#0f136d]',
    buttonText: 'Vào Shop LazMall',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5dSLzULR90j-8hJJkUTbJk-dejrZdf8FGDWvenMYK1m3-xzC75mXff8A&s=10',
    link: 'https://www.lazada.vn/shop/tritechchannel'
  }
];

const bestPricesToday = [
  { id: 201, name: "DIVITAG PRO THIẾT BỊ ĐỊNH VỊ CHÍNH HÃNG", price: 399000, oldPrice: 879000, timer: "0 Ngày : 1 : 32 : 11", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300" },
  { id: 202, name: "Gối massage cổ đa năng cao cấp (Kèm quà tặng)", price: 279000, oldPrice: 349000, timer: "Kèm quà tặng", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300" },
  { id: 203, name: "Tủ chống ẩm Andbon AB-18C bảo quản máy ảnh", price: 1099000, oldPrice: 2650000, timer: "0 Ngày : 0 : 27 : 11", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=300" },
  { id: 204, name: "Đèn năng lượng mặt trời T25008 siêu sáng", price: 79000, oldPrice: 149000, timer: "0 Ngày : 1 : 32 : 11", image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300" },
  { id: 205, name: "Đèn năng lượng mặt trời T25005 chống nước", price: 99000, oldPrice: 199000, timer: "0 Ngày : 1 : 21 : 11", image: "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=300" },
  { id: 206, name: "Quạt cầm tay mini Turbo Rock LQ-217B", price: 139000, oldPrice: 220000, timer: "0 Ngày : 1 : 32 : 11", image: "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?w=300" }
];

const youtubeShortsVideos = [
  { id: 1, shortsUrl: "https://www.youtube.com/embed/45K95-qv-Pg?autoplay=1&mute=1", title: "Review tai nghe và thiết bị công nghệ", productName: "[Bản giới hạn] Tai nghe Gạch TWS", price: 599000, oldPrice: 1299000, productImage: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=150" },
  { id: 2, shortsUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0", title: "Đánh giá chi tiết củ sạc nhanh Oca 65W", productName: "Ô cắm điện đa năng Tritech", price: 559000, oldPrice: 699000, productImage: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150" },
  { id: 3, shortsUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0", title: "Test camera S24 Ultra", productName: "Samsung Galaxy S24 Ultra", price: 25990000, oldPrice: 33990000, productImage: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150" },
  { id: 4, shortsUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0", title: "Trải nghiệm nhanh phụ kiện", productName: "Sạc dự phòng Cube 2", price: 459000, oldPrice: 799000, productImage: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=150" },
  { id: 5, shortsUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0", title: "Mở hộp định vị thông minh", productName: "Divitag Pro Chính Hãng", price: 399000, oldPrice: 879000, productImage: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150" }
];

const newsArticles = [
  { id: 1, title: "Có nên dùng củ sạc thay thế cho iPad? Top sạc tương thích an toàn...", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400" },
  { id: 2, title: "4 tính năng đáng tiền của ổ cắm điện đa năng cao cấp hiện nay", img: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400" },
  { id: 3, title: "So sánh máy cạo râu thế hệ mới và các dòng máy truyền thống", img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400" },
  { id: 4, title: "Trên tay tai nghe TWS: Giá chỉ 790.000 đồng mà xuyên âm cực đỉnh", img: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=400" },
  { id: 5, title: "Ghi dấu 10 năm huyền thoại âm nhạc bằng bộ sưu tập độc quyền", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" }
];

const thirtyProducts = [
  { id: 301, name: "Tai nghe Bluetooth TWS True Wireless chống ồn đỉnh cao V2", price: 199000, oldPrice: 350000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", soldCount: 1250, rating: "4.9" },
  { id: 302, name: "Củ sạc nhanh GaN 65W tích hợp 3 cổng Type-C thông minh", price: 350000, oldPrice: 550000, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300", soldCount: 890, rating: "4.8" },
  { id: 303, name: "Đế sạc không dây nam châm MagSafe tích hợp tản nhiệt", price: 499000, oldPrice: 799000, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300", soldCount: 450, rating: "4.7" },
  { id: 304, name: "Chuột không dây Gaming Silent độ nhạy cao 4000 DPI", price: 250000, oldPrice: 400000, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300", soldCount: 2100, rating: "4.9" },
  { id: 305, name: "Bàn phím cơ mini Bluetooth LED RGB hiệu ứng cực ngầu", price: 890000, oldPrice: 1290000, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300", soldCount: 320, rating: "4.8" },
  { id: 306, name: "Cáp sạc nhanh bọc dù chống đứt hãng cao cấp 1.2 mét", price: 150000, oldPrice: 250000, image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300", soldCount: 3400, rating: "5.0" },
  { id: 307, name: "Sạc dự phòng không dây nam châm 10.000mAh siêu mỏng", price: 550000, oldPrice: 850000, image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=300", soldCount: 780, rating: "4.6" },
  { id: 308, name: "Hub chuyển đổi Type-C sang HDMI/USB 3.0 cho Laptop", price: 450000, oldPrice: 650000, image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=300", soldCount: 560, rating: "4.7" },
  { id: 309, name: "Quạt tản nhiệt điện thoại sò lạnh livestream gaming", price: 299000, oldPrice: 499000, image: "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?w=300", soldCount: 1100, rating: "4.8" },
  { id: 310, name: "Kính cường lực full màn hình chống bám vân tay cao cấp", price: 99000, oldPrice: 150000, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300", soldCount: 5000, rating: "4.9" },
  { id: 311, name: "Tai nghe chụp tai Bluetooth có mic đàm thoại khử ồn", price: 650000, oldPrice: 950000, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300", soldCount: 420, rating: "4.5" },
  { id: 312, name: "Giá đỡ điện thoại, iPad hợp kim nhôm gấp gọn tiện lợi", price: 120000, oldPrice: 200000, image: "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=300", soldCount: 2300, rating: "4.9" },
  { id: 313, name: "Loa Bluetooth mini chống nước âm bass cực mạnh", price: 390000, oldPrice: 590000, image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300", soldCount: 890, rating: "4.7" },
  { id: 314, name: "Đèn LED để bàn học chống cận có sạc không dây", price: 450000, oldPrice: 700000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300", soldCount: 670, rating: "4.8" },
  { id: 315, name: "Webcam Full HD 1080p tích hợp mic cho học trực tuyến", price: 550000, oldPrice: 850000, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300", soldCount: 430, rating: "4.6" },
  { id: 316, name: "Balo Laptop chống nước tích hợp cổng sạc USB", price: 320000, oldPrice: 500000, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300", soldCount: 1500, rating: "4.8" },
  { id: 317, name: "Bút cảm ứng Stylus Pen chống tỳ tay dành cho iPad", price: 490000, oldPrice: 790000, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300", soldCount: 800, rating: "4.9" },
  { id: 318, name: "Gậy chụp ảnh Tripod có remote Bluetooth từ xa", price: 180000, oldPrice: 300000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", soldCount: 3100, rating: "4.7" },
  { id: 319, name: "Micro thu âm không dây cài áo cho điện thoại vlog", price: 650000, oldPrice: 990000, image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=300", soldCount: 520, rating: "4.8" },
  { id: 320, name: "Đồng hồ thông minh Smartwatch theo dõi sức khỏe", price: 890000, oldPrice: 1400000, image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=300", soldCount: 940, rating: "4.6" },
  { id: 321, name: "Ốp lưng chống sốc viền màu cao cấp cho iPhone", price: 150000, oldPrice: 250000, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300", soldCount: 4200, rating: "4.9" },
  { id: 322, name: "Thẻ nhớ MicroSD 128GB tốc độ đọc ghi cực nhanh", price: 299000, oldPrice: 450000, image: "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=300", soldCount: 1800, rating: "4.8" },
  { id: 323, name: "Túi đựng phụ kiện công nghệ chống thấm gọn gàng", price: 190000, oldPrice: 300000, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300", soldCount: 1100, rating: "4.7" },
  { id: 324, name: "Bàn di chuột lót chuột khổ lớn viền LED RGB", price: 250000, oldPrice: 350000, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300", soldCount: 2400, rating: "4.9" },
  { id: 325, name: "Sạc nhanh ô tô 2 cổng PD + QC3.0 vỏ kim loại", price: 350000, oldPrice: 550000, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300", soldCount: 630, rating: "4.8" },
  { id: 326, name: "Đầu lọc thẻ nhớ đa năng Type-C và USB 3.0", price: 120000, oldPrice: 200000, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300", soldCount: 1300, rating: "4.7" },
  { id: 327, name: "Giá đỡ Laptop nhôm nguyên khối tản nhiệt tốt", price: 420000, oldPrice: 650000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300", soldCount: 880, rating: "4.9" },
  { id: 328, name: "Cáp chia âm thanh Audio 3.5mm cho tai nghe và mic", price: 80000, oldPrice: 150000, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300", soldCount: 5000, rating: "4.8" },
  { id: 329, name: "Tẩu nghe nhạc MP3 Bluetooth cho xe hơi ô tô", price: 290000, oldPrice: 450000, image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300", soldCount: 750, rating: "4.6" },
  { id: 330, name: "Đèn viền màn hình máy tính bảo vệ mắt chống lóa", price: 690000, oldPrice: 1100000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", soldCount: 390, rating: "4.9" }
];

export default function HomePage() {
  const { addToCart } = useCart();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 15, seconds: 40 });
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const shortsContainerRef = useRef(null);

  useEffect(() => {
    const bannerTimer = setInterval(() => setCurrentBanner(p => (p === bannerImages.length - 1 ? 0 : p + 1)), 3000);
    const countdownTimer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else { minutes = 59; if (hours > 0) hours--; }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => { clearInterval(bannerTimer); clearInterval(countdownTimer); };
  }, []);

  const handleScrollShorts = () => {
    if (shortsContainerRef.current) {
      const container = shortsContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.querySelector('.shorts-card').offsetWidth + 16;
      setActiveVideoIndex(Math.round(scrollLeft / cardWidth));
    }
  };

  const nextBanner = () => setCurrentBanner((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
  const prevBanner = () => setCurrentBanner((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  const handleAddToCart = (product) => addToCart(product);

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-sans text-gray-800 overflow-x-hidden relative">
      

      <main className="max-w-[1280px] mx-auto px-2 md:px-4 py-2 md:py-3">
        
        {/* QUẢNG CÁO NỔI & BANNERS */}
        <div className="relative mb-4 md:mb-6">
          <a href="#" className="hidden xl:block absolute right-full mr-4 top-0 w-[160px] 2xl:w-[200px] z-10 hover:-translate-y-1 transition-transform duration-300">
            <img src="/assets/bannermini-left.jpg" alt="QC Trái" className="w-full h-[500px] object-cover rounded-xl shadow-md border border-gray-200" />
          </a>
          <a href="#" className="hidden xl:block absolute left-full ml-4 top-0 w-[160px] 2xl:w-[200px] z-10 hover:-translate-y-1 transition-transform duration-300">
            <img src="/assets/bannermini-right.jpg" alt="QC Phải" className="w-full h-[500px] object-cover rounded-xl shadow-md border border-gray-200" />
          </a>

          <div className="bg-[#FFF8D6] rounded-xl p-2 mb-3 flex items-center justify-between text-[10px] md:text-xs font-semibold text-gray-800 border border-yellow-200 overflow-x-auto whitespace-nowrap gap-4 md:gap-0 scrollbar-hide">
            <div className="flex items-center gap-1.5 shrink-0"><ShieldCheck size={16} className="text-black shrink-0" /><span>CHÍNH HÃNG - XUẤT VAT ĐẦY ĐỦ</span></div>
            <div className="flex items-center gap-1.5 shrink-0"><RefreshCw size={16} className="text-black shrink-0" /><span>THU CŨ LÊN ĐỜI - TRẢ GÓP 0%</span></div>
            <div className="flex items-center gap-1.5 shrink-0"><Truck size={16} className="text-black shrink-0" /><span>GIAO NHANH - FREESHIP ĐƠN 500K</span></div>
            <div className="flex items-center gap-1.5 shrink-0"><RotateCcw size={16} className="text-black shrink-0" /><span>45 NGÀY MIỄN PHÍ 1 ĐỔI 1</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="hidden md:block md:col-span-3 relative z-40 group/sidebar h-[380px]">
              <div className="bg-white rounded-xl shadow-sm p-2 flex flex-col justify-between text-xs h-full relative z-20">
                {sidebarCategories && sidebarCategories.map((cat) => (
  <div key={cat.id} className="group/item">
    <Link 
      to={cat.path || (cat.id === 4 ? '/thu-cu-doi-moi' : `/category/${cat.id}`)} 
      className="flex items-center justify-between p-1.5 hover:bg-yellow-50 rounded-lg transition-colors font-medium text-gray-700 group-hover/item:text-black group-hover/item:bg-yellow-100"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-gray-500 group-hover/item:text-black">
          {iconMap[cat.icon] || <Smartphone size={16} />}
        </span>
        <span>{cat.name}</span>
      </div>
    </Link>
  </div>
))}
              </div>
            </div>

            <div className="col-span-1 md:col-span-9 relative rounded-xl overflow-hidden shadow-sm h-[200px] sm:h-[300px] md:h-[380px] group">
              {bannerImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Banner ${idx}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${currentBanner === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
              ))}
              <button onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full text-black opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextBanner} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full text-black opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {bannerImages.map((_, idx) => (
                  <span key={idx} onClick={() => setCurrentBanner(idx)} className={`rounded-full cursor-pointer transition-all ${currentBanner === idx ? 'w-3 h-3 bg-yellow-400 border border-white shadow-sm' : 'w-2 h-2 bg-white/60 hover:bg-white'}`}></span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ICON TRÒN DƯỚI BANNER */}
        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm mb-4 md:mb-6 mt-4">
          <div className="flex md:grid md:grid-cols-9 gap-3 md:gap-2 overflow-x-auto scrollbar-hide text-center">
            {quickCategories && quickCategories.map((item) => (
              <Link 
                key={item.id} 
                to={item.path || `/category/${item.id}`} 
                className="flex flex-col items-center gap-1.5 shrink-0 w-16 md:w-auto group cursor-pointer"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-100 p-1 flex items-center justify-center border border-gray-100 group-hover:border-yellow-400 transition-all shadow-sm">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="text-[10px] md:text-[11px] font-semibold text-gray-700 group-hover:text-red-600 line-clamp-1">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ĐẠI LÝ ỦY QUYỀN CHÍNH HÃNG */}
        <div className="mb-10 mt-12">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-base md:text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-sm"></span> ĐẠI LÝ ỦY QUYỀN CHÍNH HÃNG
            </h2>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 pt-10 pb-8 pl-8 pr-6 md:px-6 md:overflow-visible overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0">
            {ecomStores.map((store) => (
              <a key={store.id} href={store.link} target="_blank" rel="noopener noreferrer" className={`w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center relative block rounded-[20px] p-6 pb-5 bg-[#FAFAFA] border-2 ${store.borderColor} shadow-sm ${store.shadowHover} transform group-hover:-translate-y-2 group-hover:scale-[1.02] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-10 hover:z-20 group`}>
                <div className="absolute -top-8 -left-5 md:-left-6 w-[76px] h-[76px] bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 z-30">
                  <img src={store.logo} alt={store.platform} className="w-[46px] h-[46px] object-contain" />
                </div>
                <div className="relative z-20">
                  <div className="ml-14 mb-4 mt-1">
                    <span className={`inline-block ${store.badgeColor} text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider mb-1 shadow-sm`}>{store.shopBadge}</span>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-black">{store.name}</h3>
                  </div>
                  <div className="bg-white rounded-xl p-3.5 flex items-center justify-between shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow mb-5">
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[13px] md:text-sm font-black text-black flex items-center gap-1">{store.rating} <Star size={12} className="text-yellow-400 fill-yellow-400 -mt-0.5" /></span>
                      <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase mt-1">Đánh giá</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[13px] md:text-sm font-black text-red-600">{store.sold}</span>
                      <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase mt-1">Đã bán</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[13px] md:text-sm font-black text-black">{store.response}</span>
                      <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase mt-1">Phản hồi</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* REVIEW SẢN PHẨM MỚI NHẤT */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-sm"></span> REVIEW SẢN PHẨM MỚI NHẤT
            </h2>
            <a href="https://www.youtube.com/@tritechchannel" className="flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
              <Play size={18} /> Kênh YouTube
            </a>
          </div>
          <div className="relative w-full rounded-[20px] shadow-sm border border-gray-200 bg-white p-2 md:p-3 hover:shadow-md transition-shadow">
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/RIDVNiNebt4" 
                title="YouTube video player" 
                frameBorder="0" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* SẢN PHẨM HOT */}
        <div className="mb-10">
          <h2 className="text-base md:text-xl font-black text-gray-900 mb-4 uppercase tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-600 rounded-sm"></span> Sản phẩm hot
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {products && products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* FLASH SALE & YOUTUBE SHORTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-5 bg-[#111111] rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col justify-between border border-gray-800">
            <div className="flex items-center justify-between mb-4 text-white">
              <div>
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-wider drop-shadow-md text-white flex items-center gap-2">
                  <Zap size={22} className="text-yellow-400 fill-yellow-400 animate-bounce" /> FLASH SALE
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-yellow-400 mt-1">
                  <Clock size={13} /> Kết thúc sau: 
                  <span className="bg-red-600 px-2 py-0.5 rounded text-white tracking-widest font-mono border border-red-500 animate-pulse">
                    {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {bestPricesToday.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-3 flex flex-col justify-between shadow-lg relative group cursor-pointer border border-yellow-400/30 hover:border-yellow-400">
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-0.5 animate-pulse">
                    <Flame size={10} fill="currentColor" /> GIẢM SỐC
                  </span>
                  <div className="relative w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center p-2 mt-5">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-[11px] md:text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{item.name}</h3>
                    <div className="mt-2">
                      <span className="text-xs md:text-sm font-black text-red-600 block leading-none">{item.price.toLocaleString('vi-VN')}đ</span>
                      <span className="text-[10px] text-gray-400 line-through">{item.oldPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl p-4 md:p-6 shadow-2xl border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg md:text-2xl font-black text-gray-900 uppercase tracking-tight">Video review về sản phẩm</h2>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-bold text-red-600 hover:underline flex items-center gap-1">
                  Xem thêm <ArrowRight size={14} />
                </a>
              </div>
              <p className="text-xs md:text-sm text-gray-500 font-medium mb-3">
                Trải nghiệm thực tế, đánh giá chi tiết tính năng từ <span className="text-red-600 font-bold">Tritech Channel</span>.
              </p>
            </div>
            
            <div ref={shortsContainerRef} onScroll={handleScrollShorts} className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-hide">
              {youtubeShortsVideos.map((video, idx) => (
                <div key={video.id} onClick={() => { if (idx === youtubeShortsVideos.length - 1) window.open('https://www.youtube.com', '_blank'); }} className="shorts-card w-[300px] sm:w-[350px] md:w-[370px] shrink-0 snap-start bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between relative border-2 border-gray-800 cursor-pointer group">
                  <div className="relative w-full aspect-[9/16] bg-black">
                    <iframe src={video.shortsUrl} title={video.title} className="w-full h-full border-0 absolute inset-0 pointer-events-auto" allowFullScreen></iframe>
                  </div>
                  <div className="bg-red-600 text-white font-extrabold text-xs sm:text-sm py-3.5 text-center flex items-center justify-center gap-1.5 shadow-inner group-hover:bg-red-700 transition-colors">
                    <span>🛒</span> {idx === 4 ? 'Xem thêm trên YouTube ➔' : 'Mua ngay'}
                  </div>
                  <div className="bg-white p-4 flex items-center gap-3 border-t border-gray-800">
                    <img src={video.productImage} alt={video.productName} className="w-12 h-12 object-contain rounded-2xl bg-gray-50 p-1 shrink-0 border border-gray-100 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">{video.productName}</h4>
                      <p className="text-xs sm:text-sm font-black text-red-600 leading-none mt-1.5">{video.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase animate-pulse">← Vuốt ngang để xem thêm video →</span>
              <div className="flex justify-center gap-2">
                {youtubeShortsVideos.map((_, i) => (
                  <span key={i} className={`h-2 rounded-full transition-all duration-300 ${activeVideoIndex === i ? 'w-8 bg-red-600 shadow-sm' : 'w-2 bg-gray-300'}`}></span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BANNER ƯU ĐÃI SINH VIÊN */}
        <div className="mb-10 bg-white rounded-3xl p-5 md:p-8 shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="max-w-xl">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mb-2 shadow-sm"><Sparkles size={12} /> ƯU ĐÃI ĐẶC QUYỀN HỌC SINH - SINH VIÊN</span>
              <h2 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">ĐỒNG HỒ & ÂM THANH - GIẢM SỐC ĐẾN <span className="text-red-600">50%+</span></h2>
              <p className="text-xs md:text-sm text-gray-600 mt-2 font-medium">Sở hữu ngay hệ sinh thái Apple, tai nghe và đồng hồ thông minh chính hãng với mức giá sinh viên cực hời.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide">
              <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 w-[260px] shadow-sm">
                <img src="https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=200" alt="Apple Watch" className="w-16 h-16 object-cover rounded-xl" />
                <div><h4 className="text-xs font-black text-gray-900">Apple Watch SE 3</h4><p className="text-xs font-black text-red-600 mt-1">Chỉ từ 6.290.000đ</p></div>
              </div>
              <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 w-[260px] shadow-sm">
                <img src="https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=200" alt="AirPods" className="w-16 h-16 object-cover rounded-xl" />
                <div><h4 className="text-xs font-black text-gray-900">AirPods 4 ANC</h4><p className="text-xs font-black text-red-600 mt-1">Chỉ từ 2.890.000đ</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* SẢN PHẨM GỢI Ý TAB */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-sm"></span> GỢI Ý HÔM NAY CHO BẠN
            </h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[{ id: 'all', label: '🔥 Tất cả gợi ý' }, { id: 'apple', label: '🍎 Apple Ecosystem' }, { id: 'audio', label: '🎧 Tai nghe & Loa' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === tab.id ? 'bg-red-600 text-white shadow-red-600/20 shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>{tab.label}</button>
            ))}
          </div>
        </div>

        {/* LƯỚI 30 SẢN PHẨM KHAI BÁO THỦ CÔNG ĐỂ GIỮ LẠI ĐỘ DÀI CODE CỦA ÔNG */}
        <div className="mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {thirtyProducts.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-3 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group cursor-pointer border border-gray-100">
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm">CHÍNH HÃNG</span>
                <div className="relative w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center p-2 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="mt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">{item.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-bold text-yellow-500 flex items-center gap-0.5"><Star size={10} className="fill-yellow-400 text-yellow-400" /> {item.rating}</span>
                      <span className="text-[10px] text-gray-400">| Đã bán {item.soldCount}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <span className="text-xs md:text-sm font-black text-red-600 block leading-none">{item.price.toLocaleString('vi-VN')}đ</span>
                      <span className="text-[10px] text-gray-400 line-through mt-0.5 block">{item.oldPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }} className="bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded-xl text-xs font-extrabold transition-all shadow-sm border border-yellow-200 transform hover:scale-105">🛒</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* KHÔI PHỤC NÚT XEM THÊM */}
          <div className="flex justify-center mt-8">
            <button className="bg-white hover:bg-gray-50 text-gray-900 font-black text-xs px-8 py-3.5 rounded-2xl shadow-md border border-gray-200 transition-all hover:scale-105">
              XEM THÊM SẢN PHẨM KHÁC ▾
            </button>
          </div>
        </div>

        {/* BANNER 100 NGÀY ĐỔI TRẢ */}
        <div className="mb-10 w-full rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:opacity-95 transition-opacity">
           <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=200&fit=crop" alt="100 Ngày Đổi Trả" className="w-full h-[120px] md:h-[160px] object-cover" />
        </div>

        {/* TIN TỨC CÔNG NGHỆ */}
        <div className="mb-10 bg-white rounded-[24px] p-5 md:p-6 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase">Tin tức</h2>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {newsArticles.map((article) => (
                 <a key={article.id} href="#" className="group cursor-pointer">
                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-3 bg-gray-50 border border-gray-100">
                       <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">{article.title}</h3>
                 </a>
              ))}
           </div>
        </div>

        {/* ========================================================== */}
        {/* THANH CAM KẾT SẢN PHẨM (Khôi phục) */}
        {/* ========================================================== */}
        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
           <div className="bg-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <ShieldCheck className="text-orange-500 shrink-0" size={28} strokeWidth={2.5} />
              <span className="text-[11px] md:text-sm text-gray-600 leading-tight">SẢN PHẨM <br/><span className="font-black text-gray-900">CHÍNH HÃNG</span></span>
           </div>
           <div className="bg-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <RefreshCw className="text-orange-500 shrink-0" size={28} strokeWidth={2.5} />
              <span className="text-[11px] md:text-sm text-gray-600 leading-tight">BẢO HÀNH 1 ĐỔI 1 <br/><span className="font-black text-gray-900">TOÀN QUỐC</span></span>
           </div>
           <div className="bg-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <PhoneCall className="text-orange-500 shrink-0" size={28} strokeWidth={2.5} />
              <span className="text-[11px] md:text-sm text-gray-600 leading-tight">HOTLINE HỖ TRỢ <br/><span className="font-black text-gray-900">0325477841</span></span>
           </div>
           <div className="bg-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <RotateCcw className="text-orange-500 shrink-0" size={28} strokeWidth={2.5} />
              <span className="text-[11px] md:text-sm text-gray-600 leading-tight">THỦ TỤC ĐỔI TRẢ <br/><span className="font-black text-gray-900">DỄ DÀNG</span></span>
           </div>
        </div>
      </main>

      

      {/* ========================================================== */}
      {/* WIDGET LIÊN HỆ NỔI */}
      {/* ========================================================== */}
      <div className="fixed bottom-4 right-4 z-50 group">
        <div className="absolute bottom-full right-0 mb-3 flex flex-col items-end gap-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <a href="tel:0325477841" className="flex items-center gap-2 group/ai cursor-pointer">
            <span className="bg-black/80 text-white text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
              Hỏi Trợ lý AI Tritech
            </span>
            <div className="w-11 h-11 md:w-12 md:h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white">
              <Bot className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
          </a>
          <a href="https://zalo.me/0824654321" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group/zalo cursor-pointer">
            <span className="bg-black/80 text-white text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/zalo:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
              Chat Zalo NV Tư Vấn
            </span>
            <div className="w-11 h-11 md:w-12 md:h-12 bg-[#0068FF] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white">
              <span className="text-white font-black text-[10px] md:text-xs tracking-wider">Zalo</span>
            </div>
          </a>
        </div>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-[10px] md:text-xs px-4 py-2.5 md:px-5 md:py-3.5 rounded-full shadow-lg flex items-center gap-2 border-2 border-white transform hover:scale-105 transition-transform z-10 relative">
          <PhoneCall size={16} className="animate-pulse" /> LIÊN HỆ
        </button>
      </div>

    </div>
  );
}