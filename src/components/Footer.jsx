import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About Us */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Về Chúng Tôi</h4>
            <p className="text-gray-400">
              Chúng tôi cung cấp những bộ sưu tập thời trang mới nhất với chất lượng tuyệt vời và giá cả hợp lý. Hãy đến với chúng tôi để tìm những món đồ ưa thích của bạn.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Useful Links */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Liên Kết Hữu Ích</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Trang Chủ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sản Phẩm</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Giới Thiệu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên Hệ</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Liên Hệ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Địa Chỉ: 123 Đường ABC, Quận XYZ</li>
              <li>Email: contact@yourstore.com</li>
              <li>Điện Thoại: 0123456789</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">&copy; 2025 Your Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
