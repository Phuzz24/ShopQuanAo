import { createContext, useState, useContext, useEffect } from "react";

// Tạo Context cho Dark Mode
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"; // Kiểm tra trạng thái chế độ tối đã được lưu
  });

  // Cập nhật trạng thái vào localStorage khi darkMode thay đổi
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className={darkMode ? "dark" : ""}>{children}</div> {/* Áp dụng lớp 'dark' khi bật chế độ tối */}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); // Custom hook để sử dụng trong các component
