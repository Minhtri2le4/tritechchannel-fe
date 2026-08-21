import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, RefreshCw, Truck, MapPin, CheckCircle, 
  ChevronRight, ShoppingBag, Zap, Award, Check
} from 'lucide-react';
import { categoryProducts } from '../data/categoryData';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Tìm sản phẩm theo ID (nếu không thấy lấy mặc định sản phẩm đầu tiên làm mẫu)
  const productData = categoryProducts.find(p => String(p.id) === String(id)) || categoryProducts[0];

  // State quản lý lựa chọn của khách hàng
  const [selectedStorage, setSelectedStorage] = useState('512GB - Máy Đẹp');
  const [selectedColor, setSelectedColor] = useState('Cam Vũ Trụ');
  const [activeImage, setActiveImage] = useState(productData.image);
  const [showNotification, setShowNotification] = useState(false);

  // Danh sách dung lượng giả lập cho sản phẩm cao cấp
  const storages = [
    { name: '256GB - Cũ 99%', priceOffset: -3000000 },
    { name: '256GB - Máy Đẹp', priceOffset: -1500000 },
    { name: '512GB - Cũ 99%', priceOffset: -1000000 },
    { name: '512GB - Máy Đẹp', priceOffset: 0 },
    { name: '1TB - Máy Đẹp', priceOffset: 3500000 },
  ];

  // Danh sách màu sắc giả lập
  const colors = [
    { name: 'Cam Vũ Trụ', hex: '#d97706', img: productData.image },
    { name: 'Xanh Đậm', hex: '#1e3a8a', img: productData.image },
    { name: 'Bạc Titan', hex: '#94a3b8', img: productData.image },
  ];

  // Danh sách ảnh thumbnail giả lập
  const productImages = [
    productData.image,
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1695048065059-472e3408a287?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1695048132964-e2808728d844?auto=format&fit=crop&w=600&q=80',
  ];

  // Tính toán giá tiền theo tùy chọn
  const basePrice = productData.price || 35990000;
  const storageExtra = storages.find(s => s.name === selectedStorage)?.priceOffset || 0;
  const currentPrice = basePrice + storageExtra;
  const originalPrice = Math.round(currentPrice * 1.24); // Giá gốc cao hơn ~24%

  // Xử lý thêm vào giỏ hàng và mua ngay
  const handleBuyNow = () => {
    const itemToAdd = {
      ...productData,
      id: `${productData.id}-${selectedStorage}-${selectedColor}`,
      name: `${productData.name} (${selectedStorage} - ${selectedColor})`,
      price: currentPrice,
      image: activeImage,
      quantity: 1
    };
    addToCart(itemToAdd);
    navigate('/cart');
  };

  const handleAddToCartOnly = () => {
    const itemToAdd = {
      ...productData,
      id: `${productData.id}-${selectedStorage}-${selectedColor}`,
      name: `${productData.name} (${selectedStorage} - ${selectedColor})`,
      price: currentPrice,
      image: activeImage,
      quantity: 1
    };
    addToCart(itemToAdd);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-4 px-2 md:px-4">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Breadcrumb đường dẫn */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 overflow-x-auto whitespace-nowrap pb-1">
          <Link to="/" className="hover:text-black">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="hover:text-black cursor-pointer">Điện thoại</span>
          <ChevronRight size={12} />
          <span className="hover:text-black cursor-pointer">APPLE IPHONE</span>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-semibold">{productData.name}</span>
        </div>

        {/* Thông báo thêm giỏ hàng thành công */}
        {showNotification && (
          <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle size={20} />
            <span className="text-xs font-bold">Đã thêm sản phẩm vào giỏ hàng thành công!</span>
          </div>
        )}

        {/* Khung chính sản phẩm */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT TRÁI: Hình ảnh sản phẩm & Slide */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 aspect-square flex items-center justify-center p-4 group">
              <img 
                src={activeImage} 
                alt={productData.name} 
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow">
                GIỜ VÀNG GIÁ SỐC
              </span>
            </div>

            {/* Danh sách ảnh nhỏ (Thumbnails) */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`border-2 rounded-xl overflow-hidden aspect-square cursor-pointer transition-all bg-gray-50 p-1 flex items-center justify-center ${activeImage === img ? 'border-amber-500 shadow-md ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            {/* Cam kết dịch vụ nhanh */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-800 font-bold">
                <ShieldCheck size={16} className="text-amber-600" />
                <span>CHÍNH HÃNG - XUẤT VAT ĐẦY ĐỦ</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-amber-200/60">
                <div className="flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-blue-600" />
                  <span>45 ngày miễn phí 1 đổi 1</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-emerald-600" />
                  <span>Giao nhanh miễn phí 500K</span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT GIỮA: Thông tin cấu hình, giá & Tùy chọn */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-yellow-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  TRITECH CHUẨN 68 BƯỚC
                </span>
                <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                  <Check size={14} /> Còn hàng tại showroom
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">
                {productData.name}
              </h1>
            </div>

            {/* Giá tiền */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-black text-red-600">
                {currentPrice.toLocaleString()}đ
              </span>
              <span className="text-sm text-gray-400 line-through font-semibold">
                {originalPrice.toLocaleString()}đ
              </span>
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                -24%
              </span>
            </div>

            {/* Box Thu Cũ Lên Đời */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl p-3 text-black shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs uppercase flex items-center gap-1">
                  <Zap size={14} className="fill-black" /> Thu cũ lên đời - Trợ giá đến 4.000.000đ
                </span>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold">15 Phút</span>
              </div>
              <p className="text-[11px] font-medium text-gray-900 mb-2">
                Chỉ từ <span className="font-black text-red-700 text-sm">{(currentPrice - 4000000).toLocaleString()}đ</span>. Thu máy cũ giá cao không thủ tục rườm rà.
              </p>
              <button 
                onClick={() => navigate('/thu-cu-doi-moi')} 
                className="w-full bg-black hover:bg-gray-900 text-[#FFD400] font-bold text-xs py-2 rounded-xl transition-colors shadow"
              >
                Định giá máy cũ ngay →
              </button>
            </div>

            {/* Chọn dung lượng */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Dung lượng phiên bản:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {storages.map((store, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedStorage(store.name)}
                    className={`border rounded-xl p-2 text-left transition-all ${selectedStorage === store.name ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'}`}
                  >
                    <p className="font-bold text-xs">{store.name}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${selectedStorage === store.name ? 'text-yellow-400' : 'text-red-600'}`}>
                      {(basePrice + store.priceOffset).toLocaleString()}đ
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn màu sắc */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Màu sắc: <span className="text-black font-extrabold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setActiveImage(color.img);
                    }}
                    className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl transition-all ${selectedColor === color.name ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'}`}
                  >
                    <span className="w-4 h-4 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: color.hex }}></span>
                    <span className="text-xs font-semibold">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nút Mua Hàng Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button 
                onClick={handleBuyNow}
                className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all text-center flex flex-col justify-center cursor-pointer active:scale-95"
              >
                <span className="text-sm">MUA NGAY</span>
                <span className="text-[10px] font-normal opacity-90">Giao tận nơi hoặc nhận tại cửa hàng</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleAddToCartOnly}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold py-2 px-2 rounded-xl shadow transition-all flex flex-col items-center justify-center text-center cursor-pointer"
                >
                  <ShoppingBag size={16} />
                  <span className="text-[11px] mt-0.5">Thêm giỏ hàng</span>
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 px-2 rounded-xl shadow transition-all flex flex-col items-center justify-center text-center cursor-pointer"
                >
                  <span className="text-xs font-bold">TRẢ GÓP 0%</span>
                  <span className="text-[9px] opacity-90">Duyệt nhanh 5 phút</span>
                </button>
              </div>
            </div>

            {/* Khuyến mãi đặc biệt */}
            <div className="border border-amber-300 bg-amber-50/50 rounded-2xl p-3 text-xs space-y-2 mt-1">
              <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <Award size={15} className="text-amber-600" />
                <span>ƯU ĐÃI ĐẶC BIỆT KHI MUA HÀNG:</span>
              </div>
              <ul className="space-y-1 text-gray-700 text-[11px] pl-4 list-disc">
                <li>Giảm ngay <span className="font-bold text-red-600">200.000đ</span> khi mua vào khung giờ vàng (09:00 - 15:00 hàng ngày).</li>
                <li>Tặng voucher giảm giá 15% cho lần mua phụ kiện tiếp theo tại Tritech Channel.</li>
                <li>Miễn phí dán cường lực và ốp lưng cao cấp bảo vệ máy trọn đời.</li>
              </ul>
            </div>

            {/* Kho hàng còn hàng */}
            <div className="border border-gray-200 rounded-2xl p-3 text-xs space-y-2">
              <div className="font-bold text-gray-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><MapPin size={15} className="text-red-600" /> Xem còn hàng tại hệ thống cửa hàng:</span>
                <span className="text-emerald-600 font-extrabold text-[11px]">Còn hàng (3 cơ sở)</span>
              </div>
              <div className="space-y-1.5 pt-1 text-[11px] text-gray-600 border-t border-gray-100">
                <p className="flex items-center justify-between">
                  <span>📍 947 Quang Trung, P. An Hội Tây, TP.HCM</span>
                  <span className="text-emerald-600 font-bold">Sẵn hàng</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>📍 1247 Đường 3 Tháng 2, P. Minh Phụng, TP.HCM</span>
                  <span className="text-emerald-600 font-bold">Sẵn hàng</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>📍 121 Chu Văn An, P. Bình Thạnh, TP.HCM</span>
                  <span className="text-emerald-600 font-bold">Sẵn hàng</span>
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}