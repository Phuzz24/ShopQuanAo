
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const Users = () => {
  const [users] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@example.com", role: "Admin", status: "Hoạt động", lastLogin: "10/06/2023 08:30" },
    { id: 2, name: "Trần Thị B", email: "tranthib@example.com", role: "Quản lý", status: "Hoạt động", lastLogin: "09/06/2023 14:45" },
    { id: 3, name: "Lê Văn C", email: "levanc@example.com", role: "Nhân viên", status: "Hoạt động", lastLogin: "08/06/2023 09:15" },
    { id: 4, name: "Phạm Thị D", email: "phamthid@example.com", role: "Nhân viên", status: "Không hoạt động", lastLogin: "01/06/2023 10:20" },
    { id: 5, name: "Hoàng Văn E", email: "hoangvane@example.com", role: "Nhân viên", status: "Hoạt động", lastLogin: "07/06/2023 16:30" },
    { id: 6, name: "Ngô Thị F", email: "ngothif@example.com", role: "Quản lý", status: "Hoạt động", lastLogin: "06/06/2023 11:45" },
    { id: 7, name: "Đặng Văn G", email: "dangvang@example.com", role: "Nhân viên", status: "Tạm khóa", lastLogin: "20/05/2023 13:10" },
    { id: 8, name: "Vũ Thị H", email: "vuthih@example.com", role: "Nhân viên", status: "Hoạt động", lastLogin: "05/06/2023 09:50" },
    { id: 9, name: "Bùi Văn I", email: "buivani@example.com", role: "Nhân viên", status: "Không hoạt động", lastLogin: "15/05/2023 14:25" },
    { id: 10, name: "Lý Thị K", email: "lythik@example.com", role: "Nhân viên", status: "Hoạt động", lastLogin: "04/06/2023 10:15" },
  ]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Hoạt động":
        return "bg-green-100 text-green-800";
      case "Không hoạt động":
        return "bg-gray-100 text-gray-800";
      case "Tạm khóa":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-500 dark:text-gray-400">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <Button className="bg-admin hover:bg-admin-secondary">
          <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách người dùng</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Tìm kiếm người dùng..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-3">ID</th>
                  <th className="text-left font-medium p-3">Tên</th>
                  <th className="text-left font-medium p-3">Email</th>
                  <th className="text-left font-medium p-3">Vai trò</th>
                  <th className="text-left font-medium p-3">Trạng thái</th>
                  <th className="text-left font-medium p-3">Đăng nhập gần đây</th>
                  <th className="text-right font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">{user.lastLogin}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Hiển thị 1-10 của 10 người dùng
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-admin-muted">
                1
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;