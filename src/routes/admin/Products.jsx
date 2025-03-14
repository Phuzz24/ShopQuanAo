import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const Products = () => {
  const [products] = useState([
    { id: 1, name: "iPhone 14 Pro Max", category: "Apple", price: 29990000, stock: 45, status: "Còn hàng" },
    { id: 2, name: "Samsung Galaxy S23", category: "Samsung", price: 21990000, stock: 32, status: "Còn hàng" },
    { id: 3, name: "Xiaomi 13 Pro", category: "Xiaomi", price: 16990000, stock: 28, status: "Còn hàng" },
    { id: 4, name: "OPPO Find X5 s", category: "OPPO", price: 19990000, stock: 18, status: "Còn hàng" },
    { id: 5, name: "Vivo X80 Pro", category: "Vivo", price: 18990000, stock: 22, status: "Còn hàng" },
    { id: 6, name: "Google Pixel 7 Pro", category: "Google", price: 22990000, stock: 15, status: "Còn hàng" },
    { id: 7, name: "Nothing Phone (1)", category: "Nothing", price: 10990000, stock: 12, status: "Còn hàng" },
    { id: 8, name: "OnePlus 10 Pro", category: "OnePlus", price: 16990000, stock: 14, status: "Còn hàng" },
    { id: 9, name: "Realme GT Neo 3", category: "Realme", price: 12990000, stock: 20, status: "Còn hàng" },
    { id: 10, name: "iPhone 13", category: "Apple", price: 17990000, stock: 5, status: "Sắp hết" },
  ]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Còn hàng":
        return "bg-green-100 text-green-800";
      case "Hết hàng":
        return "bg-red-100 text-red-800";
      case "Sắp hết":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-gray-500 dark:text-gray-400">Quản lý danh sách sản phẩm trong cửa hàng</p>
        </div>
        <Button className="bg-admin hover:bg-admin-secondary">
          <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách sản phẩm</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Tìm kiếm sản phẩm..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-3">ID</th>
                  <th className="text-left font-medium p-3">Tên sản phẩm</th>
                  <th className="text-left font-medium p-3">Loại</th>
                  <th className="text-left font-medium p-3">Giá</th>
                  <th className="text-left font-medium p-3">Tồn kho</th>
                  <th className="text-left font-medium p-3">Trạng thái</th>
                  <th className="text-right font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3">{product.id}</td>
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">{product.price.toLocaleString('vi-VN')}₫</td>
                    <td className="p-3">{product.stock}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
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
              Hiển thị 1-10 của 25 sản phẩm
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

export default Products;
