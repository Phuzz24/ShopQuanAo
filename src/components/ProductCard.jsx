import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product, showDiscount = false, onAddToCart }) => {
  const calculateDiscount = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice) return 0;
    const discount = ((originalPrice - salePrice) / originalPrice) * 100;
    return discount.toFixed(0);
  };

  const isOutOfStock = product.status === 'Hết hàng';

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden flex flex-col h-full">
      {/* Badge SALE */}
      {showDiscount && product.salePrice && (
        <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white py-1 px-3 rounded-full text-sm font-semibold">
          -{calculateDiscount(product.price, product.salePrice)}%
        </span>
      )}

      {/* Hình ảnh sản phẩm */}
      <Link to={`/product-detail/${product.id}`} className="block">
        <img
          src={product.image || 'https://via.placeholder.com/350x350'}
          alt={product.name || 'Sản phẩm'}
          className="w-full h-56 object-cover rounded-lg transition-all duration-300 hover:opacity-90"
        />
      </Link>

      <div className="mt-4 flex flex-col flex-grow">
        {/* Mô tả ngắn - Giới hạn 2 dòng */}
        <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
          {product.description || 'Không có mô tả'}
        </p>

        <div className="mt-3">
          {/* Tên sản phẩm - Giới hạn 1 dòng */}
          <Link
            to={`/product-detail/${product.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-300 line-clamp-1"
          >
            {product.name || 'Sản phẩm không tên'}
          </Link>

          {/* Giá - Đảm bảo hiển thị trên cùng một dòng */}
          <div className="flex items-center gap-2 mt-2 min-h-[2rem] flex-wrap">
            {showDiscount && product.salePrice ? (
              <>
                <p className="text-md text-gray-400 line-through whitespace-nowrap">
                  {(product.price || 0).toLocaleString('vi-VN')} VND
                </p>
                <p className="text-lg font-bold text-indigo-600 whitespace-nowrap">
                  {(product.salePrice || 0).toLocaleString('vi-VN')} VND
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-gray-700 whitespace-nowrap">
                {(product.price || 0).toLocaleString('vi-VN')} VND
              </p>
            )}
          </div>

          {/* Category - Đảm bảo chiều cao cố định */}
          <div className="mt-2 min-h-[1.5rem]">
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
              {product.category || 'Không có danh mục'}
            </span>
          </div>

          {/* Trạng thái - Đảm bảo chiều cao cố định */}
          <div className="mt-2 min-h-[1.5rem]">
            <span
              className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {product.status || 'Còn hàng'}
            </span>
          </div>
        </div>

        {/* Nút thêm vào giỏ - Đẩy xuống dưới cùng */}
        <div className="mt-auto pt-4">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center py-2 rounded-full transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:bg-gradient-to-l hover:from-indigo-500 hover:to-purple-500'
            }`}
          >
            <FaShoppingCart className="mr-2 text-md" />
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;