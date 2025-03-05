import React from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const images = [
  "https://www.webtekno.com/images/editor/default/0004/38/d34c1e9d9f1e99bc0263db1331c3fda509dca52f.jpeg",
  "https://top3.vn/uploads/source/SaSan/elm-co-khi/cover-baner-web.jpg",
  "https://i.ytimg.com/vi/36HnmEcKDJk/maxresdefault.jpg",
  "https://www.mobilegyans.com/wp-content/uploads/2023/02/Apple-iPhone-16.jpg"
];

const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-80 transition"
  >
    <FaChevronLeft size={24} />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-80 transition"
  >
    <FaChevronRight size={24} />
  </button>
);

const SliderComponent = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  return (
    <div className="w-full sm:w-4/5 mx-auto relative">
      <Slider {...settings}>
        {images.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              className="w-full h-[320px] sm:h-[500px] md:h-[650px] lg:h-[750px] object-cover rounded-lg shadow-lg"
            />
          </motion.div>
        ))}
      </Slider>
    </div>
  );
};

export default SliderComponent;
