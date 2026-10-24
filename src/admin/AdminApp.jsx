import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Spinner } from './ui';
import AdminLayout from './AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import TradeInsPage from './pages/TradeInsPage';
import WarrantiesPage from './pages/WarrantiesPage';
import CouponsPage from './pages/CouponsPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersPage from './pages/UsersPage';

// Chặn trang khi chưa đăng nhập; adminOnly: chỉ tài khoản ADMIN
function Protected({ children, adminOnly }) {
  const { user, checking, isAdmin } = useAuth();
  if (checking) return <Spinner className="min-h-screen" />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoutes() {
  const { user, checking } = useAuth();
  return (
    <Routes>
      <Route path="login" element={!checking && user ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route
        element={
          <Protected>
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="trade-ins" element={<TradeInsPage />} />
        <Route path="warranties" element={<WarrantiesPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="users" element={<Protected adminOnly><UsersPage /></Protected>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminRoutes />
    </AuthProvider>
  );
}
