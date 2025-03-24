import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaPaperPlane } from 'react-icons/fa';

const CommentSection = () => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { user: 'John Doe', text: 'Great product, I love it!', timestamp: '2025-03-24 10:30' },
    { user: 'Jane Smith', text: 'Very good performance, but expensive.', timestamp: '2025-03-24 09:15' },
  ]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        user: 'Anonymous',
        text: comment,
        timestamp: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }),
      };
      setComments([...comments, newComment]);
      setComment('');
    }
  };

  return (
    <div className="mt-10 bg-gray-100 p-6 rounded-xl shadow-lg">
      {/* Tiêu đề */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6"
      >
        Bình Luận Của Khách Hàng
      </motion.h2>

      {/* Danh sách bình luận */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence>
          {comments.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-md flex items-start gap-4"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                <FaUserCircle className="text-xl" />
              </div>

              {/* Nội dung bình luận */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-800">{item.user}</p>
                  <p className="text-sm text-gray-500">{item.timestamp}</p>
                </div>
                <p className="text-gray-700 mt-1">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Form nhập bình luận */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6"
      >
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Viết bình luận của bạn..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 resize-none h-32"
        />
        <motion.button
          onClick={handleCommentSubmit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!comment.trim()}
          className={`mt-4 px-6 py-3 flex items-center gap-2 rounded-lg transition duration-300 ${
            comment.trim()
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FaPaperPlane /> Gửi Bình Luận
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CommentSection;