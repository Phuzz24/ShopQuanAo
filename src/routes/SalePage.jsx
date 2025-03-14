import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';  // Component hiển thị sản phẩm
import { FaClock } from 'react-icons/fa';  // Biểu tượng đồng hồ

const SalePage = () => {
  const [countdown, setCountdown] = useState('');
  const [products, setProducts] = useState([]);

  // Mock data cho sản phẩm giảm giá
  const mockSaleProducts = [
    {
      id: 1,
      name: "iPhone 14 Pro Max",
      price: 29990000,
      salePrice: 25990000,
      category: "Apple",
      image: "https://example.com/iphone14.jpg",
    },
    {
      id: 2,
      name: "Samsung Galaxy S23",
      price: 19990000,
      salePrice: 17990000,
      category: "Samsung",
      image: "https://example.com/samsung.jpg",
    },
    {
      id: 3,
      name: "Xiaomi 13 Pro",
      price: 17990000,
      salePrice: 15990000,
      category: "Xiaomi",
      image: "https://example.com/xiaomi.jpg",
    },
    {
      id: 4,
      name: "OPPO Find X5 Pro",
      price: 18990000,
      salePrice: 16990000,
      category: "OPPO",
      image: "https://example.com/oppo.jpg",
    },
    {
      id: 1,
      name: "iPhone 14 Pro Max",
      price: 29990000,
      salePrice: 25990000,
      category: "Apple",
      image: "https://example.com/iphone14.jpg",
    },
    {
      id: 2,
      name: "Samsung Galaxy S23",
      price: 19990000,
      salePrice: 17990000,
      category: "Samsung",
      image: "https://example.com/samsung.jpg",
    },
    {
      id: 3,
      name: "Xiaomi 13 Pro",
      price: 17990000,
      salePrice: 15990000,
      category: "Xiaomi",
      image: "https://example.com/xiaomi.jpg",
    },
    {
      id: 4,
      name: "OPPO Find X5 Pro",
      price: 18990000,
      salePrice: 16990000,
      category: "OPPO",
      image: "https://example.com/oppo.jpg",
    }
  ];

  useEffect(() => {
    setProducts(mockSaleProducts);
    startCountdown();
  }, []);

  // Hàm để tính toán và cập nhật đồng hồ đếm ngược
  const startCountdown = () => {
    const targetDate = new Date('2025-03-30T23:59:59'); // Đặt thời gian kết thúc khuyến mãi
    const interval = setInterval(() => {
      const now = new Date();
      const timeDifference = targetDate - now;

      if (timeDifference <= 0) {
        clearInterval(interval);
        setCountdown('Khuyến mãi đã kết thúc');
      } else {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white min-h-screen py-12 px-6">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-yellow-300">Khuyến mãi đặc biệt!</h2>
        <p className="text-xl text-yellow-200 mt-2">Hãy nhanh tay trước khi hết thời gian!</p>
        
        {/* Đồng hồ đếm ngược */}
        <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-gray-800 py-3 px-8 rounded-xl inline-flex items-center mt-6">
          <FaClock className="mr-3 text-3xl" />
          <span className="font-semibold text-2xl">{countdown}</span>
        </div>
      </div>

      {/* Hiển thị sản phẩm đang giảm giá */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} showDiscount={true} />
        ))}
      </div>
    </div>
  );
};

export default SalePage;
