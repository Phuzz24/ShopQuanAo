import React from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const images = [
  "https://salt.tikicdn.com/ts/brickv2og/00/50/1b/3cde53d8619069b98772edffe8c5dad1.jpg",
  "https://w.ladicdn.com/s1300x750/6715dfc816710b00127e842d/_banner-ngang-20241107075200-ptk4t.jpg",
  "https://bizweb.dktcdn.net/100/426/984/files/phoi-ao-thun-nam-voi-quan-au.jpg?v=1642240103382"
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
    prevArrow: <CustomPrevArrow />, // Custom button
    nextArrow: <CustomNextArrow />, // Custom button
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
