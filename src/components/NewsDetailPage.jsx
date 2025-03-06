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
      category: "Khuyến Mãi",
      date: "2023-04-01",
    },
    {
      id: 2,
      title: "Mở Rộng Hệ Thống Cửa Hàng: Đến Thăm Cửa Hàng Mới Của Chúng Tôi",
      content: `Chúng tôi rất vui mừng thông báo về việc mở rộng hệ thống cửa hàng với chi nhánh mới tại trung tâm thành phố. Hãy đến thăm cửa hàng mới để nhận ưu đãi đặc biệt và trải nghiệm những sản phẩm điện thoại mới nhất!`,
      image: "https://via.placeholder.com/800x600?text=Mo+Rong+Cua+Hang",
      category: "Mở Rộng",
      date: "2023-03-20",
    },
    {
      id: 3,
      title: "Giới Thiệu Dịch Vụ Mới: Tư Vấn Chọn Điện Thoại Online",
      content: `Chúng tôi cung cấp dịch vụ tư vấn chọn điện thoại trực tuyến qua video call, giúp bạn lựa chọn sản phẩm phù hợp nhất với nhu cầu và ngân sách của bạn. Liên hệ ngay để được tư vấn miễn phí!`,
      image: "https://via.placeholder.com/800x600?text=Tu+Van+Chon+Dien+Thoai",
      category: "Dịch Vụ Mới",
      date: "2023-03-15",
    },
    {
      id: 4,
      title: "Đón Chờ Sự Kiện Công Nghệ: Hội Thảo Về Sự Phát Triển 5G",
      content: `Đừng bỏ lỡ hội thảo chuyên đề về công nghệ 5G với các chuyên gia hàng đầu trong ngành. Sự kiện này sẽ cung cấp cái nhìn sâu sắc về tương lai của mạng di động và các thiết bị hỗ trợ 5G.`,
      image: "https://via.placeholder.com/800x600?text=Hoi+Thao+Cong+Nghe+5G",
      category: "Công Nghệ",
      date: "2023-02-28",
    },
    {
      id: 5,
      title: "Sự Kiện Giảm Giá Hấp Dẫn: Black Friday 50% Off",
      content: `Sự kiện Black Friday với mức giảm giá lên đến 50% cho các sản phẩm điện tử và điện thoại. Chúng tôi cam kết mang lại những ưu đãi hấp dẫn nhất cho khách hàng.`,
      image: "https://via.placeholder.com/800x600?text=Black+Friday",
      category: "Khuyến Mãi",
      date: "2023-11-25",
    },
    {
      id: 6,
      title: "Tư Vấn Mua Hàng: Mua Điện Thoại Online An Toàn",
      content: `Tư vấn về việc mua điện thoại trực tuyến và cách bảo vệ giao dịch an toàn khi thanh toán. Chúng tôi sẽ cung cấp những lời khuyên hữu ích để bạn mua sắm an toàn.`,
      image: "https://via.placeholder.com/800x600?text=Tu+Van+Mua+Hang",
      category: "Tư Vấn",
      date: "2023-03-10",
    },
    {
      id: 7,
      title: "Sự Kiện Thực Tế Ảo: Trải Nghiệm Mua Sắm Online Đột Phá",
      content: `Tham gia sự kiện thực tế ảo và trải nghiệm những công nghệ mới trong mua sắm online. Bạn có thể thử nghiệm sản phẩm, xem chi tiết và mua sắm mà không cần ra khỏi nhà.`,
      image: "https://via.placeholder.com/800x600?text=Trải+Nghiệm+Mua+Sắm",
      category: "Công Nghệ",
      date: "2023-04-10",
    },
    {
      id: 8,
      title: "Đổi Mới Công Nghệ: Sự Ra Mắt của iPhone 14",
      content: `Apple đã chính thức ra mắt iPhone 14 với nhiều tính năng đột phá và thiết kế mới. Hãy tìm hiểu những cải tiến và tính năng vượt trội của chiếc điện thoại này.`,
      image: "https://via.placeholder.com/800x600?text=iPhone+14",
      category: "Điện Thoại",
      date: "2023-09-10",
    },
    {
      id: 9,
      title: "Giới Thiệu Về Điện Thoại 5G: Tương Lai Công Nghệ Di Động",
      content: `Khám phá về điện thoại 5G và những tính năng vượt trội mà nó mang lại cho người dùng. Công nghệ 5G sẽ làm thay đổi hoàn toàn cách chúng ta sử dụng các thiết bị di động.`,
      image: "https://via.placeholder.com/800x600?text=Dien+Thoai+5G",
      category: "Công Nghệ",
      date: "2023-02-01",
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
      <div className="text-gray-600 mt-2">
        <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
          {article?.category}
        </span>
        <span className="text-xs text-gray-500 ml-2">{article?.date}</span>
      </div>
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
