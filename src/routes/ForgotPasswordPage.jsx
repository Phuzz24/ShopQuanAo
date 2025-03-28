import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import CSS của react-toastify

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);
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

  // Validation mã và mật khẩu
  const validateReset = () => {
    const newErrors = {};
    if (!code) newErrors.code = 'Mã xác nhận không được để trống';
    if (!newPassword) newErrors.newPassword = 'Mật khẩu không được để trống';
    else if (newPassword.length < 6) newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gửi yêu cầu quên mật khẩu
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setStep(2);
        toast.success(data.message, { autoClose: 3000 }); // Hiển thị toast thành công
      } else {
        setErrors({ general: data.message });
        toast.error(data.message, { autoClose: 3000 }); // Hiển thị toast lỗi
      }
    } catch (error) {
      setErrors({ general: 'Đã có lỗi xảy ra, vui lòng thử lại' });
      toast.error('Đã có lỗi xảy ra, vui lòng thử lại', { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  // Xác nhận mã và đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateReset()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        toast.success('Đổi mật khẩu thành công!', {
          autoClose: 3000,
          onClose: () => window.location.href = '/login', // Chuyển hướng sau khi toast đóng
        });
      } else {
        setErrors({ general: data.message });
        toast.error(data.message, { autoClose: 3000 });
      }
    } catch (error) {
      setErrors({ general: 'Đã có lỗi xảy ra, vui lòng thử lại' });
      toast.error('Đã có lỗi xảy ra, vui lòng thử lại', { autoClose: 3000 });
    } finally {
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
              {step === 1 && (
                <form onSubmit={handleSendEmail}>
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
              )}
              {step === 2 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-6">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                      Mã Xác Nhận
                    </label>
                    <input
                      type="text"
                      id="code"
                      placeholder="Nhập mã xác nhận"
                      className="w-full border rounded-lg px-4 py-2"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  </div>
                  <div className="mb-6">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Mật Khẩu Mới
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="Nhập mật khẩu mới"
                      className="w-full border rounded-lg px-4 py-2"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
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
                    {isLoading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
                  </motion.button>
                </form>
              )}
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

      {/* Thêm ToastContainer để hiển thị toast */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
};

export default ForgotPasswordPage;