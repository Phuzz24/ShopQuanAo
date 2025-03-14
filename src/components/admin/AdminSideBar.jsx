import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Smartphone, 
  Layers, 
  ShoppingCart, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const SidebarLink = ({ to, icon: Icon, label, isCollapsed, isActive }) => {
  return (
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
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarLinks = [
    { to: "/admin/statistic", icon: LayoutDashboard, label: "Thống kê" },
    { to: "/admin/products", icon: Smartphone, label: "Sản phẩm" },
    { to: "/admin/categories", icon: Layers, label: "Loại SP" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
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
          />
        ))}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
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
