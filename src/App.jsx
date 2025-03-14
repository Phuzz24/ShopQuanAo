import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './context/UserContext'; // Import UserProvider
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

//import logo
import logo from './images/logo.png'
import BackToTopButton from './components/BackToTopButton'; // Import nút Trở về đầu trang

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
        <Route path="/" element={<Navigate to="/home"/>}/>

          {/* Layout dành cho User */}
        <Route element={<UserLayout />}>
          <Route path="/home" element={<HomePage/>} />
          <Route path="/product" element={<ProductPage/>} />
          <Route path="/sale" element={<SalePage/>} />
          <Route path="/hot" element={<HotPage />} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/news" element={<NewPage />} />
          <Route path="/news/:id" element={<NewsDetailPage/>} />
          <Route path="/cart" element={<CartDetailPage/>}/>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/product-detail/:id" element={<ProductDetailPage />} />
          <Route path="/user-profile/:id" element={<UserProfilePage />} />
          <Route path="/order-history/:userId" element={<OrderHistoryPage />} />
        
          <Route path="*" element={<Footer />} />
          <Route path="*" element={<AdBanner />} />

        </Route>

         {/* Layout dành cho Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />}/>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="statistic" element={<Statistic />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        </Routes>
      <BackToTopButton />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeButton rtl={false} pauseOnFocusLoss draggable pauseOnHover />

    </Router>
    </CartProvider>
    </UserProvider>

  );
};

export default App;