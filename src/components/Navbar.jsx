import React, { useState, useEffect } from "react";
import { FaShoppingBag, FaSearch, FaUserCircle, FaTimes, FaHeart, FaBell } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartSlidebar from "./CartSlidebar";
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment-timezone';

const Navbar = () => {
  const [showCart, setShowCart] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const { cart } = useCart();
  const { user, token, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleCart = () => setShowCart(!showCart);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    if (!showNotificationDropdown) {
      markNotificationsAsRead();
    }
  };

  const getTotalItems = () => cart.reduce((total, product) => total + product.quantity, 0);
  const getUnreadNotifications = () => notifications.filter(notification => !notification.isRead).length;

  // Lấy thông báo từ API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        console.log('No token found, skipping fetchNotifications');
        return;
      }
      try {
        console.log('Fetching notifications with token:', token);
        const response = await fetch('http://localhost:5000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetch notifications response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch notifications failed with status:', response.status, 'Response text:', errorText);
          throw new Error('Không thể tải thông báo');
        }
        const data = await response.json();
        console.log('Fetch notifications response data:', data);
        if (!data.success) {
          throw new Error(data.message || 'Không thể tải thông báo');
        }
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error.message, error.stack);
        toast.error(error.message, { autoClose: 2000 });
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [token]);

  // Đánh dấu tất cả thông báo là đã đọc
  const markNotificationsAsRead = async () => {
    if (!token) {
      console.log('No token found, skipping markNotificationsAsRead');
      return;
    }
    try {
      const unreadNotifications = notifications.filter(notification => !notification.isRead);
      console.log('Unread notifications to mark as read:', unreadNotifications);
      for (const notification of unreadNotifications) {
        console.log(`Marking notification ${notification.notificationId} as read`);
        const response = await fetch(`http://localhost:5000/api/notifications/${notification.notificationId}/read`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(`Mark notification ${notification.notificationId} response status:`, response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to mark notification ${notification.notificationId} as read, Status: ${response.status}, Response:`, errorText);
          throw new Error(`Không thể đánh dấu thông báo ${notification.notificationId} là đã đọc`);
        }
        const data = await response.json();
        console.log(`Mark notification ${notification.notificationId} response data:`, data);
        if (!data.success) {
          throw new Error(data.message || `Không thể đánh dấu thông báo ${notification.notificationId} là đã đọc`);
        }
      }
      // Cập nhật state sau khi đánh dấu
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true,
      })));
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error.message, error.stack);
      toast.error(error.message, { autoClose: 2000 });
    }
  };

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
    <nav className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 shadow-xl py-4 px-6 sticky top-0 z-50 border-b-2 border-yellow-500/70">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 tracking-tight">
          NEO<span className="text-white">PLATTON</span>
        </Link>

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearch} className="relative hidden md:flex items-center flex-1 mx-6">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-full text-gray-300 bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-300 placeholder-gray-500 shadow-sm"
          />
          <button type="submit" className="absolute right-3 text-gray-300 hover:text-yellow-500 transition duration-300">
            <FaSearch />
          </button>
        </form>

        {/* Menu Toggle Button (Hamburger) */}
        <button onClick={toggleMobileMenu} className="md:hidden text-yellow-500 focus:outline-none">
          {isMobileMenuOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-8 text-gray-200 font-medium">
          <Link to="/home" className="hover:text-yellow-500 transition duration-300">
            Trang chủ
          </Link>

          {/* Menu Sản phẩm */}
          <div className="relative group">
            <Link to="/product">
              <button className="hover:text-yellow-500 transition duration-300 flex items-center">
                Sản Phẩm <span className="ml-1">▼</span>
              </button>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 hidden group-hover:block bg-gray-800 shadow-xl rounded-lg w-48 py-2 z-10 border border-gray-700/50"
            >
              <Link to="/product?category=Điện thoại" className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-yellow-500 transition duration-200">Điện thoại</Link>
              <Link to="/product?category=Laptop" className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-yellow-500 transition duration-200">Laptop</Link>
              <Link to="/product?category=Macbook" className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-yellow-500 transition duration-200">Macbook</Link>
              <Link to="/product?category=Tablet" className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-yellow-500 transition duration-200">Máy tính bảng</Link>
            </motion.div>
          </div>

          <Link to="/sale" className="hover:text-yellow-500 transition duration-300">
            SALE TỐT
          </Link>
          <Link to="/news" className="hover:text-yellow-500 transition duration-300">
            Tin Tức
          </Link>

          {/* User Section */}
          <div className="relative flex items-center space-x-4">
            {/* Notification Icon */}
            <div className="relative">
              <motion.button
                onClick={toggleNotificationDropdown}
                whileHover={{ scale: 1.1 }}
                className="text-yellow-500 hover:text-yellow-400 transition duration-300"
              >
                <FaBell className="text-2xl" />
                {getUnreadNotifications() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {getUnreadNotifications()}
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence>
                {showNotificationDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl z-50 p-4 border border-gray-700/50"
                  >
                    <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2 mb-2">
                      <FaBell className="text-yellow-500" /> Thông Báo
                    </h3>
                    {notifications.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.slice(0, 3).map((notification) => (
                          <div
                            key={notification.notificationId}
                            className={`p-2 rounded-md ${notification.isRead ? 'bg-gray-700' : 'bg-yellow-600/20'}`}
                          >
                            <p className="text-sm font-medium text-gray-200">{notification.title}</p>
                            <p className="text-sm text-gray-400">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.createdAt}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">Không có thông báo nào.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={toggleDropdown}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 hover:bg-gray-700/50 p-2 rounded-full transition duration-300"
                >
                  <FaUserCircle className="text-2xl text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-200">{user.Username}</span>
                </motion.button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 shadow-xl rounded-lg border border-gray-700/50"
                    >
                      <Link
                        to="/user-profile"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-yellow-500 transition duration-200"
                        onClick={() => setShowDropdown(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/order-history"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-yellow-500 transition duration-200"
                        onClick={() => setShowDropdown(false)}
                      >
                        Lịch sử đơn hàng
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-yellow-500 transition duration-200 flex items-center gap-2"
                        onClick={() => setShowDropdown(false)}
                      >
                        Danh sách yêu thích
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-yellow-500 transition duration-200"
                      >
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="hover:text-yellow-500 transition duration-300">Đăng Nhập</Link>
                <span className="text-gray-400">/</span>
                <Link to="/register" className="hover:text-yellow-500 transition duration-300">Đăng Ký</Link>
              </div>
            )}

            {/* Cart */}
            <motion.button
              onClick={toggleCart}
              whileHover={{ scale: 1.1 }}
              className="relative text-2xl hover:text-yellow-400 transition duration-300"
            >
              <FaShoppingBag className="text-yellow-500" />
              {getTotalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {getTotalItems()}
                </motion.span>
              )}
            </motion.button>
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
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-16 left-0 w-full bg-gray-800 shadow-lg p-4 z-50 border-t border-gray-700/50"
          >
            <div className="flex flex-col space-y-4 text-gray-200 font-medium">
              <Link to="/home" onClick={toggleMobileMenu} className="hover:text-yellow-500 transition duration-200">Trang chủ</Link>

              {/* Menu Sản phẩm Mobile */}
              <div>
                <Link to="/product" onClick={toggleMobileMenu} className="w-full text-left hover:text-yellow-500 transition duration-200">
                  Sản Phẩm ▼
                </Link>
                <div className="pl-4 mt-2 space-y-2">
                  <Link to="/product?category=Điện thoại" onClick={toggleMobileMenu} className="block hover:text-yellow-500 transition duration-200">Điện thoại</Link>
                  <Link to="/product?category=Laptop" onClick={toggleMobileMenu} className="block hover:text-yellow-500 transition duration-200">Laptop</Link>
                  <Link to="/product?category=Macbook" onClick={toggleMobileMenu} className="block hover:text-yellow-500 transition duration-200">Macbook</Link>
                  <Link to="/product?category=Tablet" onClick={toggleMobileMenu} className="block hover:text-yellow-500 transition duration-200">Máy tính bảng</Link>
                </div>
              </div>

              <Link to="/sale" onClick={toggleMobileMenu} className="hover:text-yellow-500 transition duration-200">SALE TỐT</Link>
              <Link to="/news" onClick={toggleMobileMenu} className="block hover:text-yellow-500 transition duration-200">Tin Tức</Link>

              {/* Notification Section Mobile */}
              <div className="relative">
                <button
                  onClick={toggleNotificationDropdown}
                  className="flex items-center space-x-2 hover:text-yellow-500 transition duration-200"
                >
                  <FaBell className="text-yellow-500" />
                  <span>Thông Báo</span>
                  {getUnreadNotifications() > 0 && (
                    <span className="text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {getUnreadNotifications()}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotificationDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 w-full bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-700/50"
                    >
                      <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2 mb-2">
                        <FaBell className="text-yellow-500" /> Thông Báo
                      </h3>
                      {notifications.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {notifications.slice(0, 3).map((notification) => (
                            <div
                              key={notification.notificationId}
                              className={`p-2 rounded-md ${notification.isRead ? 'bg-gray-700' : 'bg-yellow-600/20'}`}
                            >
                              <p className="text-sm font-medium text-gray-200">{notification.title}</p>
                              <p className="text-sm text-gray-400">{notification.message}</p>
                              <p className="text-xs text-gray-500">{notification.createdAt}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">Không có thông báo nào.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Section Mobile */}
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <FaUserCircle className="text-2xl text-yellow-500" />
                    <span>{user.Username}</span>
                  </div>
                  <Link to="/user-profile" onClick={toggleMobileMenu} className="hover:text-yellow-500 transition duration-200">
                    Thông tin cá nhân
                  </Link>
                  <Link to="/order-history" onClick={toggleMobileMenu} className="hover:text-yellow-500 transition duration-200">
                    Lịch sử đơn hàng
                  </Link>
                  <Link to="/wishlist" onClick={toggleMobileMenu} className="hover:text-yellow-500 transition duration-200 flex items-center gap-2">
                     Danh sách yêu thích
                  </Link>
                  <button onClick={handleLogout} className="text-left hover:text-yellow-500 transition duration-200">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login" onClick={toggleMobileMenu} className="hover:text-yellow-500 transition duration-200">Đăng Nhập</Link>
                  <span className="text-gray-400">/</span>
                  <Link to="/register" onClick={toggleMobileMenu} className="hover:text-yellow-500 transition duration-200">Đăng Ký</Link>
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