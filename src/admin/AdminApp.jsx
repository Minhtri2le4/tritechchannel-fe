import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Spinner } from './ui';
import ScrollToTop from '../components/ScrollToTop';
import AdminLayout from './AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderPrintPage from './pages/OrderPrintPage';
import TradeInsPage from './pages/TradeInsPage';
import FeedbackPage from './pages/FeedbackPage';
import BlogCommentsPage from './pages/BlogCommentsPage';
import TradeInPrintPage from './pages/TradeInPrintPage';
import WarrantiesPage from './pages/WarrantiesPage';
import CouponsPage from './pages/CouponsPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersPage from './pages/UsersPage';
import HomeContentPage from './pages/HomeContentPage';
import CampaignsPage from './pages/CampaignsPage';
import CustomersPage from './pages/CustomersPage';
import ReviewsPage from './pages/ReviewsPage';
import PostsPage from './pages/PostsPage';
import PostFormPage from './pages/PostFormPage';
import MyWorkPage from './pages/MyWorkPage';
import StaffTasksPage from './pages/StaffTasksPage';
import SalesAnalyticsPage from './pages/SalesAnalyticsPage';
import CheckinsPage from './pages/CheckinsPage';

// Chặn trang khi chưa đăng nhập; adminOnly: chỉ tài khoản ADMIN
function Protected({ children, adminOnly }) {
  const { user, checking, isAdmin } = useAuth();
  if (checking) return <Spinner className="min-h-screen" />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

// Trang đầu sau khi đăng nhập: quản trị viên -> Tổng quan, nhân viên -> "Dành cho bạn"
function HomeIndex() {
  const { isAdmin } = useAuth();
  return isAdmin ? <DashboardPage /> : <Navigate to="/admin/me" replace />;
}

function AdminRoutes() {
  const { user, checking } = useAuth();
  return (
    <Routes>
      <Route path="login" element={!checking && user ? <Navigate to="/admin" replace /> : <LoginPage />} />
      {/* Trang in phiếu không có menu admin */}
      <Route path="orders/print" element={<Protected><OrderPrintPage /></Protected>} />
      <Route path="orders/:id/print" element={<Protected><OrderPrintPage /></Protected>} />
      <Route path="trade-ins/:id/print" element={<Protected><TradeInPrintPage /></Protected>} />
      <Route
        element={
          <Protected>
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<HomeIndex />} />
        <Route path="me" element={<MyWorkPage />} />
        <Route path="staff-tasks" element={<Protected adminOnly><StaffTasksPage /></Protected>} />
        <Route path="analytics" element={<Protected adminOnly><SalesAnalyticsPage /></Protected>} />
        <Route path="checkins" element={<Protected adminOnly><CheckinsPage /></Protected>} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="trade-ins" element={<TradeInsPage />} />
        <Route path="warranties" element={<WarrantiesPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="home-content" element={<HomeContentPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="blog-comments" element={<BlogCommentsPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="posts/new" element={<PostFormPage />} />
        <Route path="posts/:id" element={<PostFormPage />} />
        <Route path="users" element={<Protected adminOnly><UsersPage /></Protected>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <AdminRoutes />
    </AuthProvider>
  );
}
