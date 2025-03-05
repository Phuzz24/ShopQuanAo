import React from 'react';
import { useParams } from 'react-router-dom';

const NewsDetailPage = () => {
  const { id } = useParams(); // Lấy id từ URL

  // Mẫu dữ liệu tin tức (có thể thay thế bằng dữ liệu từ API)
  const newsData = [
    {
      id: 1,
      title: "Khuyến Mãi Mùa Xuân: Giảm Giá 20% Cho Tất Cả Các Sản Phẩm",
      content: `Chỉ trong tháng này, cửa hàng chúng tôi có chương trình giảm giá đặc biệt lên đến 20% cho mọi sản phẩm, bao gồm điện thoại, phụ kiện và các thiết bị điện tử khác. Đừng bỏ lỡ cơ hội này!`,
      image: "https://via.placeholder.com/800x600?text=Khuyen+Mai+Mua+Xuan",
    },
    {
      id: 2,
      title: "Mở Rộng Hệ Thống Cửa Hàng: Đến Thăm Cửa Hàng Mới Của Chúng Tôi",
      content: `Chúng tôi rất vui mừng thông báo về việc mở rộng hệ thống cửa hàng với chi nhánh mới tại trung tâm thành phố. Hãy đến thăm cửa hàng mới để nhận ưu đãi đặc biệt và trải nghiệm những sản phẩm điện thoại mới nhất!`,
      image: "https://via.placeholder.com/800x600?text=Mo+Rong+Cua+Hang",
    },
    {
      id: 3,
      title: "Giới Thiệu Dịch Vụ Mới: Tư Vấn Chọn Điện Thoại Online",
      content: `Chúng tôi cung cấp dịch vụ tư vấn chọn điện thoại trực tuyến qua video call, giúp bạn lựa chọn sản phẩm phù hợp nhất với nhu cầu và ngân sách của bạn. Liên hệ ngay để được tư vấn miễn phí!`,
      image: "https://via.placeholder.com/800x600?text=Tu+Van+Chon+Dien+Thoai",
    },
    {
      id: 4,
      title: "Đón Chờ Sự Kiện Công Nghệ: Hội Thảo Về Sự Phát Triển 5G",
      content: `Đừng bỏ lỡ hội thảo chuyên đề về công nghệ 5G với các chuyên gia hàng đầu trong ngành. Sự kiện này sẽ cung cấp cái nhìn sâu sắc về tương lai của mạng di động và các thiết bị hỗ trợ 5G.`,
      image: "https://via.placeholder.com/800x600?text=Hoi+Thao+Cong+Nghe+5G",
    },
  ];

  // Tìm bài viết theo id
  const article = newsData.find(item => item.id === parseInt(id));

  if (!article) {
    return <div className="text-center text-red-600">Không tìm thấy bài viết!</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800">{article?.title}</h1>
      <img
        className="w-full h-[500px] object-cover mt-4 rounded-lg shadow-lg"
        src={article?.image}
        alt="News"
      />
      <p className="text-gray-600 mt-6 leading-relaxed">{article?.content}</p>
    </div>
  );
};

export default NewsDetailPage;
