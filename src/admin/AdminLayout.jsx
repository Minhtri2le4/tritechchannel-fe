import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, RefreshCw, ShieldCheck, Ticket, FolderTree, Users,
  LogOut, Menu, X, ExternalLink, KeyRound, LayoutTemplate,
  PartyPopper, Newspaper,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import ChangePasswordModal from './pages/ChangePasswordModal';

const NAV = [
  { group: null, items: [{ to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true }] },
  {
    group: 'Bán hàng',
    items: [
      { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
      { to: '/admin/trade-ins', label: 'Thu cũ đổi mới', icon: RefreshCw },
      { to: '/admin/warranties', label: 'Bảo hành', icon: ShieldCheck },
      { to: '/admin/coupons', label: 'Mã giảm giá', icon: Ticket },
    ],
  },
  {
    group: 'Sản phẩm',
    items: [
      { to: '/admin/products', label: 'Sản phẩm', icon: Package },
      { to: '/admin/categories', label: 'Danh mục', icon: FolderTree },
    ],
  },
  {
    group: 'Website',
    items: [
      { to: '/admin/posts', label: 'Blog', icon: Newspaper },
      { to: '/admin/home-content', label: 'Giao diện trang chủ', icon: LayoutTemplate },
      { to: '/admin/campaigns', label: 'Chương trình khuyến mãi', icon: PartyPopper },
    ],
  },
  { group: 'Hệ thống', items: [{ to: '/admin/users', label: 'Nhân viên', icon: Users, adminOnly: true }] },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-4 p-3">
      {NAV.map(({ group, items }) => {
        const visible = items.filter((n) => !n.adminOnly || isAdmin);
        if (!visible.length) return null;
        return (
          <div key={group || 'main'} className="flex flex-col gap-0.5">
            {group && <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">{group}</p>}
            {visible.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#FFD400] text-black font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );

  const brand = (
    <Link to="/admin" className="flex items-center gap-2 px-5 h-14 border-b border-white/10">
      <span className="text-lg font-black text-white tracking-tight">
        TRITECH<span className="text-[#FFD400]"> ADMIN</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col bg-gray-950">
        {brand}
        {nav}
      </aside>

      {/* Sidebar mobile */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)}>
          <aside className="w-64 h-full bg-gray-950" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button onClick={() => setMenuOpen(false)} className="text-gray-400 p-1">
                <X size={20} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <button onClick={() => setMenuOpen(true)} className="lg:hidden p-1.5 -ml-1.5 text-gray-700">
            <Menu size={22} />
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-black">
            <ExternalLink size={14} /> Xem website
          </a>
          <div className="flex items-center gap-1 sm:gap-3">
            <span className="hidden sm:flex w-8 h-8 rounded-full bg-gray-900 text-[#FFD400] text-sm font-black items-center justify-center">
              {user?.name?.trim().split(/\s+/).pop()?.[0]?.toUpperCase() || 'A'}
            </span>
            <div className="text-right sm:text-left leading-tight">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-[11px] text-gray-500">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
            </div>
            <button title="Đổi mật khẩu" onClick={() => setPwOpen(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black">
              <KeyRound size={18} />
            </button>
            <button title="Đăng xuất" onClick={logout} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}
