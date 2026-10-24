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
import TechNews from './pages/TechNews';
import CartPage from './pages/CartPage';
import ProductDetail from './pages/ProductDetail';
import PolicyPage from './pages/PolicyPage';
import NotFound from './pages/NotFound';

// Trang quản trị tách bundle riêng, chỉ tải khi vào /admin
const AdminApp = lazy(() => import('./admin/AdminApp'));

// Import CartProvider
import { CartProvider } from './context/CartContext';

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] text-gray-800">
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
          <Route path="/category/11" element={<TechNews />} />
          <Route path="/tech-news" element={<TechNews />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/chinh-sach/:slug" element={<PolicyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
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
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}