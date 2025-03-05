import React, { useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext"; // Import ThemeContext

const ProductManagement = () => {
  const { darkMode } = useTheme(); // Sử dụng chế độ tối/sáng từ ThemeContext
  const [products, setProducts] = useState([
    { id: 1, name: "iPhone 15", price: 15990000, category: "Điện thoại", stock: 30, image: "https://example.com/iphone.jpg", status: "Còn hàng" },
    { id: 2, name: "Samsung Galaxy S22", price: 12990000, category: "Điện thoại", stock: 20, image: "https://example.com/samsung.jpg", status: "Còn hàng" },
    { id: 3, name: "Google Pixel 6", price: 10990000, category: "Điện thoại", stock: 10, image: "https://example.com/pixel.jpg", status: "Còn hàng" },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Hàm lọc sản phẩm theo tên
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mở form thêm sản phẩm
  const toggleAddProductForm = () => setShowAddProduct(!showAddProduct);

  return (
    <div className={`container mx-auto p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6">Quản lý Sản Phẩm</h1>

      {/* Tìm kiếm sản phẩm */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            className="w-1/3 p-2 border rounded-md"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`p-2 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded-md hover:bg-blue-700`}
            onClick={toggleAddProductForm}
          >
            <FaPlus className="inline mr-2" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm">
          <thead className={`bg-${darkMode ? 'gray-700' : 'gray-100'} text-left`}>
            <tr>
              <th className="p-4">Sản phẩm</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Số lượng</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className={`border-t ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <td className="p-4">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
                  <span className="ml-4">{product.name}</span>
                </td>
                <td className="p-4">{product.price.toLocaleString()} VND</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">{product.status}</td>
                <td className="p-4 flex space-x-2">
                  <button className={`p-2 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-400'} text-white rounded-md hover:bg-yellow-600`}>
                    <FaEdit />
                  </button>
                  <button className={`p-2 ${darkMode ? 'bg-red-500' : 'bg-red-400'} text-white rounded-md hover:bg-red-600`}>
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thêm sản phẩm (Form) */}
      {showAddProduct && (
        <div className={`mt-6 bg-white p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-4">Thêm sản phẩm mới</h2>
          <form>
            <div className="mb-4">
              <label className="block mb-2">Tên sản phẩm</label>
              <input type="text" className="w-full p-2 border rounded-md" placeholder="Nhập tên sản phẩm" />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Giá</label>
              <input type="number" className="w-full p-2 border rounded-md" placeholder="Nhập giá sản phẩm" />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Số lượng</label>
              <input type="number" className="w-full p-2 border rounded-md" placeholder="Nhập số lượng" />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Trạng thái</label>
              <select className="w-full p-2 border rounded-md">
                <option value="Còn hàng">Còn hàng</option>
                <option value="Hết hàng">Hết hàng</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Hình ảnh</label>
              <input type="file" className="w-full p-2 border rounded-md" />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Thêm sản phẩm
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
