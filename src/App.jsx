import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import WarrantyPage from './pages/WarrantyPage';
import TradeInPage from './pages/TradeInPage';
import Promotions from './pages/Promotions';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import CartPage from './pages/CartPage';
import ProductDetail from './pages/ProductDetail';
import PolicyPage from './pages/PolicyPage';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';

// Trang quản trị tách bundle riêng, chỉ tải khi vào /admin
const AdminApp = lazy(() => import('./admin/AdminApp'));

// Import CartProvider
import { CartProvider } from './context/CartContext';
import { CustomerProvider } from './context/CustomerContext';
import MobileBottomNav from './components/MobileBottomNav';
import VoucherPopup from './components/VoucherPopup';

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] text-gray-800 pb-16 md:pb-0">
      <ScrollToTop />
      {/* Header giờ sẽ tự lấy dữ liệu giỏ hàng từ Context */}
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/bao-hanh" element={<WarrantyPage />} />
          <Route path="/thu-cu-doi-moi" element={<TradeInPage />} />
          <Route path="/smart-home" element={<Navigate to="/category/9" replace />} />
          <Route path="/category/10" element={<Promotions />} />
          <Route path="/promotions" element={<Promotions />} />
          {/* "Tin công nghệ" cũ nay là Blog – giữ link cũ, tự chuyển sang /blog */}
          <Route path="/category/11" element={<Navigate to="/blog" replace />} />
          <Route path="/tech-news" element={<Navigate to="/blog" replace />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/chinh-sach/:slug" element={<PolicyPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/tai-khoan" element={<AccountPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <MobileBottomNav />
      <VoucherPopup />
    </div>
  );
}

// Bọc CartProvider ở ngoài cùng
export default function App() {
  const { pathname } = useLocation();

  // /admin dùng giao diện riêng, không có Header/Footer của website
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <CustomerProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </CustomerProvider>
  );
}