import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone, Tablet, Percent, RefreshCw, Headphones, Speaker, Watch, Laptop, Home, Gift, Newspaper, PlugZap,
} from 'lucide-react';
import { assetUrl } from '../lib/api';

// Ảnh PNG/WebP/SVG thường là ảnh tách nền -> đặt giữa ô; ảnh JPG có nền -> phủ kín ô cho đẹp
const isCutout = (src) => /\.(png|webp|svg)(\?|$)/i.test(src || '');

const ICONS = { Smartphone, Tablet, Percent, RefreshCw, Headphones, Speaker, Watch, Laptop, Home, Gift, Newspaper, PlugZap };

// Một ô danh mục: ảnh sản phẩm (nên dùng ảnh PNG nền trong suốt) trên nền xám nhạt bo góc.
// Chưa có ảnh hoặc ảnh lỗi thì hiện icon cùng kiểu, không hiện khung "no image".
function CategoryTile({ item }) {
  const [broken, setBroken] = useState(false);
  const Icon = ICONS[item.icon] || Smartphone;
  const showImage = item.image && !broken;
  const cutout = isCutout(item.image);

  return (
    <Link to={item.path || `/category/${item.id}`} className="group flex flex-col items-center gap-1.5 text-center">
      <div className="relative w-full aspect-square max-w-[84px] rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-yellow-400 group-hover:shadow-md group-hover:-translate-y-0.5">
        {showImage ? (
          <img
            src={assetUrl(item.image)}
            alt={item.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className={`transition-transform duration-300 group-hover:scale-110 ${
              cutout ? 'w-[82%] h-[82%] object-contain drop-shadow-sm' : 'w-full h-full object-cover'
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
