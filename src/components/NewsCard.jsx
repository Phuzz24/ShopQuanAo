import React from 'react';
import { Link } from 'react-router-dom';

const NewsCard = ({ title, description, image, id }) => {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
      <img className="w-full h-48 object-cover" src={image} alt="News" />
      <div className="px-6 py-4">
        <Link to={`/news/${id}`} className=''>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </Link>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      <div className="px-6 py-2">
        {/* Sử dụng Link để chuyển đến trang chi tiết */}
        <Link to={`/news/${id}`} className="text-blue-600 hover:underline">
          Xem thêm
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
