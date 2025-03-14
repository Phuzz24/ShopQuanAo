
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const Categories = () => {
  const [categories] = useState([
    { id: 1, name: "Apple", description: "iPhone và các sản phẩm Apple", products: 15, createdAt: "10/01/2023" },
    { id: 2, name: "Samsung", description: "Điện thoại và máy tính bảng Samsung", products: 12, createdAt: "15/01/2023" },
    { id: 3, name: "Xiaomi", description: "Điện thoại Xiaomi", products: 8, createdAt: "20/01/2023" },
    { id: 4, name: "OPPO", description: "Điện thoại OPPO", products: 7, createdAt: "22/01/2023" },
    { id: 5, name: "Vivo", description: "Điện thoại Vivo", products: 6, createdAt: "25/01/2023" },
    { id: 6, name: "Google", description: "Điện thoại Google Pixel", products: 3, createdAt: "28/01/2023" },
    { id: 7, name: "Nothing", description: "Điện thoại Nothing", products: 2, createdAt: "30/01/2023" },
    { id: 8, name: "OnePlus", description: "Điện thoại OnePlus", products: 4, createdAt: "02/02/2023" },
    { id: 9, name: "Realme", description: "Điện thoại Realme", products: 5, createdAt: "05/02/2023" },
    { id: 10, name: "Phụ kiện", description: "Phụ kiện điện thoại", products: 20, createdAt: "10/02/2023" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý loại sản phẩm</h1>
          <p className="text-gray-500 dark:text-gray-400">Quản lý danh mục sản phẩm điện thoại</p>
        </div>
        <Button className="bg-admin hover:bg-admin-secondary">
          <Plus className="mr-2 h-4 w-4" /> Thêm loại sản phẩm
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách loại sản phẩm</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Tìm kiếm..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-3">ID</th>
                  <th className="text-left font-medium p-3">Tên loại</th>
                  <th className="text-left font-medium p-3">Mô tả</th>
                  <th className="text-left font-medium p-3">Số sản phẩm</th>
                  <th className="text-left font-medium p-3">Ngày tạo</th>
                  <th className="text-right font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3">{category.id}</td>
                    <td className="p-3 font-medium">{category.name}</td>
                    <td className="p-3">{category.description}</td>
                    <td className="p-3">{category.products}</td>
                    <td className="p-3">{category.createdAt}</td>
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
              Hiển thị 1-10 của 10 loại sản phẩm
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

export default Categories;