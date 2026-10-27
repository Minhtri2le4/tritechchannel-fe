import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone, Tablet, Percent, RefreshCw, Headphones, Speaker, Watch, Laptop, Home, Gift, Newspaper, PlugZap,
} from 'lucide-react';
import { assetUrl } from '../lib/api';

// Ảnh PNG/WebP/SVG thường là ảnh tách nền -> đặt giữa ô; ảnh JPG có nền -> phủ kín ô cho đẹp
const isCutout = (src) => /\.(png|webp|svg)(\?|$)/i.test(src || '');

const ICONS = { Smartphone, Tablet, Percent, RefreshCw, Headphones, Speaker, Watch, Laptop, Home, Gift, Newspaper, PlugZap };

// Vệt sơn vàng phía sau ảnh tách nền – cùng phong cách nền vàng trong ảnh sản phẩm của shop
function BrushSplash({ className }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path
        fill="#FFD400"
        d="M20 31C22 19 32 15 38 21L41 11L46 21C53 10 65 12 68 22L73 13L76 26C86 26 92 36 88 46L96 49L88 56C92 68 84 80 72 78L68 89L61 80C51 90 37 89 33 78L24 85L24 72C12 70 7 58 13 50L4 45L15 40C11 34 14 30 20 31Z"
      />
      <circle cx="90" cy="24" r="3.5" fill="#FFD400" />
      <circle cx="9" cy="70" r="2.5" fill="#FFD400" />
      <circle cx="80" cy="90" r="2" fill="#FFD400" />
    </svg>
  );
}

// Một ô danh mục: ảnh PNG tách nền nằm trên vệt sơn vàng (không khung); ảnh có nền thì nằm trong ô xám nhạt bo góc.
// Chưa có ảnh hoặc ảnh lỗi thì hiện icon cùng kiểu, không hiện khung "no image".
function CategoryTile({ item }) {
  const [broken, setBroken] = useState(false);
  const Icon = ICONS[item.icon] || Smartphone;
  const showImage = item.image && !broken;
  const cutout = isCutout(item.image);
  // Ảnh tách nền: bỏ khung nền/viền, để sản phẩm "nổi" tự nhiên như các shop lớn
  const bare = showImage && cutout;

  return (
    <Link to={item.path || `/category/${item.id}`} className="group flex flex-col items-center gap-1.5 text-center">
      <div
        className={`relative w-full aspect-square max-w-[84px] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-0.5 ${
          bare
            ? ''
            : 'rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-100 overflow-hidden group-hover:border-yellow-400 group-hover:shadow-md'
        }`}
      >
        {bare && (
          <BrushSplash className="absolute -inset-[4%] w-[108%] h-[108%] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105" />
        )}
        {showImage ? (
          <img
            src={assetUrl(item.image)}
            alt={item.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className={`transition-transform duration-300 group-hover:scale-110 ${
              cutout ? 'relative w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]' : 'w-full h-full object-cover'
            }`}
          />
        ) : (
          <Icon className="w-1/2 h-1/2 text-gray-800 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
        )}
        {item.badge && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black px-1 rounded">{item.badge}</span>
        )}
      </div>
      <span className="text-[11px] md:text-[13px] font-medium text-gray-800 leading-tight line-clamp-2 group-hover:text-red-600">
        {item.name}
      </span>
    </Link>
  );
}

// Lưới danh mục dưới banner: 5 cột trên điện thoại (2 hàng), 10 cột trên máy tính – giống các shop lớn
export default function QuickCategories({ items }) {
  if (!items?.length) return null;
  return (
    <div className="bg-white rounded-2xl p-3 md:p-5 shadow-sm mb-4 md:mb-6 mt-4">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-x-2 gap-y-4 md:gap-4 justify-items-center">
        {items.slice(0, 10).map((item) => (
          <CategoryTile key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
