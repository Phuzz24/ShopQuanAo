import React, { useState } from "react";
import { FaShoppingBag, FaSearch, FaUserCircle } from "react-icons/fa";  // Import FaUserCircle
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartSlidebar from "./CartSlidebar"; 
import { useUser } from '../context/UserContext';  // Import useUser
import { toast } from 'react-toastify';  // Import react-toastify


const Navbar = () => {
  const [showCart, setShowCart] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // To handle mobile menu toggle
  const { cart } = useCart();
  const { user, logout } = useUser();  // Lấy thông tin người dùng và hàm logout

  const [showDropdown, setShowDropdown] = useState(false);  // State để kiểm soát menu dropdown

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const getTotalItems = () => {
    return cart.reduce((total, product) => total + product.quantity, 0);
  };

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="text-3xl font-bold text-red-600">
          NEO<span className="text-black">PLATTON</span>
        </Link>

        {/* Thanh tìm kiếm */}
        <div className="relative flex items-center flex-1 mx-4">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full px-4 py-2 border rounded-2xl text-gray-700 font-medium"
          />
          <FaSearch className="absolute right-3 text-gray-600 cursor-pointer" />
        </div>

        {/* Menu Toggle Button (Hamburger) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Menu for Desktop */}
        <div className="hidden md:flex space-x-6 text-gray-800 font-medium">
          <Link to="/home" className="hover:text-red-600 transition duration-300 ease-in-out">
            Trang chủ
          </Link>

          {/* Menu Sản phẩm */}
          <div className="relative group">
            <Link to="/product">
              <button className="hover:text-red-600 transition duration-300 ease-in-out">
                Sản Phẩm ▼
              </button>
            </Link>
            <div className="absolute left-0 hidden group-hover:block bg-white shadow-lg rounded-md w-48 py-2 z-10">
              <div className="flex flex-col">
                <Link to="/product/ao" className="block px-4 py-2 hover:bg-gray-100">Điện thoại</Link>
                <Link to="/product/quan" className="block px-4 py-2 hover:bg-gray-100">Laptop</Link>
                <Link to="/product/macbook" className="block px-4 py-2 hover:bg-gray-100">Macbook</Link>
                <Link to="/product/ipad" className="block px-4 py-2 hover:bg-gray-100">iPad</Link>
                <Link to="/product/giay" className="block px-4 py-2 hover:bg-gray-100">Tai nghe</Link>
              </div>
            </div>
          </div>

          <Link to="/sale" className="hover:text-red-600 transition duration-300 ease-in-out">
            SALE TỐT
          </Link>
          <Link to="/news" className="hover:text-red-600 transition duration-300 ease-in-out">
            Tin Tức
          </Link>
        </div>

        {/* Hiển thị khi người dùng đã đăng nhập */}
        <div className="ml-6 flex items-center space-x-2 text-gray-800">
          {user ? (
            <>
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)} 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-full transition duration-300"
                >
                  <FaUserCircle className="text-3xl text-gray-600" />
                  <span className="text-sm text-gray-800">{user.name}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-md border-gray-200 border">
                    <Link 
                      to="/user-profile" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition duration-200"
                    >
                      Xem thông tin cá nhân
                    </Link>
                    <Link 
                      to="/order-history" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition duration-200"
                    >
                      Xem lịch sử đơn hàng
                      </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition duration-200"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-red-600">Đăng Nhập</Link>
              <Link to="">/</Link>
              <Link to="/register" className="hover:text-red-600">Đăng ký</Link>
            </>
          )}

          {/* Cart icon */}
          <button onClick={toggleCart}>
            <div className="text-xl hover:text-red-600 cursor-pointer transition duration-300 ease-in-out ml-5 relative">
              <FaShoppingBag />
              {getTotalItems() > 0 && (
                <span className="absolute top-0 right-0 text-xs bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </div>
          </button>
        </div>

      </div>

      {/* Thêm lớp mờ khi giỏ hàng mở */}
      {showCart && (
        <div className="fixed inset-0 bg-black opacity-70 z-40" onClick={toggleCart}></div>
      )}

      {/* Cart Slidebar */}
      <CartSlidebar showCart={showCart} toggleCart={toggleCart} />
    </nav>
  );
};

export default Navbar;
