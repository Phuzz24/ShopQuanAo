import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 text-white py-16 overflow-hidden">
      {/* Hiệu ứng ánh sáng nền */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)] opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {/* Column 1: About Us */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wide">
              Về Chúng Tôi
            </h4>
            <p className="text-gray-300 leading-relaxed">
              Chúng tôi cung cấp những bộ sưu tập thời trang mới nhất với chất lượng tuyệt vời và giá cả hợp lý. Hãy đến với chúng tôi để tìm những món đồ ưa thích của bạn.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Youtube, href: "#" },
              ].map(({ Icon, href }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  whileHover={{ scale: 1.2, rotate: 10, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Useful Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wide">
              Liên Kết Hữu Ích
            </h4>
            <ul className="space-y-3 text-gray-300">
              {["Trang Chủ", "Sản Phẩm", "Giới Thiệu", "Liên Hệ"].map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  className="group relative"
                >
                  <a
                    href="#"
                    className="relative text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link}
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Contact Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wide">
              Liên Hệ
            </h4>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Địa Chỉ: 123 Đường ABC, Quận XYZ</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Email: contact@yourstore.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>Điện Thoại: 0123456789</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-gray-300 text-sm"
          >
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              NeoPlatton Store
            </span>{" "}
            © 2025. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;