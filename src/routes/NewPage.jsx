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
      title: "Xu hướng thời trang mùa Thu 2025",
      description: "Khám phá những xu hướng mới nhất với bộ sưu tập áo khoác, boots, và màu sắc tươi sáng.",
      image: "https://img3.thuthuatphanmem.vn/uploads/2019/10/14/banner-thoi-trang-dep_113856538.jpg",
    },
    {
      id: 2,
      title: "Giảm giá mùa hè: Mua sắm với giá tốt",
      description: "Đừng bỏ lỡ các chương trình giảm giá mùa hè với các món đồ thời trang yêu thích.",
      image: "https://heradg.vn/media/31503/content/z3705972368305_f3cb6a2e0479106321f88dad6f81629a.jpg",
    },
    {
      id: 3,
      title: "Hợp tác với KOLs: Bộ sưu tập đặc biệt",
      description: "Khám phá bộ sưu tập giới hạn hợp tác với các KOLs nổi tiếng trong ngành thời trang.",
      image: "https://lptech.asia/uploads/files/2022/01/05/top-kol-thoi-trang-hot-hien-nay.png",
    },
    {
      id: 4,
      title: "Lời khuyên chọn trang phục cho mùa lễ hội",
      description: "Gợi ý trang phục cho mùa lễ hội, từ những bộ váy dạ hội sang trọng đến những bộ đồ dễ dàng kết hợp.",
      image: "https://savani.vn/images/products_categories/2024/10/10/resized/banner2-01_1728533561_1.webp",
    },
  ];

  return (
    <div className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Tin Tức Thời Trang
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
