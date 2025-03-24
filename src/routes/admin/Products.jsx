import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import React from "react";
import { Loader2 } from "lucide-react"; // Thêm icon loading

// Component con để tối ưu render bảng
const ProductRow = React.memo(({ product, navigate, openEditModal, setSelectedProduct, setIsDeleteModalOpen }) => {
  const getStatus = (stock) => {
    if (stock === 0) return "Hết hàng";
    if (stock <= 5) return "Sắp hết";
    return "Còn hàng";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Còn hàng":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Hết hàng":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Sắp hết":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <tr className="border-b transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
      <td className="p-4 text-gray-700 dark:text-gray-300">{product.ProductId}</td>
      <td className="p-4">
        {product.PrimaryImage ? (
          <img
            src={product.PrimaryImage}
            alt={product.Name}
            className="w-14 h-14 object-cover rounded-lg shadow-sm"
          />
        ) : (
          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
            No Image
          </div>
        )}
      </td>
      <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">{product.Name}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{product.BrandName}</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{product.CategoryName}</td>
      <td className="p-4 text-gray-900 dark:text-gray-100">{product.Price.toLocaleString("vi-VN")}₫</td>
      <td className="p-4 text-gray-700 dark:text-gray-300">{product.Stock}</td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(getStatus(product.Stock))}`}>
          {getStatus(product.Stock)}
        </span>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => navigate(`/admin/products/${product.ProductId}`)}
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            onClick={() => openEditModal(product)}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => {
              setSelectedProduct(product);
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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    Name: "",
    BrandId: "",
    CategoryId: "",
    Price: "",
    Description: "",
    Stock: "",
    DetailedSpecs: "",
    DiscountPercentage: "",
    Images: [],
  });
  const [imageInputs, setImageInputs] = useState([{ ImageUrl: "", IsPrimary: true, DisplayOrder: 0 }]);
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
      const [productsResponse, brandsCategoriesResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/products", {
          params: { search: debouncedSearch, page, limit },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/brands-categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (productsResponse.data.success) {
        setProducts(productsResponse.data.products);
        setTotal(productsResponse.data.total);
      } else {
        throw new Error(productsResponse.data.message || "Failed to fetch products");
      }

      if (brandsCategoriesResponse.data.success) {
        setBrands(brandsCategoriesResponse.data.brands);
        setCategories(brandsCategoriesResponse.data.categories);
      } else {
        throw new Error(brandsCategoriesResponse.data.message || "Failed to fetch brands and categories");
      }
    } catch (err) {
      console.error("Error fetching data:", err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error("Lỗi khi lấy dữ liệu: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      await checkAuthAndFetchData();
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page]);

  const isFormValid = () => {
    return (
      formData.Name &&
      formData.BrandId &&
      formData.CategoryId &&
      formData.Price &&
      formData.Stock !== ""
    );
  };

  const handleAddImageInput = () => {
    setImageInputs([...imageInputs, { ImageUrl: "", IsPrimary: false, DisplayOrder: imageInputs.length }]);
  };

  const handleImageChange = (index, value) => {
    const newImages = [...imageInputs];
    newImages[index].ImageUrl = value;
    setImageInputs(newImages);
    setFormData({ ...formData, Images: newImages });
  };

  const handleRemoveImage = (index) => {
    const newImages = imageInputs.filter((_, i) => i !== index);
    setImageInputs(newImages);
    setFormData({ ...formData, Images: newImages });
  };

  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }
  
      // Chuyển đổi dữ liệu và kiểm tra
      const productData = {
        Name: formData.Name.trim(),
        BrandId: parseInt(formData.BrandId),
        CategoryId: parseInt(formData.CategoryId),
        Price: parseFloat(formData.Price),
        Description: formData.Description.trim() || null,
        Stock: parseInt(formData.Stock),
        DetailedSpecs: formData.DetailedSpecs.trim() || null,
        DiscountPercentage: formData.DiscountPercentage ? parseFloat(formData.DiscountPercentage) : 0,
        Images: formData.Images.filter((img) => img.ImageUrl.trim()).map((img, index) => ({
          ImageUrl: img.ImageUrl.trim(),
          IsPrimary: img.IsPrimary,
          DisplayOrder: index,
        })),
      };
  
      // Kiểm tra dữ liệu đầu vào
      if (!productData.Name) {
        toast.error("Tên sản phẩm không được để trống.");
        return;
      }
      if (isNaN(productData.BrandId) || productData.BrandId <= 0) {
        toast.error("Vui lòng chọn thương hiệu hợp lệ.");
        return;
      }
      if (isNaN(productData.CategoryId) || productData.CategoryId <= 0) {
        toast.error("Vui lòng chọn danh mục hợp lệ.");
        return;
      }
      if (isNaN(productData.Price) || productData.Price < 0) {
        toast.error("Giá sản phẩm không hợp lệ (phải lớn hơn hoặc bằng 0).");
        return;
      }
      if (isNaN(productData.Stock) || productData.Stock < 0) {
        toast.error("Tồn kho không hợp lệ (phải lớn hơn hoặc bằng 0).");
        return;
      }
      if (productData.DiscountPercentage < 0 || productData.DiscountPercentage > 100) {
        toast.error("Phần trăm giảm giá phải từ 0 đến 100.");
        return;
      }
  
      console.log("Dữ liệu gửi đi:", productData); // Log để kiểm tra dữ liệu
  
      // Sử dụng ngrok URL thay vì localhost
      const response = await axios.post(
        "https://364d-2405-4802-c0f3-faa0-8cb0-6540-ac31-5a2c.ngrok-free.app/api/admin/products",
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        toast.success("Thêm sản phẩm thành công");
        setIsAddModalOpen(false);
        setFormData({
          Name: "",
          BrandId: "",
          CategoryId: "",
          Price: "",
          Description: "",
          Stock: "",
          DetailedSpecs: "",
          DiscountPercentage: "",
          Images: [],
        });
        setImageInputs([{ ImageUrl: "", IsPrimary: true, DisplayOrder: 0 }]);
        checkAuthAndFetchData();
      } else {
        throw new Error(response.data.message || "Failed to add product");
      }
    } catch (err) {
      console.error("Error adding product:", err.response?.data || err.message);
      toast.error("Lỗi khi thêm sản phẩm: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const productData = {
        Name: formData.Name.trim(),
        BrandId: parseInt(formData.BrandId),
        CategoryId: parseInt(formData.CategoryId),
        Price: parseFloat(formData.Price),
        Description: formData.Description.trim() || null,
        Stock: parseInt(formData.Stock),
        DetailedSpecs: formData.DetailedSpecs.trim() || null,
        DiscountPercentage: formData.DiscountPercentage ? parseFloat(formData.DiscountPercentage) : 0,
        Images: formData.Images.filter((img) => img.ImageUrl.trim()).map((img, index) => ({
          ImageUrl: img.ImageUrl.trim(),
          IsPrimary: img.IsPrimary,
          DisplayOrder: index,
        })),
      };

      if (!productData.Name) {
        toast.error("Tên sản phẩm không được để trống.");
        return;
      }
      if (isNaN(productData.BrandId)) {
        toast.error("Vui lòng chọn thương hiệu hợp lệ.");
        return;
      }
      if (isNaN(productData.CategoryId)) {
        toast.error("Vui lòng chọn danh mục hợp lệ.");
        return;
      }
      if (isNaN(productData.Price) || productData.Price < 0) {
        toast.error("Giá sản phẩm không hợp lệ (phải lớn hơn hoặc bằng 0).");
        return;
      }
      if (isNaN(productData.Stock) || productData.Stock < 0) {
        toast.error("Tồn kho không hợp lệ (phải lớn hơn hoặc bằng 0).");
        return;
      }
      if (productData.DiscountPercentage < 0 || productData.DiscountPercentage > 100) {
        toast.error("Phần trăm giảm giá phải từ 0 đến 100.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/products/${selectedProduct.ProductId}`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Cập nhật sản phẩm thành công");
        setIsEditModalOpen(false);
        checkAuthAndFetchData();
      } else {
        throw new Error(response.data.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Error updating product:", err.response?.data || err.message);
      toast.error("Lỗi khi cập nhật sản phẩm: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      console.log("Xóa sản phẩm với ID:", selectedProduct.ProductId); // Log để kiểm tra

      const response = await axios.delete(
        `http://localhost:5000/api/admin/products/${selectedProduct.ProductId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Xóa sản phẩm thành công");
        setIsDeleteModalOpen(false);
        checkAuthAndFetchData();
      } else {
        throw new Error(response.data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err.response?.data || err.message);
      toast.error("Lỗi khi xóa sản phẩm: " + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = async (product) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/admin/products/${product.ProductId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedProduct(product);
        const { product: productData, images } = response.data;

        setFormData({
          Name: productData.Name || "",
          BrandId: productData.BrandId != null ? productData.BrandId.toString() : "",
          CategoryId: productData.CategoryId != null ? productData.CategoryId.toString() : "",
          Price: productData.Price != null ? productData.Price.toString() : "",
          Description: productData.Description || "",
          Stock: productData.Stock != null ? productData.Stock.toString() : "",
          DetailedSpecs: productData.DetailedSpecs || "",
          DiscountPercentage: productData.DiscountPercentage != null ? productData.DiscountPercentage.toString() : "0",
          Images: images || [],
        });

        setImageInputs(
          images.length > 0
            ? images
            : [{ ImageUrl: "", IsPrimary: true, DisplayOrder: 0 }]
        );
        setIsEditModalOpen(true);
      } else {
        throw new Error(response.data.message || "Failed to fetch product details");
      }
    } catch (err) {
      console.error("Error fetching product details:", err.response?.data || err.message);
      toast.error("Lỗi khi lấy chi tiết sản phẩm: " + (err.response?.data?.message || err.message));
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý sản phẩm</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý danh sách sản phẩm trong cửa hàng của bạn</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" /> Thêm sản phẩm
        </Button>
      </div>

      <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Danh sách sản phẩm
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
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
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Hình ảnh</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Tên sản phẩm</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Thương hiệu</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Danh mục</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Giá</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Tồn kho</th>
                  <th className="text-left font-semibold p-4 text-gray-700 dark:text-gray-300">Trạng thái</th>
                  <th className="text-right font-semibold p-4 text-gray-700 dark:text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <ProductRow
                      key={product.ProductId}
                      product={product}
                      navigate={navigate}
                      openEditModal={openEditModal}
                      setSelectedProduct={setSelectedProduct}
                      setIsDeleteModalOpen={setIsDeleteModalOpen}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} của {total} sản phẩm
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

      {/* Modal Thêm sản phẩm */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Thêm sản phẩm mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Tên sản phẩm</Label>
              <Input
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Thương hiệu</Label>
              <Select
                value={formData.BrandId}
                onValueChange={(value) => setFormData({ ...formData, BrandId: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  {brands.length === 0 ? (
                    <SelectItem value="" disabled>
                      Không có thương hiệu nào
                    </SelectItem>
                  ) : (
                    brands.map((brand) => (
                      <SelectItem key={brand.BrandId} value={brand.BrandId.toString()}>
                        {brand.Name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Danh mục</Label>
              <Select
                value={formData.CategoryId}
                onValueChange={(value) => setFormData({ ...formData, CategoryId: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="" disabled>
                      Không có danh mục nào
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.CategoryId} value={category.CategoryId.toString()}>
                        {category.Name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Giá (VNĐ)</Label>
              <Input
                type="number"
                value={formData.Price}
                onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Tồn kho</Label>
              <Input
                type="number"
                value={formData.Stock}
                onChange={(e) => setFormData({ ...formData, Stock: e.target.value })}
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
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Thông số chi tiết</Label>
              <Input
                value={formData.DetailedSpecs}
                onChange={(e) => setFormData({ ...formData, DetailedSpecs: e.target.value })}
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
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">Hình ảnh</Label>
              {imageInputs.map((image, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder={`Hình ảnh ${index + 1} (URL)`}
                    value={image.ImageUrl}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  {index === 0 ? (
                    <span className="text-sm text-gray-500 dark:text-gray-400">(Hình chính)</span>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                      onClick={() => handleRemoveImage(index)}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleAddImageInput}
              >
                Thêm hình ảnh
              </Button>
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
              onClick={handleAddProduct}
              disabled={!isFormValid()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sửa sản phẩm */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Chỉnh sửa sản phẩm
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Tên sản phẩm</Label>
              <Input
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Thương hiệu</Label>
              <Select
                value={formData.BrandId}
                onValueChange={(value) => setFormData({ ...formData, BrandId: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  {brands.length === 0 ? (
                    <SelectItem value="" disabled>
                      Không có thương hiệu nào
                    </SelectItem>
                  ) : (
                    brands.map((brand) => (
                      <SelectItem key={brand.BrandId} value={brand.BrandId.toString()}>
                        {brand.Name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Danh mục</Label>
              <Select
                value={formData.CategoryId}
                onValueChange={(value) => setFormData({ ...formData, CategoryId: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="" disabled>
                      Không có danh mục nào
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.CategoryId} value={category.CategoryId.toString()}>
                        {category.Name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Giá (VNĐ)</Label>
              <Input
                type="number"
                value={formData.Price}
                onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Tồn kho</Label>
              <Input
                type="number"
                value={formData.Stock}
                onChange={(e) => setFormData({ ...formData, Stock: e.target.value })}
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
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Thông số chi tiết</Label>
              <Input
                value={formData.DetailedSpecs}
                onChange={(e) => setFormData({ ...formData, DetailedSpecs: e.target.value })}
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
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">Hình ảnh</Label>
              {imageInputs.map((image, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder={`Hình ảnh ${index + 1} (URL)`}
                    value={image.ImageUrl}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  {index === 0 ? (
                    <span className="text-sm text-gray-500 dark:text-gray-400">(Hình chính)</span>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                      onClick={() => handleRemoveImage(index)}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleAddImageInput}
              >
                Thêm hình ảnh
              </Button>
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
              onClick={handleEditProduct}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Xóa sản phẩm */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Xác nhận xóa sản phẩm
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 dark:text-gray-300">
            Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct?.Name}</strong> không? Hành động này không thể hoàn tác.
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
              onClick={handleDeleteProduct}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;