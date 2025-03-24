import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token && !user) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        // Chuẩn hóa dữ liệu: sử dụng định dạng PascalCase
        setUser({
          UserId: decoded.UserId, // Đổi userId thành UserId
          Username: decoded.Username, // Đổi username thành Username
          Role: decoded.Role, // Đổi role thành Role
        });
      } catch (err) {
        console.error('Error decoding token:', err);
        logout();
      }
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (userData, authToken) => {
    if (!userData?.UserId) {
      console.warn('User data thiếu UserId. Kiểm tra dữ liệu đăng nhập từ server.');
    }
    console.log('Logging in with user:', userData);
    // Chuẩn hóa dữ liệu: sử dụng định dạng PascalCase
    setUser({
      UserId: userData.UserId,
      Username: userData.Username,
      Role: userData.Role,
      FullName: userData.FullName,
      Email: userData.Email,
      Phone: userData.Phone,
      Address: userData.Address,
      AvatarUrl: userData.AvatarUrl,
    });
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};