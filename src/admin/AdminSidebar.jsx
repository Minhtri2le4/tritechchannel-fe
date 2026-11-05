import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Moon, Search, Sun, X } from 'lucide-react';
import { assetUrl } from '../lib/api';

// Thanh menu admin kiểu "nổi": tách khỏi mép màn hình, bo góc lớn, thu gọn còn cột icon (rê chuột hiện tên),
// ô sáng trượt theo mục đang rê, ô tìm trang (Ctrl/⌘ + K), số đỏ báo việc cần làm, chế độ tối & tài khoản ở dưới.
// Nền đặc màu tối (không trong suốt).
export default function AdminSidebar({ nav, badges, collapsed, onToggle, theme, onTheme, user, onLogout, mobile = false, onNavigate }) {
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');
  const [hoverKey, setHoverKey] = useState(null);
  const [tip, setTip] = useState(null); // { label, count, top } – nhãn khi thu gọn
  const listRef = useRef(null);
  const itemRefs = useRef({});
  const searchRef = useRef(null);
  const [hoverBox, setHoverBox] = useState(null);
  const [activeBox, setActiveBox] = useState(null);
  const slim = collapsed && !mobile;

  const q = query.trim().toLowerCase();
  const groups = nav
    .map((g) => ({ ...g, items: g.items.filter((it) => !q || it.label.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length);
  const activeKey = groups
    .flatMap((g) => g.items)
    .filter((it) => (it.end ? pathname === it.to || pathname === `${it.to}/` : pathname.startsWith(it.to)))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to;

  // Vị trí ô sáng (rê chuột) và ô vàng (trang đang mở) – tính theo khung danh sách
  const boxOf = useCallback((key) => {
    const el = itemRefs.current[key];
    const box = listRef.current;
    if (!el || !box) return null;
    const a = el.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    return { top: a.top - b.top + box.scrollTop, height: a.height };
  }, []);

  // Đo lại vị trí ô vàng sau khi vẽ xong (đổi trang, thu gọn / mở rộng, lọc tìm kiếm)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setActiveBox(activeKey ? boxOf(activeKey) : null));
    // Menu đổi bề rộng có hiệu ứng ~0.5s -> đo lại khi xong
    const t = setTimeout(() => setActiveBox(activeKey ? boxOf(activeKey) : null), 520);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [activeKey, boxOf, slim, q, nav]);

  // Ctrl/⌘ + K: mở menu và nhảy vào ô tìm trang
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (slim) onToggle();
        setTimeout(() => searchRef.current?.focus(), 250);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slim, onToggle]);

  const showTip = (e, item) => {
    if (!slim) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ label: item.label, count: badges[item.to] || 0, top: r.top + r.height / 2 });
  };

  return (
    <div className={`relative flex h-full flex-col rounded-[22px] bg-[#14161b] text-[#d1d5db] ring-1 ring-white/5 ${mobile ? '' : 'shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)]'}`}>
      {/* Logo + nút thu gọn */}
      <div className={`flex items-center gap-2.5 pb-3 pt-4 ${slim ? 'justify-center px-2' : 'px-4'}`}>
        <Link to="/admin" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5">
          <img src="/assets/logo.png" alt="TriTech Channel" className="h-9 w-9 shrink-0 rounded-full bg-[#FFD400] object-contain p-1" />
          {!slim && (
            <span className="min-w-0 leading-tight">
              <span className="block text-sm font-black tracking-tight text-white">TriTech Admin</span>
              <span className="block text-[11px] text-[#8b919c]">Bảng quản trị cửa hàng</span>
            </span>
          )}
        </Link>
        {mobile ? (
          <button type="button" aria-label="Đóng menu" onClick={onNavigate} className="ml-auto rounded-full p-1.5 text-[#9ca3af] hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        ) : (
          <button
            type="button"
            aria-label={slim ? 'Mở rộng menu' : 'Thu gọn menu'}
            onClick={onToggle}
            className="absolute -right-3 top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow ring-1 ring-black/10 transition-transform hover:scale-110"
          >
            {slim ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Tìm trang */}
      <div className={slim ? 'px-2 pb-2' : 'px-3 pb-2'}>
        {slim ? (
          <button
            type="button"
            aria-label="Tìm trang"
            onMouseEnter={(e) => showTip(e, { label: 'Tìm trang (Ctrl K)', to: '' })}
            onMouseLeave={() => setTip(null)}
            onClick={() => {
              onToggle();
              setTimeout(() => searchRef.current?.focus(), 250);
            }}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-[#9ca3af] hover:bg-white/10 hover:text-white"
          >
            <Search size={18} />
          </button>
        ) : (
          <label className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2 text-sm ring-1 ring-white/5 focus-within:ring-[#FFD400]/60">
            <Search size={15} className="shrink-0 text-[#8b919c]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
              placeholder="Tìm trang"
              className="min-w-0 flex-1 bg-transparent text-[#e5e7eb] placeholder:text-[#6b7280] outline-none"
              style={{ fontSize: 14 }}
            />
            <kbd className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#9ca3af]">Ctrl K</kbd>
          </label>
        )}
      </div>

      {/* Danh sách trang */}
      <nav
        ref={listRef}
        onMouseLeave={() => {
          setHoverKey(null);
          setHoverBox(null);
        }}
        className={`relative flex-1 pb-2 ${slim ? 'overflow-visible px-2' : 'overflow-y-auto px-3'} admin-nav-scroll`}
      >
        {/* Ô vàng (trang đang mở) và ô sáng (đang rê chuột) trượt mượt giữa các mục */}
        {activeBox && (
          <span
            className="pointer-events-none absolute rounded-xl bg-[#FFD400] transition-all duration-500 ease-[cubic-bezier(0.22,1.2,0.36,1)]"
            style={{ top: activeBox.top, height: activeBox.height, left: slim ? 8 : 12, right: slim ? 8 : 12 }}
          />
        )}
        {hoverBox && hoverKey !== activeKey && (
          <span
            className="pointer-events-none absolute rounded-xl bg-white/[0.08] ring-1 ring-white/10 transition-all duration-300 ease-out"
            style={{ top: hoverBox.top, height: hoverBox.height, left: slim ? 8 : 12, right: slim ? 8 : 12 }}
          />
        )}

        {groups.map(({ group, items }) => (
          <div key={group || 'main'} className="relative">
            {group &&
              (slim ? (
                <span className="mx-auto my-2 block h-px w-6 bg-white/10" />
              ) : (
                <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">{group}</p>
              ))}
            {items.map((item) => {
              const { to, label, icon: Icon, end } = item;
              const count = badges[to] || 0;
              const active = to === activeKey;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  ref={(el) => (itemRefs.current[to] = el)}
                  onClick={() => {
                    setQuery('');
                    onNavigate?.();
                  }}
                  onMouseEnter={(e) => {
                    setHoverKey(to);
                    setHoverBox(boxOf(to));
                    showTip(e, item);
                  }}
                  onMouseLeave={() => setTip(null)}
                  className={`group relative z-10 flex items-center gap-3 rounded-xl py-2.5 text-sm transition-colors duration-200 ${
                    slim ? 'justify-center px-0' : 'px-3'
                  } ${active ? 'font-bold text-black' : 'font-medium text-[#c4c8d0] hover:text-white'}`}
                >
                  <span className="relative">
                    <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                    {slim && count > 0 && <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-[#14161b]" />}
                  </span>
                  {!slim && <span className="min-w-0 flex-1 truncate">{label}</span>}
                  {!slim && count > 0 && (
                    <span className={`min-w-5 rounded-full px-1.5 text-center text-[11px] font-bold leading-5 ${active ? 'bg-black/15 text-black' : 'bg-[#ef4444] text-white'}`}>
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
        {!groups.length && <p className="px-3 py-6 text-center text-xs text-[#6b7280]">Không có trang nào khớp “{query}”</p>}
      </nav>

      {/* Chế độ tối + tài khoản */}
      <div className={`border-t border-white/5 ${slim ? 'px-2 py-2' : 'px-3 py-2'}`}>
        <button
          type="button"
          onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
          onMouseEnter={(e) => showTip(e, { label: theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối', to: '' })}
          onMouseLeave={() => setTip(null)}
          className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-[#c4c8d0] hover:bg-white/[0.06] hover:text-white ${slim ? 'justify-center' : 'px-3'}`}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          {!slim && (
            <>
              <span className="flex-1 text-left">Chế độ tối</span>
              <span className="relative h-5 w-9 rounded-full transition-colors duration-300" style={{ background: theme === 'dark' ? '#FFD400' : '#3a3f4a' }}>
                <span
                  className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full shadow transition-transform duration-300"
                  style={{ background: '#fff', transform: theme === 'dark' ? 'translateX(16px)' : 'none' }}
                />
              </span>
            </>
          )}
        </button>

        <div className={`mt-1 flex items-center gap-2.5 rounded-xl py-2 ${slim ? 'justify-center' : 'px-2'}`}>
          <span className="relative h-9 w-9 shrink-0">
            <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#2a2e37] text-sm font-black text-[#FFD400]">
              {user?.avatar ? (
                <img src={assetUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                user?.name?.trim().split(/\s+/).pop()?.[0]?.toUpperCase() || 'A'
              )}
            </span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-[#14161b]" />
          </span>
          {!slim && (
            <>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm font-semibold text-white">{user?.name}</span>
                <span className="block truncate text-[11px] text-[#8b919c]">{user?.email}</span>
              </span>
              <button type="button" title="Đăng xuất" onClick={onLogout} className="rounded-lg p-1.5 text-[#9ca3af] hover:bg-white/10 hover:text-[#f87171]">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Nhãn tên khi thu gọn (fixed để không bị khung menu cắt) */}
      {slim && tip && (
        <span
          className="pointer-events-none fixed z-50 flex h-7 items-center gap-2 whitespace-nowrap rounded-lg bg-[#14161b] px-2.5 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10"
          style={{ left: 104, top: tip.top - 14, animation: 'popup-in 0.15s ease-out' }}
        >
          {tip.label}
          {tip.count > 0 && <span className="rounded-full bg-[#ef4444] px-1.5 text-[10px] leading-4">{tip.count}</span>}
        </span>
      )}
    </div>
  );
}
