import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';

const OrderHistoryPage = () => {
  const { userId } = useParams();

  // Dữ liệu giả lập các đơn hàng
  const orders = [
    {
      userId: '123',
      orderId: 'ORD001',
      orderDate: '2025-03-01',
      status: 'Đã giao',
      total: 1200,
      items: [
        { name: 'Áo thun', quantity: 2, price: 300, image: 'https://via.placeholder.com/100' },
        { name: 'Quần jeans', quantity: 1, price: 600, image: 'https://via.placeholder.com/100' },
      ],
      address: 'Số 123, Đường ABC, TP.HCM',
      paymentMethod: 'Thanh toán khi nhận hàng',
    },
    {
      userId: '456',
      orderId: 'ORD002',
      orderDate: '2025-02-28',
      status: 'Đang xử lý',
      total: 450,
      items: [
        { name: 'Giày thể thao', quantity: 1, price: 450, image: 'https://via.placeholder.com/100' },
      ],
      address: 'Số 456, Đường DEF, TP.HCM',
      paymentMethod: 'Thẻ tín dụng',
    },
    {
      userId: '123',
      orderId: 'ORD003',
      orderDate: '2025-02-25',
      status: 'Đã hủy',
      total: 0,
      items: [
        { name: 'Áo khoác', quantity: 1, price: 0, image: 'https://via.placeholder.com/100' },
      ],
      address: 'Số 789, Đường GHI, TP.HCM',
      paymentMethod: 'Thanh toán khi nhận hàng',
    },
  ];

  const userOrders = orders.filter(order => order.userId === userId);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-4xl font-semibold text-gray-800 mb-6">Lịch Sử Đơn Hàng</h2>

      {!selectedOrder ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userOrders.length > 0 ? (
            userOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold text-gray-800">Mã Đơn Hàng: {order.orderId}</h3>
                <p className="text-gray-600">Ngày Mua: {order.orderDate}</p>
                <p
                  className={`text-lg font-semibold ${
                    order.status === 'Đã giao'
                      ? 'text-green-600'
                      : order.status === 'Đang xử lý'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {order.status === 'Đã giao' ? (
                    <FaCheckCircle />
                  ) : order.status === 'Đang xử lý' ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTimesCircle />
                  )}
                  {order.status}
                </p>
                <p className="text-gray-700 mt-2">Tổng Tiền: {order.total}₫</p>
                <button
                  onClick={() => handleViewDetails(order)}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Xem Chi Tiết
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">Không có đơn hàng nào.</p>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <button
            onClick={handleBackToList}
            className="mb-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
          >
            Quay lại danh sách
          </button>

          {/* Tab Navigation */}
          <div className="flex border-b-2 border-gray-200 mb-6">
            <button className="px-6 py-3 text-lg font-semibold text-gray-700 hover:text-blue-600 transition duration-300">
              Thông Tin Đơn Hàng
            </button>
            <button className="px-6 py-3 text-lg font-semibold text-gray-700 hover:text-blue-600 transition duration-300">
              Địa Chỉ & Thanh Toán
            </button>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Chi Tiết Đơn Hàng {selectedOrder.orderId}</h3>

          <div>
            {/* Thông tin đơn hàng */}
            <div className="mb-4">
              <p><strong>Ngày Mua:</strong> {selectedOrder.orderDate}</p>
              <p><strong>Trạng Thái:</strong> {selectedOrder.status}</p>
              <p><strong>Tổng Tiền:</strong> {selectedOrder.total}₫</p>
            </div>

            {/* Địa chỉ & Phương thức thanh toán */}
            <div className="mb-4">
              <p><strong>Địa Chỉ:</strong> {selectedOrder.address}</p>
              <p><strong>Phương Thức Thanh Toán:</strong> {selectedOrder.paymentMethod}</p>
            </div>

            {/* Sản phẩm đã mua */}
            <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Sản Phẩm Đã Mua</h4>
            <ul className="space-y-4">
              {selectedOrder.items.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-4" />
                    <span>{item.name} (x{item.quantity})</span>
                  </div>
                  <span>{item.price * item.quantity}₫</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
