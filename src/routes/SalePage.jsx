import React, { useState, useEffect } from 'react';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaClock, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const SalePage = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedCount, setDisplayedCount] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const productsPerLoad = 8;
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sale-products');
        if (response.data.success) {
          console.log('[SalePage] API Response:', response.data.products);
          const transformedProducts = response.data.products.map(product => {
            console.log(`[SalePage] Product ${product.ProductId} - Stock: ${product.Stock}`);
            return {
              id: product.ProductId,
              name: product.Name,
              price: product.Price,
              salePrice: product.DiscountedPrice,
              description: product.Description,
              image: product.ImageUrl || 'https://via.placeholder.com/350x350',
              category: 'Điện thoại',
              status: product.Stock > 0 ? 'Còn hàng' : 'Hết hàng',
            };
          });
          setProducts(transformedProducts);
          setFilteredProducts(transformedProducts);
        } else {
          console.error('Failed to fetch sale products:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching sale products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
    startCountdown();
  }, []);

  useEffect(() => {
    let updatedProducts = [...products];

    if (searchTerm) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOrder === 'asc') {
      updatedProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortOrder === 'desc') {
      updatedProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    }

    setFilteredProducts(updatedProducts);
    setDisplayedCount(productsPerLoad);
  }, [searchTerm, sortOrder, products]);

  const displayProducts = filteredProducts.slice(0, displayedCount);

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + productsPerLoad);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortToggle = () => {
    if (sortOrder === '') setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder('');
  };

  const handleAddToCart = (product) => {
    const productToAdd = {
      id: parseInt(product.id, 10),
      name: product.name,
      price: product.salePrice || product.price, // Sử dụng salePrice nếu có
      image: product.image || 'https://via.placeholder.com/500?text=No+Image',
      quantity: 1,
      Name: product.name,
    };
    console.log('Product to add:', productToAdd);
    addToCart(productToAdd);
  };

  const startCountdown = () => {
    const targetDate = new Date('2025-04-15T23:59:59');
    const interval = setInterval(() => {
      const now = new Date();
      const timeDifference = targetDate - now;

      if (timeDifference <= 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-300 text-xl animate-pulse">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-orange-400 relative overflow-hidden">
      {/* Tiêu đề và đồng hồ đếm ngược */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-16 max-w-5xl mx-auto px-4 relative z-10 pt-20"
      >
        <h2 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-400 mb-4 drop-shadow-lg">
          Flash Sale Siêu Hot!
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-6 font-light drop-shadow-md"
        >
          Cơ hội có hạn - Mua ngay trước khi hết thời gian!
        </motion.p>

        {/* Đồng hồ đếm ngược */}
        <motion.div
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 px-8 rounded-xl shadow-2xl inline-flex items-center gap-4"
          animate={{ scale: [1, 1.03, 1], boxShadow: ['0 0 10px rgba(255, 255, 255, 0.5)', '0 0 20px rgba(255, 255, 255, 0.8)', '0 0 10px rgba(255, 255, 255, 0.5)'] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FaClock className="text-3xl text-yellow-200 drop-shadow-md" />
          <div className="flex gap-4">
            {['days', 'hours', 'minutes', 'seconds'].map((unit, index) => (
              <div key={unit} className="flex flex-col items-center">
                <motion.span
                  className="text-2xl md:text-3xl font-bold tracking-wide"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: index * 0.2 }}
                >
                  {countdown[unit]}
                </motion.span>
                <span className="text-xs uppercase text-yellow-200">{unit.charAt(0).toUpperCase()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Tìm kiếm và sắp xếp */}
      <div className="max-w-7xl mx-auto px-4 mb-12 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full p-4 pl-12 bg-white/90 backdrop-blur-md text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 shadow-md hover:shadow-lg"
          />
          <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-orange-400" />
        </div>
        <motion.button
          onClick={handleSortToggle}
          className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-xl shadow-lg overflow-hidden group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          <span className="relative flex items-center gap-2">
            {sortOrder === 'asc' ? <FaSortAmountUp /> : sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountDown />}
            <span className="font-medium">
              Sắp xếp theo giá {sortOrder === 'asc' ? '(Tăng dần)' : sortOrder === 'desc' ? '(Giảm dần)' : ''}
            </span>
          </span>
        </motion.button>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white py-12 text-xl drop-shadow-md"
          >
            Hiện tại không có sản phẩm nào đang sale.
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12"
              >
                {displayProducts.map((product, index) => (
                  <motion.div
                    key={`${product.id}-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative group"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)' }}
                  >
                    {/* Badge "Flash Sale" */}
                    <motion.div
                      className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-200 to-orange-400 text-white py-1 px-4 rounded-full text-xs font-semibold shadow-md"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Flash Sale
                    </motion.div>
                    <ProductCard
                      product={product}
                      showDiscount={true}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </motion.div>
                ))}
              </motion.section>
            </AnimatePresence>

            {/* Nút "Xem thêm" */}
            {displayedCount < filteredProducts.length && (
              <div className="text-center mt-8">
                <motion.button
                  onClick={handleLoadMore}
                  className="relative px-8 py-3 bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-xl shadow-lg font-medium overflow-hidden group"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    Xem thêm
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <FaArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SalePage;