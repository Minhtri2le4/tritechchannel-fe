import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom'; // 1. Import thêm Link từ react-router-dom
import { useCart } from '../context/CartContext'; 

export default function ProductCard({ product }) {
  const { addToCart } = useCart(); 

  return (
    /* 2. Bọc toàn bộ card bằng thẻ Link trỏ tới trang chi tiết sản phẩm */
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col relative cursor-pointer block"
    >
      
      {/* Cụm Tem Nhãn */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.discount && (
          <span className="bg-red-500 text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm w-fit border border-red-600 tracking-wide">
            Giảm {product.discount}%
          </span>
        )}
      </div>
      <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
        {product.installment && (
          <span className="bg-yellow-400 text-black text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm border border-yellow-500">
            % Trả góp 0%
          </span>
        )}
      </div>

      {/* Khung Ảnh Sản Phẩm */}
      <div className="relative w-full aspect-square bg-gray-50/50 flex items-center justify-center p-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
        />
      </div>

      {/* Nội Dung (Tên, Giá, Đánh giá, Nút) */}
      <div className="p-3 md:p-4 flex flex-col flex-1 bg-white">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[36px] md:min-h-[40px] group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-2 md:mt-3 flex flex-wrap items-end gap-1.5 md:gap-2">
          <span className="text-sm md:text-lg font-black text-red-600 leading-none">
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          {product.oldPrice && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through font-medium leading-none mb-0.5">
              {product.oldPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-[9px] md:text-xs text-gray-500 font-medium pb-1">
          <div className="flex items-center text-yellow-400">
            <Star size={12} fill="currentColor" />
            <span className="ml-1.5 text-gray-600 font-bold">{product.rating || 5}</span>
          </div>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>Đã bán {product.sold || '100+'}</span>
        </div>

        {/* Nút thêm vào giỏ hàng giữ nguyên e.stopPropagation để không bị nhảy trang khi bấm mua nhanh */}
        <button 
          onClick={(e) => {
            e.preventDefault(); // Ngăn hành vi mặc định của Link
            e.stopPropagation(); // Ngăn sự kiện nổi bọt
            addToCart(product); 
          }}
          className="mt-auto pt-2 w-full"
        >
          <div className="w-full py-2 md:py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xs md:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm">
            <ShoppingCart size={14} /> Thêm vào giỏ
          </div>
        </button>
      </div>
    </Link>
  );
}