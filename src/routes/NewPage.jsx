import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NewsCard = ({ title, description, image, id }) => {
  return (
    <motion.div
      className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <img className="w-full h-48 object-cover" src={image} alt="News" />
      <div className="px-6 py-4">
        <Link to={`/news/${id}`}>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
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

const NewPage = () => {
  const news = [
    {
      id: 1,
      title: "Khuyến Mãi Mùa Xuân: Giảm Giá 20% Cho Tất Cả Các Sản Phẩm",
      description: "Chỉ trong tháng này, cửa hàng chúng tôi có chương trình giảm giá đặc biệt lên đến 20% cho mọi sản phẩm.",
      image: "https://static.vecteezy.com/system/resources/previews/000/327/340/original/phone-sale-vector-background.jpg",
    },
    {
      id: 2,
      title: "Mở Rộng Hệ Thống Cửa Hàng: Đến Thăm Cửa Hàng Mới Của Chúng Tôi",
      description: "Chúng tôi rất vui mừng thông báo về việc mở rộng hệ thống cửa hàng với chi nhánh mới tại trung tâm thành phố.",
      image: "https://via.placeholder.com/400x300?text=Mo+Rong+Cua+Hang",
    },
    {
      id: 3,
      title: "Giới Thiệu Dịch Vụ Mới: Tư Vấn Chọn Điện Thoại Online",
      description: "Chúng tôi cung cấp dịch vụ tư vấn chọn điện thoại trực tuyến qua video call để giúp bạn lựa chọn sản phẩm phù hợp nhất.",
      image: "https://via.placeholder.com/400x300?text=Tu+Van+Chon+Dien+Thoai",
    },
    {
      id: 4,
      title: "Đón Chờ Sự Kiện Công Nghệ: Hội Thảo Về Sự Phát Triển 5G",
      description: "Đừng bỏ lỡ hội thảo chuyên đề về công nghệ 5G với các chuyên gia hàng đầu trong ngành.",
      image: "https://via.placeholder.com/400x300?text=Hoi+Thao+Cong+Nghe+5G",
    },
  ];

  return (
    <div className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Tin Tức Mới Nhất
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article) => (
            <NewsCard
              key={article.id}
              title={article.title}
              description={article.description}
              image={article.image}
              id={article.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewPage;
