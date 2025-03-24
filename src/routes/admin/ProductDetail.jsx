import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ProductId từ URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProductDetail = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setProduct(response.data.product);
        setImages(response.data.images);
      } else {
        throw new Error(response.data.message || "Failed to fetch product details");
      }
    } catch (err) {
      console.error("Error fetching product details:", err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (err.response?.status === 404) {
        toast.error("Không tìm thấy sản phẩm.");
        navigate("/admin/products");
      } else {
        toast.error("Lỗi khi lấy chi tiết sản phẩm: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  if (isLoading) {
    return <div className="text-center">Đang tải dữ liệu...</div>;
  }

  if (!product) {
    return <div className="text-center">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
        <h1 className="text-2xl font-bold">Chi tiết sản phẩm: {product.Name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Hình ảnh</h3>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.ImageId} className="relative">
                      <img
                        src={image.ImageUrl}
                        alt={`Product Image ${image.ImageId}`}
                        className="w-full h-40 object-cover rounded"
                      />
                      {image.IsPrimary && (
                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Hình chính
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  Không có hình ảnh
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin chi tiết</h3>
              <div className="space-y-2">
                <p><strong>ID:</strong> {product.ProductId}</p>
                <p><strong>Tên sản phẩm:</strong> {product.Name}</p>
                <p><strong>Thương hiệu:</strong> {product.BrandName}</p>
                <p><strong>Danh mục:</strong> {product.CategoryName}</p>
                <p><strong>Giá:</strong> {product.Price.toLocaleString('vi-VN')}₫</p>
                <p><strong>Tồn kho:</strong> {product.Stock}</p>
                <p><strong>Phần trăm giảm giá:</strong> {product.DiscountPercentage}%</p>
                <p><strong>Mô tả:</strong> {product.Description || "Không có mô tả"}</p>
                <p><strong>Thông số chi tiết:</strong> {product.DetailedSpecs || "Không có thông số chi tiết"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetail;