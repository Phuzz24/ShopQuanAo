import React, { useState, useEffect } from 'react';

const AdModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(true);

  // Kiểm tra xem quảng cáo đã được tắt chưa
  useEffect(() => {
    const adClosed = localStorage.getItem('adClosed');
    if (adClosed === 'true') {
      setIsModalVisible(false);
    }
  }, []);

  const handleCloseAd = () => {
    setIsModalVisible(false);
    localStorage.setItem('adClosed', 'true'); // Lưu trạng thái quảng cáo đã tắt
  };

  return (
    isModalVisible && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full relative">
          {/* Nút đóng */}
          <button
            onClick={handleCloseAd}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
          >
            &times;
          </button>

          <img
            src="https://via.placeholder.com/400x300" // Thay thế với ảnh quảng cáo của bạn
            alt="Quảng cáo"
            className="w-full h-auto rounded-lg"
          />
          <h3 className="text-2xl font-semibold text-gray-800 my-4">
            Mừng Ngày Quốc Tế Phụ Nữ 8/3
          </h3>
          <p className="text-gray-600 mb-4">
            Mua 1 Tặng 5 sản phẩm chăm sóc sắc đẹp tại cửa hàng chúng tôi.
          </p>
          <button
            onClick={handleCloseAd}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-500 transition"
          >
            Mua Ngay
          </button>
        </div>
      </div>
    )
  );
};

export default AdModal;
