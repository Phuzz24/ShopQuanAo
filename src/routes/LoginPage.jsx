import React, { useState } from "react";
import { useUser } from '../context/UserContext';  // Import useUser để sử dụng context
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaUser, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';  // Import useNavigate để chuyển hướng sau khi đăng nhập thành công

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useUser();  // Lấy hàm login từ UserContext
  const navigate = useNavigate();

  // Xử lý khi người dùng thay đổi ô "Ghi nhớ tôi"
  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  // Xử lý đăng nhập
  const handleLogin = (e) => {
    e.preventDefault();

    // Giả lập đăng nhập (thay thế phần này bằng API backend nếu cần)
    if (username === "user" && password === "password") {
      login({ username, name: "Người dùng" });  // Lưu thông tin người dùng vào context
      navigate('/home');  // Chuyển hướng người dùng đến trang chủ
    } else {
      alert("Tên đăng nhập hoặc mật khẩu không đúng");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Đăng nhập</title>
      </Helmet>

      {/* Slogan và logo */}
      <div className="w-1/2 flex justify-center items-center bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('https://cdnb.artstation.com/p/assets/images/images/041/601/775/original/ida-franzen-karlsson-background-animation.gif?1632167232')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="text-center text-white px-8">
            <h1 className="text-4xl font-bold mb-4">Khám phá thế giới công nghệ di động mới nhất</h1>
            <p className="text-xl mb-6">Mua điện thoại chính hãng, giá tốt – Giao hàng tận nơi</p>
          </div>
        </div>
      </div>

      {/* Form đăng nhập */}
      <div className="w-full sm:w-1/2 flex justify-center items-center bg-white p-12 shadow-2xl rounded-xl mx-8">
        <motion.div
          className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg border border-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Đăng Nhập</h2>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên Đăng Nhập
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 mt-2 focus-within:border-blue-500 transition duration-300">
                <FaUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  id="username"
                  placeholder="Tên đăng nhập"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 mt-2 focus-within:border-blue-500 transition duration-300">
                <FaLock className="text-gray-500 mr-3" />
                <input
                  type="password"
                  id="password"
                  placeholder="Mật khẩu"
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Phần Ghi nhớ tôi */}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700">Ghi nhớ tôi</label>
            </div>

            <div className="flex justify-between items-center mb-4">
              <Link to="/register" className="text-sm text-blue-500 hover:underline">Chưa có tài khoản? Đăng ký</Link>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500 transition duration-300 transform hover:scale-105"
              >
                Đăng Nhập
              </button>
            </div>
          </form>

          {/* Thêm phần quên mật khẩu */}
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Các logo đăng nhập bên thứ 3 */}
          <div className="flex justify-center items-center gap-4 mt-6 space-x-4">
            {/* Google Login Logo */}
            <a href="#" className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-200 transition-all duration-300">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Gile_use.png/120px-Gile_use.png" alt="Google logo" className="w-8 h-8" />
            </a>

            {/* Facebook Login Logo */}
            <a href="#" className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-200 transition-all duration-300">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook logo" className="w-8 h-8" />
            </a>

            {/* GitHub Login Logo */}
            <a href="#" className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-200 transition-all duration-300">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub logo" className="w-8 h-8" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
