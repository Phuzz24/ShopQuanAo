import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const reviews = [
  {
    name: "Nguyễn Thị Lan",
    avatar: "https://tophinhanh.net/wp-content/uploads/2023/11/avatar-hoat-hinh-1-300x300.jpg",
    rating: 4,
    comment: "Sản phẩm tuyệt vời! Chất lượng rất tốt và giao hàng nhanh chóng. Tôi rất hài lòng với dịch vụ của cửa hàng.",
  },
  {
    name: "Trần Minh Tuấn",
    avatar: "https://tophinhanh.net/wp-content/uploads/2023/11/avatar-hoat-hinh-1-300x300.jpg",
    rating: 4,
    comment: "Dịch vụ chăm sóc khách hàng rất chu đáo, tôi chắc chắn sẽ quay lại mua hàng. Các sản phẩm rất chất lượng và giá cả hợp lý.",
  },
  {
    name: "Lê Văn Hùng",
    avatar: "https://tophinhanh.net/wp-content/uploads/2023/11/avatar-hoat-hinh-1-300x300.jpg",
    rating: 5,
    comment: "Cửa hàng uy tín, sản phẩm chính hãng, và đội ngũ nhân viên rất nhiệt tình. Tôi rất hài lòng!",
  },
];

// Custom Previous Arrow
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-full text-white shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
  >
    <FaChevronLeft size={24} />
  </button>
);

// Custom Next Arrow
const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-full text-white shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
  >
    <FaChevronRight size={24} />
  </button>
);

const CustomerReviews = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    appendDots: (dots) => (
      <div className="mt-6">
        <ul className="flex justify-center space-x-3">
          {dots.map((item, index) => (
            <li key={index} className={item.props.className}>
              <button
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  item.props.className.includes('slick-active')
                    ? 'bg-yellow-500 scale-125'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
              />
            </li>
          ))}
        </ul>
      </div>
    ),
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2
          className="text-5xl md:text-6xl font-extrabold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-yellow-600 tracking-tight"
          data-aos="fade-down"
        >
          Đánh Giá Khách Hàng
        </h2>
        <Slider {...settings}>
          {reviews.map((review, index) => (
            <div key={index} className="px-3" data-aos="zoom-in" data-aos-delay={index * 200}>
              <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-yellow-500/5 rounded-2xl -z-10"></div>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src={review.avatar}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border-4 border-blue-600/20 shadow-md transition-all duration-300 hover:border-blue-600/40"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">{review.name}</h4>
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className={`w-5 h-5 transition-all duration-300 ${
                            i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                          } hover:scale-125`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-lg italic text-gray-600 leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default CustomerReviews;