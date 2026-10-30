import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';

// Nội dung trang chủ mặc định – dùng khi chưa cấu hình trong Admin → Giao diện trang chủ
// (ảnh nằm trong public/assets: <tên>.webp 1600px cho máy tính, <tên>-sm.webp 800px cho điện thoại)
const banner = (name, link = null) => ({
  image: `/assets/${name}.webp`,
  imageMobile: `/assets/${name}-sm.webp`,
  link,
  alt: '',
});

export const DEFAULT_HOME = {
  banners: ['A1695', 'why', 'thucu', 'tainghe', 'asus', 'aura', 'best', 'quy'].map((n) => banner(n)),
  sideBanners: {
    left: { image: '/assets/bannermini-left.webp', link: '/promotions' },
    right: { image: '/assets/bannermini-right.webp', link: '/promotions' },
  },
  reviewVideo: { url: 'https://www.youtube.com/watch?v=RIDVNiNebt4' },
  // Banner ngang giữa trang (trên mục Blog)
  promoBanner: { image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=200&fit=crop', link: '' },
  // Popup voucher: tắt cho tới khi admin tải ảnh lên và bật
  popup: { enabled: false, image: '', link: '', frequency: 'session' },
  shorts: [
    { url: 'https://www.youtube.com/shorts/1krdQqyCpbw', title: 'Review tai nghe và thiết bị công nghệ', productName: 'Sạc Dự Phòng Anker Zolo 25.000mAh 165W', price: 1400000, oldPrice: null, productImage: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mpfaa59kf8cgc0.webp', productLink: null },
    { url: 'https://www.youtube.com/shorts/79QrqmGRrzk', title: 'Đánh giá chi tiết củ sạc nhanh', productName: 'Bộ sạc nhanh Anker ZoLo 140W (4 cổng, GaN)', price: 900000, oldPrice: null, productImage: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mpuizoniuiob90.webp', productLink: null },
    { url: 'https://www.youtube.com/shorts/gBw27RN96LU', title: 'Tai nghe chống ồn', productName: 'Tai Nghe Không Dây Baseus BP1 Pro ANC -50dB', price: 388000, oldPrice: null, productImage: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mspd8f20yupya2.webp', productLink: null },
    { url: 'https://www.youtube.com/shorts/8ut8aOKLfyA', title: 'Trải nghiệm nhanh phụ kiện', productName: 'Tai nghe Bluetooth Ugreen Hitune Max5c Hi-Res', price: 499000, oldPrice: 799000, productImage: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mo58anpzl4au06.webp', productLink: null },
    { url: 'https://www.youtube.com/shorts/rPjLNSUs4eQ', title: 'Trạm sạc di động', productName: 'Trạm sạc di động Anker SOLIX C300 DC - A1726', price: 4000000, oldPrice: null, productImage: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mpul7sbjssunc4.webp', productLink: null },
  ],
};

// Gộp cấu hình đã lưu với mặc định: phần nào chưa lưu (hoặc danh sách rỗng) thì dùng mặc định
export const mergeHome = (saved) => ({
  banners: saved?.banners?.length ? saved.banners : DEFAULT_HOME.banners,
  sideBanners: saved?.sideBanners ?? DEFAULT_HOME.sideBanners,
  reviewVideo: saved?.reviewVideo?.url ? saved.reviewVideo : DEFAULT_HOME.reviewVideo,
  shorts: saved?.shorts?.length ? saved.shorts : DEFAULT_HOME.shorts,
  popup: { ...DEFAULT_HOME.popup, ...saved?.popup },
  promoBanner: saved?.promoBanner ?? DEFAULT_HOME.promoBanner,
});

// Nội dung trang chủ cho website: hiện mặc định ngay, có dữ liệu từ admin thì thay
export function useHomeContent() {
  const { data } = useFetch(() => shopApi.homeSettings(), []);
  return mergeHome(data);
}
