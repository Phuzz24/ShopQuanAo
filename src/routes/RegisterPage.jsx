import React, { useState } from "react";
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Swal from 'sweetalert2'; // Import SweetAlert2

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const validateForm = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Tên đăng nhập không được để trống';
    else if (username.length < 3) newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    if (!fullName) newErrors.fullName = 'Họ tên không được để trống';
    if (!email) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    else if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!confirmPassword) newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, fullName, email, password }),
      });
      const data = await response.json();
      console.log('Register response:', data); // Debug
      if (data.success) {
        login(data.user);
        await Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          showConfirmButton: false,
          timer: 1500, // Tự đóng sau 1.5 giây
        });
        navigate('/home');
      } else {
        setErrors({ general: data.message });
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: data.message,
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ general: 'Đã có lỗi xảy ra, vui lòng thử lại' });
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Đã có lỗi xảy ra, vui lòng thử lại',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      <Helmet>
        <title>Đăng ký</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 justify-center items-center bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('https://cdnb.artstation.com/p/assets/images/images/041/601/775/original/ida-franzen-karlsson-background-animation.gif?1632167232')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="text-center text-white px-8">
            <h1 className="text-4xl font-bold mb-4 tracking-wide">Tham gia ngay hôm nay</h1>
            <p className="text-xl mb-6">Tận hưởng trải nghiệm mua sắm tuyệt vời</p>
          </div>
        </div>
      </motion.div>

      <div className="w-full lg:w-1/2 flex justify-center items-center p-6">
        <motion.div
          className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">Đăng Ký</h2>
          {errors.general && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center mb-4">
              {errors.general}
            </motion.p>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Tên Đăng Nhập
              </label>
              <motion.div
                whileFocus={{ borderColor: '#4f46e5' }}
                className={`flex items-center border rounded-lg px-4 py-2 transition duration-300 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              >
                <FaUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  id="username"
                  placeholder="Tên đăng nhập"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </motion.div>
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Họ Tên
              </label>
              <motion.div
                whileFocus={{ borderColor: '#4f46e5' }}
                className={`flex items-center border rounded-lg px-4 py-2 transition duration-300 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              >
                <FaUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  id="fullName"
                  placeholder="Họ tên"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </motion.div>
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <motion.div
                whileFocus={{ borderColor: '#4f46e5' }}
                className={`flex items-center border rounded-lg px-4 py-2 transition duration-300 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              >
                <FaEnvelope className="text-gray-500 mr-3" />
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <motion.div
                whileFocus={{ borderColor: '#4f46e5' }}
                className={`flex items-center border rounded-lg px-4 py-2 transition duration-300 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              >
                <FaLock className="text-gray-500 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Mật khẩu"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={toggleShowPassword} className="ml-2 focus:outline-none">
                  {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                </button>
              </motion.div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Xác Nhận Mật Khẩu
              </label>
              <motion.div
                whileFocus={{ borderColor: '#4f46e5' }}
                className={`flex items-center border rounded-lg px-4 py-2 transition duration-300 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              >
                <FaLock className="text-gray-500 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" onClick={toggleShowPassword} className="ml-2 focus:outline-none">
                  {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                </button>
              </motion.div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
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
              {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
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

export default RegisterPage;