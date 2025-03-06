import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const BackToTopButton = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Theo dõi cuộn trang
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowBackToTop(true); // Hiển thị nút khi cuộn xuống
    } else {
      setShowBackToTop(false); // Ẩn nút khi cuộn lên
    }
  };

  // Thêm sự kiện cuộn vào khi component mount
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Cuộn lên đầu trang khi nhấn nút
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {showBackToTop && (
        <button
          className="fixed bottom-5 left-5 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 transition-all duration-300"
          onClick={scrollToTop}
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default BackToTopButton;
