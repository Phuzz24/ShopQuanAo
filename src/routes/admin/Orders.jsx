import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Eye, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import React from "react";
import { Loader2 } from "lucide-react";

// Hàm lấy class màu sắc cho trạng thái
const getStatusClass = (status) => {
  switch (status) {
    case "Đã thanh toán":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Đang xử lý":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Đã hủy":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "Đang giao hàng":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Đã giao":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Chưa thanh toán":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    case "Chờ xác nhận":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

// Component con để tối ưu render bảng
const OrderRow = React.memo(({ order, handleViewDetails, setOrderToDelete, setIsDeleteModalOpen }) => {
  return (
    <tr className="border-b transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
      <td className="p-4 text-gray-700 dark:text-gray-300">{order.OrderId}</td>
      <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">{order.CustomerName}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{new Date(order.OrderDate).toLocaleDateString('vi-VN')}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{order.Total.toLocaleString('vi-VN')}₫</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{order.ProductCount}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.Status)}`}>
          {order.Status}
        </span>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.PaymentStatus)}`}>
          {order.PaymentStatus}
        </span>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => handleViewDetails(order)}
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => {
              setOrderToDelete(order); // Đặt đơn hàng cần xóa
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [orderToDelete, setOrderToDelete] = useState(null);
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

  const fetchOrders = async () => {
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
      const response = await axios.get("http://localhost:5000/api/admin/orders", {
        params: { search: debouncedSearch, status: statusFilter, paymentStatus: paymentStatusFilter, sort, page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setTotal(response.data.total);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error("Lỗi khi lấy danh sách đơn hàng: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, statusFilter, paymentStatusFilter, sort, page]);

  const handleViewDetails = async (order) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/admin/orders/${order.OrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setEditStatus(response.data.order.Status);
        setEditPaymentStatus(response.data.order.PaymentStatus);
        setIsDetailModalOpen(true);
      } else {
        throw new Error(response.data.message || "Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err.response?.data || err.message);
      toast.error("Lỗi khi lấy chi tiết đơn hàng: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/orders/${selectedOrder.OrderId}`,
        {
          status: editStatus,
          paymentStatus: editPaymentStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        setIsDetailModalOpen(false);
        fetchOrders();
      } else {
        throw new Error(response.data.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err.response?.data || err.message);
      toast.error("Lỗi khi cập nhật trạng thái: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Xóa đơn hàng thành công");
        fetchOrders();
      } else {
        throw new Error(response.data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Error deleting order:", err.response?.data || err.message);
      toast.error("Lỗi khi xóa đơn hàng: " + (err.response?.data?.message || err.message));
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý đơn hàng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý và theo dõi đơn hàng từ khách hàng</p>
        </div>
      </div>

      <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm đơn hàng..."
                className="pl-10 py-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Trạng thái giao hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Chờ xác nhận">Chờ xác nhận</SelectItem>
                  <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                  <SelectItem value="Đang giao hàng">Đang giao hàng</SelectItem>
                  <SelectItem value="Đã giao">Đã giao</SelectItem>
                  <SelectItem value="Đã hủy">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentStatusFilter} onValueChange={(value) => { setPaymentStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Chưa thanh toán">Chưa thanh toán</SelectItem>
                  <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                  <SelectItem value="Đã thanh toán">Đã thanh toán</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
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
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">ID</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Khách hàng</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Ngày đặt</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Tổng tiền</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Sản phẩm</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Trạng thái giao hàng</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Trạng thái thanh toán</th>
                  <th className="text-right font-semibold p-4 text-gray-700 dark:text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <OrderRow
                    key={order.OrderId}
                    order={order}
                    handleViewDetails={handleViewDetails}
                    setOrderToDelete={setOrderToDelete} // Truyền hàm setOrderToDelete
                    setIsDeleteModalOpen={setIsDeleteModalOpen} // Truyền hàm setIsDeleteModalOpen
                  />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} của {total} đơn hàng
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

      {/* Modal Chi tiết đơn hàng */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Chi tiết đơn hàng #{selectedOrder?.OrderId}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Thông tin đơn hàng */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Thông tin đơn hàng</h3>
                <div className="mt-2 space-y-3 text-gray-700 dark:text-gray-300">
                  <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.OrderDate).toLocaleDateString('vi-VN')}</p>
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold">Trạng thái giao hàng:</Label>
                    <Select
                      value={editStatus}
                      onValueChange={(value) => setEditStatus(value)}
                    >
                      <SelectTrigger className="w-[180px] rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chờ xác nhận">Chờ xác nhận</SelectItem>
                        <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                        <SelectItem value="Đang giao hàng">Đang giao hàng</SelectItem>
                        <SelectItem value="Đã giao">Đã giao</SelectItem>
                        <SelectItem value="Đã hủy">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold">Trạng thái thanh toán:</Label>
                    <Select
                      value={editPaymentStatus}
                      onValueChange={(value) => setEditPaymentStatus(value)}
                    >
                      <SelectTrigger className="w-[180px] rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chưa thanh toán">Chưa thanh toán</SelectItem>
                        <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                        <SelectItem value="Đã thanh toán">Đã thanh toán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p><strong>Tổng tiền:</strong> {selectedOrder.Total.toLocaleString('vi-VN')}₫</p>
                  <p><strong>Phương thức thanh toán:</strong> {selectedOrder.PaymentMethod}</p>
                  <p>
                    <strong>Ngày giao hàng dự kiến:</strong>{" "}
                    {selectedOrder.EstimatedDeliveryDate
                      ? new Date(selectedOrder.EstimatedDeliveryDate).toLocaleDateString('vi-VN')
                      : "Chưa xác định"}
                  </p>
                  <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.Address}</p>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Thông tin khách hàng</h3>
                <div className="mt-2 space-y-3 text-gray-700 dark:text-gray-300">
                  <p><strong>Tên:</strong> {selectedOrder.FullName}</p>
                  <p><strong>Email:</strong> {selectedOrder.Email}</p>
                  <p><strong>Số điện thoại:</strong> {selectedOrder.Phone || "Không có"}</p>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Danh sách sản phẩm</h3>
                <div className="mt-2 overflow-x-auto rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="text-left font-semibold p-3 text-gray-700 dark:text-gray-300">Tên sản phẩm</th>
                        <th className="text-left font-semibold p-3 text-gray-700 dark:text-gray-300">Số lượng</th>
                        <th className="text-left font-semibold p-3 text-gray-700 dark:text-gray-300">Đơn giá</th>
                        <th className="text-left font-semibold p-3 text-gray-700 dark:text-gray-300">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.OrderItemId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-3 text-gray-700 dark:text-gray-300">{item.ProductName}</td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">{item.Quantity}</td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">{item.Price.toLocaleString('vi-VN')}₫</td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">{(item.Quantity * item.Price).toLocaleString('vi-VN')}₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Đóng
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={editStatus === selectedOrder?.Status && editPaymentStatus === selectedOrder?.PaymentStatus}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Cập nhật trạng thái
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
  <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Xác nhận xóa đơn hàng
      </DialogTitle>
    </DialogHeader>
    <p className="text-gray-700 dark:text-gray-300">
      Bạn có chắc chắn muốn xóa đơn hàng <strong>#{orderToDelete?.OrderId}</strong> không? Hành động này không thể hoàn tác.
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
          handleDeleteOrder(orderToDelete.OrderId); // Gọi hàm xóa
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

export default Orders;