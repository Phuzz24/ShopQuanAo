import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="py-20 bg-gray-100 text-gray-800">
      {/* Giới thiệu về cửa hàng */}
      <section className="text-center mb-16" data-aos="fade-up">
        <h2 className="text-5xl font-extrabold mb-6 text-blue-600">Giới Thiệu Về Cửa Hàng</h2>
        <p className="text-lg text-gray-600 mx-auto max-w-4xl mb-8">
          Chúng tôi là cửa hàng điện thoại tiên tiến, cung cấp các dòng sản phẩm điện thoại cao cấp với công nghệ mới nhất, hiệu suất vượt trội. Đội ngũ tư vấn viên tận tâm luôn sẵn sàng hỗ trợ, đảm bảo mang đến sản phẩm và dịch vụ tốt nhất cho khách hàng.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Hình ảnh về cửa hàng */}
          <div className="flex justify-center items-center">
            <img 
              src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/28/ictnews_.jpeg"
              alt="Cửa hàng"
              className="w-full h-auto rounded-lg shadow-lg transition-all transform hover:scale-105 hover:brightness-110"
            />
          </div>

          {/* Hình ảnh về các sản phẩm */}
          <div className="flex justify-center items-center">
            <img 
              src="https://cdn.nguyenkimmall.com/images/detailed/824/dien-thoai-iphone-14-pro-max-256gb-vang-3.jpg"
              alt="Sản phẩm điện thoại"
              className="w-full h-[420px] rounded-lg shadow-lg transition-all transform hover:scale-105 hover:brightness-110"
            />
          </div>

          {/* Hình ảnh về đội ngũ tư vấn viên */}
          <div className="flex justify-center items-center">
            <img 
              src="https://th.bing.com/th/id/OIP.Sz1IXcU47iUT1uvHdIsAzAHaFH?w=900&h=622&rs=1&pid=ImgDetMain"
              alt="Đội ngũ tư vấn"
              className="w-full h-auto rounded-lg shadow-lg transition-all transform hover:scale-105 hover:brightness-110"
            />
          </div>
        </div>

        <button className="bg-yellow-500 text-gray-800 py-2 px-6 rounded-lg hover:bg-yellow-600 transition-all duration-300">
          Khám Phá Ngay
        </button>
      </section>

      {/* Lý do nên chọn cửa hàng */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105" data-aos="zoom-in">
          <div className="text-3xl mb-4 text-blue-600">
            <i className="fas fa-box-open"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Sản Phẩm Chính Hãng</h3>
          <p className="text-gray-600">
            Chúng tôi chỉ cung cấp các sản phẩm điện thoại chính hãng từ các thương hiệu uy tín, đảm bảo chất lượng và chế độ bảo hành tốt nhất.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105" data-aos="zoom-in">
          <div className="text-3xl mb-4 text-blue-600">
            <i className="fas fa-headset"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Dịch Vụ Hỗ Trợ 24/7</h3>
          <p className="text-gray-600">
            Đội ngũ hỗ trợ khách hàng luôn sẵn sàng phục vụ bạn 24/7, giúp bạn giải đáp thắc mắc và lựa chọn sản phẩm phù hợp.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105" data-aos="zoom-in">
          <div className="text-3xl mb-4 text-blue-600">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mua Sắm Trực Tuyến Thuận Tiện</h3>
          <p className="text-gray-600">
            Với giao diện website thân thiện và các phương thức thanh toán bảo mật, việc mua sắm điện thoại trở nên dễ dàng và tiện lợi hơn bao giờ hết.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
