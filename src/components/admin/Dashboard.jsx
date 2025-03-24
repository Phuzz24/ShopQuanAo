import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Smartphone, DollarSign, Users, ShoppingCart } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE", "#E0E7FF"];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    salesData: [],
    productCategoryData: [],
    topProducts: [],
    revenueChange: 0,
    newProducts: 0,
    ordersChange: 0,
    newCustomers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        const response = await axios.get("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err.response?.data || err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          toast.error("Lỗi khi lấy dữ liệu thống kê: " + (err.response?.data?.message || err.message));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bảng điều khiển</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Tổng quan hoạt động kinh doanh</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(dashboardData.totalRevenue / 1000000).toFixed(1)} Tr₫
            </div>
            <p className={`text-xs flex items-center mt-1 ${dashboardData.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span>{dashboardData.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.revenueChange).toFixed(1)}% so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Sản phẩm</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData.totalProducts}</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <span>↑ {dashboardData.newProducts} sản phẩm mới</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData.totalOrders}</div>
            <p className={`text-xs flex items-center mt-1 ${dashboardData.ordersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span>{dashboardData.ordersChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.ordersChange).toFixed(1)}% so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData.totalCustomers}</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <span>↑ {dashboardData.newCustomers} người dùng mới</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)} Tr₫`} />
                  <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Phân loại sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.productCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardData.productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {dashboardData.productCategoryData.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sản phẩm bán chạy</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Sản phẩm</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Đã bán</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Tồn kho</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Doanh số</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-3 text-center text-gray-500 dark:text-gray-400">
                    Không có dữ liệu sản phẩm bán chạy
                  </td>
                </tr>
              ) : (
                dashboardData.topProducts.map((product) => (
                  <tr key={product.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 text-gray-900 dark:text-gray-100">{product.name}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{product.sales}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{product.stock}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {(product.sales * 4500000).toLocaleString('vi-VN')}₫
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;