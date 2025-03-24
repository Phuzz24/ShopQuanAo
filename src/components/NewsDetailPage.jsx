import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShareAlt } from 'react-icons/fa';

const NewsDetailPage = () => {
  const { id } = useParams();

  const imageUrls = {
    1: "https://static.vecteezy.com/system/resources/previews/000/327/340/original/phone-sale-vector-background.jpg",
    2: "https://aeros.vn/upload/images/thiet-ke-shop-dien-thoai-1(2).jpg",
    3: "https://cdn.thuvienphapluat.vn/phap-luat/2022-2/DQ/12-1/viec-lam-2.jpg",
    4: "https://genk.mediacdn.vn/139269124445442048/2022/7/12/photo-1-1657621353166345435608-1657624991781-16576249918561120557677.jpg",
    5: "https://th.bing.com/th/id/OIP.M6ZAl61nY45H25f4Az_D1QHaFD?rs=1&pid=ImgDetMain",
    6: "https://th.bing.com/th/id/OIP.YSV2WohLW5mMCbq7OT058AHaE7?rs=1&pid=ImgDetMain",
    7: "https://th.bing.com/th/id/OIP.DQAQYHsco_yp4wWjt5g-dwHaE8?rs=1&pid=ImgDetMain",
    8: "https://th.bing.com/th/id/OIP.7loXCV46y-_E5Aa84fHYPwHaEK?rs=1&pid=ImgDetMain",
    9: "https://cdn.sforum.vn/sforum/wp-content/uploads/2022/03/co-nen-mua-dien-thoai-5G-1-1-e1646505294297.jpg",
  };

  const newsData = [
    {
      id: 1,
      title: "Khuyến Mãi Mùa Xuân: Giảm Giá 20% Cho Tất Cả Các Sản Phẩm",
      content: `Chỉ trong tháng này, cửa hàng chúng tôi có chương trình giảm giá đặc biệt lên đến 20% cho mọi sản phẩm, bao gồm điện thoại, phụ kiện và các thiết bị điện tử khác. Đừng bỏ lỡ cơ hội này!`,
      category: "Khuyến Mãi",
      date: "2023-04-01",
    },
    {
      id: 2,
      title: "Mở Rộng Hệ Thống Cửa Hàng: Đến Thăm Cửa Hàng Mới Của Chúng Tôi",
      content: `Chúng tôi rất vui mừng thông báo về việc mở rộng hệ thống cửa hàng với chi nhánh mới tại trung tâm thành phố. Hãy đến thăm cửa hàng mới để nhận ưu đãi đặc biệt và trải nghiệm những sản phẩm điện thoại mới nhất!`,
      category: "Mở Rộng",
      date: "2023-03-20",
    },
    {
      id: 3,
      title: "Giới Thiệu Dịch Vụ Mới: Tư Vấn Chọn Điện Thoại Online",
      content: `Chúng tôi cung cấp dịch vụ tư vấn chọn điện thoại trực tuyến qua video call, giúp bạn lựa chọn sản phẩm phù hợp nhất với nhu cầu và ngân sách của bạn. Liên hệ ngay để được tư vấn miễn phí!`,
      category: "Dịch Vụ Mới",
      date: "2023-03-15",
    },
    {
      id: 4,
      title: "Đón Chờ Sự Kiện Công Nghệ: Hội Thảo Về Sự Phát Triển 5G",
      content: `Đừng bỏ lỡ hội thảo chuyên đề về công nghệ 5G với các chuyên gia hàng đầu trong ngành. Sự kiện này sẽ cung cấp cái nhìn sâu sắc về tương lai của mạng di động và các thiết bị hỗ trợ 5G.`,
      category: "Công Nghệ",
      date: "2023-02-28",
    },
    {
      id: 5,
      title: "Sự Kiện Giảm Giá Hấp Dẫn: Black Friday 50% Off",
      content: `Sự kiện Black Friday với mức giảm giá lên đến 50% cho các sản phẩm điện tử và điện thoại. Chúng tôi cam kết mang lại những ưu đãi hấp dẫn nhất cho khách hàng.`,
      category: "Khuyến Mãi",
      date: "2023-11-25",
    },
    {
      id: 6,
      title: "Tư Vấn Mua Hàng: Mua Điện Thoại Online An Toàn",
      content: `Tư vấn về việc mua điện thoại trực tuyến và cách bảo vệ giao dịch an toàn khi thanh toán. Chúng tôi sẽ cung cấp những lời khuyên hữu ích để bạn mua sắm an toàn.`,
      category: "Tư Vấn",
      date: "2023-03-10",
    },
    {
      id: 7,
      title: "Sự Kiện Thực Tế Ảo: Trải Nghiệm Mua Sắm Online Đột Phá",
      content: `Tham gia sự kiện thực tế ảo và trải nghiệm những công nghệ mới trong mua sắm online. Bạn có thể thử nghiệm sản phẩm, xem chi tiết và mua sắm mà không cần ra khỏi nhà.`,
      category: "Công Nghệ",
      date: "2023-04-10",
    },
    {
      id: 8,
      title: "Đổi Mới Công Nghệ: Sự Ra Mắt của iPhone 14",
      content: `Apple đã chính thức ra mắt iPhone 14 với nhiều tính năng đột phá và thiết kế mới. Hãy tìm hiểu những cải tiến và tính năng vượt trội của chiếc điện thoại này.`,
      category: "Điện Thoại",
      date: "2023-09-10",
    },
    {
      id: 9,
      title: "Giới Thiệu Về Điện Thoại 5G: Tương Lai Công Nghệ Di Động",
      content: `Khám phá về điện thoại 5G và những tính năng vượt trội mà nó mang lại cho người dùng. Công nghệ 5G sẽ làm thay đổi hoàn toàn cách chúng ta sử dụng các thiết bị di động.`,
      category: "Công Nghệ",
      date: "2023-02-01",
    },
  ];

  const article = newsData.find((item) => item.id === parseInt(id));
  const imageUrl = imageUrls[article?.id];

  if (!article) {
    return (
      <div className="text-center text-red-600 py-20">
        Không tìm thấy bài viết!
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-gray-100 min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-gray-600 mb-6"
        >
          <Link to="/" className="hover:text-indigo-600">Trang chủ</Link> &gt;{' '}
          <Link to="/news" className="hover:text-indigo-600">Tin tức</Link> &gt;{' '}
          <span className="text-indigo-600">{article.title}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-gray-600 mb-6">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-sm">{article.date}</span>
          </div>
          <img
            className="w-full h-[400px] md:h-[500px] object/cover rounded-xl shadow-md mb-6"
            src={imageUrl}
            alt={article.title}
          />
          <p className="text-gray-700 leading-relaxed text-lg">{article.content}</p>

          {/* Nút chia sẻ */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => alert('Chia sẻ bài viết (chưa tích hợp thực tế)')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300"
            >
              <FaShareAlt /> Chia sẻ
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsDetailPage;