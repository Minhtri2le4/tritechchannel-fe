// Icon có hiệu ứng khi rê chuột – lấy từ Its Hover (https://www.itshover.com, github.com/itshover/itshover),
// giấy phép Apache-2.0. Chuyển từ TypeScript sang JSX, giữ nguyên hình và chuyển động.
import { useRef } from 'react';

export { default as HomeIcon } from './home-icon.jsx';
export { default as LayoutDashboardIcon } from './layout-dashboard-icon.jsx';
export { default as MagnifierIcon } from './magnifier-icon.jsx';
export { default as RefreshIcon } from './refresh-icon.jsx';
export { default as ShieldCheckIcon } from './shield-check.jsx';
export { default as ShoppingCartIcon } from './shopping-cart-icon.jsx';
export { default as TelephoneIcon } from './telephone-icon.jsx';
export { default as PhoneVolumeIcon } from './phone-volume.jsx';
export { default as UserIcon } from './user-icon.jsx';

// Cả nút/link chạy hiệu ứng (không chỉ khi chuột nằm đúng trên icon); chạm trên điện thoại cũng chạy.
// Dùng: const [cartIcon, cartHover] = useIconHover(); <Link {...cartHover}><ShoppingCartIcon ref={cartIcon} /></Link>
export function useIconHover() {
  const ref = useRef(null);
  const start = () => ref.current?.startAnimation?.();
  const stop = () => ref.current?.stopAnimation?.();
  const onTouchStart = () => {
    start();
    setTimeout(stop, 700);
  };
  return [ref, { onMouseEnter: start, onMouseLeave: stop, onTouchStart }];
}
