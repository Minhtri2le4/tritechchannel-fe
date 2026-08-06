import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, MapPin, QrCode, 
  ChevronRight, Truck, Check, Copy, ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext'; // Dynamic import Context

export default function CartPage() {
  const { 
    cartItems, 
    updateQuantity, 
    toggleSelect, 
    toggleSelectAll, 
    removeItem, 
    clearCart 
  } = useCart();

  // State Form Checkout
  const [step, setStep] = useState('cart'); // 'cart' hoặc 'checkout'
  const [gender, setGender] = useState('Anh');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('store'); 
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank'); 
  const [couponCode, setCouponCode] = useState('');
  const [copiedSTK, setCopiedSTK] = useState(false);

  // Thông tin Chuyển khoản của Shop
  const bankInfo = {
    bankName: "MB BANK (Ngân hàng Quân Đội)",
    accountName: "HỒ MINH TRÍ",
    accountNo: "200320047979",
    storeAddress: "Lô 7, Cư xá Thanh Đa, Bình Quới, Hồ Chí Minh, Việt Nam"
  };

  const handleCopySTK = () => {
    navigator.clipboard.writeText(bankInfo.accountNo);
    setCopiedSTK(true);
    setTimeout(() => setCopiedSTK(false), 2000);
  };

  // Tính toán tổng tiền
  const selectedItems = cartItems.filter((i) => i.selected);
  const subTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // QR VietQR MB Bank
  const qrUrl = `https://img.vietqr.io/image/MB-${bankInfo.accountNo}-compact2.png?amount=${subTotal}&addInfo=TT%20DH%20${phone || 'TRITECH'}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

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
                    <div className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-4">
                      <input 
                        type="checkbox" 
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id, item.color)}
                        className="w-4 h-4 accent-amber-400 rounded cursor-pointer mt-1 sm:mt-2 shrink-0"
                      />
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain border border-gray-100 rounded-lg shrink-0 bg-gray-50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug">
                              {item.name}
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 sm:mt-1">Màu sắc: {item.color}</p>
                          </div>
                          <div className="text-left sm:text-right shrink-0 mt-1 sm:mt-0">
                            <p className="font-bold text-red-600 text-xs sm:text-sm">{item.price?.toLocaleString()}đ</p>
                            {item.oldPrice && (
                              <p className="text-[9px] sm:text-[10px] text-gray-400 line-through">{item.oldPrice?.toLocaleString()}đ</p>
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
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2.5 uppercase tracking-wide">
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
                    <input 
                      type="text" 
                      placeholder="Họ và Tên (bắt buộc)" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-amber-400"
                    />
                    <input 
                      type="text" 
                      placeholder="Số điện thoại (bắt buộc)" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-amber-400"
                    />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email nhận thông tin xác nhận đơn hàng" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-amber-400 mt-2.5"
                  />
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
                        checked={deliveryMethod === 'store'} 
                        onChange={() => setDeliveryMethod('store')}
                        className="accent-amber-400"
                      />
                      Nhận hàng tại cửa hàng
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input 
                        type="radio" 
                        name="delivery" 
                        checked={deliveryMethod === 'home'} 
                        onChange={() => setDeliveryMethod('home')}
                        className="accent-amber-400"
                      />
                      Nhận hàng tận nhà
                    </label>
                  </div>

                  {deliveryMethod === 'store' ? (
                    <div className="p-3 rounded-xl border border-amber-400 bg-amber-50/40 text-xs space-y-1">
                      <p className="font-bold text-gray-900 flex items-center gap-1">
                        <MapPin size={14} className="text-amber-600 shrink-0" /> Cửa hàng nhận hàng:
                      </p>
                      <p className="text-gray-700 pl-5 font-medium leading-relaxed">{bankInfo.storeAddress}</p>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Nhập địa chỉ cụ thể (Số nhà, đường, phường/xã, quận/huyện)..." 
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-amber-400"
                    />
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
                              * Nội dung CK: <strong className="text-black">{fullName || 'Họ tên'} - {phone || 'SĐT'}</strong>
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
                  placeholder="CHỌN HOẶC NHẬP MÃ COUPON" 
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="flex-1 min-w-0 text-[11px] sm:text-xs px-2.5 py-2 border border-gray-200 rounded-lg outline-none focus:border-amber-400 uppercase"
                />
                <button className="bg-[#FFD400] hover:bg-amber-400 text-black font-bold px-3 sm:px-4 py-2 rounded-lg text-xs transition-colors shrink-0">
                  Áp dụng
                </button>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2.5">Thông tin đơn hàng</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng tiền:</span>
                    <span className="font-bold text-gray-900">{subTotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="text-emerald-600 font-bold">Miễn phí</span>
                  </div>
                </div>

                <hr className="border-gray-100 my-2.5" />

                <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                  <span>Số tiền cần thanh toán:</span>
                  <span className="text-red-600 text-sm sm:text-base">{subTotal.toLocaleString()}đ</span>
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
                  onClick={() => {
                    if (!fullName.trim() || !phone.trim()) {
                      alert("Vui lòng nhập đầy đủ Họ và Tên và Số điện thoại!");
                      return;
                    }
                    if (deliveryMethod === 'home' && !address.trim()) {
                      alert("Vui lòng nhập địa chỉ nhận hàng tận nhà!");
                      return;
                    }
                    alert("Đặt hàng thành công! Shop sẽ liên hệ bạn sớm nhất.");
                    clearCart();
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] uppercase cursor-pointer"
                >
                  XÁC NHẬN ĐẶT HÀNG
                </button>
              )}

              <p className="text-[9px] sm:text-[10px] text-gray-400 text-center leading-relaxed">
                🔒 Bằng việc đặt hàng, bạn đã đọc và chấp nhận <br />
                <a href="#" className="text-gray-600 underline">Chính sách bảo mật</a> và <a href="#" className="text-gray-600 underline">Xử lý thông tin cá nhân</a>.
              </p>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}