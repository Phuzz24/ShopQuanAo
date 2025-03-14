import React from 'react';
import { Link } from 'react-router-dom';  // Import Link từ react-router-dom
import { FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product, showDiscount = false }) => {
  // Hàm tính phần trăm giảm giá
  const calculateDiscount = (originalPrice, salePrice) => {
    const discount = ((originalPrice - salePrice) / originalPrice) * 100;
    return discount.toFixed(2);  // Làm tròn đến 2 chữ số thập phân
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative">
      {/* Hiển thị SALE chỉ khi showDiscount là true */}
      {showDiscount && (
        <span className="absolute top-4 right-4 bg-red-500 text-white py-2 px-4 rounded-full text-lg font-semibold">
          SALE
        </span>
      )}

      {/* Liên kết đến trang chi tiết sản phẩm khi nhấp vào hình ảnh hoặc tên */}
      <Link to={`/product-detail/${product.id}`} className="block">
        {/* Hình ảnh sản phẩm */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-64 object-cover rounded-xl transition-all duration-300 hover:opacity-90" 
        />
      </Link>

      <div className="mt-4">
        {/* Mô tả ngắn về sản phẩm */}
        <p className="text-sm text-gray-600">{product.description}</p>
      </div>

      <div className="mt-4">
        {/* Liên kết đến trang chi tiết sản phẩm khi nhấp vào tên sản phẩm */}
        <Link to={`/product-detail/${product.id}`} className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300">
          {product.name}
        </Link>
        <div className="flex items-center mt-2">
          {/* Giá gốc chỉ hiển thị nếu có salePrice */}
          <p className={`text-lg ${showDiscount ? 'text-gray-500 line-through mr-3' : 'text-gray-500'}`}>
            {product.price.toLocaleString('vi-VN')} VND
          </p>

          {/* Giá sale chỉ hiển thị khi showDiscount = true */}
          {showDiscount && (
            <p className="text-lg font-semibold text-red-600">
              {product.salePrice.toLocaleString('vi-VN')} VND
            </p>
          )}
        </div>

        {/* Thêm phần span cho loại category */}
        <div className="mt-2">
          <span className="inline-block px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
            {product.category}
          </span>
        </div>

        {/* Chỉ hiển thị phần tiết kiệm khi showDiscount là true */}
        {showDiscount && (
          <div className="mt-2 text-2xl font-bold text-red-500">
            Sale {calculateDiscount(product.price, product.salePrice)}%!
          </div>
        )}

        {/* Trạng thái còn hàng */}
        <div className="mt-2">
          <span className="inline-block px-4 py-2 text-sm font-medium rounded-full bg-green-100 text-green-700">
            {product.status || 'Trạng thái không rõ'}
          </span>
        </div>

        {/* Thêm vào giỏ */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          <button className="flex items-center justify-center w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:bg-gradient-to-l hover:from-indigo-400 hover:to-purple-500 transition-all">
            <FaShoppingCart className="mr-2 text-lg" /> Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
