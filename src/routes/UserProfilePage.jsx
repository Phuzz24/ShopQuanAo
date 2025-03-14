import React, { useState } from 'react';
import { motion } from 'framer-motion';

const UserProfilePage = () => {
  const [userData, setUserData] = useState({
    fullName: 'Nguyễn Văn A',
    email: 'nguyen.a@example.com',
    phone: '0123456789',
    address: 'Số 123, Đường ABC, TP.HCM',
    avatar: 'https://anhchibi.com/wp-content/uploads/2024/12/anh-cam-dao-ngau-meme.jpg', // Đường dẫn ảnh đại diện mặc định
  });

  const [isEditing, setIsEditing] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(userData);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdatedUserData(userData); // Đưa dữ liệu trở về trước khi chỉnh sửa
  };

  const handleSave = () => {
    setUserData(updatedUserData);
    setIsEditing(false);
  };

  return (
    <motion.div
      className="container mx-auto p-8"
      initial={{ opacity: 0, y: 50 }} // Bắt đầu từ độ mờ và dịch chuyển từ dưới lên
      animate={{ opacity: 1, y: 0 }} // Hoàn thiện vị trí và độ mờ
      transition={{ duration: 0.6 }} // Hiệu ứng kéo dài trong 0.6 giây
    >
      <h2 className="text-4xl font-semibold text-gray-800 mb-6">Thông Tin Cá Nhân</h2>

      <motion.div
        className="flex space-x-8 bg-white p-8 rounded-xl shadow-lg"
        initial={{ opacity: 0, scale: 0.8 }} // Bắt đầu từ độ mờ và thu nhỏ
        animate={{ opacity: 1, scale: 1 }} // Quay lại độ mờ bình thường và kích thước bình thường
        transition={{ duration: 0.6 }} // Hiệu ứng kéo dài trong 0.6 giây
      >
        {/* Phần ảnh đại diện */}
        <div className="w-1/4 flex justify-center items-center">
          <motion.img
            src={userData.avatar}
            alt="Avatar"
            className="w-32 h-32 object-cover rounded-full border-4 border-gray-300"
            initial={{ scale: 0.6 }} // Bắt đầu từ kích thước nhỏ
            animate={{ scale: 1 }} // Hiển thị ảnh ở kích thước bình thường
            transition={{ duration: 0.6 }} // Hiệu ứng chuyển động
          />
        </div>

        {/* Phần thông tin cá nhân */}
        <div className="w-3/4">
          <form className="space-y-6">
            {/* Họ và Tên */}
            <div className="border-b-2 border-gray-300 pb-4">
              <label htmlFor="fullName" className="block text-lg font-semibold text-gray-700">Họ và Tên</label>
              {isEditing ? (
                <input
                  type="text"
                  id="fullName"
                  value={updatedUserData.fullName}
                  onChange={(e) => setUpdatedUserData({ ...updatedUserData, fullName: e.target.value })}
                  className="w-full p-4 border-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <p className="text-gray-700">{userData.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="border-b-2 border-gray-300 pb-4">
              <label htmlFor="email" className="block text-lg font-semibold text-gray-700">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  value={updatedUserData.email}
                  onChange={(e) => setUpdatedUserData({ ...updatedUserData, email: e.target.value })}
                  className="w-full p-4 border-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email"
                />
              ) : (
                <p className="text-gray-700">{userData.email}</p>
              )}
            </div>

            {/* Số Điện Thoại */}
            <div className="border-b-2 border-gray-300 pb-4">
              <label htmlFor="phone" className="block text-lg font-semibold text-gray-700">Số Điện Thoại</label>
              {isEditing ? (
                <input
                  type="tel"
                  id="phone"
                  value={updatedUserData.phone}
                  onChange={(e) => setUpdatedUserData({ ...updatedUserData, phone: e.target.value })}
                  className="w-full p-4 border-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="text-gray-700">{userData.phone}</p>
              )}
            </div>

            {/* Địa Chỉ */}
            <div className="border-b-2 border-gray-300 pb-4">
              <label htmlFor="address" className="block text-lg font-semibold text-gray-700">Địa Chỉ</label>
              {isEditing ? (
                <input
                  type="text"
                  id="address"
                  value={updatedUserData.address}
                  onChange={(e) => setUpdatedUserData({ ...updatedUserData, address: e.target.value })}
                  className="w-full p-4 border-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ"
                />
              ) : (
                <p className="text-gray-700">{userData.address}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Lưu Thay Đổi
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-300"
                >
                  Chỉnh Sửa
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfilePage;
