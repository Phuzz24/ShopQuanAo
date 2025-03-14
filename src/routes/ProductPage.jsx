import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import ProductCard from '../components/ProductCard';  // Component hiển thị sản phẩm
import { FaShoppingCart } from 'react-icons/fa';  // Icon shopping cart
import { useCart } from "../context/CartContext";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  // Mock data (dữ liệu sản phẩm giả)
  const mockProducts = [
    {
      id: 1,
      name: "iPhone 14 Pro Max",
      price: 29990000,
      category: "Apple",
      description: "Mô tả về iPhone 14 Pro Max.",
      status: "Còn hàng",
      image: "https://example.com/iphone14.jpg",
    },
    {
      id: 2,
      name: "Samsung Galaxy S23",
      price: 19990000,
      category: "Samsung",
      description: "Mô tả về Samsung Galaxy S23.",
      status: "Hết hàng",
      image: "https://example.com/samsung.jpg",
    },
    {
      id: 3,
      name: "Xiaomi 13 Pro",
      price: 17990000,
      category: "Xiaomi",
      description: "Mô tả về Xiaomi 13 Pro.",
      status: "Còn hàng",
      image: "https://example.com/xiaomi.jpg",
    },
    {
      id: 1,
      name: "iPhone 14 Pro Max",
      price: 29990000,
      category: "Apple",
      description: "Mô tả về iPhone 14 Pro Max.",
      status: "Còn hàng",
      image: "https://example.com/iphone14.jpg",
    },
    {
      id: 2,
      name: "Samsung Galaxy S23",
      price: 19990000,
      category: "Samsung",
      description: "Mô tả về Samsung Galaxy S23.",
      status: "Hết hàng",
      image: "https://example.com/samsung.jpg",
    },
    {
      id: 3,
      name: "Xiaomi 13 Pro",
      price: 17990000,
      category: "Xiaomi",
      description: "Mô tả về Xiaomi 13 Pro.",
      status: "Còn hàng",
      image: "https://example.com/xiaomi.jpg",
    }
  ];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Danh sách Sản phẩm</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative">
            <Link to={`/product-detail/${product.id}`} className="block">
              {/* Hình ảnh sản phẩm */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-xl transition-all duration-300 hover:opacity-90"
              />
            </Link>
           

            <div className="mt-4">
            <Link to={`/product-detail/${product.id}`} className="block">

              <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600">{product.name}</h3>
            </Link>
              <div className="flex items-center mt-2">
                {/* Giá hiển thị chữ đậm và màu sắc khác */}
                <p className="text-lg font-bold text-red-700 mr-3">
                  {product.price.toLocaleString('vi-VN')} VND
                </p>
              </div>
            </div>
            <div className="mt-2">
              {/* Mô tả ngắn về sản phẩm */}
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
            {/* Category và trạng thái hàng nằm ngang */}
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-block px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                {product.category}
              </span>
              <span className="inline-block px-4 py-2 text-sm font-medium rounded-full bg-green-100 text-green-700">
                {product.status || 'Trạng thái không rõ'}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-2">
              <button 
                onClick={() => addToCart(product)}
              className="flex items-center justify-center w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:bg-gradient-to-l hover:from-indigo-400 hover:to-purple-500 transition-all">
                <FaShoppingCart className="mr-2 text-lg" /> Thêm vào giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
