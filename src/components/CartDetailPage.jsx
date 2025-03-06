import React from 'react';
import { Helmet } from 'react-helmet';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom'; // Để chuyển hướng trang

const CartDetailPage = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();

  // Hàm tính tổng số tiền trong giỏ hàng
  const getTotalAmount = () => {
    return cart.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  return (
    <div className="max-w-screen-lg mx-auto py-12 px-6">
      <Helmet>
      <title>
        Giỏ hàng
      </title>
    </Helmet>
      <h2 className="text-3xl font-bold mb-6 text-center">Giỏ Hàng Của Bạn</h2>
      
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-gray-700">Giỏ hàng của bạn trống!</p>
          <Link to="/product" className="mt-4 inline-block py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div>
          {/* Danh sách sản phẩm trong giỏ hàng */}
          <div className="space-y-6">
            {cart.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
                  <div className="ml-4">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-gray-500">{product.price.toLocaleString('vi-VN')} VND</p>
                  </div>
                </div>

                {/* Thay đổi số lượng */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(product.id, product.quantity - 1)}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                    className="w-12 text-center border border-gray-300 rounded-md"
                    min="1"
                  />
                  <button
                    onClick={() => updateQuantity(product.id, product.quantity + 1)}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                {/* Xóa sản phẩm khỏi giỏ */}
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="flex justify-between items-center font-bold text-xl py-4">
            <span>Tổng Tiền:</span>
            <span>{getTotalAmount().toLocaleString('vi-VN')} VND</span>
          </div>

          {/* Thực hiện thanh toán */}
          <div className="flex justify-between items-center py-4">
            <Link
              to="/checkout"
              className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-700"
            >
              Thanh Toán
            </Link>
            <Link
              to="/product"
              className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              Tiếp Tục Mua Sắm
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDetailPage;
