import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PromotionBanner = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 13);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleShopNow = () => {
    navigate('/sale');
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-8 px-6 rounded-xl shadow-2xl max-w-7xl mx-auto mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

      <div className="relative flex items-center justify-between">
        {/* Phần nội dung bên trái */}
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold mb-2 animate-fade-in-down">
            🔥 Siêu khuyến mãi đặc biệt! 🔥
          </h2>
          <p className="text-xl mb-4 animate-fade-in-up">
            Giảm giá lên đến <span className="font-bold text-yellow-300">30%</span> cho tất cả sản phẩm
          </p>
          <button
            onClick={handleShopNow}
            className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 hover:scale-105 transform transition-all duration-300 animate-bounce"
          >
            Mua ngay
          </button>
        </div>

        {/* Đồng hồ đếm ngược và hình ảnh minh họa bên phải */}
        <div className="flex items-center space-x-6">
          <div className="flex space-x-4 bg-white/20 backdrop-blur-md p-4 rounded-lg shadow-inner">
            {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
              <div key={unit} className="text-center">
                <p className="text-4xl font-bold animate-pulse">{timeLeft[unit]}</p>
                <p className="text-sm uppercase">{unit === 'days' ? 'Ngày' : unit === 'hours' ? 'Giờ' : unit === 'minutes' ? 'Phút' : 'Giây'}</p>
              </div>
            ))}
          </div>
          <img
            src="https://png.pngtree.com/png-clipart/20230401/original/pngtree-3-sets-of-sale-labels-or-stickers-in-red-color-png-image_9015056.png" // Thay bằng URL hình ảnh minh họa của bạn
            alt="Sale Illustration"
            className="w-32 h-32 object-contain animate-spin-slow"
          />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-300/30 rounded-full blur-3xl animate-ping"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-300/30 rounded-full blur-3xl animate-ping"></div>
    </div>
  );
};

export default PromotionBanner;