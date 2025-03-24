import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Đặt port thành 3000
    open: true, // Tùy chọn: tự động mở trình duyệt khi chạy
  },
});