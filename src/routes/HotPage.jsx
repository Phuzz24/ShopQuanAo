import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaSearch, FaSortAmountDown, FaSortAmountUp, FaEye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext'; // Thêm useCart
import { toast } from 'react-toastify';

const HotPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const productsPerPage = 4;
  const navigate = useNavigate();
  const { token } = useUser();
  const { addToCart } = useCart(); // Thêm addToCart từ CartContext

  useEffect(() => {
    const fetchHotProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/hot-products');
        if (response.data.success) {
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);
        } else {
          console.error('Failed to fetch hot products:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching hot products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotProducts();
  }, []);

  useEffect(() => {
    let updatedProducts = [...products];
    if (searchTerm) {
      updatedProducts = updatedProducts.filter((product) =>
        product.Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortOrder === 'asc') {
      updatedProducts.sort((a, b) => a.Price - b.Price);
    } else if (sortOrder === 'desc') {
      updatedProducts.sort((a, b) => b.Price - b.Price);
    }
    setFilteredProducts(updatedProducts);
    setCurrentIndex(0);
  }, [searchTerm, sortOrder, products]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const displayProducts = filteredProducts.slice(currentIndex, currentIndex + productsPerPage);

  const handleNext = () => {
    if (currentIndex < filteredProducts.length - productsPerPage) {
      setCurrentIndex(currentIndex + productsPerPage);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - productsPerPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortToggle = () => {
    if (sortOrder === '') setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder('');
  };

  const handleProductClick = (productId) => {
    navigate(`/product-detail/${productId}`);
  };

  const handleBuyNow = async (product) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để mua hàng!', { autoClose: 2000 });
      navigate('/login');
      return;
    }

    const cartItem = {
      id: product.ProductId,
      name: product.Name,
      price: product.Price,
      image: product.ImageUrl,
      quantity: 1,
    };

    try {
      await addToCart(cartItem); // Thêm sản phẩm vào giỏ hàng qua CartContext
      toast.success(`Đã thêm ${product.Name} vào giỏ hàng!`, { autoClose: 1500 });
      navigate('/cart'); // Chuyển hướng đến trang giỏ hàng
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Lỗi khi thêm sản phẩm vào giỏ hàng');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 text-xl">Đang tải...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 min-h-screen py-16">
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-16 max-w-5xl mx-auto px-4"
      >
        <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 mb-4">
          Sản Phẩm Nổi Bật
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Khám phá những sản phẩm được yêu thích nhất, đã bán hơn 10 đơn vị và thuộc các đơn hàng đã giao.
        </p>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 mb-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full p-4 pl-12 bg-gray-100 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          />
          <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500" />
        </div>
        <button
          onClick={handleSortToggle}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
        >
          {sortOrder === 'asc' ? <FaSortAmountUp /> : sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountDown />}
          <span className="font-medium">
            Sắp xếp theo giá {sortOrder === 'asc' ? '(Tăng dần)' : sortOrder === 'desc' ? '(Giảm dần)' : ''}
          </span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-xl">
            Không có sản phẩm nào phù hợp với tiêu chí.
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.section
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
              >
                {displayProducts.map((product) => (
                  <motion.div
                    key={product.ProductId}
                    className="relative bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-200 hover:border-blue-500"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleProductClick(product.ProductId)}
                  >
                    <motion.div
                      className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white py-1 px-4 rounded-full text-xs font-semibold shadow-md"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Hot
                    </motion.div>

                    <div className="relative">
                      <img
                        src={product.ImageUrl || 'https://via.placeholder.com/350x350'}
                        alt={product.Name}
                        className="w-full h-56 object-cover rounded-lg mb-4 group-hover:opacity-80 transition-all duration-300"
                      />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <button
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.ProductId);
                          }}
                        >
                          <FaEye />
                          Xem chi tiết
                        </button>
                      </motion.div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">{product.Name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.Description}</p>
                    <p className="text-lg font-bold text-blue-600 mb-4">{product.Price.toLocaleString()} VNĐ</p>
                    <p className="text-sm text-gray-500 mb-4">Đã bán: {product.TotalSold} sản phẩm</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(product);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md"
                    >
                      Mua Ngay
                    </button>
                  </motion.div>
                ))}
              </motion.section>
            </AnimatePresence>

            <div className="flex justify-center items-center gap-6">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`p-4 rounded-full text-white transition-all duration-300 shadow-lg ${
                  currentIndex === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                }`}
              >
                <FaArrowLeft />
              </button>
              <div className="flex gap-3">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      Math.floor(currentIndex / productsPerPage) === index ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    whileHover={{ scale: 1.3 }}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={currentIndex >= filteredProducts.length - productsPerPage}
                className={`p-4 rounded-full text-white transition-all duration-300 shadow-lg ${
                  currentIndex >= filteredProducts.length - productsPerPage
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                }`}
              >
                <FaArrowRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HotPage;