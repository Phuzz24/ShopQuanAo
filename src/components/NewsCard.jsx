import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NewsCard = ({ title, description, image, id }) => {
  return (
    <motion.div
      className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white cursor-pointer transition-all duration-200 ease-in-out hover:shadow-xl hover:bg-gray-100"
      whileHover={{ boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}  // Sử dụng hiệu ứng giảm scale khi nhấn vào
    >
      <img className="w-full h-48 object-cover" src={image} alt="News" />
      <div className="px-6 py-4">
        <Link to={`/news/${id}`}>
          <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600">{title}</h2>
        </Link>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      <div className="px-6 py-2">
        <Link to={`/news/${id}`} className="text-blue-600 hover:underline">
          Xem thêm
        </Link>
      </div>
    </motion.div>
  );
};

export default NewsCard;
