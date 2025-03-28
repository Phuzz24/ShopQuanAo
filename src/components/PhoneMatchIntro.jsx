import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Hình ảnh minh họa (có thể thay bằng hình ảnh thực tế của bạn)
const phoneIllustration = 'https://img.freepik.com/premium-vector/3d-vector-robot-chatbot-ai-science-business-technology-engineering-concept_112554-1067.jpg?w=2000';

const PhoneMatchIntro = () => {
  const navigate = useNavigate();

  const handleExperienceClick = () => {
    navigate('/phone-match');
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Phần nội dung */}
          <motion.div
            className="md:w-1/2 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
              Tìm điện thoại hoàn hảo với <span className="text-blue-600">Phone Match AI</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Chỉ trong 3 bước đơn giản, chúng tôi sẽ gợi ý chiếc điện thoại phù hợp nhất với ngân sách, thương hiệu và sở thích của bạn. Trải nghiệm ngay tính năng thông minh này!
            </p>
            <motion.button
              onClick={handleExperienceClick}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Trải nghiệm ngay
            </motion.button>
          </motion.div>

          {/* Phần hình ảnh minh họa */}
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="relative">
              <img
                src={phoneIllustration}
                alt="Phone Match AI Illustration"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              {/* Hiệu ứng trang trí */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-300 rounded-full opacity-50"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PhoneMatchIntro;