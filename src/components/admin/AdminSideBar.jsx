import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Smartphone, 
  Layers, 
  ShoppingCart, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Tag, // Icon cho Brands
  Percent // Icon cho Discount Codes
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useUser } from '../../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const SidebarLink = ({ to, icon: Icon, label, isCollapsed, isActive, badge }) => {
  return (
    <div className="relative group">
      <Link 
        to={to} 
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
          isActive 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <Icon size={20} />
        {!isCollapsed && (
          <>
            <span>{label}</span>
            {badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {badge}
              </span>
            )}
          </>
        )}
      </Link>
      {isCollapsed && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
          {label}
          {badge > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [pendingOrders, setPendingOrders] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      if (!user || user.Role !== 'Admin') return;
      try {
        const response = await axios.get('http://localhost:5000/api/admin/orders/pending-count', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.data.success) {
          setPendingOrders(response.data.count);
        }
      } catch (err) {
        console.error('Error fetching pending orders:', err);
      }
    };

    fetchPendingOrders();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!", { position: toast.POSITION.TOP_RIGHT });
    navigate('/login');
  };

  const sidebarLinks = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Thống kê" },
    { to: "/admin/products", icon: Smartphone, label: "Sản phẩm" },
    { to: "/admin/categories", icon: Layers, label: "Loại SP" },
    { to: "/admin/brands", icon: Tag, label: "Thương hiệu" }, // Thêm icon Tag cho Brands
    { to: "/admin/discount-codes", icon: Percent, label: "Mã giảm giá" }, // Thêm icon Percent cho Discount Codes
    { to: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng", badge: pendingOrders },
    { to: "/admin/users", icon: Users, label: "Người dùng" },
    { to: "/admin/settings", icon: Settings, label: "Cài đặt" },
  ];

  return (
    <aside className={cn(
      "bg-sidebar flex flex-col h-screen transition-all duration-300 border-r border-sidebar-border",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <h2 className="text-sidebar-foreground font-bold text-xl">Dashboard</h2>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      
      <nav className="flex-1 py-4 px-2 space-y-1">
        {sidebarLinks.map((link) => (
          <SidebarLink 
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            isCollapsed={isCollapsed}
            isActive={location.pathname === link.to}
            badge={link.badge || 0}
          />
        ))}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Đăng xuất</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;