import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    
    <div className="flex h-screen bg-gradient-to-r from-pink-400 via-yellow-400 to-orange-400">
    <Helmet>
      <title>
        Đăng kí
      </title>
    </Helmet>
      {/* Logo và thương hiệu */}
      <div className="w-1/2 flex justify-center items-center bg-white p-10">
        <div className="text-center">
          <Link to="/home" className="text-3xl font-bold text-red-600">
                             NEO<span className="text-black"> PLATTON</span></Link>
          <p className="text-xl text-gray-600 mt-2">Thương hiệu thời trang đỉnh cao</p>
        </div>
      </div>

      {/* Form đăng ký */}
      <div className="w-1/2 flex justify-center items-center bg-white p-10">
        <motion.div
          className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg border border-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Đăng Ký</h2>

          <form>
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên Đăng Nhập
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 mt-2 focus-within:border-pink-500 transition duration-300">
                <FaUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  id="username"
                  placeholder="Tên đăng nhập"
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Địa chỉ Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 mt-2 focus-within:border-pink-500 transition duration-300">
                <FaEnvelope className="text-gray-500 mr-3" />
                <input
                  type="email"
                  id="email"
                  placeholder="Email của bạn"
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 mt-2 focus-within:border-pink-500 transition duration-300">
                <FaLock className="text-gray-500 mr-3" />
                <input
                  type="password"
                  id="password"
                  placeholder="Mật khẩu"
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <Link to="/login" className="text-sm text-blue-500 hover:underline">Đã có tài khoản? Đăng nhập</Link>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500 transition duration-300"
              >
                Đăng Ký
              </button>
            </div>
          </form>
           {/* Các logo đăng nhập bên thứ 3 */}
           <div className="flex justify-center items-center mt-6 gap-4 space-x-4">
            {/* Google Login Logo */}
            <a href="#" className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-200">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Gile_use.png/120px-Gile_use.png" alt="Google logo" className="w-8 h-8" />
            </a>

            {/* Facebook Login Logo */}
            <a href="#" className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-200">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook logo" className="w-8 h-8" />
            </a>

            {/* GitHub Login Logo */}
            <a href="#" className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-200">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub logo" className="w-8 h-8" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
