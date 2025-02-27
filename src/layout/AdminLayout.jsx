import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Slidebar";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Nội dung chính, không bị đẩy xa khi mở sidebar */}
      <div className="flex-1 p-6 bg-white shadow-lg transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
