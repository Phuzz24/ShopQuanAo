import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation email
  const validateEmail = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email không đúng định dạng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý gửi yêu cầu
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      // Giả lập gọi API quên mật khẩu (thay bằng API thực tế nếu có)
      setTimeout(() => {
        setIsLoading(false);
        setSuccess(true);
        setEmail(''); // Reset email sau khi gửi thành công
      }, 1000); // Giả lập delay 1s
    } catch (error) {
      setErrors({ general: 'Đã có lỗi xảy ra, vui lòng thử lại' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      <Helmet>
        <title>Quên mật khẩu</title>
      </Helmet>

      {/* Slogan */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 justify-center items-center bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('https://cdnb.artstation.com/p/assets/images/images/041/601/775/original/ida-franzen-karlsson-background-animation.gif?1632167232')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="text-center text-white px-8">
            <h1 className="text-4xl font-bold mb-4 tracking-wide">Khôi phục mật khẩu</h1>
            <p className="text-xl mb-6">Nhập email để nhận hướng dẫn khôi phục.</p>
          </div>
        </div>
      </motion.div>

      {/* Form quên mật khẩu */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6">
        <motion.div
          className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">Quên Mật Khẩu</h2>

          {success ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-500 text-center mb-6"
            >
              Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn.
            </motion.p>
          ) : (
            <>
              {errors.general && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center mb-4">
                  {errors.general}
                </motion.p>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ Email
                  </label>
                  <motion.div
                    whileFocus={{ borderColor: '#4f46e5' }}
                    className={`flex items-center border rounded-lg px-4 py-2 transition duration-300 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <FaEnvelope className="text-gray-500 mr-3" />
                    <input
                      type="email"
                      id="email"
                      placeholder="Nhập email của bạn"
                      className="w-full outline-none text-gray-700 placeholder-gray-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </motion.div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 bg-indigo-600 text-white rounded-lg shadow-md transition duration-300 flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                  ) : null}
                  {isLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                </motion.button>
              </form>
            </>
          )}

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Đã nhớ mật khẩu?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline font-semibold">
                Đăng nhập
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;