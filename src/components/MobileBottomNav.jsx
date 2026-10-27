import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, RefreshCw, Headset, Gift } from 'lucide-react';

// Sự kiện để Header mở menu DANH MỤC từ thanh dưới đáy
export const OPEN_CATEGORY_MENU = 'tritech:open-category-menu';

const itemClass = (active) =>
  `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-semibold transition-colors ${
    active ? 'text-black' : 'text-gray-500'
  }`;

function Item({ icon: Icon, label, active, hot }) {
  return (
    <>
      <span className={`relative flex items-center justify-center w-10 h-7 rounded-full ${active ? 'bg-[#FFD400]' : ''}`}>
        <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
        {hot && <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[7px] font-black px-1 rounded-full leading-3">HOT</span>}
      </span>
      {label}
    </>
  );
}

// Thanh điều hướng cố định dưới đáy, chỉ hiện trên điện thoại (giống app bán hàng)
export default function MobileBottomNav() {
  const openMenu = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.dispatchEvent(new Event(OPEN_CATEGORY_MENU));
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-14">
        <NavLink to="/" end className={({ isActive }) => itemClass(isActive)}>
          {({ isActive }) => <Item icon={Home} label="Trang chủ" active={isActive} />}
        </NavLink>
        <button type="button" onClick={openMenu} className={itemClass(false)}>
          <Item icon={LayoutGrid} label="Danh mục" />
        </button>
        <NavLink to="/thu-cu-doi-moi" className={({ isActive }) => itemClass(isActive)}>
          {({ isActive }) => <Item icon={RefreshCw} label="Thu cũ" active={isActive} hot />}
        </NavLink>
        <a href="https://zalo.me/0325477841" target="_blank" rel="noopener noreferrer" className={itemClass(false)}>
          <Item icon={Headset} label="Liên hệ" />
        </a>
        <NavLink to="/promotions" className={({ isActive }) => itemClass(isActive)}>
          {({ isActive }) => <Item icon={Gift} label="Ưu đãi" active={isActive} />}
        </NavLink>
      </div>
    </nav>
  );
}
