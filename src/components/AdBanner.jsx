import React from 'react';

const AdBanner = () => {
  return (
    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-6 sm:px-12">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
          Khám Phá Các Sản Phẩm Mới Nhất!
        </h2>
        <p className="text-xl sm:text-2xl mb-8">
          Các sản phẩm điện thoại với tính năng vượt trội và giá cả phải chăng đang chờ đón bạn.
        </p>
        <a
          href="/product"
          className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 text-lg font-semibold rounded-full hover:bg-yellow-500 transition duration-300"
        >
          Mua Ngay
        </a>
      </div>
    </div>
  );
};

export default AdBanner;
