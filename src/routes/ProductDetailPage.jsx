import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaInfoCircle, FaSmile } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProductDetailPage = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const navigate = useNavigate(); // Dùng để điều hướng

  const [product, setProduct] = useState(null); // Dữ liệu sản phẩm
  const [selectedRating, setSelectedRating] = useState(null); // Đánh giá sao
  const [newComment, setNewComment] = useState(''); // Bình luận mới của khách hàng
  const [reviews, setReviews] = useState([ // Các bình luận mặc định
    { user: 'John Doe', rating: 5, comment: 'Excellent phone, highly recommend!' },
    { user: 'Jane Smith', rating: 4, comment: 'Great performance but a bit pricey.' },
  ]);
  const [quantity, setQuantity] = useState(1); // Số lượng sản phẩm
  const [currentImage, setCurrentImage] = useState(0); // Hiển thị ảnh sản phẩm hiện tại
  const [activeTab, setActiveTab] = useState('details'); // Tab hiện tại
  const [discountCode, setDiscountCode] = useState(''); // Mã giảm giá
  const [discountMessage, setDiscountMessage] = useState(''); // Thông báo mã giảm giá

  useEffect(() => {
    // Mô phỏng lấy dữ liệu sản phẩm từ API
    setProduct({
      id: 1,
      name: 'iPhone 14 Pro',
      brand: 'Apple',
      category: 'Smartphone',
      price: 999,
      description: 'The latest iPhone 14 Pro with amazing features and design.',
      specs: [
        '6.1-inch Super Retina XDR display',
        'A15 Bionic chip',
        'Pro camera system with 48MP lens',
        '5G capable',
        'Face ID',
      ],
      images: [
        'https://example.com/iphone-14.jpg',
        'https://example.com/iphone-14-2.jpg',
        'https://example.com/iphone-14-3.jpg',
      ],
      promo: 'Giảm 10% cho đơn hàng đầu tiên!',
      detailedSpecs: [
        'Dung lượng bộ nhớ: 128GB',
        'Màu sắc: Đen, Trắng, Vàng',
        'Kích thước màn hình: 6.1 inch',
        'Hệ điều hành: iOS 15',
      ],
    });
  }, []); // Chạy một lần khi component được render

  // Nếu chưa có dữ liệu sản phẩm
  if (!product) {
    return <div>Loading...</div>; // Nếu product chưa có dữ liệu, hiển thị loading
  }

  // Hàm xử lý mã giảm giá
  const handleApplyDiscount = () => {
    if (discountCode === 'SALE10') {
      setDiscountMessage('Mã giảm giá đã được áp dụng. Bạn nhận được 10% giảm giá!');
    } else {
      setDiscountMessage('Mã giảm giá không hợp lệ. Vui lòng thử lại.');
    }
  };

  const handleAddToCart = () => {
    console.log(`Added ${quantity} ${product.name} to the cart`);
  };

  const handleBuyNow = () => {
    console.log(`Buying ${quantity} ${product.name} now`);
    navigate('/checkout');
  };

  const handleImageClick = (index) => {
    setCurrentImage(index); // Cập nhật ảnh chính khi nhấn vào ảnh nhỏ
  };

  const handleAddComment = () => {
    const newReview = { user: 'New User', rating: 3, comment: newComment }; // Tạo một bình luận mới
    setReviews([newReview, ...reviews]); // Thêm vào đầu danh sách bình luận
    setNewComment(''); // Làm rỗng trường nhập bình luận
  };

  return (
    <div className="container mx-auto p-8">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 mb-6"
      >
        Quay lại
      </button>

      

      <div className="flex flex-col md:flex-row gap-10">
        {/* Hình ảnh sản phẩm */}
        <motion.div
          className="md:w-1/2 mb-6 md:mb-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
        >
          <img
            src={product.images[currentImage]}
            alt={product.name}
            className="w-full h-[500px] object-cover rounded-xl shadow-lg"
          />
          <div className="flex justify-center mt-4">
            <button onClick={() => setCurrentImage(currentImage === 0 ? product.images.length - 1 : currentImage - 1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
              &#60;
            </button>
            <button onClick={() => setCurrentImage(currentImage === product.images.length - 1 ? 0 : currentImage + 1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ml-2">
              &#62;
            </button>
          </div>

          {/* Ảnh nhỏ phía dưới */}
          <div className="flex justify-center mt-4 space-x-4">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`thumbnail-${index}`}
                className="w-16 h-16 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-blue-500"
                onClick={() => handleImageClick(index)}
              />
            ))}
          </div>
        </motion.div>

        {/* Thông tin chi tiết sản phẩm */}
        <div className="md:w-1/2">
  {/* Tên sản phẩm và giá */}
  <div className="mb-6">
    <h2 className="text-4xl font-semibold text-gray-800">{product.name}</h2>
    <p className="text-3xl font-bold text-blue-600">{product.price} VND</p>
  </div>

  {/* Mô tả ngắn về sản phẩm */}
  <p className="text-lg text-gray-600 mb-6">{product.description}</p>

  {/* Thông tin khuyến mãi */}
  <div className="bg-yellow-100 p-4 rounded-lg mb-6">
    <p className="text-xl font-semibold text-yellow-700">Ưu đãi đặc biệt:</p>
    <p className="text-gray-700 mt-2">Giảm 10% cho đơn hàng đầu tiên với mã "SALE10". Hãy nhanh tay nhận ngay ưu đãi!</p>
  </div>

  {/* Nhập mã giảm giá */}
  <div className="mb-6">
    <label htmlFor="discount" className="block text-lg font-semibold">Nhập mã giảm giá:</label>
    <input
      type="text"
      id="discount"
      value={discountCode}
      onChange={(e) => setDiscountCode(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg text-lg mb-3"
      placeholder="Mã giảm giá"
    />
    <button
      onClick={handleApplyDiscount}
      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
    >
      Áp dụng
    </button>
    {discountMessage && (
      <p className={`mt-3 ${discountCode === 'SALE10' ? 'text-green-600' : 'text-red-600'}`}>{discountMessage}</p>
    )}
  </div>

  {/* Các nút chức năng */}
  <div className="flex gap-4 mb-6">
    <button
      onClick={handleAddToCart}
      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2"
    >
      <FaShoppingCart /> Thêm vào Giỏ Hàng
    </button>
    <button
      onClick={handleBuyNow}
      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2"
    >
      <FaShoppingCart /> Mua Ngay
    </button>
  </div>
</div>

      </div>

      {/* Tách biệt các phần Thông số và Đánh giá */}
      <div className="mt-12">
        {/* Tab điều hướng */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`${
              activeTab === 'details' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
            } px-6 py-3 rounded-lg border-2 border-blue-600 flex items-center gap-2`}
          >
            <FaInfoCircle /> Thông Số Kỹ Thuật
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`${
              activeTab === 'reviews' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
            } px-6 py-3 rounded-lg border-2 border-blue-600 flex items-center gap-2`}
          >
            <FaStar /> Đánh Giá
          </button>
        </div>

        {/* Nội dung của các tab */}
        {activeTab === 'details' && (
          <div className="bg-gray-100 p-6 rounded-xl shadow-lg mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông Số Kỹ Thuật:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {product.detailedSpecs.map((spec, index) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={index} className="flex items-start gap-4 bg-gray-100 p-4 rounded-lg shadow-md">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {review.user[0]}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-800">{review.user}</p>
                  <p className="text-sm text-yellow-500">Rating: {review.rating} stars</p>
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nhập bình luận */}
        {activeTab === 'reviews' && (
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="w-full p-4 border border-gray-300 rounded-lg mb-4 mt-4"
          />
        )}
        {activeTab === 'reviews' && (
          <button
            onClick={handleAddComment}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Gửi Bình Luận
          </button>
        )}
      </div>

      {/* Đánh giá sản phẩm */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Đánh Giá Sản Phẩm</h2>
        <div className="flex justify-center space-x-4">
          {['Rất Tệ', 'Tệ', 'Tạm ổn', 'Tốt', 'Rất Tốt'].map((rating, index) => (
            <button
              key={index}
              onClick={() => setSelectedRating(rating)}
              className={`${
                selectedRating === rating ? 'bg-yellow-500 text-white' : 'bg-transparent text-gray-700'
              } px-6 py-3 border-2 border-yellow-500 rounded-lg flex items-center gap-2`}
            >
              <FaStar className="text-yellow-400" /> {rating}
            </button>
          ))}
        </div>
        {selectedRating && (
          <p className="mt-4 text-lg text-gray-800 text-center">Bạn đã chọn đánh giá: <span className="font-bold text-yellow-500">{selectedRating}</span></p>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
