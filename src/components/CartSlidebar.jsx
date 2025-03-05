import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export const CartSlidebar = ({ showCart, toggleCart }) => {
  const { cart, removeFromCart, updateQuantity } = useCart(); // Lấy các hàm từ CartContext

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-lg transition-transform duration-300 w-80 p-6 z-50 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Nút đóng giỏ hàng */}
      <button
        onClick={toggleCart}
        className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-red-600"
      >
        &times;
      </button>

      <h2 className="text-xl font-bold mb-4">Giỏ hàng</h2>
      {cart.length === 0 ? (
        <p>Giỏ hàng của bạn trống!</p>
      ) : (
        <ul>
          {cart.map((product) => (
            <li key={product.id} className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <span className="ml-4">{product.name}</span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Thay đổi số lượng sản phẩm */}
                <button
                  onClick={() => updateQuantity(product.id, product.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                  disabled={product.quantity <= 1}
                >
                  -
                </button>
                <span>{product.quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, product.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>

              {/* Nút xóa sản phẩm khỏi giỏ */}
              <button
                onClick={() => removeFromCart(product.id)}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between items-center mt-4 font-bold">
        <span>Tổng tiền:</span>
        <span>
          {cart.reduce((total, product) => total + product.price * product.quantity, 0).toLocaleString('vi-VN')} VND
        </span>
      </div>

      <Link
        to="/cart"
        className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        onClick={toggleCart}
      >
        Xem chi tiết giỏ hàng
      </Link>
    </div>
  );
};
