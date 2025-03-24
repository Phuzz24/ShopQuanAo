import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NewsCard = ({ title, description, image, id, category, date }) => {
  return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-md bg-white cursor-pointer transition-all duration-300 hover:shadow-xl"
      whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
    >
      <img
        className="w-full h-48 object-cover"
        src={image}
        alt={title}
      />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
            {category}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <Link to={`/news/${id}`}>
          <h2 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors duration-300 line-clamp-2">
            {title}
          </h2>
        </Link>
        <p className="text-gray-600 mt-2 line-clamp-3">{description}</p>
        <Link
          to={`/news/${id}`}
          className="text-indigo-600 hover:underline mt-3 inline-block font-medium"
        >
          Xem thêm
        </Link>
      </div>
    </motion.div>
  );
};

export default NewsCard;