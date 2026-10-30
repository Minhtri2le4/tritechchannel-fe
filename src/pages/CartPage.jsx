import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, MapPin, QrCode, 
  ChevronRight, ChevronDown, Truck, Check, Copy, ShoppingBag, Loader2, CheckCircle2, Zap
} from 'lucide-react';
import { useCart } from '../context/CartContext'; // Dynamic import Context
import { shopApi } from '../services/shop';
import { assetUrl, imgFallback } from '../lib/api';
import useSeo from '../hooks/useSeo';
import AddressPicker from '../components/AddressPicker';
import CartOptionPicker from '../components/CartOptionPicker';
import SwipeRow from '../components/SwipeRow';

// Giao hỏa tốc: chỉ trong TP. Hồ Chí Minh, cộng phí này (server tính lại khi đặt hàng)
const HCM = 'Thành phố Hồ Chí Minh';
const EXPRESS_FEE = 30000;
import { formatAddress } from '../lib/address';

// Tính tiền giảm theo mã đã áp dụng (server sẽ tính lại khi đặt hàng)
const calcCouponDiscount = (coupon, subtotal) => {
  if (!coupon || subtotal < coupon.minOrder) return 0;
  let amount = coupon.type === 'PERCENT' ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount != null) amount = Math.min(amount, coupon.maxDiscount);
  return Math.min(amount, subtotal);
};

