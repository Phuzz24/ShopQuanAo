import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import React from "react";
import { Loader2 } from "lucide-react";

// Component con để tối ưu render bảng
const BrandRow = React.memo(({ brand, navigate, openEditModal, setSelectedBrand, setIsDeleteModalOpen }) => {
  return (
    <tr className="border-b transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
      <td className="p-4 text-gray-700 dark:text-gray-300">{brand.BrandId}</td>
      <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">{brand.Name}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{brand.Description || "Không có mô tả"}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{brand.ProductCount}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{new Date(brand.CreatedAt).toLocaleDateString('vi-VN')}</td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => navigate(`/admin/brands/${brand.BrandId}`)}
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            onClick={() => openEditModal(brand)}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => {
              setSelectedBrand(brand);
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

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
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
      const response = await axios.get("http://localhost:5000/api/admin/brands", {
        params: { search: debouncedSearch, page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setBrands(response.data.brands);
        setTotal(response.data.total);
      } else {
        throw new Error(response.data.message || "Failed to fetch brands");
      }
    } catch (err) {
      console.error("Error fetching brands:", err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error("Lỗi khi lấy danh sách thương hiệu: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetchData();
  }, [debouncedSearch, page]);

  const isFormValid = () => {
    return formData.Name.trim() !== "";
  };

  const handleAddBrand = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      if (!formData.Name) {
        toast.error("Vui lòng nhập tên thương hiệu.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/admin/brands",
        { Name: formData.Name, Description: formData.Description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Thêm thương hiệu thành công");
        setIsAddModalOpen(false);
        setFormData({ Name: "", Description: "" });
        checkAuthAndFetchData();
      }
    } catch (err) {
      console.error("Error adding brand:", err.response?.data || err.message);
      toast.error("Lỗi khi thêm thương hiệu: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditBrand = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      if (!formData.Name) {
        toast.error("Vui lòng nhập tên thương hiệu.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/brands/${selectedBrand.BrandId}`,
        { Name: formData.Name, Description: formData.Description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Cập nhật thương hiệu thành công");
        setIsEditModalOpen(false);
        checkAuthAndFetchData();
      }
    } catch (err) {
      console.error("Error updating brand:", err.response?.data || err.message);
      toast.error("Lỗi khi cập nhật thương hiệu: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBrand = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/admin/brands/${selectedBrand.BrandId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Xóa thương hiệu thành công");
        setIsDeleteModalOpen(false);
        checkAuthAndFetchData();
      }
    } catch (err) {
      console.error("Error deleting brand:", err.response?.data || err.message);
      toast.error("Lỗi khi xóa thương hiệu: " + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      Name: brand.Name,
      Description: brand.Description || "",
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý thương hiệu</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý thương hiệu sản phẩm điện thoại</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" /> Thêm thương hiệu
        </Button>
      </div>

      <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Danh sách thương hiệu
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm thương hiệu..."
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
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Tên thương hiệu</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Mô tả</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Số sản phẩm</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Ngày tạo</th>
                  <th className="text-right font-semibold p-4 text-gray-700 dark:text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy thương hiệu nào
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <BrandRow
                      key={brand.BrandId}
                      brand={brand}
                      navigate={navigate}
                      openEditModal={openEditModal}
                      setSelectedBrand={setSelectedBrand}
                      setIsDeleteModalOpen={setIsDeleteModalOpen}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} của {total} thương hiệu
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

      {/* Modal Thêm thương hiệu */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Thêm thương hiệu mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Tên thương hiệu</Label>
              <Input
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Mô tả</Label>
              <Input
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
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
              onClick={handleAddBrand}
              disabled={!isFormValid()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sửa thương hiệu */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Chỉnh sửa thương hiệu
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Tên thương hiệu</Label>
              <Input
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Mô tả</Label>
              <Input
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
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
              onClick={handleEditBrand}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Xóa thương hiệu */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Xác nhận xóa thương hiệu
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 dark:text-gray-300">
            Bạn có chắc chắn muốn xóa thương hiệu <strong>{selectedBrand?.Name}</strong> không? Hành động này không thể hoàn tác.
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
              onClick={handleDeleteBrand}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Brands;