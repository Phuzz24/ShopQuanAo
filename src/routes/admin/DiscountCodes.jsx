import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import React from "react";
import { Loader2 } from "lucide-react";

// Component con để tối ưu render bảng
const DiscountCodeRow = React.memo(({ discountCode, navigate, openEditModal, setSelectedDiscountCode, setIsDeleteModalOpen }) => {
  return (
    <tr className="border-b transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
      <td className="p-4 text-gray-700 dark:text-gray-300">{discountCode.DiscountCodeId}</td>
      <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">{discountCode.Code}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{discountCode.DiscountPercentage}%</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">
        {discountCode.ExpiryDate ? new Date(discountCode.ExpiryDate).toLocaleDateString('vi-VN') : "Không có hạn"}
      </td>
      <td className="p-4 text-gray-700 dark:text-gray-300">
        <span className={`px-2 py-1 rounded-full text-sm ${discountCode.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {discountCode.IsActive ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => navigate(`/admin/discount-codes/${discountCode.DiscountCodeId}`)}
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            onClick={() => openEditModal(discountCode)}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => {
              setSelectedDiscountCode(discountCode);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

const DiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState(null);
  const [formData, setFormData] = useState({
    Code: "",
    DiscountPercentage: "",
    ExpiryDate: "",
    IsActive: true,
  });
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

  const checkAuthAndFetchData = async () => {
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
      const response = await axios.get("http://localhost:5000/api/admin/discount-codes", {
        params: { search: debouncedSearch, page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setDiscountCodes(response.data.discountCodes);
        setTotal(response.data.total);
      } else {
        throw new Error(response.data.message || "Failed to fetch discount codes");
      }
    } catch (err) {
      console.error("Error fetching discount codes:", err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error("Lỗi khi lấy danh sách mã giảm giá: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetchData();
  }, [debouncedSearch, page]);

  const isFormValid = () => {
    return formData.Code.trim() !== "" && formData.DiscountPercentage > 0;
  };

  const handleAddDiscountCode = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      if (!formData.Code || !formData.DiscountPercentage) {
        toast.error("Vui lòng nhập mã giảm giá và phần trăm giảm giá.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/admin/discount-codes",
        {
          Code: formData.Code,
          DiscountPercentage: parseFloat(formData.DiscountPercentage),
          ExpiryDate: formData.ExpiryDate || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Thêm mã giảm giá thành công");
        setIsAddModalOpen(false);
        setFormData({ Code: "", DiscountPercentage: "", ExpiryDate: "", IsActive: true });
        checkAuthAndFetchData();
      }
    } catch (err) {
      console.error("Error adding discount code:", err.response?.data || err.message);
      toast.error("Lỗi khi thêm mã giảm giá: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditDiscountCode = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      if (!formData.Code || !formData.DiscountPercentage) {
        toast.error("Vui lòng nhập mã giảm giá và phần trăm giảm giá.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/discount-codes/${selectedDiscountCode.DiscountCodeId}`,
        {
          Code: formData.Code,
          DiscountPercentage: parseFloat(formData.DiscountPercentage),
          ExpiryDate: formData.ExpiryDate || null,
          IsActive: formData.IsActive,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Cập nhật mã giảm giá thành công");
        setIsEditModalOpen(false);
        checkAuthAndFetchData();
      }
    } catch (err) {
      console.error("Error updating discount code:", err.response?.data || err.message);
      toast.error("Lỗi khi cập nhật mã giảm giá: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteDiscountCode = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/admin/discount-codes/${selectedDiscountCode.DiscountCodeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Xóa mã giảm giá thành công");
        setIsDeleteModalOpen(false);
        checkAuthAndFetchData();
      }
    } catch (err) {
      console.error("Error deleting discount code:", err.response?.data || err.message);
      toast.error("Lỗi khi xóa mã giảm giá: " + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = (discountCode) => {
    setSelectedDiscountCode(discountCode);
    setFormData({
      Code: discountCode.Code,
      DiscountPercentage: discountCode.DiscountPercentage,
      ExpiryDate: discountCode.ExpiryDate ? discountCode.ExpiryDate.split('T')[0] : "",
      IsActive: discountCode.IsActive,
    });
    setIsEditModalOpen(true);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý mã giảm giá</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý các mã giảm giá cho cửa hàng</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" /> Thêm mã giảm giá
        </Button>
      </div>

      <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Danh sách mã giảm giá
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm mã giảm giá..."
                className="pl-10 py-2 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">ID</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Mã</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Phần trăm giảm</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Hạn sử dụng</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Trạng thái</th>
                  <th className="text-right font-semibold p-4 text-gray-700 dark:text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy mã giảm giá nào
                    </td>
                  </tr>
                ) : (
                  discountCodes.map((discountCode) => (
                    <DiscountCodeRow
                      key={discountCode.DiscountCodeId}
                      discountCode={discountCode}
                      navigate={navigate}
                      openEditModal={openEditModal}
                      setSelectedDiscountCode={setSelectedDiscountCode}
                      setIsDeleteModalOpen={setIsDeleteModalOpen}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} của {total} mã giảm giá
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

      {/* Modal Thêm mã giảm giá */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Thêm mã giảm giá mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Mã giảm giá</Label>
              <Input
                value={formData.Code}
                onChange={(e) => setFormData({ ...formData, Code: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Phần trăm giảm giá</Label>
              <Input
                type="number"
                value={formData.DiscountPercentage}
                onChange={(e) => setFormData({ ...formData, DiscountPercentage: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Hạn sử dụng</Label>
              <Input
                type="date"
                value={formData.ExpiryDate}
                onChange={(e) => setFormData({ ...formData, ExpiryDate: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
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
              onClick={handleAddDiscountCode}
              disabled={!isFormValid()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sửa mã giảm giá */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Chỉnh sửa mã giảm giá
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Mã giảm giá</Label>
              <Input
                value={formData.Code}
                onChange={(e) => setFormData({ ...formData, Code: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Phần trăm giảm giá</Label>
              <Input
                type="number"
                value={formData.DiscountPercentage}
                onChange={(e) => setFormData({ ...formData, DiscountPercentage: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Hạn sử dụng</Label>
              <Input
                type="date"
                value={formData.ExpiryDate}
                onChange={(e) => setFormData({ ...formData, ExpiryDate: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.IsActive}
                onCheckedChange={(checked) => setFormData({ ...formData, IsActive: checked })}
              />
              <Label className="text-gray-700 dark:text-gray-300">Hoạt động</Label>
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
              onClick={handleEditDiscountCode}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Xóa mã giảm giá */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Xác nhận xóa mã giảm giá
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 dark:text-gray-300">
            Bạn có chắc chắn muốn xóa mã giảm giá <strong>{selectedDiscountCode?.Code}</strong> không? Hành động này không thể hoàn tác.
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
              onClick={handleDeleteDiscountCode}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscountCodes;