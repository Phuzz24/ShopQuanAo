import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Package, Headphones, ShoppingCart } from 'lucide-react';

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  return (
    <div className="py-24 bg-gradient-to-b from-white to-gray-50 text-gray-800 overflow-hidden">
      {/* Giới thiệu về cửa hàng */}
      <section
        className="relative text-center mb-24 max-w-7xl mx-auto px-6 bg-cover bg-center"
        style={{
          backgroundImage: "url('')",
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-yellow-500/30 -z-10 rounded-3xl"></div>
        <h2
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-yellow-600 tracking-tight"
          data-aos="fade-down"
        >
          Giới Thiệu Về Cửa Hàng
        </h2>
        <p
          className="text-lg md:text-xl text-gray-600 mx-auto max-w-3xl mb-12 font-light leading-relaxed tracking-wide"
          data-aos="fade-up"
        >
          Chúng tôi tự hào là cửa hàng điện thoại tiên phong, mang đến những siêu phẩm công nghệ đỉnh cao cùng dịch vụ đẳng cấp. Sự hài lòng của bạn là sứ mệnh của chúng tôi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 mt-16">
          <div className="group relative" data-aos="fade-right">
            <img
              src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/28/ictnews_.jpeg"
              alt="Cửa hàng"
              className="w-full h-[350px] object-cover rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <p className="text-white text-lg font-semibold tracking-wide">Không gian cửa hàng sang trọng</p>
            </div>
          </div>

          <div className="group relative" data-aos="fade-up">
            <img
              src="https://cdn.nguyenkimmall.com/images/detailed/824/dien-thoai-iphone-14-pro-max-256gb-vang-3.jpg"
              alt="Sản phẩm điện thoại"
              className="w-full h-[350px] object-cover rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <p className="text-white text-lg font-semibold tracking-wide">Sản phẩm công nghệ đỉnh cao</p>
            </div>
          </div>

          <div className="group relative" data-aos="fade-left">
            <img
              src="https://th.bing.com/th/id/OIP.Sz1IXcU47iUT1uvHdIsAzAHaFH?w=900&h=622&rs=1&pid=ImgDetMain"
              alt="Đội ngũ tư vấn"
              className="w-full h-[350px] object-cover rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <p className="text-white text-lg font-semibold tracking-wide">Đội ngũ chuyên nghiệp</p>
            </div>
          </div>
        </div>

        <a
          href="/news"
          className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 px-10 rounded-full font-semibold text-lg shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          data-aos="zoom-in"
        >
          Khám Phá Ngay
        </a>
      </section>

      {/* Số liệu ấn tượng */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 mb-24">
        <div className="text-center" data-aos="fade-up">
          <h3 className="text-5xl font-bold text-blue-600 mb-2">10,000+</h3>
          <p className="text-gray-600 font-light">Khách hàng hài lòng</p>
        </div>
        <div className="text-center" data-aos="fade-up" data-aos-delay="200">
          <h3 className="text-5xl font-bold text-blue-600 mb-2">50,000+</h3>
          <p className="text-gray-600 font-light">Sản phẩm bán ra</p>
        </div>
        <div className="text-center" data-aos="fade-up" data-aos-delay="400">
          <h3 className="text-5xl font-bold text-blue-600 mb-2">5+</h3>
          <p className="text-gray-600 font-light">Năm kinh nghiệm</p>
        </div>
      </section>

      {/* Lý do nên chọn cửa hàng */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto px-6 mb-24">
        <div
          className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100"
          data-aos="zoom-in-up"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-yellow-500/5 rounded-2xl -z-10"></div>
          <Package className="text-5xl mb-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Sản Phẩm Chính Hãng</h3>
          <p className="text-gray-600 font-light leading-relaxed">
            Cam kết 100% hàng chính hãng từ các thương hiệu hàng đầu, đi kèm chế độ bảo hành vàng.
          </p>
        </div>

        <div
          className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100"
          data-aos="zoom-in-up"
          data-aos-delay="200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-yellow-500/5 rounded-2xl -z-10"></div>
          <Headphones className="text-5xl mb-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Hỗ Trợ 24/7</h3>
          <p className="text-gray-600 font-light leading-relaxed">
            Dịch vụ chăm sóc khách hàng đẳng cấp, sẵn sàng hỗ trợ bạn mọi lúc mọi nơi.
          </p>
        </div>

        <div
          className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100"
          data-aos="zoom-in-up"
          data-aos-delay="400"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-yellow-500/5 rounded-2xl -z-10"></div>
          <ShoppingCart className="text-5xl mb-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Mua Sắm Tiện Lợi</h3>
          <p className="text-gray-600 font-light leading-relaxed">
            Trải nghiệm mua sắm trực tuyến mượt mà với giao diện tối ưu và thanh toán an toàn.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;