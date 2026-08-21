import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import WarrantyPage from './pages/WarrantyPage';
import TradeInPage from './pages/TradeInPage';
import SmartHome from './pages/SmartHome';
import Promotions from './pages/Promotions';
import TechNews from './pages/TechNews';
import CartPage from './pages/CartPage';
import ProductDetail from './pages/ProductDetail';

// Import CartProvider
import { CartProvider } from './context/CartContext';

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] text-gray-800">
      {/* Header giờ sẽ tự lấy dữ liệu giỏ hàng từ Context */}
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/bao-hanh" element={<WarrantyPage />} />
          <Route path="/thu-cu-doi-moi" element={<TradeInPage />} />
          <Route path="/category/9" element={<SmartHome />} /> 
          <Route path="/smart-home" element={<SmartHome />} />
          <Route path="/category/10" element={<Promotions />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/category/11" element={<TechNews />} />
          <Route path="/tech-news" element={<TechNews />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

// Bọc CartProvider ở ngoài cùng
export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}