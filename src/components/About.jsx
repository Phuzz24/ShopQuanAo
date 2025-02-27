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
        <h2 className="text-4xl font-bold text-red-600 mb-4">Giới Thiệu Về Cửa Hàng</h2>
        <p className="text-lg text-gray-600 mx-auto max-w-4xl">
          Chúng tôi là cửa hàng thời trang tiên tiến, nơi cung cấp các sản phẩm thời trang nam và nữ với phong cách hiện đại và chất lượng vượt trội. Với một đội ngũ thiết kế tài năng, chúng tôi cam kết mang đến những bộ sưu tập mới nhất, phong cách độc đáo để phục vụ nhu cầu thời trang của mọi khách hàng.
        </p>
      </section>

      {/* Lý do nên chọn cửa hàng */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 text-center">
        <div className="bg-gray-200 p-8 rounded-lg shadow-md hover:shadow-xl transition-all " data-aos="zoom-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 ">Sản Phẩm Chất Lượng</h3>
          <p className="text-gray-600  ">
            Tất cả sản phẩm của chúng tôi được chọn lọc kỹ lưỡng từ các nhà sản xuất uy tín, đảm bảo chất lượng vượt trội và độ bền cao.
          </p>
        </div>
        <div className="bg-gray-200 p-8 rounded-lg shadow-md hover:shadow-xl transition-all" data-aos="zoom-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Dịch Vụ Tận Tâm</h3>
          <p className="text-gray-600">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn với dịch vụ chăm sóc khách hàng chu đáo, giúp bạn tìm kiếm sản phẩm phù hợp nhất.
          </p>
        </div>
        <div className="bg-gray-200 p-8 rounded-lg shadow-md hover:shadow-xl transition-all" data-aos="zoom-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mua Sắm Trực Tuyến Dễ Dàng</h3>
          <p className="text-gray-600">
            Với giao diện dễ sử dụng và phương thức thanh toán bảo mật, việc mua sắm tại cửa hàng chúng tôi chưa bao giờ dễ dàng và tiện lợi đến vậy.
          </p>
        </div>
      </section>

      {/* Mô tả không gian cửa hàng */}
      <section className="text-center">
        <h2 className="text-4xl font-bold text-red-600 mb-4" data-aos="fade-up">Không Gian Cửa Hàng</h2>
        <p className="text-lg text-gray-600 mx-auto max-w-4xl mb-8" data-aos="fade-up">
          Chúng tôi không chỉ cung cấp các sản phẩm thời trang mà còn mang đến một không gian mua sắm thoải mái, sang trọng, với các khu trưng bày sản phẩm hiện đại. Đến với cửa hàng, bạn sẽ có trải nghiệm mua sắm tuyệt vời.
        </p>
        <img
          src="https://dony.vn/wp-content/uploads/2021/08/shop-quan-ao-don-gian.jpg"
          alt="Không gian cửa hàng"
          className="w-full max-w-5xl mx-auto h-auto object-cover rounded-lg shadow-lg transition-all hover:scale-105 hover:brightness-90"
          data-aos="fade-up"
        />
      </section>
    </div>
  );
};

export default StoreIntro;