export default function CartPage() {
  useSeo({ title: 'Giỏ hàng', noindex: true });
  const {
    cartItems,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    removeItem,
    clearCart,
    removeSelected,
    changeOption
  } = useCart();
  // Món đang đổi phân loại (mở bảng chọn như Shopee)
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();
  const [express, setExpress] = useState(false);

  // State gọi API
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // State Form Checkout
  const [step, setStep] = useState('cart'); // 'cart' hoặc 'checkout'
  const [gender, setGender] = useState('Anh');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('home'); 
  const [addr, setAddr] = useState({ province: '', ward: '', street: '' });
  const [errors, setErrors] = useState({});
const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank'); 
  const [couponCode, setCouponCode] = useState('');
  const [copiedSTK, setCopiedSTK] = useState(false);

  // Thông tin Chuyển khoản của Shop
  const bankInfo = {
    bankName: "MB BANK (Ngân hàng Quân Đội)",
    accountName: "HỒ MINH TRÍ",
    accountNo: "200320047979",
    storeAddress: "Thanh Đa, Bình Thạnh, TP. Hồ Chí Minh"
  };

  const handleCopySTK = () => {
    navigator.clipboard.writeText(bankInfo.accountNo);
    setCopiedSTK(true);
    setTimeout(() => setCopiedSTK(false), 2000);
  };

  // Tính toán tổng tiền
  const selectedItems = cartItems.filter((i) => i.selected);
  const subTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = calcCouponDiscount(appliedCoupon, subTotal);
  const couponBelowMin = appliedCoupon && subTotal < appliedCoupon.minOrder;
  const isHcm = deliveryMethod === 'home' && addr.province === HCM;
  const expressActive = express && isHcm;
  const shippingFee = expressActive ? EXPRESS_FEE : 0;
  const total = subTotal - discount + shippingFee;

  // QR VietQR MB Bank
  const buildQrUrl = (amount, content) =>
    `https://img.vietqr.io/image/MB-${bankInfo.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  const qrUrl = buildQrUrl(total, `TT DH ${phone || 'TRITECH'}`);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponMessage('');
    try {
      const { data } = await shopApi.validateCoupon(code, subTotal);
      setAppliedCoupon(data);
      setCouponMessage(`Đã áp dụng mã ${data.code}`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMessage(err.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Kiểm tra thông tin khách nhập – trả về { tênÔ: lỗi }, rỗng là hợp lệ
  const validate = () => {
    const e = {};
    const name = fullName.trim();
    const phoneDigits = phone.replace(/[\s.\-()]/g, '').replace(/^\+?84/, '0');
    if (!name) e.fullName = 'Vui lòng nhập họ và tên';
    else if (!/^[\p{L}\s.'-]{2,}$/u.test(name) || !/\p{L}{2,}/u.test(name)) e.fullName = 'Họ tên chỉ gồm chữ, ví dụ: Nguyễn Văn An';
    if (!phoneDigits) e.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0[35789]\d{8}|02\d{9})$/.test(phoneDigits)) e.phone = 'Số điện thoại không đúng (VD: 0901 234 567)';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = 'Email không hợp lệ';
    if (deliveryMethod === 'home') {
      if (!addr.province) e.province = 'Chọn Tỉnh / Thành phố';
      if (!addr.ward) e.ward = 'Chọn Phường / Xã';
      const street = addr.street.trim();
      if (!street) e.street = 'Nhập số nhà, tên đường';
      else if (street.length < 5 || !/\p{L}{2,}/u.test(street)) e.street = 'Ghi rõ số nhà và tên đường (VD: 12 Nguyễn Xí)';
    }
    return e;
  };

  const handlePlaceOrder = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById('checkout-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await shopApi.createOrder({
        gender,
        fullName,
        phone,
        email,
        deliveryMethod: deliveryMethod === 'home' ? 'HOME' : 'STORE',
        address: deliveryMethod === 'home' ? formatAddress(addr) : undefined,
        express: expressActive,
        note,
        paymentMethod: paymentMethod === 'bank' ? 'BANK' : 'COD',
        couponCode: appliedCoupon && !couponBelowMin ? appliedCoupon.code : undefined,
        items: selectedItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          color: i.color || undefined,
          quantity: i.quantity,
        })),
      });
      setPlacedOrder(data);
      removeSelected();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      // Lỗi dữ liệu từ server: hiện chi tiết từng trường
      const detail = err.details?.map((d) => `• ${d.message}`).join('\n');
      alert(detail ? `${err.message}\n${detail}` : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // GIAO DIỆN SAU KHI ĐẶT HÀNG THÀNH CÔNG
  if (placedOrder) {
    return (
      <div className="bg-gray-100 min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm text-center max-w-md w-full space-y-3">
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
          <h2 className="text-lg font-black text-gray-900">Đặt hàng thành công!</h2>
          <p className="text-xs text-gray-600">
            Mã đơn hàng của bạn: <strong className="text-red-600 text-sm tracking-wide">{placedOrder.code}</strong>
          </p>
          <p className="text-xs text-gray-600">
            Tổng thanh toán: <strong className="text-gray-900">{placedOrder.total.toLocaleString('vi-VN')}đ</strong>
          </p>
          {placedOrder.paymentMethod === 'BANK' && (
            <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-3 space-y-2">
              <img
                src={buildQrUrl(placedOrder.total, placedOrder.transferContent)}
                alt="Mã QR thanh toán"
                className="w-40 h-40 mx-auto object-contain rounded-lg"
              />
              <p className="text-[11px] text-gray-700">
                Nội dung chuyển khoản: <strong className="text-black">{placedOrder.transferContent}</strong>
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-500">TriTech sẽ gọi xác nhận qua SĐT <strong>{placedOrder.phone}</strong> trong ít phút.</p>
          <Link
            to="/"
            className="inline-block bg-[#FFD400] hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase transition-all shadow"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // GIAO DIỆN KHI GIỎ HÀNG TRỐNG
  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-1">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-gray-500 mb-6">Hãy chọn thêm sản phẩm để tiếp tục mua sắm nhé!</p>
          <Link 
            to="/" 
            className="inline-block bg-[#FFD400] hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase transition-all shadow"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-12 pt-2 md:pt-4">
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-gray-500 mb-3 md:mb-4 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-black">Trang chủ</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span 
            className={step === 'cart' ? 'font-bold text-black' : 'hover:text-black cursor-pointer'} 
            onClick={() => setStep('cart')}
          >
            Giỏ hàng ({cartItems.length})
          </span>
          {step === 'checkout' && (
            <>
              <ChevronRight size={12} className="shrink-0" />
              <span className="font-bold text-black">Nhập thông tin</span>
            </>
          )}
        </div>

        {/* Layout Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          
          {/* CỘT BÊN TRÁI */}
          <div className="lg:col-span-8 space-y-3 md:space-y-4">
            
            {step === 'cart' ? (
              <>
                {/* Header Chọn tất cả */}
                <div className="bg-white p-3 md:p-3.5 rounded-xl shadow-sm flex items-center justify-between text-xs font-medium">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={cartItems.length > 0 && cartItems.every((i) => i.selected)} 
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <span className="text-xs">Chọn tất cả ({cartItems.length} sản phẩm)</span>
                  </label>
                  <button 
                    onClick={clearCart}
                    className="text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors text-xs"
                  >
                    <Trash2 size={13} /> Xóa tất cả
                  </button>
                </div>

                {/* Danh sách Item Dùng dữ liệu thật từ Context */}
                {cartItems.map((item, idx) => (
                  <div key={`${item.id}-${item.color}-${idx}`} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <SwipeRow
                      onDelete={() => removeItem(item.id, item.color)}
                      onSimilar={() => navigate(`/product/${item.productId}#similar`)}
                    >
                    <div className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-4">
                      <input 
                        type="checkbox" 
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id, item.color)}
                        className="w-4 h-4 accent-amber-400 rounded cursor-pointer mt-1 sm:mt-2 shrink-0"
                      />
                      <Link to={`/product/${item.productId}`} className="shrink-0">
                        <img
                          onError={imgFallback} src={assetUrl(item.image)}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain border border-gray-100 rounded-lg bg-gray-50 hover:border-red-300"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                          <div>
                            <Link to={`/product/${item.productId}`} className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug hover:text-red-600">
                              {item.name}
                            </Link>
                            {(item.variantId || item.color) && (
                              <button
                                type="button"
                                onClick={() => setEditingItem(item)}
                                className="mt-1 inline-flex max-w-full items-center gap-1 rounded bg-gray-100 px-2 py-1 text-[10px] sm:text-[11px] text-gray-600 hover:bg-gray-200"
                              >
                                <span className="truncate">
                                  Phân loại: {[item.color, item.variantLabel || (item.variantId && item.name.match(/\(([^)]+)\)$/)?.[1])].filter(Boolean).join(', ')}
                                </span>
                                <ChevronDown size={12} className="shrink-0" />
                              </button>
                            )}
                          </div>
                          <div className="text-left sm:text-right shrink-0 mt-1 sm:mt-0">
                            <p className="font-bold text-red-600 text-xs sm:text-sm">{item.price?.toLocaleString('vi-VN')}đ</p>
                            {item.oldPrice && (
                              <p className="text-[9px] sm:text-[10px] text-gray-400 line-through">{item.oldPrice?.toLocaleString('vi-VN')}đ</p>
                            )}
                          </div>
                        </div>

                        {/* Nút tăng giảm số lượng & Xóa */}
                        <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-2 border-t sm:border-t-0 border-gray-50">
                          <div className="flex items-center border border-gray-200 rounded-md bg-white">
                            <button 
                              onClick={() => updateQuantity(item.id, item.color, -1)}
                              className="w-6 h-6 sm:w-7 sm:h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-7 sm:w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.color, 1)}
                              className="w-6 h-6 sm:w-7 sm:h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id, item.color)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    </SwipeRow>

                    {/* Khung Ưu đãi */}
                    {item.perks && item.perks.length > 0 && (
                      <div className="bg-red-50/50 p-2.5 sm:p-3 border-t border-red-100/60 text-[10px] sm:text-[11px] text-red-800">
                        <p className="font-bold text-red-600 mb-0.5 sm:mb-1 flex items-center gap-1">
                          🔥 Ưu đãi đi kèm
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-gray-700 text-[10px] sm:text-[11px]">
                          {item.perks.map((perk, pIdx) => (
                            <li key={pIdx} className="line-clamp-1">{perk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              /* FORM ĐIỀN THÔNG TIN CHEKOUT */
              <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                
                {/* 1. Thông tin khách hàng */}
                <div>
                  <h3 id="checkout-info" className="font-bold text-xs sm:text-sm text-gray-900 mb-2.5 uppercase tracking-wide scroll-mt-24">
                    Thông tin khách hàng
                  </h3>
                  <div className="flex gap-4 mb-2.5">
                    {['Anh', 'Chị'].map((g) => (
                      <label key={g} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                        <input 
                          type="radio" 
                          name="gender" 
                          checked={gender === g} 
                          onChange={() => setGender(g)}
                          className="accent-amber-400"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="Họ và Tên (bắt buộc)"
                        value={fullName}
                        onChange={e => { setFullName(e.target.value); setErrors((er) => ({ ...er, fullName: undefined })); }}
                        className={`w-full text-xs p-2.5 border rounded-lg outline-none focus:border-amber-400 ${errors.fullName ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="Số điện thoại (bắt buộc)"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setErrors((er) => ({ ...er, phone: undefined })); }}
                        className={`w-full text-xs p-2.5 border rounded-lg outline-none focus:border-amber-400 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="Email (không bắt buộc)"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: undefined })); }}
                    className={`w-full text-xs p-2.5 border rounded-lg outline-none focus:border-amber-400 mt-2.5 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* 2. Thông tin nhận hàng */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2.5 uppercase tracking-wide">
                    Thông tin nhận hàng
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-2.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input 
                        type="radio" 
                        name="delivery" 
                        checked={deliveryMethod === 'home'} 
                        onChange={() => setDeliveryMethod('home')}
                        className="accent-amber-400"
                      />
                      Giao hàng tận nơi
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input 
                        type="radio" 
                        name="delivery" 
                        checked={deliveryMethod === 'store'} 
                        onChange={() => setDeliveryMethod('store')}
                        className="accent-amber-400"
                      />
                      Nhận trực tiếp tại Thanh Đa (Bình Thạnh)
                    </label>
                  </div>

                  {deliveryMethod === 'store' ? (
                    <div className="p-3 rounded-xl border border-amber-400 bg-amber-50/40 text-xs space-y-1">
                      <p className="font-bold text-gray-900 flex items-center gap-1">
                        <MapPin size={14} className="text-amber-600 shrink-0" /> Điểm nhận hàng trực tiếp:
                      </p>
                      <p className="text-gray-700 pl-5 font-medium leading-relaxed">{bankInfo.storeAddress}</p>
                      <p className="text-gray-500 pl-5 leading-relaxed">
                        TriTech bán hàng online, không có cửa hàng trưng bày. Vui lòng gọi/Zalo 0325 477 841 hẹn giờ trước khi qua nhận.
                      </p>
                    </div>
                  ) : (
                    <AddressPicker
                      value={addr}
                      errors={errors}
                      onChange={(next) => {
                        setAddr(next);
                        setErrors((er) => ({ ...er, province: undefined, ward: undefined, street: undefined }));
                      }}
                    />
                  )}

                  {/* Hình thức giao: tiêu chuẩn (miễn phí) hoặc hỏa tốc nội thành TP.HCM */}
                  {deliveryMethod === 'home' && (
                    <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      <label className={`flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-xs ${!expressActive ? 'border-amber-400 bg-amber-50/40' : 'border-gray-200'}`}>
                        <input type="radio" name="ship" checked={!expressActive} onChange={() => setExpress(false)} className="mt-0.5 accent-amber-400" />
                        <span>
                          <span className="flex items-center gap-1 font-bold text-gray-900"><Truck size={13} /> Giao tiêu chuẩn</span>
                          <span className="text-emerald-600 font-semibold">Miễn phí</span> · toàn quốc
                        </span>
                      </label>
                      <label className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs ${isHcm ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${expressActive ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}>
                        <input type="radio" name="ship" disabled={!isHcm} checked={expressActive} onChange={() => setExpress(true)} className="mt-0.5 accent-red-500" />
                        <span>
                          <span className="flex items-center gap-1 font-bold text-gray-900"><Zap size={13} className="text-red-500 fill-red-500" /> Giao hỏa tốc nội thành</span>
                          <span className="font-semibold text-red-600">+{EXPRESS_FEE.toLocaleString('vi-VN')}đ</span> · nhận trong ngày
                          {!isHcm && <span className="block text-[10px] text-gray-500">Chỉ áp dụng khi chọn TP. Hồ Chí Minh</span>}
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="mt-2.5">
                    <textarea 
                      rows={2}
                      placeholder="Ghi chú thêm yêu cầu khác (nếu có)..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-amber-400"
                    ></textarea>
                  </div>
                </div>

                {/* 3. Hình thức thanh toán */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2.5 uppercase tracking-wide">
                    Hình thức thanh toán
                  </h3>
                  <div className="space-y-2">
                    <div 
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'bank' ? 'border-amber-400 bg-amber-50/30' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                        <input type="radio" checked={paymentMethod === 'bank'} readOnly className="accent-amber-400" />
                        <QrCode size={16} className="text-amber-600 shrink-0" />
                        <span>Thanh toán chuyển khoản ngân hàng (Quét mã QR)</span>
                      </div>
                      
                      {paymentMethod === 'bank' && (
                        <div className="mt-3 p-3 sm:p-3.5 bg-white border border-amber-200 rounded-xl text-xs flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                          <div className="w-full sm:col-span-5 flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded-xl">
                            <img 
                              src={qrUrl} 
                              alt="Mã QR MB Bank" 
                              className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg shadow-sm"
                            />
                            <p className="text-[10px] text-gray-500 font-semibold mt-1 text-center">Mở App Ngân hàng / Momo quét</p>
                          </div>

                          <div className="w-full sm:col-span-7 space-y-2 text-left">
                            <div>
                              <p className="text-gray-500 text-[10px]">Ngân hàng</p>
                              <p className="font-bold text-gray-900 text-xs">{bankInfo.bankName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[10px]">Chủ tài khoản</p>
                              <p className="font-black text-gray-900 uppercase text-xs">{bankInfo.accountName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[10px]">Số tài khoản</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-extrabold text-red-600 text-sm tracking-wide">
                                  {bankInfo.accountNo}
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleCopySTK(); }}
                                  className="flex items-center gap-1 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded border transition-colors shrink-0"
                                >
                                  {copiedSTK ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                  <span>{copiedSTK ? 'Đã chép' : 'Sao chép'}</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-[10px] text-amber-700 font-medium italic pt-1 border-t border-gray-100">
                              * Mã QR kèm <strong className="text-black">nội dung chuyển khoản theo mã đơn</strong> sẽ hiện sau khi bạn xác nhận đặt hàng
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod' ? 'border-amber-400 bg-amber-50/30' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                        <input type="radio" checked={paymentMethod === 'cod'} readOnly className="accent-amber-400" />
                        <Truck size={16} className="text-blue-600 shrink-0" />
                        <span>Thanh toán tiền mặt khi nhận hàng (COD)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* CỘT BÊN PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-20 space-y-3.5">
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="NHẬP MÃ GIẢM GIÁ" 
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="flex-1 min-w-0 text-[11px] sm:text-xs px-2.5 py-2 border border-gray-200 rounded-lg outline-none focus:border-amber-400 uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="bg-[#FFD400] hover:bg-amber-400 disabled:opacity-60 text-black font-bold px-3 sm:px-4 py-2 rounded-lg text-xs transition-colors shrink-0"
                >
                  {applyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Áp dụng'}
                </button>
              </div>
              {couponMessage && (
                <p className={`text-[11px] -mt-2 ${appliedCoupon && !couponBelowMin ? 'text-emerald-600' : 'text-red-600'}`}>
                  {couponBelowMin
                    ? `Đơn tối thiểu ${appliedCoupon.minOrder.toLocaleString('vi-VN')}đ để dùng mã ${appliedCoupon.code}`
                    : couponMessage}
                </p>
              )}

              <hr className="border-gray-100" />

              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2.5">Thông tin đơn hàng</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng tiền:</span>
                    <span className="font-bold text-gray-900">{subTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Giảm giá ({appliedCoupon.code}):</span>
                      <span className="font-bold text-emerald-600">-{discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển{expressActive ? ' (hỏa tốc)' : ''}:</span>
                    {shippingFee > 0 ? (
                      <span className="font-bold text-gray-900">{shippingFee.toLocaleString('vi-VN')}đ</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    )}
                  </div>
                </div>

                <hr className="border-gray-100 my-2.5" />

                <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                  <span>Số tiền cần thanh toán:</span>
                  <span className="text-red-600 text-sm sm:text-base">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {step === 'cart' ? (
                <button 
                  disabled={selectedItems.length === 0}
                  onClick={() => setStep('checkout')}
                  className="w-full bg-[#FFD400] hover:bg-amber-400 disabled:opacity-50 text-black font-black py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] uppercase cursor-pointer"
                >
                  ĐẶT HÀNG NGAY ({selectedItems.length})
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting || selectedItems.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] uppercase cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  XÁC NHẬN ĐẶT HÀNG
                </button>
              )}

              <p className="text-[9px] sm:text-[10px] text-gray-400 text-center leading-relaxed">
                🔒 Bằng việc đặt hàng, bạn đã đọc và chấp nhận <br />
                <Link to="/chinh-sach/bao-mat" className="text-gray-600 underline">Chính sách bảo mật</Link> và <Link to="/chinh-sach/chinh-sach-chung" className="text-gray-600 underline">Điều khoản mua hàng</Link>.
              </p>

            </div>
          </div>

        </div>

      </div>
      {editingItem && (
        <CartOptionPicker
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onConfirm={(product, color, variant, qty) => {
            changeOption(editingItem, product, color, variant, qty);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}