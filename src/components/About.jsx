import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const StoreIntro = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="py-20 bg-white">
      {/* Giới thiệu về cửa hàng */}
      <section className="text-center mb-16" data-aos="fade-up">
        <h2 className="text-4xl font-bold text-blue-600 mb-4">Giới Thiệu Về Cửa Hàng</h2>
        <p className="text-lg text-gray-600 mx-auto max-w-4xl">
          Chúng tôi là cửa hàng điện thoại tiên tiến, nơi cung cấp các dòng điện thoại cao cấp với công nghệ mới nhất và hiệu suất vượt trội. Với một đội ngũ tư vấn viên tận tâm, chúng tôi cam kết mang đến những sản phẩm tốt nhất và dịch vụ hỗ trợ tuyệt vời cho khách hàng.
        </p>
      </section>

      {/* Lý do nên chọn cửa hàng */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 text-center">
        <div className="bg-gray-200 p-8 rounded-lg shadow-md hover:shadow-xl transition-all" data-aos="zoom-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Sản Phẩm Chính Hãng</h3>
          <p className="text-gray-600">
            Chúng tôi chỉ cung cấp các sản phẩm điện thoại chính hãng từ các thương hiệu uy tín, bảo đảm chất lượng và chế độ bảo hành tốt nhất.
          </p>
        </div>
        <div className="bg-gray-200 p-8 rounded-lg shadow-md hover:shadow-xl transition-all" data-aos="zoom-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Dịch Vụ Hỗ Trợ 24/7</h3>
          <p className="text-gray-600">
            Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng phục vụ bạn 24/7, giúp bạn giải đáp mọi thắc mắc và lựa chọn sản phẩm phù hợp.
          </p>
        </div>
        <div className="bg-gray-200 p-8 rounded-lg shadow-md hover:shadow-xl transition-all" data-aos="zoom-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mua Sắm Trực Tuyến Thuận Tiện</h3>
          <p className="text-gray-600">
            Với giao diện website thân thiện và các phương thức thanh toán bảo mật, việc mua sắm điện thoại tại cửa hàng chúng tôi trở nên dễ dàng và tiện lợi hơn bao giờ hết.
          </p>
        </div>
      </section>

      {/* Mô tả không gian cửa hàng */}
      <section className="text-center">
        <h2 className="text-4xl font-bold text-blue-600 mb-4" data-aos="fade-up">Không Gian Cửa Hàng</h2>
        <p className="text-lg text-gray-600 mx-auto max-w-4xl mb-8" data-aos="fade-up">
          Cửa hàng của chúng tôi không chỉ là nơi bán điện thoại, mà còn là nơi bạn có thể trải nghiệm trực tiếp các sản phẩm, nhận tư vấn chuyên sâu và khám phá những tính năng mới nhất của các dòng điện thoại.
        </p>
        <img
          src="https://dony.vn/wp-content/uploads/2021/08/shop-quan-ao-don-gian.jpg"
          alt="Không gian cửa hàng điện thoại"
          className="w-full max-w-5xl mx-auto h-auto object-cover rounded-lg shadow-lg transition-all hover:scale-105 hover:brightness-90"
          data-aos="fade-up"
        />
      </section>
    </div>
  );
};

export default StoreIntro;
