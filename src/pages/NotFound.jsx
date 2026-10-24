import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

// Trang hiện khi đường dẫn không tồn tại
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md w-full">
        <SearchX size={56} className="mx-auto text-gray-300 mb-3" />
        <h1 className="text-2xl font-black text-gray-900">404</h1>
        <p className="text-sm text-gray-600 mt-1 mb-6">Trang bạn tìm không tồn tại hoặc đã được chuyển đi.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/" className="bg-[#FFD400] hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase">
            Về trang chủ
          </Link>
          <Link to="/category/1" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-2.5 rounded-xl text-xs uppercase">
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
