import React, { useState } from 'react';
import { Search, ShieldCheck, AlertCircle, Clock, Wrench, PhoneCall, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function WarrantyPage() {
  const [searchKey, setSearchKey] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock dữ liệu tra cứu
  const mockWarrantyData = [
    {
      imei: '0325477841',
      phone: '0325477841',
      productName: 'iPhone 15 Pro Max 256GB - VN/A',
      purchaseDate: '15/10/2023',
      expiryDate: '15/10/2024',
      status: 'Hết hạn',
      customerName: 'Hồ Minh Trí',
      history: [
        { date: '20/12/2023', note: 'Vệ sinh máy & dán lại cường lực miễn phí', status: 'Hoàn tất' }
      ]
    },
    {
      imei: '0987654321',
      phone: '0987654321',
      productName: 'MacBook Pro M3 14 inch 16GB / 512GB',
      purchaseDate: '01/03/2026',
      expiryDate: '01/03/2027',
      status: 'Còn hạn',
      customerName: 'Nguyễn Văn A',
      history: []
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchKey.trim()) return;

    setHasSearched(true);
    const key = searchKey.trim().toLowerCase();
    
    const found = mockWarrantyData.find(
      (item) => item.phone.includes(key) || item.imei.toLowerCase().includes(key)
    );

    setSearchResult(found || null);
  };

  return (
    <div className="w-full bg-white text-gray-800 py-6 md:py-10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        
        {/* 1. Header Tra Cứu - Trắng Tinh Tế & Tối Giản */}
        <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 sm:p-8 md:p-12 text-center mb-8 sm:mb-12">
          <div className="max-w-2xl mx-auto">
            
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/50 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
              <ShieldCheck size={16} className="text-amber-500" /> Trung Tâm Bảo Hành TriTech
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
              Tra Cứu Bảo Hành
            </h1>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 leading-relaxed">
              Nhập <span className="font-semibold text-gray-900">Số điện thoại</span> hoặc <span className="font-semibold text-gray-900">Mã IMEI / Serial</span> để xem thông tin thiết bị.
            </p>

            {/* Form Tra Cứu Responsive */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-xl border border-gray-300 shadow-sm focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-200 transition-all">
              <div className="flex-1 flex items-center px-3 py-1">
                <Search size={18} className="text-gray-400 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Nhập SĐT hoặc Mã IMEI..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="w-full text-xs sm:text-sm text-gray-800 outline-none bg-transparent font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
              >
                Tra cứu ngay
              </button>
            </form>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-gray-500 mt-4">
              <span>Thử mẫu:</span>
              <button type="button" onClick={() => setSearchKey('0325477841')} className="bg-white px-2 py-0.5 rounded border border-gray-200 hover:border-yellow-500 text-gray-700 font-medium transition-colors">
                0325477841
              </button>
              <button type="button" onClick={() => setSearchKey('0987654321')} className="bg-white px-2 py-0.5 rounded border border-gray-200 hover:border-yellow-500 text-gray-700 font-medium transition-colors">
                0987654321
              </button>
            </div>

          </div>
        </div>

        {/* 2. Kết Quả Tra Cứu */}
        {hasSearched && (
          <div className="mb-10 sm:mb-12">
            {searchResult ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
                
                {/* Status Bar Header */}
                <div className={`p-4 flex flex-wrap items-center justify-between gap-2 text-white font-bold text-xs sm:text-sm ${
                  searchResult.status === 'Còn hạn' ? 'bg-emerald-600' : 'bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>TRẠNG THÁI BẢO HÀNH</span>
                  </div>
                  <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs">
                    {searchResult.status}
                  </span>
                </div>

                {/* Details Container */}
                <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Khách hàng:</span>
                      <strong className="text-gray-900 text-sm sm:text-base">{searchResult.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Số điện thoại:</span>
                      <strong className="text-gray-900 text-sm sm:text-base">{searchResult.phone}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Sản phẩm:</span>
                      <strong className="text-red-600 text-sm sm:text-base">{searchResult.productName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Mã IMEI / Serial:</span>
                      <strong className="font-mono text-gray-800">{searchResult.imei}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-500 text-[11px] block">Ngày mua:</span>
                      <strong className="text-gray-800">{searchResult.purchaseDate}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[11px] block">Ngày hết hạn:</span>
                      <strong className="text-red-600">{searchResult.expiryDate}</strong>
                    </div>
                  </div>

                  {/* History */}
                  <div className="pt-2">
                    <span className="font-bold text-gray-900 mb-2 flex items-center gap-1.5 text-xs">
                      <Wrench size={14} className="text-amber-500" /> Lịch sử hỗ trợ kỹ thuật:
                    </span>
                    {searchResult.history.length > 0 ? (
                      <div className="space-y-2">
                        {searchResult.history.map((h, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg text-xs gap-1 border border-gray-100">
                            <div>
                              <span className="font-semibold text-gray-800">{h.date}:</span> {h.note}
                            </div>
                            <span className="text-emerald-700 font-medium text-[11px] self-start sm:self-auto">
                              ✓ {h.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Chưa có ghi nhận sửa chữa/bảo hành.</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 text-center max-w-md mx-auto shadow-sm">
                <AlertCircle size={36} className="text-red-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Không tìm thấy dữ liệu!</h3>
                <p className="text-xs text-gray-500">
                  Rất tiếc không tìm thấy thông tin phù hợp. Vui lòng kiểm tra lại SĐT hoặc IMEI.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Chính Sách Bảo Hành Grid (Responsive 1 col mobile / 2 tablet / 4 desktop) */}
        <div>
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 uppercase tracking-tight">
              Cam Kết Bảo Hành
            </h2>
            <p className="text-xs text-gray-500 mt-1">Hậu mãi an tâm cho khách hàng TriTech</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-yellow-400 transition-colors">
              <div className="w-10 h-10 bg-yellow-100 text-yellow-800 rounded-xl flex items-center justify-center mb-3">
                <RefreshCw size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">1 Đổi 1 trong 45 ngày</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Đổi ngay sản phẩm mới hoặc tương đương nếu có lỗi phần cứng từ NSX.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-yellow-400 transition-colors">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mb-3">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Bảo hành 12 - 24 tháng</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Bảo hành toàn bộ Mainboard, Nguồn, Màn hình theo tiêu chuẩn hãng.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-yellow-400 transition-colors">
              <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center mb-3">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Bảo hành Pin trọn đời</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Miễn phí thay pin khi dung lượng chai dưới 80% trong suốt thời gian xài.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-yellow-400 transition-colors">
              <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-xl flex items-center justify-center mb-3">
                <PhoneCall size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Hỗ trợ kỹ thuật 24/7</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Đội ngũ kỹ thuật hỗ trợ từ xa, hướng dẫn phần mềm tận tình mọi lúc.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}