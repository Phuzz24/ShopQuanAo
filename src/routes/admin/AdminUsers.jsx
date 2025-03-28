// React hooks
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
// UI Components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";

// Icons
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from "lucide-react";

// Third-party libraries
import axios from "axios";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import React from "react";

// Hàm tiện ích để lấy class cho trạng thái
const getStatusClass = (status) => {
  switch (status) {
    case "Hoạt động":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Không hoạt động":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    case "Tạm khóa":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

// Component con để tối ưu render bảng
const UserRow = React.memo(({ user, handleEditUser, setUserToDelete, setIsDeleteModalOpen }) => {
  return (
    <tr className="border-b transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
      <td className="p-4 text-gray-700 dark:text-gray-300">{user.Id}</td>
      <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">{user.Name}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{user.Email}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{user.Role}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(user.Status)}`}>
          {user.Status}
        </span>
      </td>
      <td className="p-4 text-gray-700 dark:text-gray-300">
        {user.LastLogin 
          ? format(
              new Date(new Date(user.LastLogin).getTime() + 7 * 60 * 60 * 1000), // Bù 7 giờ (UTC+7)
              'dd/MM/yyyy, HH:mm:ss'
            ) 
          : "Chưa đăng nhập"}
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => handleEditUser(user)}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => {
              setUserToDelete(user); // Đặt người dùng cần xóa
              setIsDeleteModalOpen(true); // Mở modal
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

const Users = () => {
  // State quản lý danh sách người dùng và phân trang
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("idAsc");

  // State quản lý modal và dữ liệu người dùng
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    status: "",
  });
  const [editUser, setEditUser] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    status: "",
  });

  // State quản lý trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Debounce cho tìm kiếm
  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearch(value);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    debouncedSetSearch(e.target.value);
    setPage(1);
  };
  

  // Hàm lấy danh sách người dùng
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    if (user.Role !== "Admin") {
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        params: { search: debouncedSearch, sort, page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setTotal(response.data.total);
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách người dùng");
      }
    } catch (err) {
      console.error("Error fetching users - Detailed:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        params: { search: debouncedSearch, sort, page, limit },
      });
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error("Lỗi khi lấy danh sách người dùng: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi fetchUsers khi search, sort, hoặc page thay đổi
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, sort, page]);

  // Hàm thêm người dùng mới
  const handleAddUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    if (!newUser.fullName || !newUser.email || !newUser.password || !newUser.role || !newUser.status) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/users",
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Thêm người dùng thành công");
        setIsAddModalOpen(false);
        setNewUser({ fullName: "", email: "", password: "", phone: "", role: "", status: "" });
        fetchUsers();
      } else {
        throw new Error(response.data.message || "Không thể thêm người dùng");
      }
    } catch (err) {
      console.error("Error adding user:", err.response?.data || err.message);
      toast.error("Lỗi khi thêm người dùng: " + (err.response?.data?.message || err.message));
    }
  };

  // Hàm chỉnh sửa người dùng
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      fullName: user.Name,
      email: user.Email,
      password: "",
      phone: user.Phone || "",
      role: user.Role,
      status: user.Status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    if (!editUser.fullName && !editUser.email && !editUser.password && !editUser.role && !editUser.status && !editUser.phone) {
      toast.error("Cần cung cấp ít nhất một trường để cập nhật");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${selectedUser.Id}`,
        editUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Cập nhật người dùng thành công");
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        throw new Error(response.data.message || "Không thể cập nhật người dùng");
      }
    } catch (err) {
      console.error("Error updating user:", err.response?.data || err.message);
      toast.error("Lỗi khi cập nhật người dùng: " + (err.response?.data?.message || err.message));
    }
  };

  // Hàm xóa người dùng
  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Xóa người dùng thành công");
        fetchUsers();
      } else {
        throw new Error(response.data.message || "Không thể xóa người dùng");
      }
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
      toast.error("Lỗi khi xóa người dùng: " + (err.response?.data?.message || err.message));
    }
  };

  // Tính toán số trang
  const totalPages = Math.ceil(total / limit);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Tiêu đề và nút thêm người dùng */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý người dùng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" /> Thêm người dùng
        </Button>
      </div>

      {/* Bảng danh sách người dùng */}
      <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm người dùng..."
                className="pl-10 py-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idAsc">ID tăng dần</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="nameAsc">Tên A-Z</SelectItem>
                  <SelectItem value="nameDesc">Tên Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">ID</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Tên</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Vai trò</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Trạng thái</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Đăng nhập gần đây</th>
                  <th className="text-right font-semibold p-4 text-gray-700 dark:text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <UserRow
                    key={user.Id}
                    user={user}
                    handleEditUser={handleEditUser}
                    setUserToDelete={setUserToDelete} // Truyền hàm setUserToDelete
                    setIsDeleteModalOpen={setIsDeleteModalOpen} // Truyền hàm setIsDeleteModalOpen
                  />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} của {total} người dùng
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="icon"
                  className={`h-9 w-9 rounded-full border-gray-300 dark:border-gray-600 ${
                    p === page
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Thêm người dùng */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Thêm người dùng mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Họ và tên</Label>
              <Input
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                placeholder="Nhập họ và tên"
                className="mt-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Email</Label>
              <Input
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Nhập email"
                type="email"
                className="mt-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Mật khẩu</Label>
              <Input
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Nhập mật khẩu"
                type="password"
                className="mt-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Số điện thoại</Label>
              <Input
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="Nhập số điện thoại (tùy chọn)"
                className="mt-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Vai trò</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger className="mt-2 w-full rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Khách hàng">Khách hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Trạng thái</Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({ ...newUser, status: value })}
              >
                <SelectTrigger className="mt-2 w-full rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                  <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
                  <SelectItem value="Tạm khóa">Tạm khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsAddModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Chỉnh sửa người dùng */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chỉnh sửa người dùng #{selectedUser?.Id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Họ và tên</Label>
              <Input
                value={editUser.fullName}
                onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                placeholder="Nhập họ và tên"
                className="mt-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Email</Label>
              <Input
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                placeholder="Nhập email"
                type="email"
                className="mt-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Mật khẩu mới (để trống nếu không đổi)</Label>
              <Input
                value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                placeholder="Nhập mật khẩu mới"
                type="password"
                className="mt-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Số điện thoại</Label>
              <Input
                value={editUser.phone}
                onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                placeholder="Nhập số điện thoại (tùy chọn)"
                className="mt-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Vai trò</Label>
              <Select
                value={editUser.role}
                onValueChange={(value) => setEditUser({ ...editUser, role: value })}
              >
                <SelectTrigger className="mt-2 w-full rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Khách hàng">Khách hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block font-semibold text-gray-900 dark:text-gray-100">Trạng thái</Label>
              <Select
                value={editUser.status}
                onValueChange={(value) => setEditUser({ ...editUser, status: value })}
              >
                <SelectTrigger className="mt-2 w-full rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                  <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
                  <SelectItem value="Tạm khóa">Tạm khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsEditModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateUser}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
  <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Xác nhận xóa người dùng
      </DialogTitle>
    </DialogHeader>
    <p className="text-gray-700 dark:text-gray-300">
      Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.Name}</strong> không? Hành động này không thể hoàn tác.
    </p>
    <DialogFooter>
      <Button
        variant="outline"
        className="rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsDeleteModalOpen(false)}
      >
        Hủy
      </Button>
      <Button
        variant="destructive"
        className="rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-lg transform hover:scale-105 transition-all duration-300"
        onClick={() => {
          handleDeleteUser(userToDelete.Id); // Gọi hàm xóa
          setIsDeleteModalOpen(false); // Đóng modal
        }}
      >
        Xóa
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default Users;