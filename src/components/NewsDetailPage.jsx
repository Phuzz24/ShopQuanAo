import React from 'react';
import { useParams } from 'react-router-dom';

const NewsDetailPage = () => {
  const { id } = useParams(); // Lấy id từ URL

  // Mẫu dữ liệu tin tức (có thể thay thế bằng dữ liệu từ API)
  const newsData = [
    {
      id: 1,
      title: "Xu hướng thời trang mùa Thu 2025",
      content: "Khám phá những xu hướng mới nhất với bộ sưu tập áo khoác, boots, và màu sắc tươi sáng.",
      image: "https://img3.thuthuatphanmem.vn/uploads/2019/10/14/banner-thoi-trang-dep_113856538.jpg",
    },
    {
      id: 2,
      title: "Giảm giá mùa hè: Mua sắm với giá tốt",
      content: "Đừng bỏ lỡ các chương trình giảm giá mùa hè với các món đồ thời trang yêu thích.",
      image: "https://heradg.vn/media/31503/content/z3705972368305_f3cb6a2e0479106321f88dad6f81629a.jpg",
    },
    {
      id: 3,
      title: "Hợp tác với KOLs: Bộ sưu tập đặc biệt",
      content: "Khám phá bộ sưu tập giới hạn hợp tác với các KOLs nổi tiếng trong ngành thời trang.",
      image: "https://lptech.asia/uploads/files/2022/01/05/top-kol-thoi-trang-hot-hien-nay.png",
    },
    {
      id: 4,
      title: "Lời khuyên chọn trang phục cho mùa lễ hội",
      content: "Gợi ý trang phục cho mùa lễ hội, từ những bộ váy dạ hội sang trọng đến những bộ đồ dễ dàng kết hợp.",
      image: "https://via.placeholder.com/600x400",
    },
  ];

  // Tìm bài viết theo id
  const article = newsData.find(item => item.id === parseInt(id));

  if (!article) {
    return <div>Không tìm thấy bài viết!</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800">{article?.title}</h1>
      <img className="w-full h-96 object-cover mt-4" src={article?.image} alt="News" />
      <p className="text-gray-600 mt-6">{article?.content}</p>
    </div>
  );
};

export default NewsDetailPage;
