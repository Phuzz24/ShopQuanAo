import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaInfoCircle, FaArrowLeft, FaSpinner, FaTag, FaSearch, FaShareAlt, FaHeart, FaReply } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { token, user } = useUser();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState({}); // Lưu trữ nội dung phản hồi cho từng đánh giá

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error('Không thể tải thông tin sản phẩm');
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Không thể tải thông tin sản phẩm');

        const detailedSpecs = data.product.DetailedSpecs
          ? data.product.DetailedSpecs.split(';').filter(spec => spec.trim())
          : [];

        setProduct({
          ...data.product,
          id: parseInt(data.product.ProductId, 10),
          detailedSpecs,
          images: data.product.images || ['https://via.placeholder.com/500?text=No+Image'],
        });

        if (token) {
          await fetch('http://localhost:5000/api/recently-viewed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId: parseInt(id, 10) }),
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(error.message, { autoClose: 2000 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/${id}`);
        if (!response.ok) throw new Error('Không thể tải danh sách bình luận');
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Không thể tải danh sách bình luận');
        setReviews(data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error(error.message, { autoClose: 2000 });
      }
    };
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/related/${id}`);
        if (!response.ok) throw new Error('Không thể tải sản phẩm liên quan');
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Không thể tải sản phẩm liên quan');
        setRelatedProducts(data.relatedProducts || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
        toast.error(error.message, { autoClose: 2000 });
        setRelatedProducts([]);
      }
    };
    fetchRelatedProducts();
  }, [id]);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/recently-viewed', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm đã xem');
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Không thể tải danh sách sản phẩm đã xem');
        setRecentlyViewed(data.recentlyViewed.filter(item => item.ProductId !== parseInt(id)));
      } catch (error) {
        console.error('Error fetching recently viewed products:', error);
        toast.error(error.message, { autoClose: 2000 });
      }
    };
    fetchRecentlyViewed();
  }, [id, token]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá!', { autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/discount/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Mã giảm giá không hợp lệ!');
      }

      setDiscountPercentage(data.discountPercentage);
      setDiscountMessage(data.message);
      toast.success(data.message, { autoClose: 2000 });
    } catch (error) {
      console.error('Error applying discount:', error);
      setDiscountPercentage(0);
      setDiscountMessage(error.message);
      toast.error(error.message, { autoClose: 2000 });
    }
  };

  const getDiscountedPrice = () => {
    if (!product) return 0;
    const basePrice = product.DiscountedPrice || product.Price;
    const discount = discountPercentage / 100;
    return basePrice * (1 - discount);
  };

  const handleAddToCart = (productToAdd, qty = quantity) => {
    if (qty < 1) {
      toast.error('Số lượng phải lớn hơn 0!', { autoClose: 2000 });
      return;
    }
    if (productToAdd.Stock === 0) {
      toast.error('Sản phẩm hiện đã hết hàng!', { autoClose: 2000 });
      return;
    }

    const item = {
      id: parseInt(productToAdd.id || productToAdd.ProductId, 10),
      Name: productToAdd.Name,
      price: productToAdd.Price,
      discountedPrice: productToAdd.DiscountedPrice || productToAdd.Price,
      image: productToAdd.images[0],
      quantity: qty,
      appliedDiscountCode: discountCode,
    };
    addToCart(item);
    toast.success('Đã thêm vào giỏ hàng!', { autoClose: 2000 });
  };

  const handleBuyNow = () => {
    if (quantity < 1) {
      toast.error('Số lượng phải lớn hơn 0!', { autoClose: 2000 });
      return;
    }
    if (product.Stock === 0) {
      toast.error('Sản phẩm hiện đã hết hàng!', { autoClose: 2000 });
      return;
    }
    if (!token) {
      toast.error('Vui lòng đăng nhập để tiếp tục!', { autoClose: 2000 });
      navigate('/login');
      return;
    }

    const productToAdd = {
      id: parseInt(product.id, 10),
      Name: product.Name,
      price: product.Price,
      discountedPrice: getDiscountedPrice(),
      image: product.images[0],
      quantity,
      appliedDiscountCode: discountCode,
    };
    addToCart(productToAdd);
    navigate('/cart');
  };

  const handleAddComment = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để bình luận!', { autoClose: 2000 });
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Vui lòng nhập bình luận!', { autoClose: 2000 });
      return;
    }

    if (!selectedRating) {
      toast.error('Vui lòng chọn số sao đánh giá!', { autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: parseInt(id, 10),
          rating: selectedRating,
          comment: newComment,
        }),
      });

      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', { autoClose: 2000 });
        navigate('/login');
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Không thể gửi bình luận');
      }

      const newReview = {
        reviewId: data.reviewId,
        productId: parseInt(id, 10),
        userId: user.UserId,
        username: user.Username,
        rating: selectedRating,
        comment: newComment,
        createdAt: moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss'),
        replies: [],
      };
      setReviews([newReview, ...reviews]);
      setNewComment('');
      setSelectedRating(null);
      toast.success('Bình luận đã được gửi!', { autoClose: 2000 });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.message, { autoClose: 2000 });
    }
  };

  const handleAddReply = async (reviewId) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để trả lời!', { autoClose: 2000 });
      navigate('/login');
      return;
    }
  
    const text = replyText[reviewId]?.trim();
    if (!text) {
      toast.error('Vui lòng nhập nội dung trả lời!', { autoClose: 2000 });
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/reviews/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewId,
          replyText: text,
        }),
      });
  
      // Kiểm tra Content-Type của phản hồi
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Phản hồi từ server không phải JSON');
      }
  
      const data = await response.json();
  
      if (response.status === 401 || response.status === 403) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', { autoClose: 2000 });
        navigate('/login');
        return;
      }
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Không thể gửi phản hồi');
      }
  
      const updatedReviews = reviews.map(review => {
        if (review.reviewId === reviewId) {
          return {
            ...review,
            replies: [
              ...review.replies,
              {
                replyId: data.replyId,
                userId: user.UserId,
                username: user.Username,
                replyText: text,
                createdAt: moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss'),
              },
            ],
          };
        }
        return review;
      });
  
      setReviews(updatedReviews);
      setReplyText({ ...replyText, [reviewId]: '' });
      toast.success('Phản hồi đã được gửi!', { autoClose: 2000 });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error(error.message, { autoClose: 2000 });
    }
  };
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Vui lòng nhập từ khóa tìm kiếm!', { autoClose: 2000 });
      return;
    }
    navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Đã sao chép liên kết sản phẩm!', { autoClose: 2000 });
    });
  };

  const handleAddToWishlist = async () => {
    if (!token) {
      console.log('No token found, redirecting to login');
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích!', { autoClose: 2000 });
      navigate('/login');
      return;
    }
  
    console.log(`Adding product ${id} to wishlist for user with token: ${token}`);
    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: parseInt(id, 10) }),
      });
  
      console.log(`Add to wishlist response status: ${response.status}`);
      const data = await response.json();
      console.log('Add to wishlist response data:', data);
  
      if (!response.ok) {
        console.error(`Failed to add product ${id} to wishlist, Status: ${response.status}, Response:`, data);
        throw new Error(data.message || 'Không thể thêm vào danh sách yêu thích');
      }
  
      if (!data.success) {
        console.error(`Failed to add product ${id} to wishlist:`, data.message);
        throw new Error(data.message || 'Không thể thêm vào danh sách yêu thích');
      }
  
      toast.success(data.message, { autoClose: 2000 });
    } catch (error) {
      console.error(`Error adding product ${id} to wishlist:`, error.message, error.stack);
      toast.error(error.message, { autoClose: 2000 });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <p className="text-xl text-gray-600">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const isOnSale = product.DiscountPercentage > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12">
      <div className="container mx-auto p-6 md:p-8">
        {/* Thanh tìm kiếm và nút quay lại */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            onClick={() => navigate(-1)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
          >
            <FaArrowLeft />
            <span>Quay lại</span>
          </motion.button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <motion.button
              onClick={handleSearch}
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              <FaSearch />
            </motion.button>
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-xl shadow-lg"
        >
          {/* Hình ảnh sản phẩm */}
          <div className="md:w-1/2 relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden"
            >
              <img
                src={product.images[currentImage]}
                alt={product.Name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
              {isOnSale && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{product.DiscountPercentage}%
                </span>
              )}
            </motion.div>
            <div className="flex justify-center mt-4 gap-3">
              {product.images.map((image, index) => (
                <motion.img
                  key={index}
                  src={image}
                  alt={`thumbnail-${index}`}
                  whileHover={{ scale: 1.1 }}
                  className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 ${currentImage === index ? 'border-indigo-500' : 'border-transparent'}`}
                  onClick={() => setCurrentImage(index)}
                />
              ))}
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              {product.Name}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-yellow-500 flex items-center gap-1">
                {Array(Math.round(product.averageRating || 0)).fill(<FaStar />)}
                {Array(5 - Math.round(product.averageRating || 0)).fill(<FaStar className="text-gray-300" />)}
              </p>
              <p className="text-sm text-gray-600">
                ({product.averageRating?.toFixed(1) || 0} / 5) - {product.reviewCount || 0} đánh giá
              </p>
            </div>
            <div>
              {isOnSale ? (
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-indigo-600">
                    {(product.DiscountedPrice || 0).toLocaleString('vi-VN')} ₫
                  </p>
                  <p className="text-lg text-gray-500 line-through">
                    {(product.Price || 0).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              ) : discountPercentage > 0 ? (
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-indigo-600">
                    {getDiscountedPrice().toLocaleString('vi-VN')} ₫
                  </p>
                  <p className="text-lg text-gray-500 line-through">
                    {(product.Price || 0).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-indigo-600">
                  {(product.Price || 0).toLocaleString('vi-VN')} ₫
                </p>
              )}
            </div>
            <p className="text-lg text-gray-600">{product.Description}</p>
            <p className="text-lg font-semibold text-gray-700">
              Trạng thái: <span className={product.Stock > 0 ? 'text-green-600' : 'text-red-600'}>{product.status}</span>
            </p>

            <div className="flex items-center space-x-4">
              <label className="text-lg font-semibold text-gray-700">Số lượng:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 p-2 border border-gray-300 rounded-lg text-center"
                disabled={product.Stock === 0}
              />
            </div>

            {!isOnSale && (
              <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
                <div className="flex items-center space-x-2 mb-2">
                  <FaTag className="text-yellow-500" />
                  <p className="text-lg font-semibold text-gray-800">
                    Sử dụng mã giảm giá để tiết kiệm hơn!
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Nhập mã như <span className="font-bold">SALE10</span> hoặc{' '}
                  <span className="font-bold">SUMMER20</span> để nhận ưu đãi lên đến 20%. Kiểm tra email hoặc trang khuyến mãi để lấy mã!
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="discount"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập mã giảm giá (VD: SALE10)"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
                  >
                    Áp dụng
                  </button>
                </div>
                {discountMessage && (
                  <p className={`mt-2 ${discountPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {discountMessage}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <motion.button
                onClick={() => handleAddToCart(product)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition duration-300 ${
                  product.Stock > 0
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                disabled={product.Stock === 0}
              >
                <FaShoppingCart /> Thêm vào Giỏ Hàng
              </motion.button>
              <motion.button
                onClick={handleBuyNow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition duration-300 ${
                  product.Stock > 0
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                disabled={product.Stock === 0}
              >
                <FaShoppingCart /> Mua Ngay
              </motion.button>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
              >
                <FaShareAlt /> Chia sẻ
              </motion.button>
              <motion.button
                onClick={handleAddToWishlist}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
              >
                <FaHeart /> Yêu thích
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tab Thông Số Kỹ Thuật và Đánh Giá */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <div className="flex gap-4 mb-6">
            {['details', 'reviews'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-lg border-2 border-indigo-600 flex items-center gap-2 ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'
                }`}
              >
                {tab === 'details' ? <FaInfoCircle /> : <FaStar />}
                {tab === 'details' ? 'Thông Số Kỹ Thuật' : 'Đánh Giá'}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông Số Kỹ Thuật</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {product.detailedSpecs.length > 0 ? (
                    product.detailedSpecs.map((spec, index) => (
                      <li key={index}>{spec}</li>
                    ))
                  ) : (
                    <li>Không có thông số kỹ thuật</li>
                  )}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <motion.div
                      key={review.reviewId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-4 rounded-lg shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                          {review.username[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-medium text-gray-800">{review.username}</p>
                              <p className="text-sm text-yellow-500 flex items-center gap-1">
                                {Array(review.rating).fill(<FaStar />)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500">{review.createdAt}</p>
                          </div>
                          <p className="text-gray-700 mt-2">{review.comment}</p>

                          {/* Hiển thị các phản hồi */}
                          {review.replies && review.replies.length > 0 && (
  <div className="mt-4 pl-6 border-l-2 border-gray-200">
    {review.replies.map(reply => {
      console.log(`[ProductDetailPage] Displaying reply: replyId=${reply.replyId}, userId=${reply.userId}, role=${reply.role}, currentUserId=${user?.UserId}, currentUserRole=${user?.Role}`);
      return (
        <div key={reply.replyId} className="mt-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              {reply.username[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {reply.username}
                {reply.userId === user?.UserId ? (
                  <span className="text-xs text-gray-500"> (Bạn)</span>
                ) : reply.role === 'Admin' ? (
                  <span className="text-xs text-gray-500"> (Quản lý)</span>
                ) : null}
              </p>
              <p className="text-gray-700">{reply.replyText}</p>
              <p className="text-xs text-gray-500">{reply.createdAt}</p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
                          {/* Form trả lời */}
                          <div className="mt-4 flex items-center gap-3">
                            <textarea
                              value={replyText[review.reviewId] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [review.reviewId]: e.target.value })}
                              placeholder="Viết phản hồi của bạn..."
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <motion.button
                              onClick={() => handleAddReply(review.reviewId)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 flex items-center gap-2"
                            >
                              <FaReply /> Gửi
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-600">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="w-full p-4 border border-gray-300 rounded-lg mt-4"
                />
                <motion.button
                  onClick={handleAddComment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                  Gửi Bình Luận
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Đánh giá sản phẩm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Đánh Giá Sản Phẩm</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {['Rất Tệ', 'Tệ', 'Tạm ổn', 'Tốt', 'Rất Tốt'].map((rating, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedRating(index + 1)}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 border-2 border-yellow-500 rounded-lg flex items-center gap-2 ${
                  selectedRating === index + 1 ? 'bg-yellow-500 text-white' : 'bg-transparent text-gray-700'
                }`}
              >
                <FaStar className="text-yellow-400" /> {rating}
              </motion.button>
            ))}
          </div>
          {selectedRating && (
            <p className="mt-4 text-lg text-gray-800">
              Bạn đã đánh giá: <span className="font-bold text-yellow-500">{selectedRating} sao</span>
            </p>
          )}
        </motion.div>

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Sản Phẩm Liên Quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.ProductId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
                  className="relative bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-[350px]"
                  onClick={() => navigate(`/product-detail/${relatedProduct.ProductId}`)}
                >
                  <div className="relative w-full h-48 mb-4">
                    <img
                      src={relatedProduct.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
                      alt={relatedProduct.Name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {relatedProduct.DiscountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{relatedProduct.DiscountPercentage}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-grow">{relatedProduct.Name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    {relatedProduct.DiscountPercentage > 0 ? (
                      <>
                        <p className="text-lg font-bold text-indigo-600">
                          {(relatedProduct.DiscountedPrice || 0).toLocaleString('vi-VN')} ₫
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          {(relatedProduct.Price || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-indigo-600">
                        {(relatedProduct.Price || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    )}
                  </div>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(relatedProduct, 1);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`mt-4 w-full py-2 rounded-lg flex items-center justify-center gap-2 transition duration-300 ${
                      relatedProduct.Stock > 0
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                    disabled={relatedProduct.Stock === 0}
                  >
                    <FaShoppingCart /> Thêm vào giỏ
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sản phẩm đã xem gần đây */}
        {recentlyViewed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Sản Phẩm Đã Xem Gần Đây
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recentlyViewed.map((viewedProduct, index) => (
                <motion.div
                  key={viewedProduct.ProductId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
                  className="relative bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-[350px]"
                  onClick={() => navigate(`/product-detail/${viewedProduct.ProductId}`)}
                >
                  <div className="relative w-full h-48 mb-4">
                    <img
                      src={viewedProduct.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
                      alt={viewedProduct.Name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {viewedProduct.DiscountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{viewedProduct.DiscountPercentage}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-grow">{viewedProduct.Name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    {viewedProduct.DiscountPercentage > 0 ? (
                      <>
                        <p className="text-lg font-bold text-indigo-600">
                          {(viewedProduct.DiscountedPrice || 0).toLocaleString('vi-VN')} ₫
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          {(viewedProduct.Price || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-indigo-600">
                        {(viewedProduct.Price || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    )}
                  </div>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(viewedProduct, 1);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`mt-4 w-full py-2 rounded-lg flex items-center justify-center gap-2 transition duration-300 ${
                      viewedProduct.Stock > 0
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                    disabled={viewedProduct.Stock === 0}
                  >
                    <FaShoppingCart /> Thêm vào giỏ
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;