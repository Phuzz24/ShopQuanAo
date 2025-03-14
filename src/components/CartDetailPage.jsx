import React from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CartDetail = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();

  // Tính tổng tiền
  const calculateTotal = () => {
    return cart.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  // Hiển thị thông báo khi xóa sản phẩm
  const handleRemove = (product) => {
    removeFromCart(product.id);
    toast.success(`${product.name} đã được xóa khỏi giỏ hàng!`, {
      position: toast.POSITION.TOP_RIGHT,  // Hiển thị ở góc phải trên
      autoClose: 3000, // Thời gian tự động đóng
    });
  };

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      {/* Tiêu đề giỏ hàng */}
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Chi Tiết Giỏ Hàng</h2>

      {/* Nếu giỏ hàng trống */}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
          <FaTrashAlt className="text-6xl text-gray-400 mb-4" />
          <p className="text-xl font-medium">Giỏ hàng của bạn hiện tại trống!</p>
          <Link
            to="/product"
            className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Mua Sắm Ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hiển thị các sản phẩm trong giỏ hàng */}
          <div className="space-y-6">
            {cart.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <p className="text-sm text-green-500 mt-2">{product.status}</p>
                  </div>
                </div>

                {/* Điều chỉnh số lượng và xóa sản phẩm */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(product.id, product.quantity - 1)}
                      className="text-lg text-gray-600 hover:text-gray-800 transition duration-200"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold">{product.quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, product.quantity + 1)}
                      className="text-lg text-gray-600 hover:text-gray-800 transition duration-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(product)}
                    className="text-red-600 hover:text-red-800 transition duration-200"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Phần Tổng tiền và các nút hành động */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tổng Tiền</h3>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xl font-bold text-gray-800">Tổng Tiền:</p>
              <p className="text-xl font-bold text-red-600">{calculateTotal().toLocaleString()} VND</p>
            </div>

            {/* Các nút hành động */}
            <div className="space-x-4 flex justify-between items-center">
              <Link
                to="/checkout"
                className="w-full md:w-auto py-3 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                Thanh Toán
              </Link>
              <Link
                to="/cart"
                className="w-full md:w-auto py-3 px-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Xem Chi Tiết Giỏ Hàng
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDetail;
