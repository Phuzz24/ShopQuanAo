import React, { useState } from 'react';
import { FaShoppingCart, FaStar, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext'; // Import useCart từ CartContext

const sampleProducts = [
  { id: 1, name: "iPhone 15", category: "iPhone", price: 15990000, image: "https://i.gadgets360cdn.com/large/iphone_15_series_models_1694757260405.jpg", rating: 4.5 },
  { id: 2, name: "Samsung Galaxy S22", category: "Samsung", price: 12990000, image: "https://via.placeholder.com/150?text=Samsung+Galaxy+S22", rating: 4.8 },
  { id: 3, name: "Google Pixel 6", category: "Google", price: 10990000, image: "https://via.placeholder.com/150?text=Google+Pixel+6", rating: 4.7 },
  { id: 4, name: "OnePlus 9", category: "OnePlus", price: 8990000, image: "https://via.placeholder.com/150?text=OnePlus+9", rating: 4.6 },
];

const ProductPage = () => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const { addToCart } = useCart(); // Lấy hàm addToCart từ CartContext

  const handleAddToCart = (product) => {
    addToCart(product); // Thêm sản phẩm vào giỏ hàng
  };

  const filteredProducts = sampleProducts.filter((product) => {
    return (
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "Tất cả" || product.category === category) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
    );
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center text-red-600 mb-10">Danh Mục Điện Thoại</h1>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-full md:w-1/4 p-2 border rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Tất cả">Tất cả</option>
          <option value="iPhone">iPhone</option>
          <option value="Samsung">Samsung</option>
          <option value="Google">Google</option>
          <option value="OnePlus">OnePlus</option>
        </select>
        <input
          type="range"
          min="0"
          max="10000000"
          step="500000"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, Number(e.target.value)])}
          className="w-full md:w-1/4"
        />
        <span className="text-gray-700">Giá: {priceRange[1].toLocaleString()} VND</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={product.image} alt={product.name} className="w-full h-60 object-cover rounded-lg mb-4" />
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-lg text-red-500 font-semibold">{product.price.toLocaleString()} VND</p>
            <div className="flex items-center gap-1 my-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"} />
              ))}
              <span className="text-gray-600 ml-2">({product.rating})</span>
            </div>
            <button
              className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500 transition"
              onClick={() => handleAddToCart(product)} // Gọi addToCart khi nhấn vào nút
            >
              <FaShoppingCart /> Thêm vào giỏ hàng
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
