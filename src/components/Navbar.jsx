import React, { useState } from "react";
import { FaShoppingBag, FaSearch, FaUserCircle, FaTimes } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartSlidebar from "./CartSlidebar";
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [showCart, setShowCart] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart } = useCart();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleCart = () => setShowCart(!showCart);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const getTotalItems = () => cart.reduce((total, product) => total + product.quantity, 0);

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!", { position: toast.POSITION.TOP_RIGHT });
    setShowDropdown(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const currentPath = location.pathname;
      const searchTerm = searchQuery.trim();

      if (currentPath.startsWith('/product')) {
        navigate(`/product?search=${encodeURIComponent(searchTerm)}`);
      } else if (currentPath === '/sale') {
        navigate(`/sale?search=${encodeURIComponent(searchTerm)}`);
      } else {
        navigate(`/product?search=${encodeURIComponent(searchTerm)}`);
      }

      toast.info(`Tìm kiếm: ${searchTerm}`, { position: toast.POSITION.TOP_RIGHT });
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 shadow-lg py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="text-3xl font-bold text-red-600 tracking-tight">
          NEO<span className="text-gray-800">PLATTON</span>
        </Link>

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearch} className="relative hidden md:flex items-center flex-1 mx-6">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
          />
          <button type="submit" className="absolute right-3 text-gray-600 hover:text-indigo-600">
            <FaSearch />
          </button>
        </form>

        {/* Menu Toggle Button (Hamburger) */}
        <button onClick={toggleMobileMenu} className="md:hidden text-gray-800 focus:outline-none">
          {isMobileMenuOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-8 text-gray-800 font-medium">
          <Link to="/home" className="hover:text-indigo-600 transition duration-300">
            Trang chủ
          </Link>

          {/* Menu Sản phẩm */}
          <div className="relative group">
            <Link to="/product">
              <button className="hover:text-indigo-600 transition duration-300 flex items-center">
                Sản Phẩm <span className="ml-1">▼</span>
              </button>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 hidden group-hover:block bg-white shadow-xl rounded-lg w-48 py-2 z-10 border border-gray-100"
            >
              <Link to="/product?category=Điện thoại" className="block px-4 py-2 hover:bg-indigo-50">Điện thoại</Link>
              <Link to="/product?category=Laptop" className="block px-4 py-2 hover:bg-indigo-50">Laptop</Link>
              <Link to="/product?category=Macbook" className="block px-4 py-2 hover:bg-indigo-50">Macbook</Link>
              <Link to="/product?category=Tablet" className="block px-4 py-2 hover:bg-indigo-50">Máy tính bảng</Link>
            </motion.div>
          </div>

          <Link to="/sale" className="hover:text-indigo-600 transition duration-300">
            SALE TỐT
          </Link>
          <Link to="/news" className="hover:text-indigo-600 transition duration-300">
            Tin Tức
          </Link>

          {/* User Section */}
          <div className="relative flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-full transition duration-300"
                >
                  <FaUserCircle className="text-2xl text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">{user.Username}</span>
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg border border-gray-100"
                    >
                      <Link
                        to="/user-profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-indigo-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/order-history"
                        className="block px-4 py-2 text-gray-800 hover:bg-indigo-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        Lịch sử đơn hàng
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-indigo-50"
                      >
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="hover:text-indigo-600 transition duration-300">Đăng Nhập</Link>
                <span>/</span>
                <Link to="/register" className="hover:text-indigo-600 transition duration-300">Đăng Ký</Link>
              </div>
            )}

            {/* Cart */}
            <button onClick={toggleCart} className="relative text-2xl hover:text-indigo-600 transition duration-300">
              <FaShoppingBag />
              {getTotalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {getTotalItems()}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg p-4 z-50 border-t border-gray-200"
          >
            <div className="flex flex-col space-y-4 text-gray-800 font-medium">
              <Link to="/home" onClick={toggleMobileMenu} className="hover:text-indigo-600">Trang chủ</Link>

              {/* Menu Sản phẩm Mobile */}
              <div>
                <Link to="/product" onClick={toggleMobileMenu} className="w-full text-left hover:text-indigo-600">
                  Sản Phẩm ▼
                </Link>
                <div className="pl-4 mt-2 space-y-2">
                  <Link to="/product?category=Điện thoại" onClick={toggleMobileMenu} className="block hover:text-indigo-600">Điện thoại</Link>
                  <Link to="/product?category=Laptop" onClick={toggleMobileMenu} className="block hover:text-indigo-600">Laptop</Link>
                  <Link to="/product?category=Macbook" onClick={toggleMobileMenu} className="block hover:text-indigo-600">Macbook</Link>
                  <Link to="/product?category=Máy tính bảng" onClick={toggleMobileMenu} className="block hover:text-indigo-600">Máy tính bảng</Link>
                </div>
              </div>

              <Link to="/sale" onClick={toggleMobileMenu} className="hover:text-indigo-600">SALE TỐT</Link>
              <Link to="/news" onClick={toggleMobileMenu} className="hover:text-indigo-600">Tin Tức</Link>

              {/* User Section Mobile */}
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <FaUserCircle className="text-2xl text-gray-600" />
                    <span>{user.Username}</span>
                  </div>
                  <Link to="/user-profile" onClick={toggleMobileMenu} className="hover:text-indigo-600">
                    Thông tin cá nhân
                  </Link>
                  <Link to="/order-history" onClick={toggleMobileMenu} className="hover:text-indigo-600">
                    Lịch sử đơn hàng
                  </Link>
                  <button onClick={handleLogout} className="text-left hover:text-indigo-600">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login" onClick={toggleMobileMenu} className="hover:text-indigo-600">Đăng Nhập</Link>
                  <span>/</span>
                  <Link to="/register" onClick={toggleMobileMenu} className="hover:text-indigo-600">Đăng Ký</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay khi giỏ hàng mở */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleCart}></div>
      )}

      {/* Cart Slidebar */}
      <CartSlidebar showCart={showCart} toggleCart={toggleCart} />
    </nav>
  );
};

export default Navbar;