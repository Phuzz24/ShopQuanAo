import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const CustomerReviews = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto text-center">
        <h2 className="text-5xl font-extrabold text-blue-600 mb-12" data-aos="fade-up">
          Đánh Giá Khách Hàng
        </h2>
        <div className="flex flex-wrap justify-center gap-12">
          {/* Review 1 */}
          <div
            className="w-[350px] bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src="https://tophinhanh.net/wp-content/uploads/2023/11/avatar-hoat-hinh-1-300x300.jpg"
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-800">Nguyễn Thị Lan</h4>
                <div className="flex justify-center gap-1">
                  {/* Đánh giá sao */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-400 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-400 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-400 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-400 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-gray-300 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-lg italic text-gray-500">"Sản phẩm tuyệt vời! Chất lượng rất tốt và giao hàng nhanh chóng. Tôi rất hài lòng với dịch vụ của cửa hàng."</p>
          </div>

          {/* Review 2 */}
          <div
            className="w-[350px] bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src="https://tophinhanh.net/wp-content/uploads/2023/11/avatar-hoat-hinh-1-300x300.jpg"
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-800">Trần Minh Tuấn</h4>
                <div className="flex justify-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-400 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-400 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-400 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-400 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-gray-300 w-5 h-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.2 3.4L6.8 12 3 8.6l6.4-.5L10 2l2.6 6.1 6.4.5-3.8 3.4 1 6.4L10 15z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-lg italic text-gray-500">"Dịch vụ chăm sóc khách hàng rất chu đáo, tôi chắc chắn sẽ quay lại mua hàng. Các sản phẩm rất chất lượng và giá cả hợp lý."</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
