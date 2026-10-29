import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, Truck, MapPin, CheckCircle, ChevronRight, ShoppingCart, Zap, Check, Loader2,
  Star, Minus, Plus, MessageCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import useFetch from '../hooks/useFetch';
import useSeo, { SITE_URL } from '../hooks/useSeo';
import { shopApi } from '../services/shop';
import { assetUrl, imgFallback } from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, loading, error } = useFetch(() => shopApi.product(id), [id]);

  if (loading && !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-sm text-gray-600">
        <p>{error?.status === 404 ? 'Sản phẩm không tồn tại hoặc đã ngừng bán.' : error?.message}</p>
        <Link to="/" className="bg-[#FFD400] px-5 py-2 rounded-xl font-bold text-xs">Về trang chủ</Link>
      </div>
    );
  }
  // key: đổi sản phẩm thì reset lựa chọn dung lượng / màu
  return <ProductDetailView key={product.id} productData={product} />;
}

// Một dòng thông tin kiểu Shopee: nhãn xám bên trái, nội dung bên phải
function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[110px_1fr] gap-3 items-start text-sm">
      <span className="text-gray-500 pt-1.5">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ProductDetailView({ productData }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const storages = productData.variants || [];
  const colors = productData.colors || [];

  // Mặc định chọn phiên bản & màu đầu tiên
  const [selectedVariantId, setSelectedVariantId] = useState(storages[0]?.id ?? null);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '');
  const [activeImage, setActiveImage] = useState(assetUrl(productData.image));
  const [showNotification, setShowNotification] = useState(false);

  // Ảnh thumbnail: ảnh đại diện + ảnh phụ (bỏ trùng)
  const productImages = [...new Set([productData.image, ...(productData.images || [])].filter(Boolean))].map(assetUrl);

  // Giá theo phiên bản đã chọn
  const selectedVariant = storages.find((v) => v.id === selectedVariantId) || null;
  const currentPrice = selectedVariant?.price ?? productData.price;
  const originalPrice = selectedVariant ? selectedVariant.originalPrice : productData.originalPrice;
  const discountPercent = originalPrice > currentPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;
  const stock = selectedVariant ? selectedVariant.stock : productData.stock;
  const inStock = stock > 0;

  const productPath = `/product/${productData.slug || productData.id}`;
  const absImage = (src) => (src && /^https?:/.test(src) ? src : `${SITE_URL}${src || ''}`);
  const minPrice = storages.length ? Math.min(...storages.map((v) => v.price)) : productData.price;
  const anyStock = storages.length ? storages.some((v) => v.stock > 0) : productData.stock > 0;
  useSeo({
    title: `${productData.name} - Giá ${minPrice.toLocaleString('vi-VN')}đ`,
    description:
      productData.description ||
      `Mua ${productData.name}${productData.brand ? ` chính hãng ${productData.brand}` : ''} giá ${minPrice.toLocaleString('vi-VN')}đ tại TriTech Channel. Giao hàng toàn quốc, bảo hành 1 đổi 1, kiểm tra hàng trước khi nhận.`,
    image: absImage(productImages[0]),
    path: productPath,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productData.name,
        image: productImages.map(absImage),
        description: productData.description || productData.name,
        sku: String(productData.id),
        ...(productData.brand && { brand: { '@type': 'Brand', name: productData.brand } }),
        // Không khai báo điểm đánh giá: số sao hiện tại chưa phải đánh giá thật của khách,
        // Google phạt nếu dữ liệu đánh giá không có đánh giá thật đi kèm.
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}${productPath}`,
          priceCurrency: 'VND',
          price: minPrice,
          availability: anyStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: 'TriTech Channel' },
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` },
          ...(productData.category
            ? [{ '@type': 'ListItem', position: 2, name: productData.category.name, item: `${SITE_URL}/category/${productData.category.id}` }]
            : []),
          { '@type': 'ListItem', position: productData.category ? 3 : 2, name: productData.name, item: `${SITE_URL}${productPath}` },
        ],
      },
    ],
  });

  // Trợ giá thu cũ chỉ hợp lý với máy giá trị cao
  const TRADE_IN_CATEGORIES = [1, 2, 8];
  const showTradeIn = TRADE_IN_CATEGORIES.includes(productData.categoryId) && currentPrice >= 5000000;

  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const maxQty = Math.max(1, Math.min(stock || 1, 99));
  const qty = Math.min(quantity, maxQty);
  const longDesc = (productData.description || '').length > 600;
  const perks = productData.perks?.length
    ? productData.perks
    : ['Miễn phí dán cường lực khi mua điện thoại, máy tính bảng', 'Tặng voucher 15% cho lần mua phụ kiện tiếp theo'];

  const addSelected = () => {
    if (!inStock) {
      alert('Phiên bản này tạm hết hàng, vui lòng chọn phiên bản khác!');
      return false;
    }
    addToCart(productData, qty, selectedColor, selectedVariant);
    return true;
  };

  // Xử lý thêm vào giỏ hàng và mua ngay
  const handleBuyNow = () => {
    if (addSelected()) navigate('/cart');
  };

  const handleAddToCartOnly = () => {
    if (!addSelected()) return;
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const optionClass = (active, disabled) =>
    `relative border rounded-md px-3 py-1.5 text-sm transition-colors ${
      active ? 'border-red-500 text-red-600 bg-red-50/40' : 'border-gray-200 text-gray-800 hover:border-red-400'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`;

  return (
    <div className="bg-gray-100 min-h-screen py-4 px-2 md:px-4">
      <div className="max-w-[1280px] mx-auto">

        {/* Breadcrumb đường dẫn */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 overflow-x-auto whitespace-nowrap pb-1">
          <Link to="/" className="hover:text-black">Trang chủ</Link>
          <ChevronRight size={12} />
          {productData.category && (
            <>
              <Link to={`/category/${productData.category.id}`} className="hover:text-black">{productData.category.name}</Link>
              <ChevronRight size={12} />
            </>
          )}
          {productData.brand && (
            <>
              <span>{productData.brand}</span>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-gray-900 font-semibold">{productData.name}</span>
        </div>

        {/* Thông báo thêm giỏ hàng thành công */}
        {showNotification && (
          <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle size={20} />
            <span className="text-xs font-bold">Đã thêm {qty} sản phẩm vào giỏ hàng!</span>
          </div>
        )}

        {/* Khung chính: ảnh bên trái, khung mua hàng bên phải (giống Shopee) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CỘT TRÁI: Hình ảnh sản phẩm */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 aspect-square flex items-center justify-center p-4 group">
              <img
                onError={imgFallback}
                src={activeImage}
                alt={productData.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow">
                  -{discountPercent}%
                </span>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {productImages.map((img, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveImage(img)}
                  onMouseEnter={() => setActiveImage(img)}
                  className={`shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 rounded-lg overflow-hidden bg-gray-50 p-1 ${activeImage === img ? 'border-red-500' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img onError={imgFallback} src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: Khung mua hàng */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-snug">{productData.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-500">
                {productData.reviewsCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="text-red-600 font-semibold underline">{productData.rating.toFixed(1)}</span>
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-gray-300">|</span>
                    <span><b className="text-gray-800">{productData.reviewsCount}</b> đánh giá</span>
                  </span>
                )}
                {productData.soldCount > 0 && <span>Đã bán <b className="text-gray-800">{productData.soldCount.toLocaleString('vi-VN')}</b></span>}
                {productData.brand && <span>Thương hiệu: <b className="text-gray-800">{productData.brand}</b></span>}
              </div>
            </div>

            {/* Giá */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl md:text-[34px] font-semibold text-red-600 leading-none">
                {currentPrice.toLocaleString('vi-VN')}<span className="text-xl align-top">₫</span>
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-base text-gray-400 line-through">{originalPrice.toLocaleString('vi-VN')}₫</span>
                  <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">-{discountPercent}%</span>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4 px-1">
              <Row label="Ưu đãi">
                <div className="flex flex-wrap gap-1.5">
                  {perks.map((p) => (
                    <span key={p} className="text-xs border border-red-300 text-red-600 bg-red-50/50 px-2 py-1 rounded">{p}</span>
                  ))}
                </div>
              </Row>

              <Row label="Vận chuyển">
                <div className="space-y-1 pt-1.5">
                  <p className="flex items-center gap-1.5 text-gray-800"><Truck size={16} className="text-emerald-600 shrink-0" /> Giao toàn quốc, miễn phí đơn từ 500K</p>
                  <p className="flex items-center gap-1.5 text-gray-500 text-xs"><MapPin size={14} className="shrink-0" /> Hoặc nhận trực tiếp tại Thanh Đa, Bình Thạnh (hẹn trước qua 0325 477 841)</p>
                </div>
              </Row>

              <Row label="An tâm mua">
                <p className="flex items-center gap-1.5 text-gray-800 pt-1.5">
                  <ShieldCheck size={16} className="text-red-500 shrink-0" />
                  Chính hãng 100% · 1 đổi 1 trong 45 ngày · Kiểm tra hàng khi nhận
                </p>
              </Row>

              {storages.length > 0 && (
                <Row label="Phiên bản">
                  <div className="flex flex-wrap gap-2">
                    {storages.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={v.stock <= 0}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={optionClass(selectedVariantId === v.id, v.stock <= 0)}
                      >
                        {v.label}
                        {selectedVariantId === v.id && <Check size={12} className="absolute -bottom-px -right-px bg-red-500 text-white rounded-tl" />}
                      </button>
                    ))}
                  </div>
                </Row>
              )}

              {colors.length > 0 && (
                <Row label="Màu sắc">
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color.name);
                          if (color.image) setActiveImage(assetUrl(color.image));
                        }}
                        className={`${optionClass(selectedColor === color.name, false)} flex items-center gap-2`}
                      >
                        {color.image ? (
                          <img src={assetUrl(color.image)} alt="" className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color.hex || '#e5e7eb' }} />
                        )}
                        {color.name}
                        {selectedColor === color.name && <Check size={12} className="absolute -bottom-px -right-px bg-red-500 text-white rounded-tl" />}
                      </button>
                    ))}
                  </div>
                </Row>
              )}

              <Row label="Số lượng">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button type="button" aria-label="Giảm" disabled={qty <= 1} onClick={() => setQuantity(qty - 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-50">
                      <Minus size={14} />
                    </button>
                    <input
                      value={qty}
                      inputMode="numeric"
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1))}
                      className="w-12 h-8 text-center text-sm border-x border-gray-300 outline-none"
                    />
                    <button type="button" aria-label="Tăng" disabled={qty >= maxQty} onClick={() => setQuantity(qty + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-50">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className={`text-sm ${inStock ? 'text-gray-500' : 'text-red-600 font-semibold'}`}>
                    {inStock ? 'Còn hàng' : 'Tạm hết hàng'}
                  </span>
                </div>
              </Row>
            </div>

            {/* Nút mua: máy tính hiện ở đây, điện thoại dùng thanh dính dưới đáy */}
            <div className="hidden md:flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCartOnly}
                disabled={!inStock}
                className="flex-1 max-w-[240px] flex items-center justify-center gap-2 border border-red-500 bg-red-50 text-red-600 font-semibold py-3 rounded-lg hover:bg-red-100 disabled:opacity-50 cursor-pointer"
              >
                <ShoppingCart size={18} /> Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 max-w-[240px] bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Mua ngay
              </button>
            </div>
            {productData.installment && (
              <p className="hidden md:block text-xs text-gray-500 -mt-2">Hỗ trợ trả góp 0% – chọn khi thanh toán hoặc gọi 0325 477 841.</p>
            )}

            {/* Box Thu Cũ Lên Đời – chỉ với máy (điện thoại, tablet, Macbook) giá từ 5 triệu */}
            {showTradeIn && (
              <button
                type="button"
                onClick={() => navigate('/thu-cu-doi-moi')}
                className="flex items-center justify-between gap-3 bg-[#FFD400] hover:bg-amber-400 rounded-xl px-4 py-2.5 text-left transition-colors"
              >
                <span className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Zap size={14} className="fill-black" /> Thu cũ lên đời – trợ giá đến 4.000.000đ, chỉ từ{' '}
                  <span className="text-red-700">{Math.max(currentPrice - 4000000, 0).toLocaleString('vi-VN')}đ</span>
                </span>
                <span className="text-xs font-bold whitespace-nowrap">Định giá →</span>
              </button>
            )}
          </div>
        </div>

        {/* CHI TIẾT & MÔ TẢ SẢN PHẨM – nằm riêng bên dưới như Shopee */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-4 p-4 md:p-6">
          <h2 className="bg-gray-50 -mx-1 px-3 py-2.5 rounded text-base md:text-lg font-semibold text-gray-900 uppercase">Chi tiết sản phẩm</h2>
          <dl className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] gap-y-3 text-sm mt-4 px-2">
            {productData.category && (
              <>
                <dt className="text-gray-500">Danh mục</dt>
                <dd><Link to={`/category/${productData.category.id}`} className="text-blue-700 hover:underline">{productData.category.name}</Link></dd>
              </>
            )}
            {productData.brand && (
              <>
                <dt className="text-gray-500">Thương hiệu</dt>
                <dd className="text-gray-800">{productData.brand}</dd>
              </>
            )}
            <dt className="text-gray-500">Bảo hành</dt>
            <dd className="text-gray-800">1 đổi 1 trong 45 ngày</dd>
            <dt className="text-gray-500">Kho hàng</dt>
            <dd className="text-gray-800">{inStock ? 'Còn hàng' : 'Tạm hết hàng'}</dd>
            <dt className="text-gray-500">Gửi từ</dt>
            <dd className="text-gray-800">TP. Hồ Chí Minh</dd>
          </dl>

          {productData.description && (
            <>
              <h2 className="bg-gray-50 -mx-1 px-3 py-2.5 rounded text-base md:text-lg font-semibold text-gray-900 uppercase mt-6">Mô tả sản phẩm</h2>
              <div className="relative mt-4 px-2">
                <div className={`text-sm text-gray-800 leading-relaxed whitespace-pre-line ${longDesc && !showFullDesc ? 'max-h-[420px] overflow-hidden' : ''}`}>
                  {productData.description}
                </div>
                {longDesc && !showFullDesc && (
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
              {longDesc && (
                <div className="text-center mt-3">
                  <button type="button" onClick={() => setShowFullDesc((v) => !v)} className="text-sm font-semibold text-red-600 border border-red-300 rounded-lg px-6 py-2 hover:bg-red-50">
                    {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sản phẩm cùng danh mục */}
        {productData.related?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base md:text-lg font-black text-gray-900 mb-3 uppercase">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {productData.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thanh mua hàng dính dưới đáy trên điện thoại (như app Shopee) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 flex h-14" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <a href="https://zalo.me/0325477841" target="_blank" rel="noopener noreferrer" className="w-16 flex flex-col items-center justify-center text-[10px] text-gray-600 border-r border-gray-200">
          <MessageCircle size={20} /> Chat
        </a>
        <button type="button" onClick={handleAddToCartOnly} disabled={!inStock} className="flex-1 flex flex-col items-center justify-center bg-amber-400 text-black text-[11px] font-semibold disabled:opacity-50">
          <ShoppingCart size={18} /> Thêm vào giỏ
        </button>
        <button type="button" onClick={handleBuyNow} disabled={!inStock} className="flex-[1.4] bg-red-600 text-white text-sm font-bold disabled:opacity-50">
          Mua ngay
        </button>
      </div>
    </div>
  );
}