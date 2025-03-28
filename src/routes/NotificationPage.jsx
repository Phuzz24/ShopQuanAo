import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { FaBell } from 'react-icons/fa';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'; // New icons for marking as read

const NotificationsPage = () => {
  const { token } = useUser();
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from the API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        console.log('No token found, skipping fetchNotifications');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Không thể tải thông báo: ${errorText}`);
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Không thể tải thông báo');
        }
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error.message, error.stack);
        toast.error(error.message, { autoClose: 2000 });
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [token]);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    if (!token) {
      console.log('No token found, skipping markNotificationAsRead');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể đánh dấu thông báo ${notificationId} là đã đọc: ${errorText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || `Không thể đánh dấu thông báo ${notificationId} là đã đọc`);
      }
      setNotifications(notifications.map(notification =>
        notification.notificationId === notificationId
          ? { ...notification, isRead: true }
          : notification
      ));
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error.message, error.stack);
      toast.error(error.message, { autoClose: 2000 });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-black mb-6 flex items-center gap-2 text-center">
        Tất Cả Thông Báo
      </h1>
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.notificationId}
              onClick={() => !notification.isRead && markNotificationAsRead(notification.notificationId)}
              className={`p-6 rounded-lg shadow-lg cursor-pointer transform transition-all hover:scale-105 ${
                notification.isRead ? 'bg-gray-800' : 'bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xl font-semibold text-gray-200">{notification.title}</p>
                <p className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-yellow-300'}`}>
                  {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                </p>
              </div>
              <p className="text-gray-300">{notification.message}</p>
              <p className="text-sm text-gray-500 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
              <div className="absolute top-2 right-2">
                {!notification.isRead ? (
                  <FiCheckCircle className="text-yellow-500 cursor-pointer" size={20} />
                ) : (
                  <FiAlertCircle className="text-gray-500 cursor-pointer" size={20} />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">Không có thông báo nào.</p>
      )}
    </div>
  );
};

export default NotificationsPage;
