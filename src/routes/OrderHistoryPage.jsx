import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaSpinner, FaTimesCircle, FaArrowLeft, FaInfoCircle, FaMapMarkerAlt, FaTrash, FaClock, FaMoneyBillWave, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const OrderHistoryPage = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('[OrderHistory] Fetching orders with token:', token);
        const response = await fetch('http://localhost:5000/api/orders/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('[OrderHistory] Orders response:', data);
        if (data.success) {
          setOrders(data.orders);
        } else {
          toast.error(data.message || 'Không thể tải lịch sử đơn hàng');
        }
      } catch (err) {
        toast.error('Lỗi kết nối server');
        console.error('[OrderHistory] Fetch orders error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleViewDetails = async (orderId) => {
    console.log(`Fetching details for OrderId: ${orderId}`);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log(`Response for OrderId ${orderId}:`, data);
      if (data.success) {
        setSelectedOrder(data.order);
      } else {
        toast.error(data.message || 'Không thể tải chi tiết đơn hàng');
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
      console.error('Fetch order details error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col items-center space-y-4 p-4">
          <p className="text-lg font-semibold text-gray-800">Bạn có chắc muốn hủy đơn hàng #{orderId} không?</p>
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                closeToast();
                try {
                  const token = localStorage.getItem('token');
                  console.log(`[OrderHistory] Cancelling order: ${orderId}`);
                  const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });

                  const data = await response.json();
                  console.log(`[OrderHistory] Cancel response:`, data);
                  if (data.success) {
                    toast.success('Đơn hàng đã được hủy thành công', { autoClose: 2000 });
                    setOrders(orders.map(order => 
                      order.OrderId === orderId ? { ...order, Status: 'Đã hủy' } : order
                    ));
                    if (selectedOrder && selectedOrder.OrderId === orderId) {
                      setSelectedOrder({ ...selectedOrder, Status: 'Đã hủy' });
                    }
                  } else {
                    toast.error(data.message || 'Không thể hủy đơn hàng');
                  }
                } catch (err) {
                  toast.error('Lỗi kết nối server');
                  console.error('[OrderHistory] Cancel order error:', err);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Đồng ý
            </button>
            <button
              onClick={closeToast}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const handleBackToList = () => {
    // Cập nhật danh sách orders với thông tin từ selectedOrder trước khi quay lại
    if (selectedOrder) {
      setOrders(orders.map(order => 
        order.OrderId === selectedOrder.OrderId ? { ...order, PaymentStatus: selectedOrder.payment?.PaymentStatus } : order
      ));
    }
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const canCancelOrder = (status) => ['Chờ xác nhận', 'Đang xử lý'].includes(status);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Đã giao':
        return { color: 'text-green-600', icon: <FaCheckCircle className="text-green-600" /> };
      case 'Chờ xác nhận':
      case 'Đang xử lý':
        return { color: 'text-yellow-600', icon: <FaSpinner className="animate-spin text-yellow-600" /> };
      case 'Đã hủy':
        return { color: 'text-red-600', icon: <FaTimesCircle className="text-red-600" /> };
      default:
        return { color: 'text-gray-600', icon: <FaClock className="text-gray-600" /> };
    }
  };

  const getPaymentStatusStyles = (status) => {
    switch (status) {
      case 'Đã thanh toán':
        return { color: 'text-green-600', icon: <FaCheckCircle className="text-green-600" /> };
      case 'Chưa thanh toán':
        return { color: 'text-yellow-600', icon: <FaMoneyBillWave className="text-yellow-600" /> };
      case 'Thất bại':
        return { color: 'text-red-600', icon: <FaTimesCircle className="text-red-600" /> };
      default:
        return { color: 'text-gray-600', icon: <FaClock className="text-gray-600" /> };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-3xl md:text-4xl font-extrabold text-indigo-800 mb-10 text-center"
        >
          Lịch Sử Đơn Hàng
        </motion.h2>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-64"
          >
            <FaSpinner className="animate-spin text-5xl text-indigo-600" />
          </motion.div>
        ) : !selectedOrder ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {orders.length > 0 ? (
              orders.map((order, index) => {
                const { color: statusColor, icon: statusIcon } = getStatusStyles(order.Status);
                const { color: paymentColor, icon: paymentIcon } = getPaymentStatusStyles(order.PaymentStatus || 'Chưa xác định');

                return (
                  <motion.div
                    key={order.OrderId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 border border-gray-100"
                  >
                    {/* Status Bar */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex flex-col space-y-2">
                        <div className="text-lg font-semibold text-gray-900">
                          Mã đơn: {order.OrderId}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className={`flex items-center space-x-2 ${statusColor}`}>
                            {statusIcon}
                            <span className="font-medium">Trạng thái: {order.Status}</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${paymentColor}`}>
                            {paymentIcon}
                            <span className="font-medium">{order.PaymentStatus || 'Chưa xác định'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mt-1">Ngày: {formatDate(order.OrderDate)}</p>
                    <p className="text-gray-700 mt-3 font-semibold">
                      Tổng: {order.Total.toLocaleString('vi-VN')}₫
                    </p>
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => handleViewDetails(order.OrderId)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
                      >
                        Xem Chi Tiết
                      </button>
                      {canCancelOrder(order.Status) && (
                        <button
                          onClick={() => handleCancelOrder(order.OrderId)}
                          className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 font-medium flex items-center justify-center space-x-2"
                        >
                          <FaTrash />
                          <span>Hủy Đơn Hàng</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-center text-gray-600 col-span-full text-lg">
                Bạn chưa có đơn hàng nào.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100"
          >
            {/* Status Bar for Selected Order */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
              <div className="flex flex-col space-y-3">
                <div className="text-2xl font-bold text-gray-900">
                  Mã đơn: {selectedOrder.OrderId}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className={`flex items-center space-x-2 ${getStatusStyles(selectedOrder.Status).color}`}>
                    {getStatusStyles(selectedOrder.Status).icon}
                    <span className="font-medium text-lg">Trạng thái đơn hàng: {selectedOrder.Status}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${getPaymentStatusStyles(selectedOrder.payment?.PaymentStatus || 'Chưa xác định').color}`}>
                    {getPaymentStatusStyles(selectedOrder.payment?.PaymentStatus || 'Chưa xác định').icon}
                    <span className="font-medium text-lg">Trạng thái thanh toán: {selectedOrder.payment?.PaymentStatus || 'Chưa xác định'}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBackToList}
              className="mb-6 flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
            >
              <FaArrowLeft />
              <span>Quay lại</span>
            </button>

            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center space-x-2 px-4 py-2 text-lg font-medium ${
                  activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                } transition duration-300`}
              >
                <FaInfoCircle />
                <span>Thông Tin</span>
              </button>
              <button
                onClick={() => setActiveTab('address')}
                className={`flex items-center space-x-2 px-4 py-2 text-lg font-medium ${
                  activeTab === 'address' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                } transition duration-300`}
              >
                <FaMapMarkerAlt />
                <span>Địa Chỉ & Thanh Toán</span>
              </button>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Chi Tiết Đơn Hàng #{selectedOrder.OrderId}
            </h3>

            <AnimatePresence mode="wait">
              {activeTab === 'info' ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.OrderDate)}</p>
                    <p><strong>Tổng tiền:</strong> {selectedOrder.Total.toLocaleString('vi-VN')}₫</p>
                    {selectedOrder.EstimatedDeliveryDate && (
                      <p><strong>Dự kiến giao:</strong> {formatDate(selectedOrder.EstimatedDeliveryDate)}</p>
                    )}
                  </div>
                  {canCancelOrder(selectedOrder.Status) && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.OrderId)}
                      className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 font-medium flex items-center space-x-2"
                    >
                      <FaTrash />
                      <span>Hủy Đơn Hàng</span>
                    </button>
                  )}
                  <h4 className="text-xl font-semibold text-gray-800 mt-6">Sản Phẩm</h4>
                  <ul className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <li key={index} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.ImageUrl || 'https://via.placeholder.com/80'}
                            alt={item.ProductName}
                            className="w-16 h-16 object-cover rounded-md shadow-sm"
                          />
                          <div>
                            <Link
                              to={`/product-detail/${item.ProductId}`}
                              className="text-indigo-600 hover:underline font-medium"
                            >
                              {item.ProductName}
                            </Link>
                            <p className="text-gray-600">Số lượng: {item.Quantity}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-700">
                          {(item.Price * item.Quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-gray-600" />
                    <p><strong>Họ và tên:</strong> {selectedOrder.FullName || 'Chưa cung cấp'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaPhone className="text-gray-600" />
                    <p><strong>Số điện thoại:</strong> {selectedOrder.Phone || 'Chưa cung cấp'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaEnvelope className="text-gray-600" />
                    <p><strong>Email:</strong> {selectedOrder.Email || 'Chưa cung cấp'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="text-gray-600" />
                    <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.Address || 'Chưa cung cấp'}</p>
                  </div>
                  <p><strong>Phương thức thanh toán:</strong> {selectedOrder.payment?.PaymentMethod || selectedOrder.PaymentMethod}</p>
                  {selectedOrder.payment?.PaymentDate && (
                    <p><strong>Ngày thanh toán:</strong> {formatDate(selectedOrder.payment.PaymentDate)}</p>
                  )}
                  {selectedOrder.payment?.TransactionId && (
                    <p><strong>Mã giao dịch:</strong> {selectedOrder.payment.TransactionId}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;