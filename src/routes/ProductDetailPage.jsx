  import React, { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { FaShoppingCart, FaStar, FaInfoCircle, FaArrowLeft, FaSpinner, FaTag } from 'react-icons/fa';
  import { motion, AnimatePresence } from 'framer-motion';
  import { useCart } from '../context/CartContext';
  import { useUser } from '../context/UserContext';
  import { toast } from 'react-toastify';

  const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { token } = useUser();

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
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error(error.message, { autoClose: 2000 });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }, [id]);

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

    const handleAddToCart = () => {
      if (quantity < 1) {
        toast.error('Số lượng phải lớn hơn 0!', { autoClose: 2000 });
        return;
      }
      if (product.Stock === 0) {
        toast.error('Sản phẩm hiện đã hết hàng!', { autoClose: 2000 });
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
      console.log('Product before adding to cart:', productToAdd);
      addToCart(productToAdd);
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
      navigate('/cart'); // Chuyển hướng đến trang giỏ hàng
    };

    const handleAddComment = () => {
      if (!newComment.trim()) {
        toast.error('Vui lòng nhập bình luận!', { autoClose: 2000 });
        return;
      }
      const newReview = { user: 'Bạn', rating: selectedRating || 3, comment: newComment };
      setReviews([newReview, ...reviews]);
      setNewComment('');
      setSelectedRating(null);
      toast.success('Bình luận đã được gửi!', { autoClose: 2000 });
    };

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-100">
          <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        </div>
      );
    }

    if (!product) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-100">
          <p className="text-xl text-gray-600">Không tìm thấy sản phẩm</p>
        </div>
      );
    }

    const isOnSale = product.DiscountPercentage > 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 py-12">
        <div className="container mx-auto p-6 md:p-8">
          <motion.button
            onClick={() => navigate(-1)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
          >
            <FaArrowLeft />
            <span>Quay lại</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row gap-8"
          >
            <div className="md:w-1/2">
              <motion.img
                key={currentImage}
                src={product.images[currentImage]}
                alt={product.Name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-[400px] md:h-[500px] object-cover rounded-xl shadow-lg"
              />
              <div className="flex justify-center mt-4 gap-4">
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

            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{product.Name}</h2>
              <div>
                {isOnSale ? (
                  <div>
                    <p className="text-xl text-gray-  line-through">
                      {product.Price.toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-2xl font-semibold text-indigo-600">
                      {product.DiscountedPrice.toLocaleString('vi-VN')} ₫
                      <span className="text-sm text-green-600 ml-2">(-{product.DiscountPercentage}%)</span>
                    </p>
                  </div>
                ) : discountPercentage > 0 ? (
                  <div>
                    <p className="text-xl text-gray-500 line-through">
                      {product.Price.toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-2xl font-semibold text-indigo-600">
                      {getDiscountedPrice().toLocaleString('vi-VN')} ₫
                      <span className="text-sm text-green-600 ml-2">(-{discountPercentage}%)</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-indigo-600">
                    {product.Price.toLocaleString('vi-VN')} ₫
                  </p>
                )}
              </div>
              <p className="text-lg text-gray-600">{product.Description}</p>
              <p className="text-lg font-semibold text-gray-700">
                Trạng thái: <span className={product.Stock > 0 ? 'text-green-600' : 'text-red-600'}>{product.Stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
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
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition duration-300 ${
                    product.Stock > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
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
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  disabled={product.Stock === 0}
                >
                  <FaShoppingCart /> Mua Ngay
                </motion.button>
              </div>
            </div>
          </motion.div>

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
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-lg shadow-md flex items-start gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                          {review.user[0]}
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-800">{review.user}</p>
                          <p className="text-sm text-yellow-500 flex items-center gap-1">
                            {Array(review.rating).fill(<FaStar />)}
                          </p>
                          <p className="text-gray-700 mt-2">{review.comment}</p>
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
        </div>
      </div>
    );
  };

  export default ProductDetailPage;