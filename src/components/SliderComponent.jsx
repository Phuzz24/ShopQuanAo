import React, { useState } from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Parallax } from 'react-parallax';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const images = [
  {
    url: "https://www.webtekno.com/images/editor/default/0004/38/d34c1e9d9f1e99bc0263db1331c3fda509dca52f.jpeg",
    title: "Siêu phẩm công nghệ mới",
    description: "Khám phá những sản phẩm đỉnh cao từ các thương hiệu hàng đầu.",
  },
  {
    url: "https://top3.vn/uploads/source/SaSan/elm-co-khi/cover-baner-web.jpg",
    title: "Khuyến mãi hấp dẫn",
    description: "Giảm giá lên đến 50% cho các sản phẩm công nghệ hot nhất.",
  },
  {
    url: "https://i.ytimg.com/vi/36HnmEcKDJk/maxresdefault.jpg",
    title: "Trải nghiệm đẳng cấp",
    description: "Không gian mua sắm sang trọng, dịch vụ chuyên nghiệp.",
  },
  {
    url: "https://www.mobilegyans.com/wp-content/uploads/2023/02/Apple-iPhone-16.jpg",
    title: "iPhone 16 ra mắt",
    description: "Sở hữu ngay siêu phẩm iPhone 16 với công nghệ tiên tiến.",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Công nghệ tương lai",
    description: "Trải nghiệm những thiết bị tiên tiến nhất trên thị trường.",
  },
  {
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Điện thoại thông minh",
    description: "Cập nhật những mẫu điện thoại mới nhất với hiệu năng vượt trội.",
  },
];

// Custom Previous Arrow
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-full text-white shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
  >
    <FaChevronLeft size={28} />
  </button>
);

// Custom Next Arrow
const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-full text-white shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
  >
    <FaChevronRight size={28} />
  </button>
);

const SliderComponent = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    afterChange: (index) => setCurrentImageIndex(index),
    appendDots: (dots) => (
      <div className="absolute bottom-6 left-0 right-0">
        <ul className="flex justify-center space-x-3">
          {dots.map((item, index) => (
            <li key={index} className={item.props.className}>
              <motion.button
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  item.props.className.includes('slick-active')
                    ? 'bg-yellow-500 scale-125'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              />
            </li>
          ))}
        </ul>
      </div>
    ),
  };

  return (
    <div className="w-full max-w-[80%] mx-auto relative overflow-hidden">
      <Slider {...settings}>
        {images.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative w-full"
          >
            {/* Hình ảnh với hiệu ứng parallax */}
            <Parallax strength={300}>
              <motion.div
                className="w-full h-[320px] sm:h-[500px] md:h-[650px] lg:h-[800px] rounded-xl shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={img.url}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </Parallax>

            {/* Overlay và Caption */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/70 flex flex-col justify-end p-8 md:p-12 rounded-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between w-full"
              >
                {/* Text khuyến mãi */}
                <div className="text-left">
                  <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight uppercase">
                    Sale Đầu Tuần - Giảm Tưng Bừng
                  </h3>
                  <div className="flex gap-4 mb-4">
                    <span className="bg-red-600 text-white text-lg font-bold px-4 py-2 rounded-lg shadow-md">
                      Sale đến 800K
                    </span>
                    <span className="bg-white text-red-600 text-lg font-bold px-4 py-2 rounded-lg shadow-md">
                      Ưu đãi 500K
                    </span>
                  </div>
                  <p className="text-sm md:text-lg text-gray-200 max-w-md">
                    Khuyến mãi hấp dẫn - Giảm giá lên đến 50% cho các siêu phẩm hot nhất.
                  </p>
                </div>

                {/* Nút CTA */}
                <a
                  href="/products"
                  className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-8 rounded-full font-semibold text-lg shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 mt-4 md:mt-0"
                >
                  Xem thêm
                </a>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </Slider>

      {/* Chỉ số slide */}
      <div className="absolute top-6 right-6 bg-gray-800/50 text-white px-4 py-2 rounded-full">
        {currentImageIndex + 1}/{images.length}
      </div>
    </div>
  );
};

export default SliderComponent;