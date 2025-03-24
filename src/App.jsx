import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider, useUser } from './context/UserContext'; // Import UserProvider và useUser
import AdBanner from './components/AdBanner';

// Import TawkToWidget component
import TawkToWidget from './components/TawkToWidget';

//Layout
import UserLayout from './layout/UserLayout';
import AdminLayout from './layout/AdminLayout';

//User Page
import Navbar from "./components/Navbar"
import HomePage from './routes/HomePage'
import ProductPage from './routes/ProductPage'
import SalePage from './routes/SalePage'
import HotPage from './routes/HotPage'
import LoginPage from './routes/LoginPage'
import RegisterPage from './routes/RegisterPage'
import NewPage from './routes/NewPage'
import NewsDetailPage from './components/NewsDetailPage'
import CartDetailPage from './components/CartDetailPage';
import ForgotPasswordPage from './routes/ForgotPasswordPage';
import ProductDetailPage from './routes/ProductDetailPage';
import UserProfilePage from './routes/UserProfilePage';
import OrderHistoryPage from './routes/OrderHistoryPage';
import Footer from './components/Footer';
import CheckoutPage from './routes/CheckoutPage';
import OrderDetailPage from './routes/OrderDetailPage';
import WishlistPage from './routes/WishListPage';
//Admin Page
import AdminUsers from './routes/admin/AdminUsers';
import Categories from './routes/admin/Categories';
import Customers from './routes/admin/Customers';
import Orders from './routes/admin/Orders';
import Products from './routes/admin/Products';
import Settings from './routes/admin/Settings';
import Dashboard from './components/admin/Dashboard'
import NotFound from './routes/admin/NotFound';
import Statistic from './routes/admin/Statistic';
import ProductDetail from './routes/admin/ProductDetail';
import Brand from './routes/admin/Brands';
import DiscountCodes from './routes/admin/DiscountCodes';
// // Bảo vệ route cho người dùng đã đăng nhập
// const ProtectedRoute = ({ children }) => {
//   const { user } = React.useContext(UserContext);
//   return user ? children : <Navigate to="/login" />;
// };

//import logo
import logo from './images/logo.png'
import BackToTopButton from './components/BackToTopButton'; // Import nút Trở về đầu trang


// Component bảo vệ route Admin
const AdminRoute = ({ children }) => {
  const { user } = useUser();
  console.log('AdminRoute - Current user:', user);

  if (!user) {
    console.log('AdminRoute - No user, redirecting to /login');
    return <Navigate to="/login" />;
  }

  if (user.Role !== 'Admin') {
    console.log('AdminRoute - User is not Admin, redirecting to /home');
    return <Navigate to="/home" />;
  }

  return children;
};

// Component bảo vệ route yêu cầu đăng nhập và chuyển hướng Admin
const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  console.log('ProtectedRoute - Current user:', user);

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to /login');
    return <Navigate to="/login" />;
  }

  // Nếu người dùng là Admin và đang truy cập route không phải /admin, chuyển hướng đến /admin
  if (user.Role === 'Admin' && !window.location.pathname.startsWith('/admin')) {
    console.log('ProtectedRoute - User is Admin, redirecting to /admin');
    return <Navigate to="/admin" />;
  }

  return children;
};

// Component xử lý chuyển hướng sau khi đăng nhập
const RedirectAfterLogin = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.Role === 'Admin') {
    return <Navigate to="/admin" />;
  }

  return <Navigate to="/home" />;
};
const App = () => {
  return (
    <UserProvider>
      <CartProvider>

    <Router>
      <Helmet>
        <title>NeoPlaton</title>
        <link rel="icon" href={logo} className='' /> {/* Đặt logo làm favicon */}
        </Helmet>
      <TawkToWidget />

      <Routes>
      <Route path="/" element={<RedirectAfterLogin />} />
          {/* Layout dành cho User */}
          <Route element={<UserLayout />}>
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/sale" element={<SalePage />} />
              <Route path="/hot" element={<HotPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/news" element={<NewPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/cart" element={<ProtectedRoute><CartDetailPage /></ProtectedRoute>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/product-detail/:id" element={<ProductDetailPage />} />
              <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/user-profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
              <Route path="/order-history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            </Route>

         {/* Layout dành cho Admin */}
         <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
          <Route index element={<Dashboard />}/>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="statistic" element={<Statistic />} />
          <Route path="brands" element={<Brand />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="discount-codes" element={<DiscountCodes />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        </Routes>
      <BackToTopButton />
      <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
    </Router>
    </CartProvider>
    </UserProvider>

  );
};

export default App;