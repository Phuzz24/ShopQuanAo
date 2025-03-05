import { useEffect } from "react";

const TawkToWidget = () => {
  useEffect(() => {
    // Tạo và thêm script Tawk.to vào body của trang
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://embed.tawk.to/67c5c59728c1cc19085dc8e6/1ile8nmfm"; // Mã nhúng của bạn
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    
    // Thêm script vào cuối body của trang
    document.body.appendChild(script);

    // Dọn dẹp khi component bị unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Chạy một lần khi component được mount

  return null; // Component này không cần render gì cả
};

export default TawkToWidget;
