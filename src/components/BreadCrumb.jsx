import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Tùy chỉnh tên hiển thị cho từng đoạn URL
  const breadcrumbNames = {
    news: 'Tin tức',
    'news-detail': 'Chi tiết tin tức',
    products: 'Sản phẩm',
    'product-detail': 'Chi tiết sản phẩm',
    checkout: 'Thanh toán',
    cart: 'Giỏ hàng',
    about: 'Giới thiệu',
    contact: 'Liên hệ',
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-50 to-gray-100 p-4 rounded-xl shadow-md w-full mb-6"
    >
      <ol className="list-reset flex items-center flex-wrap">
        {/* Trang chủ */}
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-300 group"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center"
            >
              <HomeIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Trang chủ
            </motion.div>
          </Link>
        </li>

        {/* Các đoạn đường dẫn */}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = breadcrumbNames[value] || value.charAt(0).toUpperCase() + value.slice(1); // Tùy chỉnh tên hoặc capitalize

          return (
            <motion.li
              key={to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center"
            >
              <ChevronRightIcon className="h-5 w-5 mx-2 text-gray-400 transition-transform duration-300 hover:scale-110" />
              {isLast ? (
                <span className="text-gray-600 font-semibold">{displayName}</span>
              ) : (
                <Link
                  to={to}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-300"
                >
                  {displayName}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumbs;