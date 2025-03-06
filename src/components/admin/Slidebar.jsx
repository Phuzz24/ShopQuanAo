import { Link } from "react-router-dom";
import { Menu, X, Home, ShoppingBag, Users, Settings, FileText, Layers } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`h-screen bg-gray-900 text-white shadow-lg transition-all duration-300 ${isOpen ? "w-64" : "w-16"} flex flex-col items-center overflow-hidden`}
    >
      {/* Nút Toggle Sidebar */}
      <button
        className="p-3 mt-2 rounded-md text-white hover:bg-gray-700 transition-all"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menu Items */}
      <nav className="flex-1 w-full">
        <ul className="mt-4">
          <li className="flex items-center px-4 py-3 hover:bg-gray-700 rounded-lg transition-all">
            <Home size={24} />
            <span className={`ml-4 transition-all ${isOpen ? "block" : "hidden"}`}>
              <Link to="/admin/dashboard">Dashboard</Link>
            </span>
          </li>

          <li className="flex items-center px-4 py-3 hover:bg-gray-700 rounded-lg transition-all">
            <ShoppingBag size={24} />
            <span className={`ml-4 transition-all ${isOpen ? "block" : "hidden"}`}>
              <Link to="/admin/products">Products</Link>
            </span>
          </li>

          <li className="flex items-center px-4 py-3 hover:bg-gray-700 rounded-lg transition-all">
            <FileText size={24} />
            <span className={`ml-4 transition-all ${isOpen ? "block" : "hidden"}`}>
              <Link to="/admin/orders">Orders</Link>
            </span>
          </li>

          <li className="flex items-center px-4 py-3 hover:bg-gray-700 rounded-lg transition-all">
            <Users size={24} />
            <span className={`ml-4 transition-all ${isOpen ? "block" : "hidden"}`}>
              <Link to="/admin/customers">Customers</Link>
            </span>
          </li>

          

          <li className="flex items-center px-4 py-3 hover:bg-gray-700 rounded-lg transition-all">
            <Layers size={24} />
            <span className={`ml-4 transition-all ${isOpen ? "block" : "hidden"}`}>
              <Link to="/admin/categories">Categories</Link>
            </span>
          </li>

          <li className="flex items-center px-4 py-3 hover:bg-gray-700 rounded-lg transition-all">
            <Users size={24} />
            <span className={`ml-4 transition-all ${isOpen ? "block" : "hidden"}`}>
              <Link to="/admin/users">Users</Link>
            </span>
          </li>
          <li className="flex items-center px-4 py-3 hover:bg-gray-700 rounded-lg transition-all">
            <Settings size={24} />
            <span className={`ml-4 transition-all ${isOpen ? "block" : "hidden"}`}>
              <Link to="/admin/settings">Settings</Link>
            </span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
