import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PhoneMatchAI = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAnswer = async (key, value) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (step === 6) {
      try {
        console.log('Sending request with answers:', newAnswers);
        const response = await axios.post('http://localhost:5000/api/auth/phone-match', newAnswers);
        console.log('Response from API:', response.data);
        setSuggestions(response.data.suggestions);
        console.log('Updated suggestions state:', response.data.suggestions);
        if (response.data.suggestions.length === 0) {
          setMessage(response.data.message || 'Không tìm thấy sản phẩm phù hợp');
          toast.info('Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn!', { autoClose: 3000 });
        } else {
          toast.success('Đã tìm thấy các sản phẩm phù hợp cho bạn!', { autoClose: 3000 });
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setMessage('Có lỗi xảy ra, vui lòng thử lại!');
        toast.error('Có lỗi xảy ra, vui lòng thử lại!', { autoClose: 3000 });
      }
    } else {
      setStep(step + 1);
    }
  };

  const viewDetails = (productId) => {
    navigate(`/product-detail/${productId}`);
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setSuggestions([]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <motion.div
        className="w-full max-w-5xl bg-white rounded-3xl shadow-lg p-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-4xl font-extrabold text-center text-blue-600 mb-10">
          Phone Match AI - Tìm kiếm thông minh
        </h2>

        {/* Steps */}
        {step <= 6 && suggestions.length === 0 && (
          <div className="mb-8">
            <div className="flex justify-center space-x-6 mb-6">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <motion.div
                  key={s}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg ${
                    step >= s
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: s * 0.2 }}
                >
                  {s}
                </motion.div>
              ))}
            </div>

            {step === 1 && (
              <div>
                <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                  Ngân sách của bạn là bao nhiêu?
                </h3>
                <div className="flex justify-center space-x-6">
                  {['under10', '10to20', 'over20'].map((budget, index) => (
                    <motion.button
                      key={budget}
                      onClick={() => handleAnswer('budget', budget)}
                      className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-300 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {budget === 'under10' ? 'Dưới 10 triệu' : budget === '10to20' ? '10-20 triệu' : 'Trên 20 triệu'}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                  Bạn thích thương hiệu nào?
                </h3>
                <div className="flex justify-center space-x-6">
                  {['apple', 'samsung', 'any'].map((brand, index) => (
                    <motion.button
                      key={brand}
                      onClick={() => handleAnswer('brand', brand)}
                      className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-300 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {brand === 'apple' ? 'Apple' : brand === 'samsung' ? 'Samsung' : 'Bất kỳ'}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                  Độ tuổi của bạn là bao nhiêu?
                </h3>
                <div className="flex justify-center space-x-6">
                  {['under18', '18to30', 'over30'].map((age, index) => (
                    <motion.button
                      key={age}
                      onClick={() => handleAnswer('ageGroup', age)}
                      className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-300 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {age === 'under18' ? 'Dưới 18' : age === '18to30' ? '18-30' : 'Trên 30'}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {step === 4 && (
              <div>
                <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                  Bạn ưu tiên tính năng nào nhất?
                </h3>
                <div className="flex justify-center space-x-6">
                  {['camera', 'gaming', 'battery'].map((pref, index) => (
                    <motion.button
                      key={pref}
                      onClick={() => handleAnswer('preference', pref)}
                      className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-300 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {pref === 'camera' ? 'Camera đẹp' : pref === 'gaming' ? 'Chơi game mượt' : 'Pin trâu'}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {step === 5 && (
              <div>
                <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                  Bạn muốn tìm loại thiết bị nào?
                </h3>
                <div className="flex justify-center space-x-6 flex-wrap">
                  {['phone', 'tablet', 'laptop', 'macbook'].map((type, index) => (
                    <motion.button
                      key={type}
                      onClick={() => handleAnswer('deviceType', type)}
                      className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-300 shadow-sm m-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {type === 'phone' ? 'Điện thoại' : type === 'tablet' ? 'Máy tính bảng' : type === 'laptop' ? 'Laptop' : 'MacBook'}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {step === 6 && (
              <div>
                <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                  Bạn sẽ sử dụng thiết bị để làm gì?
                </h3>
                <div className="flex justify-center space-x-6">
                  {['work', 'entertainment', 'study'].map((purpose, index) => (
                    <motion.button
                      key={purpose}
                      onClick={() => handleAnswer('purpose', purpose)}
                      className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-300 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {purpose === 'work' ? 'Làm việc' : purpose === 'entertainment' ? 'Giải trí' : 'Học tập'}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thông báo nếu không tìm thấy sản phẩm */}
        {message && suggestions.length === 0 && (
          <div className="text-center">
            <p className="text-red-500 text-lg mb-6">{message}</p>
            <motion.button
              onClick={reset}
              className="py-3 px-6 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Thử lại
            </motion.button>
          </div>
        )}

        {/* Gợi ý sản phẩm */}
        {suggestions.length > 0 && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800">Gợi ý sản phẩm cho bạn</h3>
              <motion.button
                onClick={reset}
                className="py-2 px-5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Tìm lại
              </motion.button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {suggestions.map((product) => (
                <motion.div
                  key={product.ProductId}
                  className="relative bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => viewDetails(product.ProductId)}
                >
                  <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Đề xuất
                  </div>
                  <img
                    src={product.ImageUrl || 'https://via.placeholder.com/150'}
                    alt={product.Name}
                    className="w-full h-56 object-contain rounded-lg mb-4"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                  />
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">{product.Name}</h4>
                  <p className="text-gray-600 mb-1">Giá: {product.Price.toLocaleString()} VND</p>
                  <p className="text-gray-600 mb-4">Thương hiệu: {product.Brand}</p>
                  <motion.button
                    className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Xem chi tiết
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default PhoneMatchAI;