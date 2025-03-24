import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz'; // Import đúng hàm
import { FaSpinner, FaTimesCircle } from 'react-icons/fa';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { token } = useUser();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const timeZone = 'Asia/Ho_Chi_Minh';

  const fetchOrderDetails = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để xem chi tiết đơn hàng!', { autoClose: 2000 });
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        throw new Error(response.data.message || 'Không thể lấy thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order details:', error.response || error);
      toast.error(`Lỗi khi lấy chi tiết đơn hàng: ${error.response?.data?.message || error.message}`, { autoClose: 2000 });
      navigate('/orders'); // Chuyển hướng về trang danh sách đơn hàng nếu lỗi
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, token, navigate]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    setIsCanceling(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Đơn hàng đã được hủy thành công!', { autoClose: 2000 });
        fetchOrderDetails(); // Làm mới thông tin đơn hàng
      } else {
        throw new Error(response.data.message || 'Không thể hủy đơn hàng');
      }
    } catch (error) {
      console.error('Error canceling order:', error.response || error);
      toast.error(`Lỗi khi hủy đơn hàng: ${error.response?.data?.message || error.message}`, { autoClose: 2000 });
    } finally {
      setIsCanceling(false);
    }
  };

  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return 'Chưa xác định';
    const date = toZonedTime(new Date(isoDate), timeZone); // Sử dụng toZonedTime
    return format(date, 'dd/MM/yyyy HH:mm:ss', { timeZone });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="text-4xl text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">Chi tiết đơn hàng #{order.OrderId}</h1>

        <div className="space-y-6">
          {/* Thông tin đơn hàng */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Thông tin đơn hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  <strong>Trạng thái đơn hàng:</strong> {order.Status}
                </p>
                <p className="text-gray-600">
                  <strong>Ngày đặt hàng:</strong> {formatDisplayDate(order.OrderDate)}
                </p>
                <p className="text-gray-600">
                  <strong>Dự kiến giao hàng:</strong> {formatDisplayDate(order.EstimatedDeliveryDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <strong>Phương thức thanh toán:</strong> {order.PaymentMethod}
                </p>
                <p className="text-gray-600">
                  <strong>Trạng thái thanh toán:</strong> {order.payment?.PaymentStatus || 'Chưa xác định'}
                </p>
                {order.payment?.PaymentDate && (
                  <p className="text-gray-600">
                    <strong>Ngày thanh toán:</strong> {formatDisplayDate(order.payment.PaymentDate)}
                  </p>
                )}
                {order.payment?.TransactionId && (
                  <p className="text-gray-600">
                    <strong>Mã giao dịch:</strong> {order.payment.TransactionId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin giao hàng */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Thông tin giao hàng</h2>
            <p className="text-gray-600">
              <strong>Họ và tên:</strong> {order.FullName || 'Chưa cung cấp'}
            </p>
            <p className="text-gray-600">
              <strong>Số điện thoại:</strong> {order.Phone || 'Chưa cung cấp'}
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong> {order.Email || 'Chưa cung cấp'}
            </p>
            <p className="text-gray-600">
              <strong>Địa chỉ:</strong> {order.Address || 'Chưa cung cấp'}
            </p>
          </div>

          {/* Sản phẩm trong đơn hàng */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Sản phẩm</h2>
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.OrderItemId} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3">
                    <img src={item.ImageUrl} alt={item.ProductName} className="w-12 h-12 object-cover rounded-lg" />
                    <div>
                      <p className="text-gray-800 font-medium">{item.ProductName}</p>
                      <p className="text-gray-600 text-sm">Số lượng: {item.Quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">
                    {(item.Price * item.Quantity).toLocaleString('vi-VN')} VND
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Không có sản phẩm nào trong đơn hàng.</p>
            )}
            <div className="flex justify-between mt-4">
              <span className="text-lg font-semibold">Tổng cộng:</span>
              <span className="text-lg font-bold text-indigo-600">{order.Total.toLocaleString('vi-VN')} VND</span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/order-history')}
            className="w-full py-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-all duration-300 font-semibold"
          >
            Quay lại danh sách đơn hàng
          </button>
          {['Chờ xác nhận', 'Đang xử lý'].includes(order.Status) && (
            <button
              onClick={handleCancelOrder}
              className="w-full py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              disabled={isCanceling}
            >
              {isCanceling ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;