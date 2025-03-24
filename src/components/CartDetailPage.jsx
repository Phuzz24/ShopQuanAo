import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

const CartDetailPage = () => {
  const { cart, removeFromCart, updateQuantity, fetchCartFromDB } = useCart();
  const { token } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchCartFromDB(); // Đồng bộ giỏ hàng từ server
    }
  }, [token, fetchCartFromDB]);

  const calculateTotal = () => {
    return cart.reduce((total, product) => {
      const price = product.discountedPrice !== undefined && product.discountedPrice !== null
        ? product.discountedPrice
        : product.price || 0;
      return total + price * product.quantity;
    }, 0);
  };

  const handleRemove = (product) => {
    removeFromCart(product.id);
    toast.success(`${product.name} đã được xóa khỏi giỏ hàng!`, {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  const handleCheckout = () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để thanh toán!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống!', { autoClose: 2000 });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-center text-indigo-700 mb-10 tracking-tight"
        >
          Giỏ Hàng Của Bạn
        </motion.h2>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl shadow-lg p-8"
          >
            <FaShoppingCart className="text-6xl text-gray-300 mb-6" />
            <p className="text-xl font-medium text-gray-600 mb-6">Giỏ hàng của bạn hiện tại trống!</p>
            <Link
              to="/product"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-md font-semibold"
            >
              Tiếp Tục Mua Sắm
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cart.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
                  >
                    <div className="flex items-center space-x-6 w-full sm:w-auto">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <p className="text-sm text-green-600 font-medium">{product.status || 'Còn hàng'}</p>
                        <p className="text-md font-bold text-indigo-600 mt-2">
  {product.discountedPrice !== undefined && 
   product.discountedPrice !== null && 
   product.discountedPrice !== product.price && 
   product.discountedPrice < product.price ? (
    <>
      {(product.discountedPrice * product.quantity).toLocaleString('vi-VN')} VND
      <span className="line-through text-gray-500 text-sm ml-2">
        {(product.price * product.quantity).toLocaleString('vi-VN')} VND
      </span>
      {product.appliedDiscountCode && (
        <span className="text-green-600 text-xs ml-2">({product.appliedDiscountCode})</span>
      )}
    </>
  ) : (
    `${(product.price * product.quantity).toLocaleString('vi-VN')} VND`
  )}
</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                      <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(product.id, product.quantity - 1)}
                          disabled={product.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-indigo-600 disabled:text-gray-400 transition duration-200"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-lg font-medium">{product.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, product.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-indigo-600 transition duration-200"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(product)}
                        className="text-red-500 hover:text-red-700 transition duration-200"
                      >
                        <FaTrashAlt className="text-xl" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md lg:sticky lg:top-8 border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Tóm Tắt Đơn Hàng</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg text-gray-600">Tạm tính:</p>
                  <p className="text-lg font-medium text-gray-800">{calculateTotal().toLocaleString('vi-VN')} VND</p>
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <p className="text-xl font-semibold text-gray-800">Tổng cộng:</p>
                  <p className="text-2xl font-bold text-indigo-600">{calculateTotal().toLocaleString('vi-VN')} VND</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md"
                >
                  Thanh Toán Ngay
                </button>
                <Link
                  to="/product"
                  className="block w-full py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-all duration-300 text-center font-semibold"
                >
                  Tiếp Tục Mua Sắm
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDetailPage;