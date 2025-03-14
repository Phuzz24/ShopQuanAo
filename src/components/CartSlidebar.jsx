import React from 'react';
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartSlidebar = ({ showCart, toggleCart }) => {
  const { cart, removeFromCart, updateQuantity } = useCart();

  // Tính tổng giá trị của các sản phẩm trong giỏ hàng
  const calculateTotal = () => {
    return cart.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  return (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-6 z-50 transform transition-transform duration-300 ${
        showCart ? 'translate-x-0' : 'translate-x-full'
      } flex flex-col`}
    >
      <button onClick={toggleCart} className="absolute top-4 right-4 text-2xl text-gray-600">
        &times;
      </button>

      <h2 className="text-2xl font-semibold mb-4">Giỏ Hàng</h2>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <FaShoppingCart className="text-6xl text-gray-400 mb-4" />
          <p className="text-center text-lg font-medium text-gray-500">Giỏ hàng của bạn hiện tại trống!</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4 flex-grow">
          {cart.map((product) => (
            <div key={product.id} className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={() => updateQuantity(product.id, product.quantity - 1)} className="text-xl">
                  -
                </button>
                <span>{product.quantity}</span>
                <button onClick={() => updateQuantity(product.id, product.quantity + 1)} className="text-xl">
                  +
                </button>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}

          {/* Hiển thị tổng tiền */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Tổng tiền</p>
              <p className="text-xl font-bold text-red-600">{calculateTotal().toLocaleString()} VND</p>
            </div>
          </div>
        </div>
      )}

      {/* Các nút thanh toán và xem chi tiết giỏ hàng nằm ở dưới cùng */}
      {cart.length > 0 && (
        <div className="mt-auto space-y-4">
          <button
            onClick={() => {}}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            Thanh Toán
          </button>
          <Link
            to="/cart"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 block text-center"
          >
            Xem Chi Tiết Giỏ Hàng
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartSlidebar;
