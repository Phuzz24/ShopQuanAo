import React, { useState, useEffect } from 'react';

const AdModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const lastVisitTime = localStorage.getItem('lastVisitTime');
    const currentTime = new Date().getTime();
    
    // Nếu lần truy cập trước đó đã quá 15-30 phút (900000 - 1800000 ms)
    if (!lastVisitTime || currentTime - lastVisitTime > Math.random() * (1800000 - 900000) + 900000) {
      setIsModalVisible(true);
    }
    
    // Cập nhật thời gian truy cập lần này
    localStorage.setItem('lastVisitTime', currentTime);
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
            src="https://img3.thuthuatphanmem.vn/uploads/2019/10/08/banner-quang-cao-dien-thoai-dep_103211368.jpg" // Thay thế với ảnh quảng cáo của bạn
            alt="Quảng cáo"
            className="w-full h-auto rounded-lg"
          />
          <h3 className="text-2xl font-semibold text-gray-800 my-4">
            Mừng Ngày Lễ Black Friday
          </h3>
          <p className="text-gray-600 mb-4">
            Giảm mạnh 50%.
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
