import { useState } from 'react';
import { RefreshCw, PhoneCall, ArrowRight, FileText, PackageCheck, X, Camera } from 'lucide-react';

export default function TradeIn() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    category: 'Điện thoại / Máy tính bảng',
    brand: '',
    deviceName: '',
    condition: '99%',
    accessoryIncluded: 'Đủ phụ kiện',
    targetDevice: '',
    note: ''
  });

  // State quản lý ảnh upload
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Xử lý khi chọn/chụp ảnh
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Tối đa chỉ được tải lên 5 ảnh!');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.brand || !formData.deviceName) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    // TODO: Tại đây sẽ gọi API gửi dữ liệu + images lên Telegram Bot hoặc Server
    console.log("Dữ liệu Form:", formData);
    console.log("Danh sách file ảnh:", images.map(img => img.file));

    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 text-black rounded-full mb-2 sm:mb-3">
            <RefreshCw size={22} className="sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-tight">
            Thu Cũ Đổi Mới & Phụ Kiện Công Nghệ
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Gửi hình ảnh & thông tin thiết bị để TriTech Channel định giá chính xác trong vòng 5-10 phút.
          </p>
        </div>

        {/* Form Đăng Ký */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-gray-100">
            <FileText size={20} className="text-yellow-600 shrink-0" />
            <h2 className="font-bold text-gray-900 text-base sm:text-lg">Thông Tin Món Đồ Cần Định Giá</h2>
          </div>

          {submitted ? (
            <div className="text-center py-6 sm:py-8 space-y-3">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <PackageCheck size={28} />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900">Đã Gửi Thông Tin & Hình Ảnh Thành Công!</h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                TriTech Channel sẽ kiểm tra hình ảnh món đồ của ông và phản hồi định giá qua Zalo/SĐT <strong>{formData.phone}</strong> ngay lập tức.
              </p>
              <button
                onClick={() => { setSubmitted(false); setImages([]); }}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Gửi định giá món đồ khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Thông tin khách hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-yellow-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Số điện thoại / Zalo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-yellow-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Thông tin món đồ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Phân loại thiết bị
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-yellow-500 text-xs sm:text-sm"
                  >
                    <option value="Điện thoại / Máy tính bảng">Điện thoại / Tablet</option>
                    <option value="Laptop / Macbook">Laptop / Macbook</option>
                    <option value="Sạc dự phòng / Củ sạc">Sạc dự phòng / Củ sạc</option>
                    <option value="Tai nghe / Loa">Tai nghe / Loa Bluetooth</option>
                    <option value="Bàn phím / Chuột / Phụ kiện">Bàn phím / Chuột / Phụ kiện</option>
                    <option value="Đồng hồ thông minh">Đồng hồ thông minh</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Apple, Lenovo, AULA..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-yellow-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tên món đồ / Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Sạc Thinkplus, F81..."
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-yellow-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* KHỐI TẢI ẢNH / CHỤP ẢNH THỰC TẾ */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Hình ảnh thực tế của món đồ (Tải lên hoặc chụp trực tiếp, tối đa 5 ảnh)
                </label>
                
                <div className="border-2 border-dashed border-gray-300 hover:border-yellow-500 rounded-xl p-4 sm:p-5 bg-gray-50 text-center transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="image-upload"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 bg-yellow-100 text-black rounded-full flex items-center justify-center shadow-sm">
                      <Camera size={20} />
                    </div>
                    <span className="font-bold text-gray-800 text-xs sm:text-sm">Bấm vào đây để chụp hoặc chọn ảnh từ thư viện</span>
                    <span className="text-gray-400 text-[11px] max-w-xs">Chụp rõ các góc, vết trầy xước (nếu có) để định giá chuẩn nhất</span>
                  </label>
                </div>

                {/* Khối hiển thị ảnh đã chọn (Preview) */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square shadow-sm">
                        <img src={img.preview} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tình trạng & Phụ kiện */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tình trạng ngoại hình / Hoạt động
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-yellow-500 text-xs sm:text-sm"
                  >
                    <option value="99%">Likenew 99% - Rất mới, full chức năng</option>
                    <option value="95%">95% - Trầy xước nhẹ, hoạt động tốt</option>
                    <option value="Cũ / Trầy nhiều">Cũ / Trầy xước nhiều / Cấn móp</option>
                    <option value="Có lỗi nhẹ">Có lỗi nhỏ / Chai pin / Hỏng tính năng phụ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Phụ kiện kèm theo
                  </label>
                  <select
                    value={formData.accessoryIncluded}
                    onChange={(e) => setFormData({ ...formData, accessoryIncluded: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-yellow-500 text-xs sm:text-sm"
                  >
                    <option value="Đủ hộp & Phụ kiện">Còn đủ Hộp (Box) + Cáp sạc/Phụ kiện</option>
                    <option value="Chỉ có máy/sản phẩm">Chỉ có sản phẩm lẻ (Không box/cáp)</option>
                    <option value="Kèm cáp sạc">Sản phẩm + Cáp sạc</option>
                  </select>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nhu cầu đổi món khác / Ghi chú thêm
                </label>
                <textarea
                  rows="2"
                  placeholder="VD: Muốn bán đứt lấy tiền hoặc đổi sang Bàn phím AULA F81..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-yellow-500 text-xs sm:text-sm resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FFD400] hover:bg-yellow-400 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-xs sm:text-sm shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span>Gửi Thông Tin & Ảnh Định Giá</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Hotline */}
        <div className="bg-gray-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-md">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2.5 bg-yellow-400 text-black rounded-xl shrink-0">
              <PhoneCall size={20} />
            </div>
            <div>
              <p className="font-bold text-[11px] sm:text-xs text-yellow-400">CẦN BÁO GIÁ TRỰC TIẾP QUA ZALO?</p>
              <p className="text-xs sm:text-sm font-semibold">Gửi hình ảnh qua Zalo để nhân viên kiểm tra ngay</p>
            </div>
          </div>
          <a
            href="tel:0325477841"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 shadow-sm active:scale-95"
          >
            Hotline: 0325.477.841
          </a>
        </div>

      </div>
    </div>
  );
}