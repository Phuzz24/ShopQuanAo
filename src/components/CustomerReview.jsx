import React, { useEffect } from 'react';
import AOS from 'aos'
import 'aos/dist/aos.css'
const CustomerReviews = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Khởi tạo AOS với thời gian hiệu ứng là 1 giây
  }, []);
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl text-red-600 font-bold mb-8" data-aos="fade-up">Đánh Giá Khách Hàng</h2>
        <div className="flex justify-center gap-12">
          {/* Đánh giá 1 */}
          <div
            className="w-[350px] bg-gray-50 p-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src="userImg.jpeg"
                alt="Customer Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-800">Nguyễn Thị Lan</h4>
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
            <p className="text-lg italic text-gray-500">"Sản phẩm tuyệt vời! Chất lượng rất tốt và giao hàng nhanh chóng. Tôi rất hài lòng với dịch vụ của cửa hàng."</p>
          </div>

          {/* Đánh giá 2 */}
          <div
            className="w-[350px] bg-gray-50 p-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src="userImg.jpeg"
                alt="Customer Avatar"
                className="w-12 h-12 rounded-full object-cover"
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
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-gray-300 w-5 h-5" viewBox="0 0 20 20">
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