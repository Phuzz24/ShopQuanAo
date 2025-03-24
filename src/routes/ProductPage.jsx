import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Filter, Star, Heart, Smartphone, Laptop, ChevronDown, SlidersHorizontal,
  Check, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';
import { useCart } from "../context/CartContext";

const ProductPage = () => {
  const { category: categoryFromParams } = useParams(); // Lấy category từ URL params (nếu có)
  const location = useLocation(); // Lấy query parameter từ URL
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Lấy query parameter từ URL
  const query = new URLSearchParams(location.search);
  const initialSearchTerm = query.get('search') || '';
  const initialCategory = query.get('category') || categoryFromParams || ''; // Lấy category từ query hoặc params

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory); // Khởi tạo categoryFilter từ URL
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(8);
  const { addToCart } = useCart();

  const brandColors = [
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-green-100', text: 'text-green-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-pink-100', text: 'text-pink-600' },
    { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    { bg: 'bg-red-100', text: 'text-red-600' },
    { bg: 'bg-teal-100', text: 'text-teal-600' },
    { bg: 'bg-orange-100', text: 'text-orange-600' },
  ];

  const getBrandColor = (brand) => {
    const hash = Array.from(brand).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % brandColors.length;
    return brandColors[index];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Lấy danh sách sản phẩm với category từ query parameter
        const productsResponse = await fetch(`http://localhost:5000/api/products1${initialCategory ? `?category=${encodeURIComponent(initialCategory)}` : ''}`);
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        console.log('Products from API:', productsData);
        const nonSaleProducts = productsData.products.filter(product => !product.DiscountPercentage || product.DiscountPercentage === 0);
        setProducts(nonSaleProducts);
        setFilteredProducts(nonSaleProducts);

        const categoriesResponse = await fetch('http://localhost:5000/api/categories1');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        const brandsResponse = await fetch('http://localhost:5000/api/brands');
        if (!brandsResponse.ok) throw new Error('Failed to fetch brands');
        const brandsData = await brandsResponse.json();
        setBrands(brandsData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialCategory]); // Gọi lại khi initialCategory thay đổi

  useEffect(() => {
    let filtered = products.filter(product => {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter ? product.category === categoryFilter : true) &&
        (brandFilter ? product.brand === brandFilter : true) &&
        (statusFilter ? product.status === statusFilter : true) &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1]
      );
    });

    switch (sortBy) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    setFilteredProducts(filtered);
    setDisplayedCount(8);
  }, [searchTerm, categoryFilter, brandFilter, statusFilter, priceRange, products, sortBy]);

  // Cập nhật searchTerm và categoryFilter khi query parameter thay đổi
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const newSearchTerm = query.get('search') || '';
    const newCategory = query.get('category') || categoryFromParams || '';
    setSearchTerm(newSearchTerm);
    setCategoryFilter(newCategory);
  }, [location.search, categoryFromParams]);

  const handleAddToCart = (product) => {
    const productToAdd = {
      id: parseInt(product.id, 10),
      name: product.name,
      price: product.price,
      image: product.image || 'https://via.placeholder.com/500?text=No+Image',
      quantity: 1,
      Name: product.name,
    };
    console.log('Product to add:', productToAdd);
    addToCart(productToAdd);
  };

  const handleLoadMore = () => {
    setDisplayedCount(filteredProducts.length);
  };

  const displayProducts = filteredProducts.slice(0, displayedCount);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight"
          >
            Sản Phẩm Công Nghệ Đỉnh Cao
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.9 }} 
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl font-light"
          >
            Khám phá những thiết bị hiện đại với giá trị vượt trội
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="bg-white rounded-3xl shadow-xl p-6 mb-10 -mt-16 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full focus:ring-2 focus:ring-blue-500 border-none shadow-sm transition-all duration-300"
                placeholder="Tìm kiếm sản phẩm..."
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm flex items-center gap-2"
              >
                {viewMode === 'grid' ? 'Danh sách' : 'Lưới'}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
              >
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="name">Tên A-Z</option>
              </select>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Bộ lọc
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại sản phẩm</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Tất cả</option>
                    {categories.map(category => (
                      <option key={category.CategoryId} value={category.Name}>
                        {category.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu</label>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Tất cả</option>
                    {brands.map(brand => (
                      <option key={brand.BrandId} value={brand.Name}>
                        {brand.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Tất cả</option>
                    <option value="Còn hàng">Còn hàng</option>
                    <option value="Hết hàng">Hết hàng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-1/2 p-3 bg-gray-50 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Từ"
                    />
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-1/2 p-3 bg-gray-50 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Đến"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid ${
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
          } gap-8`}
        >
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : displayProducts.length > 0 ? (
            displayProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
                className={`bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full ${
                  viewMode === 'list' ? 'flex-row' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-1/3' : ''}`}>
                  <Link to={`/product-detail/${product.id}`}>
                    <img
                      src={product.image || 'https://via.placeholder.com/500?text=No+Image'}
                      alt={product.name}
                      className="w-full h-72 object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </Link>
                  <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all">
                    <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>
                  {product.status === 'Còn hàng' ? (
                    <span className="absolute top-4 left-4 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm shadow-md whitespace-nowrap">
                      Còn hàng
                    </span>
                  ) : (
                    <span className="absolute top-4 left-4 px-4 py-1 bg-red-500 text-white rounded-full text-sm shadow-md whitespace-nowrap">
                      Hết hàng
                    </span>
                  )}
                </div>

                <div className={`p-6 flex flex-col flex-grow ${viewMode === 'list' ? 'w-2/3' : ''}`}>
                  <Link to={`/product-detail/${product.id}`}>
                    <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-2 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">(123 đánh giá)</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        <span className="inline-flex items-baseline whitespace-nowrap">
                          {product.price.toLocaleString('vi-VN')} <span className="ml-1 text-lg font-medium">VNĐ</span>
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-4 py-1 rounded-full text-sm shadow-sm ${getBrandColor(product.brand).bg} ${getBrandColor(product.brand).text} whitespace-nowrap`}>
                        {product.brand}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-16"
            >
              <Search className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </motion.div>
          )}
        </motion.div>

        {filteredProducts.length > 8 && displayedCount < filteredProducts.length && (
          <div className="text-center mt-8">
            <motion.button
              onClick={handleLoadMore}
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl transition-all shadow-lg font-medium overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative flex items-center justify-center gap-2">
                Xem thêm
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;