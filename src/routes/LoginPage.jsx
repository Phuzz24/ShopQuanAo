import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    else if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        login(data.user, data.token);
        await Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          showConfirmButton: false,
          timer: 1500,
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
      console.error('Login error:', error);
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

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/auth/facebook';
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    console.log('Token from URL in LoginPage:', token);

    if (token) {
      setIsLoading(true);
      fetch('http://localhost:5000/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('User data fetched:', data.user);
            const user = {
              UserId: data.user.UserId,
              Username: data.user.Username,
              Role: data.user.Role,
            };
            login(user, token);
            localStorage.setItem('token', token);
            Swal.fire({
              icon: 'success',
              title: `Đăng nhập ${data.user.Username.includes('fb_') ? 'Facebook' : 'Google'} thành công!`,
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              navigate('/home');
            });
          } else {
            console.error('Failed to fetch user:', data.message);
            setErrors({ general: data.message || 'Không thể lấy thông tin người dùng' });
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: data.message || 'Không thể lấy thông tin người dùng',
            });
          }
        })
        .catch(err => {
          console.error('Error fetching user:', err);
          setErrors({ general: 'Lỗi khi đăng nhập với mạng xã hội' });
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Lỗi khi đăng nhập với mạng xã hội',
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [login, navigate]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      <Helmet>
        <title>Đăng nhập</title>
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
            <h1 className="text-4xl font-bold mb-4 tracking-wide">Khám phá thế giới công nghệ</h1>
            <p className="text-xl mb-6">Điện thoại chính hãng – Giá tốt – Giao hàng nhanh</p>
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
          <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">Đăng Nhập</h2>
          {errors.general && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center mb-4">
              {errors.general}
            </motion.p>
          )}

          <form onSubmit={handleLogin}>
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
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-indigo-600 hover:underline font-semibold">
                Đăng ký
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
    <Link to="/forgot-password" className="text-indigo-600 hover:underline font-semibold">
      Quên mật khẩu?
    </Link>
  </p>
          </div>

          <div className="mt-8">
            <p className="text-center text-sm text-gray-600 mb-4">Hoặc đăng nhập bằng</p>
            <div className="flex justify-center gap-4">
              <motion.button
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.1 }}
                className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-all duration-300"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Gile_use.png/120px-Gile_use.png" alt="Google" className="w-6 h-6" />
              </motion.button>
              <motion.button
                onClick={handleFacebookLogin}
                whileHover={{ scale: 1.1 }}
                className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-all duration-300"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="w-6 h-6" />
              </motion.button>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-all duration-300"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" className="w-6 h-6" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;