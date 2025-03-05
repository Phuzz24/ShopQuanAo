import React, { useState } from 'react';
import { FaShoppingBag, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartSlidebar } from './CartSlidebar'; // Import CartSlidebar component

const Navbar = () => {
  const [showCart, setShowCart] = useState(false);
  const { cart } = useCart();

  const toggleCart = () =>{
    setShowCart(!showCart);
  }
  const [showSubmenuAo, setShowSubmenuAo] = useState(false);
  const [showSubmenuQuan, setShowSubmenuQuan] = useState(false);

   // Định nghĩa hàm getTotalItems để tính tổng số lượng sản phẩm trong giỏ hàng
   const getTotalItems = () => {
    return cart.reduce((total, product) => total + product.quantity, 0);
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/home" className="text-3xl font-bold text-red-600">
          NEO<span className="text-black"> PLATTON</span>
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

        {/* Menu */}
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
            {/* Submenu: Áo, Quần, Áo khoác */}
            <div className="absolute left-0 hidden group-hover:block bg-white shadow-md w-48 py-2 z-10">
              <div className="flex flex-col">
                <div
                  className="relative group"
                  onMouseEnter={() => setShowSubmenuAo(true)}
                  onMouseLeave={() => setShowSubmenuAo(false)}
                >
                  <Link to="/product/ao" className="block px-4 py-2 hover:bg-gray-100">
                    Điện thoại ▼
                  </Link>
                  {/* Submenu con của Áo */}
                  {showSubmenuAo && (
                    <div className="absolute left-full top-0 bg-white shadow-md w-48 py-2 z-10">
                      <Link to="/product/ao-thun" className="block px-4 py-2 hover:bg-gray-100">
                        iPhone
                      </Link>
                      <Link to="/product/ao-so-mi" className="block px-4 py-2 hover:bg-gray-100">
                        Oppo
                      </Link>
                      <Link to="/product/ao-kieu" className="block px-4 py-2 hover:bg-gray-100">
                        Samsung
                      </Link>
                    </div>
                  )}
                </div>

                <div
                  className="relative group"
                  onMouseEnter={() => setShowSubmenuQuan(true)}
                  onMouseLeave={() => setShowSubmenuQuan(false)}
                >
                  <Link to="/product/quan" className="block px-4 py-2 hover:bg-gray-100">
                    Laptop ▼
                  </Link>
                  {/* Submenu con của Quần */}
                  {showSubmenuQuan && (
                    <div className="absolute left-full top-0 bg-white shadow-md w-48 py-2 z-10">
                      <Link to="/product/quan-dai" className="block px-4 py-2 hover:bg-gray-100">
                        Quần dài
                      </Link>
                      <Link to="/product/quan-short" className="block px-4 py-2 hover:bg-gray-100">
                        Quần short
                      </Link>
                      <Link to="/product/quan-lung" className="block px-4 py-2 hover:bg-gray-100">
                        Quần lửng
                      </Link>
                      <Link to="/product/quan-jeans" className="block px-4 py-2 hover:bg-gray-100">
                        Quần jeans
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/product/ao-khoac" className="block px-4 py-2 hover:bg-gray-100">
                  Macbook
                </Link>
                <Link to="/product/giay" className="block px-4 py-2 hover:bg-gray-100">
                  Tai nghe
                </Link>
              </div>
            </div>
          </div>

          {/* Các mục menu khác */}
          <Link to="/hot" className="hover:text-red-600 transition duration-300 ease-in-out">
            HOT
          </Link>
          <Link to="/sale" className="hover:text-red-600 transition duration-300 ease-in-out">
            SALE TỐT
          </Link>
          <Link to="/news" className="hover:text-red-600 transition duration-300 ease-in-out">
            Tin Tức
          </Link>
        </div>

        {/* Các biểu tượng */}
        <div className="ml-6 flex items-center space-x-2 text-gray-800">
          {/* Tài khoản */}
          <Link to="/login" className="hover:text-red-600">Đăng Nhập</Link>
          <Link to="/">/</Link>
          <Link to="/register" className="hover:text-red-600">Đăng kí</Link>
          
        {/* Cart icon */}
<button onClick={toggleCart}>
  <div className="text-xl hover:text-red-600 cursor-pointer transition duration-300 ease-in-out ml-5 relative">
    <FaShoppingBag />
    {/* Hiển thị số lượng sản phẩm trong giỏ hàng */}
    {getTotalItems() > 0 && (
      <span className="absolute top-0 right-0 text-xs bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
        {getTotalItems()}
      </span>
    )}
  </div>
</button>
        </div>
      </div>


      {/* Cart Slidebar */}
      <CartSlidebar showCart={showCart} toggleCart={toggleCart} /> {/* Add CartSlidebar here */}
    </nav>
  );
};

export default Navbar;