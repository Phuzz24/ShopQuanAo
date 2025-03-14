import React from 'react';
import { Link } from 'react-router-dom';

import { Helmet } from 'react-helmet';
import NewsCard from '../components/NewsCard';

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
      image: "https://aeros.vn/upload/images/thiet-ke-shop-dien-thoai-1(2).jpg",
    },
    {
      id: 3,
      title: "Giới Thiệu Dịch Vụ Mới: Tư Vấn Chọn Điện Thoại Online",
      description: "Chúng tôi cung cấp dịch vụ tư vấn chọn điện thoại trực tuyến qua video call để giúp bạn lựa chọn sản phẩm phù hợp nhất.",
      image: "https://cdn.thuvienphapluat.vn/phap-luat/2022-2/DQ/12-1/viec-lam-2.jpg",
    },
    {
      id: 4,
      title: "Đón Chờ Sự Kiện Công Nghệ: Hội Thảo Về Sự Phát Triển 5G",
      description: "Đừng bỏ lỡ hội thảo chuyên đề về công nghệ 5G với các chuyên gia hàng đầu trong ngành.",
      image: "https://genk.mediacdn.vn/139269124445442048/2022/7/12/photo-1-1657621353166345435608-1657624991781-16576249918561120557677.jpg",
    },
    {
      id: 5,
      title: "Sự Kiện Giảm Giá Hấp Dẫn: Black Friday 50% Off",
      description: "Sự kiện Black Friday với mức giảm giá lên đến 50% cho các sản phẩm điện tử và điện thoại.",
      image: "https://th.bing.com/th/id/OIP.M6ZAl61nY45H25f4Az_D1QHaFD?rs=1&pid=ImgDetMain",
    },
    {
      id: 6,
      title: "Tư Vấn Mua Hàng: Mua Điện Thoại Online An Toàn",
      description: "Tư vấn về việc mua điện thoại trực tuyến và cách bảo vệ giao dịch an toàn khi thanh toán.",
      image: "https://th.bing.com/th/id/OIP.YSV2WohLW5mMCbq7OT058AHaE7?rs=1&pid=ImgDetMain",
    },
    {
      id: 7,
      title: "Sự Kiện Thực Tế Ảo: Trải Nghiệm Mua Sắm Online Đột Phá",
      description: "Tham gia sự kiện thực tế ảo và trải nghiệm những công nghệ mới trong mua sắm online.",
      image: "https://th.bing.com/th/id/OIP.DQAQYHsco_yp4wWjt5g-dwHaE8?rs=1&pid=ImgDetMain",
    },
    {
      id: 8,
      title: "Đổi Mới Công Nghệ: Sự Ra Mắt của iPhone 14",
      description: "Apple đã chính thức ra mắt iPhone 14 với nhiều tính năng đột phá và thiết kế mới.",
      image: "https://th.bing.com/th/id/OIP.7loXCV46y-_E5Aa84fHYPwHaEK?rs=1&pid=ImgDetMain",
    },
    {
      id: 9,
      title: "Giới Thiệu Về Điện Thoại 5G: Tương Lai Công Nghệ Di Động",
      description: "Khám phá về điện thoại 5G và những tính năng vượt trội mà nó mang lại cho người dùng.",
      image: "https://cdn.sforum.vn/sforum/wp-content/uploads/2022/03/co-nen-mua-dien-thoai-5G-1-1-e1646505294297.jpg",
    },
  ];

  return (
    <div className="py-12 bg-gray-100">
      <Helmet>
        <title>Tin tức</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Tin Tức Mới Nhất
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {news.map((article) => (
            <div
              key={article.id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover rounded-lg mb-4 transition-all duration-300 transform hover:scale-105"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{article.title}</h3>
              <p className="text-gray-600 mb-4">{article.description}</p>
              <Link
                to={`/news/${article.id}`} // Chuyển đến trang chi tiết khi nhấn vào
                className="text-blue-600 hover:underline transition-all duration-300"
              >
                Xem Thêm
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewPage;
