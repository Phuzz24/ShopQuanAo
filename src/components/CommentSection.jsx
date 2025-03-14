import React, { useState } from 'react';

const CommentSection = () => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { user: 'John Doe', text: 'Great product, I love it!' },
    { user: 'Jane Smith', text: 'Very good performance, but expensive.' },
  ]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment) {
      setComments([...comments, { user: 'Anonymous', text: comment }]);
      setComment('');
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">Bình luận của khách hàng</h2>

      {/* Danh sách bình luận */}
      <div className="mt-4 space-y-4">
        {comments.map((item, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-md">
            <p className="text-lg font-medium text-gray-800">{item.user}</p>
            <p className="text-gray-700 mt-2">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Form nhập bình luận */}
      <div className="mt-6">
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Viết bình luận của bạn..."
          className="w-full p-4 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleCommentSubmit}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Gửi Bình Luận
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
