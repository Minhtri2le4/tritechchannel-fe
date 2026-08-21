import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Settings, Sparkles, Clock, Wrench, ShieldCheck } from 'lucide-react';

export default function SmartHome() {
  return (
    <div className="bg-gray-50 min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center relative overflow-hidden">
        
        {/* Background Glow trang trí */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-yellow-200/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-yellow-100/60 rounded-full blur-3xl pointer-events-none"></div>

        {/* Khối Icon Hoạt Họa 3D / Đang Xây Dựng */}
        <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
          {/* Vòng tròn hiệu ứng xung quanh */}
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
          <div className="absolute -inset-2 border-2 border-dashed border-yellow-400/60 rounded-full animate-[spin_10s_linear_infinite]"></div>
          
          {/* Khối Icon Trung Tâm */}
          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-300 rounded-2xl shadow-lg shadow-yellow-200/50 flex items-center justify-center text-black relative z-10 transform hover:scale-105 transition-transform duration-300">
            <Home size={42} strokeWidth={2.2} />
            <Settings size={22} className="absolute top-2 right-2 animate-[spin_4s_linear_infinite] text-black/70" />
          </div>
        </div>

        {/* Badge Trạng Thái */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 border border-yellow-300/50 text-yellow-900 rounded-full text-xs font-bold mb-4 shadow-sm">
          <Sparkles size={14} className="text-amber-600 animate-pulse" />
          <span className="tracking-wide uppercase">Đang Trong Quá Trình Hoàn Thiện</span>
        </div>

        {/* Tiêu Đề */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight uppercase mb-3">
          Gia Dụng Thông Minh
        </h1>

        {/* Nội dung mô tả */}
        <p className="text-gray-600 text-sm leading-relaxed max-w-lg mx-auto mb-8">
          Hệ sinh thái <span className="font-semibold text-gray-900">Smart Home</span> (Robot hút bụi, Khóa cửa vân tay, Đèn LED RGB, Sạc thông minh...) đang được <strong className="text-black">TriTech Channel</strong> chuẩn bị kỹ lưỡng để mang tới trải nghiệm tốt nhất!
        </p>

        {/* Các đặc quyền sắp ra mắt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-left flex sm:flex-col items-center sm:items-start gap-2">
            <ShieldCheck size={18} className="text-yellow-600 shrink-0" />
            <span className="text-xs font-semibold text-gray-800">Chính hãng 100%</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-left flex sm:flex-col items-center sm:items-start gap-2">
            <Wrench size={18} className="text-yellow-600 shrink-0" />
            <span className="text-xs font-semibold text-gray-800">Bảo hành 1 đổi 1</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-left flex sm:flex-col items-center sm:items-start gap-2">
            <Clock size={18} className="text-yellow-600 shrink-0" />
            <span className="text-xs font-semibold text-gray-800">Sớm ra mắt 2026</span>
          </div>
        </div>

        {/* Button Quay Về Trang Chủ */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#FFD400] hover:bg-yellow-400 text-black font-extrabold py-3.5 px-8 rounded-2xl transition-all duration-200 text-xs uppercase shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            <span>Quay Về Trang Chủ</span>
          </Link>
        </div>

      </div>
    </div>
  );
}