import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý gửi yêu cầu quên mật khẩu ở đây
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Helmet>
        <title>Quên mật khẩu</title>
      </Helmet>

      {/* Slogan và logo */}
      <div className="w-1/2 flex justify-center items-center bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('https://cdnb.artstation.com/p/assets/images/images/041/601/775/original/ida-franzen-karlsson-background-animation.gif?1632167232')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="text-center text-white px-8">
            <h1 className="text-4xl font-bold mb-4">Khôi phục mật khẩu của bạn</h1>
            <p className="text-xl mb-6">Nhập email để nhận hướng dẫn khôi phục mật khẩu.</p>
          </div>
        </div>
      </div>

      {/* Form quên mật khẩu */}
      <div className="w-full sm:w-1/2 flex justify-center items-center bg-white p-12 shadow-2xl rounded-xl mx-8">
        <motion.div
          className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg border border-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Quên Mật Khẩu</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Địa chỉ Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 mt-2 focus-within:border-pink-500 transition duration-300">
                <FaEnvelope className="text-gray-500 mr-3" />
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div className="flex justify-center items-center mb-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500 transition duration-300"
              >
                Gửi Yêu Cầu
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-blue-500 hover:underline">
              Đã nhớ mật khẩu? Đăng nhập
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
