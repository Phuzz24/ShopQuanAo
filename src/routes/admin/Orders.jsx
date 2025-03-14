import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const getStatusClass = (status) => {
  switch (status) {
    case "Đã thanh toán":
      return "bg-blue-100 text-blue-800";
    case "Đang xử lý":
      return "bg-yellow-100 text-yellow-800";
    case "Đã hủy":
      return "bg-red-100 text-red-800";
    case "Đang giao hàng":
      return "bg-purple-100 text-purple-800";
    case "Hoàn thành":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Orders = () => {
  const [orders] = useState([
    { 
      id: 1001, 
      customer: "Nguyễn Văn A", 
      date: "05/06/2023", 
      amount: 29990000, 
      status: "Hoàn thành", 
      products: 1,
      address: "123 Đường Lê Lợi, Quận 1, TP.HCM"
    },
    { 
      id: 1002, 
      customer: "Trần Thị B", 
      date: "06/06/2023", 
      amount: 42980000, 
      status: "Đang giao hàng", 
      products: 2,
      address: "456 Đường Nguyễn Huệ, Quận 1, TP.HCM"
    },
    { 
      id: 1003, 
      customer: "Lê Văn C", 
      date: "07/06/2023", 
      amount: 17990000, 
      status: "Đã thanh toán", 
      products: 1,
      address: "789 Đường Trần Hưng Đạo, Quận 5, TP.HCM"
    },
    { 
      id: 1004, 
      customer: "Phạm Thị D", 
      date: "08/06/2023", 
      amount: 33980000, 
      status: "Đang xử lý", 
      products: 2,
      address: "101 Đường Nguyễn Du, Quận 1, TP.HCM"
    },
    { 
      id: 1005, 
      customer: "Hoàng Văn E", 
      date: "09/06/2023", 
      amount: 16990000, 
      status: "Đã hủy", 
      products: 1,
      address: "202 Đường Võ Văn Tần, Quận 3, TP.HCM"
    },
    { 
      id: 1006, 
      customer: "Ngô Thị F", 
      date: "10/06/2023", 
      amount: 29990000, 
      status: "Hoàn thành", 
      products: 1,
      address: "303 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM"
    },
    { 
      id: 1007, 
      customer: "Đặng Văn G", 
      date: "11/06/2023", 
      amount: 19990000, 
      status: "Đang giao hàng", 
      products: 1,
      address: "404 Đường Cách Mạng Tháng 8, Quận 3, TP.HCM"
    },
    { 
      id: 1008, 
      customer: "Vũ Thị H", 
      date: "12/06/2023", 
      amount: 45970000, 
      status: "Đã thanh toán", 
      products: 3,
      address: "505 Đường Hai Bà Trưng, Quận 1, TP.HCM"
    },
    { 
      id: 1009, 
      customer: "Bùi Văn I", 
      date: "13/06/2023", 
      amount: 12990000, 
      status: "Đang xử lý", 
      products: 1,
      address: "606 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM"
    },
    { 
      id: 1010, 
      customer: "Lý Thị K", 
      date: "14/06/2023", 
      amount: 35980000, 
      status: "Hoàn thành", 
      products: 2,
      address: "707 Đường Trần Quốc Thảo, Quận 3, TP.HCM"
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-gray-500 dark:text-gray-400">Quản lý và theo dõi đơn hàng từ khách hàng</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Tìm kiếm đơn hàng..." className="pl-9" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="shipping">Đang giao hàng</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="newest">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="highestAmount">Giá trị cao nhất</SelectItem>
                  <SelectItem value="lowestAmount">Giá trị thấp nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-3">ID</th>
                  <th className="text-left font-medium p-3">Khách hàng</th>
                  <th className="text-left font-medium p-3">Ngày đặt</th>
                  <th className="text-left font-medium p-3">Tổng tiền</th>
                  <th className="text-left font-medium p-3">Sản phẩm</th>
                  <th className="text-left font-medium p-3">Trạng thái</th>
                  <th className="text-right font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3">{order.id}</td>
                    <td className="p-3 font-medium">{order.customer}</td>
                    <td className="p-3">{order.date}</td>
                    <td className="p-3">{order.amount.toLocaleString('vi-VN')}₫</td>
                    <td className="p-3">{order.products}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Hiển thị 1-10 của 45 đơn hàng
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-admin-muted">
                1
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                2
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                3
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

export default Orders;
