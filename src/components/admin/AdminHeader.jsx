import { Bell, Search, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminHeader = () => {
  const { user, token, logout } = useUser();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(0);
  const [notificationList, setNotificationList] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const fetchNotificationsCount = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setNotifications(response.data.count);
      }
    } catch (err) {
      console.error('Error fetching notifications count:', err);
    }
  }, [token]);

  const fetchNotificationList = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/notifications/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setNotificationList(response.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notification list:', err);
    } finally {
      setLoadingNotifications(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotificationsCount();
    }
  }, [token, fetchNotificationsCount]);

  useEffect(() => {
    if (token && showNotifications) {
      fetchNotificationList();
    }
  }, [token, showNotifications, fetchNotificationList]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/notifications/${notificationId}/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => Math.max(0, prev - 1));
      setNotificationList((prev) =>
        prev.map((notif) =>
          notif.NotificationId === notificationId ? { ...notif, IsRead: 1 } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/admin/notifications/mark-all-read',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(0);
      setNotificationList((prev) =>
        prev.map((notif) => ({ ...notif, IsRead: 1 }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [token]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setLoadingSearch(true);
      try {
        const response = await axios.get('http://localhost:5000/api/admin/search', {
          params: { query: searchQuery },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setSearchResults(response.data.results);
          setShowResults(true);
        }
      } catch (err) {
        console.error('Error searching:', err);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setLoadingSearch(false);
      }
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, token]);

  const handleSearchClick = useCallback((type, id) => {
    setShowResults(false);
    setSearchQuery('');
    if (type === 'Product') {
      navigate(`/admin/products/${id}`);
    } else if (type === 'Order') {
      navigate(`/admin/orders/${id}`);
    } else if (type === 'User') {
      navigate(`/admin/users/${id}`);
    }
  }, [navigate]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const getInitial = useCallback(() => {
    if (user?.FullName) {
      return user.FullName.charAt(0).toUpperCase();
    }
    return 'A';
  }, [user]);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'Order':
        return { color: 'bg-blue-500', icon: '📦' };
      case 'Stock':
        return { color: 'bg-red-500', icon: '⚠️' };
      case 'User':
        return { color: 'bg-green-500', icon: '👤' };
      case 'Product':
        return { color: 'bg-purple-500', icon: '🛍️' };
      default:
        return { color: 'bg-gray-500', icon: '🔔' };
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Thanh tìm kiếm */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" size={18} />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="pl-9 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
          />
          {showResults && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
              {loadingSearch ? (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">Đang tìm kiếm...</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">Không tìm thấy kết quả</div>
              ) : (
                searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSearchClick(result.type, result.id)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {result.title} <span className="text-xs text-gray-500 dark:text-gray-400">({result.type})</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nút thông báo với dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover:bg-purple-500 dark:hover:bg-gray-600 rounded-full p-2 transition-colors"
            >
              <Bell size={18} className="text-gray-500 dark:text-gray-300" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-y-auto z-10">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Thông báo</h3>
                  {notifications > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <Check size={14} /> Đánh dấu tất cả là đã đọc
                    </button>
                  )}
                </div>
                {loadingNotifications ? (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">Đang tải...</div>
                ) : notificationList.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">Không có thông báo</div>
                ) : (
                  notificationList.map((notif) => {
                    const { color, icon } = getNotificationStyle(notif.Type);
                    return (
                      <div
                        key={notif.NotificationId}
                        onClick={() => !notif.IsRead && markAsRead(notif.NotificationId)}
                        className={`px-4 py-2 border-b border-gray-200 dark:border-gray-600 cursor-pointer flex items-start gap-3 ${
                          notif.IsRead ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
                        } hover:bg-gray-100 dark:hover:bg-gray-600`}
                      >
                        <span className={`text-white ${color} rounded-full w-6 h-6 flex items-center justify-center text-xs`}>
                          {icon}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notif.Title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{notif.Message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDistanceToNow(new Date(notif.CreatedAt), { addSuffix: true, locale: vi })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Nút chuyển đổi theme */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-purple-500 dark:hover:bg-gray-600 rounded-full p-2 transition-colors"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          {/* Thông tin user với dropdown */}
          <div className="relative">
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user?.AvatarUrl ? (
                <img
                  src={user.AvatarUrl}
                  alt="Avatar"
                  loading="lazy"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium hover:bg-blue-600 transition-colors">
                  {getInitial()}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {user?.FullName || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.Email || 'admin@example.com'}
                </p>
              </div>
            </div>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {user?.FullName || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.Email || 'admin@example.com'}
                  </p>
                </div>
                <div
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer flex items-center gap-2"
                >
                  <LogOut size={16} className="text-red-500 dark:text-red-400" />
                  <span className="text-sm text-red-500 dark:text-red-400">Đăng xuất</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;