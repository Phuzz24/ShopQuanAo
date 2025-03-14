import React, { createContext, useContext, useState } from 'react';

// Tạo Context người dùng
const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Lưu thông tin người dùng

  // Hàm đăng nhập
  const login = (userData) => {
    setUser(userData); // Cập nhật thông tin người dùng vào state
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null); // Xóa thông tin người dùng
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
