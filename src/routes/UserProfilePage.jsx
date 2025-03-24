import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCamera, FaLock, FaCrown } from 'react-icons/fa';

const UserProfilePage = () => {
  const { user, token, updateUser } = useUser();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    UserId: user?.UserId || '',
    FullName: user?.FullName || '',
    Email: user?.Email || '',
    Phone: user?.Phone || '',
    Address: user?.Address || '',
    AvatarUrl: user?.AvatarUrl || 'https://anhchibi.com/wp-content/uploads/2024/12/anh-cam-dao-ngau-meme.jpg',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(userData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userData.AvatarUrl);
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        UserId: user.UserId,
        FullName: user.FullName || '',
        Email: user.Email || '',
        Phone: user.Phone || '',
        Address: user.Address || '',
        AvatarUrl: user.AvatarUrl || 'https://anhchibi.com/wp-content/uploads/2024/12/anh-cam-dao-ngau-meme.jpg',
      });
      setUpdatedUserData({ ...userData });
      setAvatarPreview(user.AvatarUrl || 'https://anhchibi.com/wp-content/uploads/2024/12/anh-cam-dao-ngau-meme.jpg');
    } else if (!token) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng đăng nhập để tiếp tục!' });
      navigate('/login');
    }
  }, [user, token, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (updatedUserData.FullName && updatedUserData.FullName.length < 2) {
      newErrors.FullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    if (updatedUserData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedUserData.Email)) {
      newErrors.Email = 'Email không đúng định dạng';
    }
    if (updatedUserData.Phone && !/^[0-9]{10,11}$/.test(updatedUserData.Phone)) {
      newErrors.Phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.oldPassword) newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    if (!passwordData.newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setUpdatedUserData(userData);
    setAvatarPreview(userData.AvatarUrl);
    setAvatarFile(null);
    setErrors({});
    setShowPasswordForm(false);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    if (!token) {
      setIsLoading(false);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không tìm thấy token. Vui lòng đăng nhập lại!' });
      navigate('/login');
      return;
    }

    try {
      let avatarUrl = updatedUserData.AvatarUrl;
      if (avatarFile) {
        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const uploadResponse = await fetch('http://localhost:5000/api/upload-avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload response error:', errorText);
          throw new Error('Upload ảnh thất bại: Server trả về phản hồi không hợp lệ');
        }

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          avatarUrl = uploadData.url;
        } else {
          throw new Error(uploadData.message || 'Upload ảnh thất bại');
        }
      }

      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...updatedUserData, AvatarUrl: avatarUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update response error:', errorText);
        throw new Error('Cập nhật thông tin thất bại: Server trả về phản hồi không hợp lệ');
      }

      const data = await response.json();
      if (data.success) {
        setUserData({ ...updatedUserData, AvatarUrl: avatarUrl });
        updateUser({ ...updatedUserData, AvatarUrl: avatarUrl });
        setIsEditing(false);
        setAvatarFile(null);
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Cập nhật thông tin thành công!', timer: 1500, showConfirmButton: false });
      } else {
        throw new Error(data.message || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Update error:', error.message);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error.message || 'Lỗi server khi cập nhật thông tin' });
    } finally {
      setIsLoading(false);
      setIsUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setIsLoading(true);

    if (!token) {
      setIsLoading(false);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không tìm thấy token. Vui lòng đăng nhập lại!' });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đổi mật khẩu thành công!', timer: 1500, showConfirmButton: false });
      } else {
        throw new Error(data.message || 'Không thể đổi mật khẩu');
      }
    } catch (error) {
      console.error('Change password error:', error);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error.message || 'Lỗi server khi đổi mật khẩu' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12">
      <motion.div
        className="container mx-auto p-6 md:p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-10 text-center tracking-wide drop-shadow-lg">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-pink-500">
            Hồ Sơ VIP
          </span>
        </h2>
        <motion.div
          className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-10 bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-gray-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Avatar Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center relative">
            <div className="relative">
              <motion.img
                src={avatarPreview}
                alt="Avatar"
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-yellow-400 shadow-xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 opacity-30 blur-xl"></div>
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-2 shadow-lg">
                <FaCrown className="text-lg" />
              </div>
            </div>
            {isEditing && (
              <label className="mt-6 flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-full cursor-pointer hover:from-yellow-500 hover:to-pink-600 transition duration-300 shadow-md">
                <FaCamera />
                <span>Thay Đổi Ảnh Đại Diện</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Form Section */}
          <div className="w-full md:w-2/3">
            <form className="space-y-6">
              {/* FullName */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và Tên <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="fullName"
                    value={updatedUserData.FullName}
                    onChange={(e) => setUpdatedUserData({ ...updatedUserData, FullName: e.target.value })}
                    className={`w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300 ${errors.FullName ? 'border-red-500' : ''}`}
                    placeholder="Nhập họ và tên (nếu muốn)"
                  />
                ) : (
                  <p className="text-gray-800 text-lg">{userData.FullName || 'Chưa cập nhật'}</p>
                )}
                {errors.FullName && <p className="text-red-500 text-sm mt-1">{errors.FullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    id="email"
                    value={updatedUserData.Email}
                    onChange={(e) => setUpdatedUserData({ ...updatedUserData, Email: e.target.value })}
                    className={`w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300 ${errors.Email ? 'border-red-500' : ''}`}
                    placeholder="Nhập email (nếu muốn)"
                  />
                ) : (
                  <p className="text-gray-800 text-lg">{userData.Email || 'Chưa cập nhật'}</p>
                )}
                {errors.Email && <p className="text-red-500 text-sm mt-1">{errors.Email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số Điện Thoại <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="phone"
                    value={updatedUserData.Phone}
                    onChange={(e) => setUpdatedUserData({ ...updatedUserData, Phone: e.target.value })}
                    className={`w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300 ${errors.Phone ? 'border-red-500' : ''}`}
                    placeholder="Nhập số điện thoại (nếu muốn)"
                  />
                ) : (
                  <p className="text-gray-800 text-lg">{userData.Phone || 'Chưa cập nhật'}</p>
                )}
                {errors.Phone && <p className="text-red-500 text-sm mt-1">{errors.Phone}</p>}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa Chỉ <span className="text-gray-400 text-xs">(Không bắt buộc)</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="address"
                    value={updatedUserData.Address}
                    onChange={(e) => setUpdatedUserData({ ...updatedUserData, Address: e.target.value })}
                    className={`w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300 ${errors.Address ? 'border-red-500' : ''}`}
                    placeholder="Nhập địa chỉ (nếu muốn)"
                  />
                ) : (
                  <p className="text-gray-800 text-lg">{userData.Address || 'Chưa cập nhật'}</p>
                )}
                {errors.Address && <p className="text-red-500 text-sm mt-1">{errors.Address}</p>}
              </div>

              {/* Change Password Section */}
              {isEditing && (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="flex items-center text-yellow-500 hover:text-yellow-600 transition duration-300"
                  >
                    <FaLock className="mr-2" /> {showPasswordForm ? 'Ẩn Đổi Mật Khẩu' : 'Đổi Mật Khẩu'}
                  </button>
                  {showPasswordForm && (
                    <div className="space-y-6 mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Mật Khẩu Cũ
                        </label>
                        <input
                          type="password"
                          id="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                          className={`w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300 ${errors.oldPassword ? 'border-red-500' : ''}`}
                        />
                        {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Mật Khẩu Mới
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className={`w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300 ${errors.newPassword ? 'border-red-500' : ''}`}
                        />
                        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Xác Nhận Mật Khẩu
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className={`w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>
                      <motion.button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl shadow-lg ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-green-600 hover:to-teal-600'}`}
                      >
                        {isLoading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                {isEditing ? (
                  <>
                    <motion.button
                      type="button"
                      onClick={handleSave}
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-8 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-xl flex items-center justify-center shadow-lg ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-yellow-500 hover:to-pink-600'}`}
                    >
                      {isLoading && <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>}
                      {isLoading ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition duration-300 shadow-lg"
                    >
                      Hủy
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleEdit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-xl hover:from-yellow-500 hover:to-pink-600 transition duration-300 shadow-lg"
                  >
                    Chỉnh Sửa
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;