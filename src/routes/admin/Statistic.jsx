import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Smartphone, DollarSign, Users, ShoppingCart } from "lucide-react";

const salesData = [
  { name: "T1", value: 400 },
  { name: "T2", value: 300 },
  { name: "T3", value: 500 },
  { name: "T4", value: 700 },
  { name: "T5", value: 600 },
  { name: "T6", value: 800 },
  { name: "T7", value: 900 },
  { name: "T8", value: 800 },
  { name: "T9", value: 950 },
  { name: "T10", value: 1100 },
  { name: "T11", value: 1000 },
  { name: "T12", value: 1200 },
];

const productCategoryData = [
  { name: "Smartphone", value: 400 },
  { name: "Tablet", value: 300 },
  { name: "Phụ kiện", value: 300 },
  { name: "Khác", value: 200 },
];

const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"];

const topProducts = [
  { id: 1, name: "iPhone 14 Pro Max", sales: 120, stock: 45 },
  { id: 2, name: "Samsung Galaxy S23", sales: 98, stock: 32 },
  { id: 3, name: "Xiaomi 13 Pro", sales: 85, stock: 28 },
  { id: 4, name: "OPPO Find X5 Pro", sales: 72, stock: 18 },
  { id: 5, name: "Vivo X80 Pro", sales: 65, stock: 22 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        <p className="text-gray-500 dark:text-gray-400">Tổng quan hoạt động kinh doanh</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-admin" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.5 Tr₫</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <span>↑ 18% so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Smartphone className="h-4 w-4 text-admin" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <span>↑ 12 sản phẩm mới</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-admin" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">320</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <span>↑ 24% so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-admin" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,423</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <span>↑ 32 người dùng mới</span>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Phân loại sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {productCategoryData.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm bán chạy</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-3 font-medium">Sản phẩm</th>
                <th className="pb-3 font-medium">Đã bán</th>
                <th className="pb-3 font-medium">Tồn kho</th>
                <th className="pb-3 font-medium">Doanh số</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="py-3">{product.name}</td>
                  <td className="py-3">{product.sales}</td>
                  <td className="py-3">{product.stock}</td>
                  <td className="py-3">{(product.sales * 4500000).toLocaleString('vi-VN')}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
