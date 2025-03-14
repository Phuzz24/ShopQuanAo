
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
      <h1 className="text-7xl font-bold text-admin mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Trang không tìm thấy</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link to="/">
        <Button className="bg-admin hover:bg-admin-secondary">
          Quay lại trang chủ
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;