import { useState } from "react";
import { Helmet } from "react-helmet";
import { useTheme } from "../../context/ThemeContext"; // Import ThemeContext
import { Switch } from "@headlessui/react";

const Settings = () => {
  const { darkMode, setDarkMode } = useTheme(); // Sử dụng useTheme để lấy và thay đổi trạng thái Dark Mode

  // State cho chức năng đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false); // Trạng thái để hiển thị form đổi mật khẩu

  // Chức năng đổi mật khẩu
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    // Giả lập chức năng đổi mật khẩu
    console.log("Đổi mật khẩu thành công!");
    setError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false); // Đóng form sau khi đổi mật khẩu thành công
  };

  // Chức năng đăng xuất
  const handleLogout = () => {
    // Xử lý đăng xuất, có thể gọi API hoặc xóa token
    console.log("Đăng xuất thành công!");
    // Giả sử thực hiện xóa session hoặc redirect
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-md transition-all duration-300 ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <Helmet>
      <title>
        Setting
      </title>
    </Helmet>
      <h1 className="text-2xl font-bold mb-4">Cài đặt Admin</h1>

      {/* Chuyển đổi chế độ sáng/tối */}
      <div className="flex items-center justify-between mb-4">
        <span>Chế độ tối</span>
        <Switch
          checked={darkMode}
          onChange={setDarkMode}
          className={`${
            darkMode ? "bg-blue-600" : "bg-gray-300"
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              darkMode ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>

      {/* Thông tin tài khoản */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Thông tin tài khoản</h2>
        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
          <p className="mb-2"><strong>Tên người dùng:</strong> John Doe</p>
          <p className="mb-2"><strong>Email:</strong> johndoe@example.com</p>
          {/* Bạn có thể thay đổi thông tin này bằng dữ liệu thực tế */}
        </div>
      </div>

      {/* Nút đổi mật khẩu */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-2">Đổi mật khẩu</h2>
        <Switch
          checked={showPasswordForm}
          onChange={() => setShowPasswordForm(!showPasswordForm)}
          className={`${
            showPasswordForm ? "bg-blue-600" : "bg-gray-300"
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              showPasswordForm ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>

      {/* Form đổi mật khẩu */}
      {showPasswordForm && (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-2"></h2>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <label className="block mb-2" htmlFor="current-password">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Nhập mật khẩu hiện tại"
            />

            <label className="block mb-2" htmlFor="new-password">Mật khẩu mới</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Nhập mật khẩu mới"
            />

            <label className="block mb-2" htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Nhập lại mật khẩu mới"
            />

            <button
              onClick={handleChangePassword}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      )}

      {/* Đăng xuất */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-36 py-1 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Settings;
