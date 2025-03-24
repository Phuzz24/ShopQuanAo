import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  return (
    <div className="py-24 bg-gray-100 text-gray-800 overflow-hidden">
      {/* Giới thiệu về cửa hàng */}
      <section className="relative text-center mb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent -z-10"></div>
        <h2 
          className="text-6xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-yellow-500"
          data-aos="fade-down"
        >
          Giới Thiệu Về Cửa Hàng
        </h2>
        <p 
          className="text-xl text-gray-600 mx-auto max-w-4xl mb-10 font-light tracking-wide"
          data-aos="fade-up"
        >
          Chúng tôi tự hào là cửa hàng điện thoại tiên phong, mang đến những siêu phẩm công nghệ đỉnh cao cùng dịch vụ đẳng cấp. Sự hài lòng của bạn là sứ mệnh của chúng tôi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 px-6">
          <div className="group relative" data-aos="fade-right">
            <img 
              src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/28/ictnews_.jpeg"
              alt="Cửa hàng"
              className="w-full h-[400px] object-cover rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:brightness-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white font-semibold">Không gian cửa hàng sang trọng</p>
            </div>
          </div>

          <div className="group relative" data-aos="fade-up">
            <img 
              src="https://cdn.nguyenkimmall.com/images/detailed/824/dien-thoai-iphone-14-pro-max-256gb-vang-3.jpg"
              alt="Sản phẩm điện thoại"
              className="w-full h-[400px] object-cover rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:brightness-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white font-semibold">Sản phẩm công nghệ đỉnh cao</p>
            </div>
          </div>

          <div className="group relative" data-aos="fade-left">
            <img 
              src="https://th.bing.com/th/id/OIP.Sz1IXcU47iUT1uvHdIsAzAHaFH?w=900&h=622&rs=1&pid=ImgDetMain"
              alt="Đội ngũ tư vấn"
              className="w-full h-[400px] object-cover rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:brightness-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white font-semibold">Đội ngũ chuyên nghiệp</p>
            </div>
          </div>
        </div>
        <button 
          className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-gray-900 py-3 px-8 rounded-full font-semibold text-lg shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 transform hover:scale-110"
          data-aos="zoom-in"
          href="/news"
        >
          Khám Phá Ngay
        </button>
      </section>

      {/* Lý do nên chọn cửa hàng */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-6 mb-20">
        <div 
          className="bg-yellow-200 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-200"
          data-aos="zoom-in-up"
        >
          <div className="text-4xl mb-6 text-blue-600">
            <i className="fas fa-box-open"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Sản Phẩm Chính Hãng</h3>
          <p className="text-gray-600 font-light">
            Cam kết 100% hàng chính hãng từ các thương hiệu hàng đầu, đi kèm chế độ bảo hành vàng.
          </p>
        </div>

        <div 
          className="bg-yellow-200 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-200"
          data-aos="zoom-in-up"
          data-aos-delay="200"
        >
          <div className="text-4xl mb-6 text-blue-600">
            <i className="fas fa-headset"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Hỗ Trợ 24/7</h3>
          <p className="text-gray-600 font-light">
            Dịch vụ chăm sóc khách hàng đẳng cấp, sẵn sàng hỗ trợ bạn mọi lúc mọi nơi.
          </p>
        </div>

        <div 
          className="bg-yellow-200 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-200"
          data-aos="zoom-in-up"
          data-aos-delay="400"
        >
          <div className="text-4xl mb-6 text-blue-600">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Mua Sắm Tiện Lợi</h3>
          <p className="text-gray-600 font-light">
            Trải nghiệm mua sắm trực tuyến mượt mà với giao diện tối ưu và thanh toán an toàn.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;