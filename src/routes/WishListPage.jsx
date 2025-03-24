import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash, FaSpinner, FaCartPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { token } = useUser();
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        console.log('No token found, redirecting to login');
        toast.error('Vui lòng đăng nhập để xem danh sách yêu thích!', { autoClose: 2000 });
        navigate('/login');
        return;
      }

      console.log(`Fetching wishlist with token: ${token}`);
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/wishlist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`Fetch wishlist response status: ${response.status}`);
        const data = await response.json();
        console.log('Fetch wishlist response data:', data);

        if (!response.ok) {
          console.error(`Failed to fetch wishlist, Status: ${response.status}, Response:`, data);
          throw new Error(data.message || 'Không thể tải danh sách yêu thích');
        }

        if (!data.success) {
          console.error(`Failed to fetch wishlist:`, data.message);
          throw new Error(data.message || 'Không thể tải danh sách yêu thích');
        }

        setWishlist(data.wishlist || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error.message, error.stack);
        toast.error(error.message, { autoClose: 2000 });
        setWishlist([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlist();
  }, [token, navigate]);

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Sản phẩm hiện đã hết hàng!', { autoClose: 2000 });
      return;
    }

    const item = {
      id: product.productId,
      Name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice || product.price,
      image: product.images[0],
      quantity: 1,
    };
    addToCart(item);
    toast.success('Đã thêm vào giỏ hàng!', { autoClose: 2000 });
  };

  const handleRemoveFromWishlist = async (wishlistId) => {
    console.log(`Removing wishlist item ${wishlistId} with token: ${token}`);
    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${wishlistId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`Remove from wishlist response status: ${response.status}`);
      const data = await response.json();
      console.log('Remove from wishlist response data:', data);

      if (!response.ok) {
        console.error(`Failed to remove wishlist item ${wishlistId}, Status: ${response.status}, Response:`, data);
        throw new Error(data.message || 'Không thể xóa sản phẩm khỏi danh sách yêu thích');
      }

      if (!data.success) {
        console.error(`Failed to remove wishlist item ${wishlistId}:`, data.message);
        throw new Error(data.message || 'Không thể xóa sản phẩm khỏi danh sách yêu thích');
      }

      setWishlist(wishlist.filter(item => item.wishlistId !== wishlistId));
      toast.success(data.message, { autoClose: 2000 });
    } catch (error) {
      console.error(`Error removing wishlist item ${wishlistId}:`, error.message, error.stack);
      toast.error(error.message, { autoClose: 2000 });
    }
  };

  // Thêm tất cả sản phẩm vào giỏ hàng
  const handleAddAllToCart = () => {
    let addedCount = 0;
    let outOfStockCount = 0;

    wishlist.forEach((item) => {
      if (item.stock === 0) {
        outOfStockCount++;
        return;
      }

      const productToAdd = {
        id: item.productId,
        Name: item.name,
        price: item.price,
        discountedPrice: item.discountedPrice || item.price,
        image: item.images[0],
        quantity: 1,
      };
      addToCart(productToAdd);
      addedCount++;
    });

    if (addedCount > 0) {
      toast.success(`Đã thêm ${addedCount} sản phẩm vào giỏ hàng!`, { autoClose: 2000 });
    }
    if (outOfStockCount > 0) {
      toast.warning(`${outOfStockCount} sản phẩm đã hết hàng và không được thêm!`, { autoClose: 2000 });
    }
    if (addedCount === 0 && outOfStockCount === 0) {
      toast.info('Không có sản phẩm nào để thêm vào giỏ hàng!', { autoClose: 2000 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <FaSpinner className="animate-spin text-4xl text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12">
      <div className="container mx-auto p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            Danh Sách Yêu Thích
          </h1>
          <p className="text-lg text-gray-600 mt-2">Những sản phẩm bạn yêu thích nhất</p>
        </motion.div>

        {wishlist.length > 0 ? (
          <>
            {/* Nút Thêm Tất Cả Vào Giỏ Hàng */}
            <div className="flex justify-end mb-6">
              <motion.button
                onClick={handleAddAllToCart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition duration-300 shadow-md"
              >
                <FaCartPlus /> Thêm Tất Cả Vào Giỏ Hàng
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.wishlistId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
                  className="relative bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-[400px]"
                >
                  <div
                    className="relative w-full h-48 mb-4 cursor-pointer"
                    onClick={() => navigate(`/product-detail/${item.productId}`)}
                  >
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {item.discountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{item.discountPercentage}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-grow">{item.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    {item.discountPercentage > 0 ? (
                      <>
                        <p className="text-lg font-bold text-yellow-500">
                          {(item.discountedPrice || 0).toLocaleString('vi-VN')} ₫
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          {(item.price || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-yellow-500">
                        {(item.price || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <motion.button
                      onClick={() => handleAddToCart(item)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition duration-300 ${
                        item.stock > 0
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 hover:from-yellow-500 hover:to-yellow-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={item.stock === 0}
                    >
                      <FaShoppingCart /> Thêm vào giỏ
                    </motion.button>
                    <motion.button
                      onClick={() => handleRemoveFromWishlist(item.wishlistId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600"
          >
            <FaHeart className="text-6xl text-yellow-400 mx-auto mb-4" />
            <p className="text-xl">Danh sách yêu thích của bạn đang trống.</p>
            <p className="mt-2">Hãy thêm sản phẩm yêu thích để hiển thị tại đây!</p>
            <motion.button
              onClick={() => navigate('/product')}
              whileHover={{ scale: 1.05 }}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 rounded-lg hover:from-yellow-500 hover:to-yellow-600"
            >
              Khám phá sản phẩm
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;