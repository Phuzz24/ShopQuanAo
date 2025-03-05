import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Slidebar";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext

const AdminLayout = () => {
  const { darkMode } = useTheme(); // Lấy trạng thái darkMode từ Context
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`flex h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Nội dung chính */}
      <div
        className={`flex-1 p-6 shadow-lg transition-all duration-300 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
