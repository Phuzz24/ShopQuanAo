import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTruck, FaMoneyBillWave, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { format, addDays } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz'; // Import đúng hàm

const CheckoutPage = () => {
  const { cart, removeFromCart, fetchCartFromDB } = useCart();
  const { token, user } = useUser();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [appTransId, setAppTransId] = useState('');
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ Việt Nam

  const checkPaymentStatus = async (appTransId) => {
    try {
      console.log('Checking payment status for appTransId:', appTransId, 'Current paymentStatus:', paymentStatus, 'isPaymentProcessed:', isPaymentProcessed);

      const response = await axios.post(
        'http://localhost:5000/api/zalopay/check-status',
        { app_trans_id: appTransId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Check payment status response:', response.data);

      if (response.data.success && response.data.status === 1) {
        setPaymentStatus('success');
        setIsPaymentProcessed(true);
        console.log('Updated paymentStatus to success:', paymentStatus);

        // Xóa giỏ hàng sau khi thanh toán thành công
        if (state?.fromBuyNow) {
          await axios.delete('http://localhost:5000/api/cart/remove', {
            headers: { Authorization: `Bearer ${token}` },
            data: { userId: parseInt(user.UserId, 10), productId: checkoutItems[0].id },
          });
        } else {
          checkoutItems.forEach((item) => removeFromCart(item.id));
        }

        toast.success(`Đơn hàng ${orderId} đã được thanh toán thành công!`, { autoClose: 2000 });
        setStep(4);
        setPendingOrder(null);
      } else if (response.data.success && (response.data.status === 0 || response.data.status === 3)) {
        console.log('Payment is still processing, status:', response.data.status);
        setPaymentStatus('pending');
        toast.info('Đang chờ thanh toán, vui lòng quét mã QR để hoàn tất.', { autoClose: 2000 });
      } else if (response.data.success && response.data.status === -1) {
        setPaymentStatus('failed');
        setIsPaymentProcessed(true);
        setOrderId(null); // Xóa orderId vì đơn hàng đã bị xóa bởi backend
        toast.error('Thanh toán thất bại. Đơn hàng đã bị hủy. Vui lòng thử lại.', { autoClose: 2000 });
      } else {
        setPaymentStatus('failed');
        setIsPaymentProcessed(true);
        setOrderId(null); // Xóa orderId vì đơn hàng đã bị xóa bởi backend
        toast.error(`Lỗi khi kiểm tra trạng thái thanh toán: ${response.data.message}`, { autoClose: 2000 });
      }
    } catch (err) {
      console.error('Error checking payment status:', err.response?.data || err.message);
      setPaymentStatus('failed');
      setIsPaymentProcessed(true);
      setOrderId(null); // Xóa orderId vì đơn hàng đã bị xóa bởi backend
      toast.error(`Lỗi khi kiểm tra trạng thái thanh toán: ${err.response?.data?.message || err.message}`, { autoClose: 2000 });
    }
  };

  useEffect(() => {
    console.log('Initial useEffect - Current paymentStatus:', paymentStatus);
    const query = new URLSearchParams(window.location.search);
    const orderIdFromQuery = query.get('orderId');
    const appTransIdFromQuery = query.get('appTransId');

    if (orderIdFromQuery && appTransIdFromQuery) {
      setOrderId(orderIdFromQuery);
      setAppTransId(appTransIdFromQuery);
      setStep(3.5);
      checkPaymentStatus(appTransIdFromQuery);
    } else {
      setStep(1);
      setPaymentStatus('pending');
      setQrCodeUrl('');
      setAppTransId('');
      setIsPaymentProcessed(false);
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const query = new URLSearchParams(window.location.search);
      const orderIdFromQuery = query.get('orderId');
      const appTransIdFromQuery = query.get('appTransId');

      if (orderIdFromQuery && appTransIdFromQuery) {
        setOrderId(orderIdFromQuery);
        setAppTransId(appTransIdFromQuery);
        setStep(3.5);
        checkPaymentStatus(appTransIdFromQuery);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const loadCheckoutItems = async () => {
      let items = [];
      if (state?.fromBuyNow && state.cartItems) {
        items = state.cartItems.map((item) => ({
          id: item.id,
          name: item.Name || item.name,
          price: item.discountedPrice || item.price,
          image: item.image,
          quantity: item.quantity,
        }));
      } else {
        if (cart.length === 0 && token) {
          await fetchCartFromDB();
        }
        items = cart.map((item) => ({
          id: item.id,
          name: item.name || item.Name,
          price: item.discountedPrice || item.price || 0,
          image: item.image,
          quantity: item.quantity,
        }));
      }
      setCheckoutItems(items);
    };

    loadCheckoutItems();
  }, [state, cart, token, fetchCartFromDB]);

  const shippingFee = shippingMethod === 'fast' ? 30000 : 15000;
  const totalAmount = checkoutItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price * item.quantity;
  }, 0) + shippingFee;

  const getEstimatedDeliveryDate = () => {
    const today = toZonedTime(new Date(), timeZone); // Sử dụng toZonedTime
    const daysToAdd = shippingMethod === 'fast' ? 2 : 5;
    const deliveryDate = addDays(today, daysToAdd);
    return fromZonedTime(deliveryDate, timeZone).toISOString(); // Sử dụng fromZonedTime
  };

  useEffect(() => {
    axios
      .get('https://provinces.open-api.vn/api/p/')
      .then((response) => {
        setProvinces(response.data);
      })
      .catch((error) => console.error('Error fetching provinces:', error));
  }, []);

  useEffect(() => {
    if (shippingInfo.province) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${shippingInfo.province}?depth=2`)
        .then((response) => {
          setDistricts(response.data.districts || []);
          setWards([]);
          setShippingInfo((prev) => ({ ...prev, district: '', ward: '' }));
        })
        .catch((error) => console.error('Error fetching districts:', error));
    }
  }, [shippingInfo.province]);

  useEffect(() => {
    if (shippingInfo.district) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${shippingInfo.district}?depth=2`)
        .then((response) => {
          setWards(response.data.wards || []);
          setShippingInfo((prev) => ({ ...prev, ward: '' }));
        })
        .catch((error) => console.error('Error fetching wards:', error));
    }
  }, [shippingInfo.district]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const generateOrderId = () => {
    return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  useEffect(() => {
    console.log('Timeout useEffect - Current paymentStatus:', paymentStatus, 'isPaymentProcessed:', isPaymentProcessed, 'appTransId:', appTransId);
    let interval, timeout;

    if (paymentMethod === 'online' && appTransId) {
      setTimeout(() => {
        if (!isPaymentProcessed) {
          checkPaymentStatus(appTransId);
        }
      }, 5000);

      interval = setInterval(() => {
        if (!isPaymentProcessed) {
          checkPaymentStatus(appTransId);
        }
      }, 5000);

      timeout = setTimeout(() => {
        clearInterval(interval);
        if (paymentStatus !== 'success' && !isPaymentProcessed) {
          setPaymentStatus('failed');
          setIsPaymentProcessed(true);
          setOrderId(null);
          toast.error('Thanh toán đã hết thời gian. Đơn hàng đã bị hủy. Vui lòng thử lại.', { autoClose: 2000 });
        }
      }, 30 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [appTransId, paymentMethod, isPaymentProcessed]);

  const handleOrderSubmit = async () => {
    if (!token || !user?.UserId) {
      toast.error('Vui lòng đăng nhập để đặt hàng!', { autoClose: 2000 });
      navigate('/login');
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error('Không có sản phẩm nào để thanh toán!', { autoClose: 2000 });
      return;
    }

    if (
      !shippingInfo.fullName ||
      !shippingInfo.phone ||
      !shippingInfo.email ||
      !shippingInfo.province ||
      !shippingInfo.district ||
      !shippingInfo.ward ||
      !shippingInfo.address
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng!', { autoClose: 2000 });
      setStep(1);
      return;
    }

    const provinceName = provinces.find((p) => p.code === parseInt(shippingInfo.province))?.name || '';
    const districtName = districts.find((d) => d.code === parseInt(shippingInfo.district))?.name || '';
    const wardName = wards.find((w) => w.code === parseInt(shippingInfo.ward))?.name || '';

    const fullAddress = [
      shippingInfo.address,
      wardName,
      districtName,
      provinceName,
    ].filter(Boolean).join(', ');

    const orderData = {
      orderId: generateOrderId(),
      userId: parseInt(user.UserId, 10),
      total: totalAmount,
      address: fullAddress || 'Chưa cung cấp địa chỉ đầy đủ',
      fullName: shippingInfo.fullName,
      phone: shippingInfo.phone,
      email: shippingInfo.email,
      paymentMethod: paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online',
      estimatedDeliveryDate: getEstimatedDeliveryDate(),
      items: checkoutItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    setIsLoading(true);

    try {
      setPendingOrder(orderData);

      const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Không thể tạo đơn hàng');
      }

      setOrderId(orderData.orderId);

      if (paymentMethod === 'cod') {
        if (state?.fromBuyNow) {
          await axios.delete('http://localhost:5000/api/cart/remove', {
            headers: { Authorization: `Bearer ${token}` },
            data: { userId: parseInt(user.UserId, 10), productId: checkoutItems[0].id },
          });
        } else {
          checkoutItems.forEach((item) => removeFromCart(item.id));
        }

        toast.success(`Đơn hàng ${orderData.orderId} đã được đặt thành công!`, { autoClose: 2000 });
        setPendingOrder(null);
        nextStep();
      } else {
        const zalopayResponse = await axios.post(
          'http://localhost:5000/api/zalopay/create-order',
          {
            userId: parseInt(user.UserId, 10),
            total: totalAmount,
            orderId: orderData.orderId,
            items: checkoutItems,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!zalopayResponse.data.success) {
          throw new Error(zalopayResponse.data.message || 'Không thể tạo đơn hàng ZaloPay');
        }

        setQrCodeUrl(zalopayResponse.data.order_url);
        setAppTransId(zalopayResponse.data.app_trans_id);
        setStep(3.5);
      }
    } catch (error) {
      console.error('Error submitting order:', error.response || error);
      toast.error(`Lỗi khi đặt hàng: ${error.response?.data?.message || error.message}`, { autoClose: 2000 });
      setOrderId(null);
      setPendingOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayDate = (isoDate) => {
    const date = toZonedTime(new Date(isoDate), timeZone); // Sử dụng toZonedTime
    return format(date, 'dd/MM/yyyy', { timeZone });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-gray-50 to-pink-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`flex-1 text-center ${step >= s ? 'text-indigo-600' : 'text-gray-400'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}
              >
                {s}
              </div>
              <p className="mt-2 text-sm font-medium">
                {s === 1 ? 'Thông tin giao hàng' : s === 2 ? 'Thanh toán & Vận chuyển' : s === 3 ? 'Xác nhận' : 'Hoàn tất'}
              </p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">Thông tin giao hàng</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleShippingChange}
                  placeholder="Họ và tên *"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  placeholder="Số điện thoại *"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  placeholder="Email *"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <select
                  name="province"
                  value={shippingInfo.province}
                  onChange={handleShippingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Chọn tỉnh/thành phố *</option>
                  {provinces.map((prov) => (
                    <option key={prov.code} value={prov.code}>
                      {prov.name}
                    </option>
                  ))}
                </select>
                <select
                  name="district"
                  value={shippingInfo.district}
                  onChange={handleShippingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!shippingInfo.province}
                  required
                >
                  <option value="">Chọn quận/huyện *</option>
                  {districts.map((dist) => (
                    <option key={dist.code} value={dist.code}>
                      {dist.name}
                    </option>
                  ))}
                </select>
                <select
                  name="ward"
                  value={shippingInfo.ward}
                  onChange={handleShippingChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!shippingInfo.district}
                  required
                >
                  <option value="">Chọn phường/xã *</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  placeholder="Địa chỉ chi tiết (số nhà, tên đường) *"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                onClick={nextStep}
                className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 font-semibold"
                disabled={
                  !shippingInfo.fullName ||
                  !shippingInfo.phone ||
                  !shippingInfo.email ||
                  !shippingInfo.province ||
                  !shippingInfo.district ||
                  !shippingInfo.ward ||
                  !shippingInfo.address
                }
              >
                Tiếp tục
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">Phương thức thanh toán & vận chuyển</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Chọn phương thức thanh toán</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 border rounded-lg cursor-pointer flex items-center gap-3 ${
                        paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <FaMoneyBillWave className="text-indigo-600" />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    <div
                      onClick={() => setPaymentMethod('online')}
                      className={`p-4 border rounded-lg cursor-pointer flex items-center gap-3 ${
                        paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <FaCreditCard className="text-indigo-600" />
                      <span>Thanh toán online (ZaloPay)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Chọn phương thức vận chuyển</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setShippingMethod('standard')}
                      className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${
                        shippingMethod === 'standard' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FaTruck className="text-indigo-600" />
                        <span>Giao hàng tiết kiệm</span>
                      </div>
                      <span className="text-sm font-medium">15.000 VND</span>
                    </div>
                    <div
                      onClick={() => setShippingMethod('fast')}
                      className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${
                        shippingMethod === 'fast' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FaTruck className="text-indigo-600" />
                        <span>Giao hàng nhanh</span>
                      </div>
                      <span className="text-sm font-medium">30.000 VND</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={prevStep}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-all duration-300 font-semibold"
                >
                  Quay lại
                </button>
                <button
                  onClick={nextStep}
                  className="w-full py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 font-semibold"
                >
                  Tiếp tục
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">Xác nhận đơn hàng</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin giao hàng</h3>
                  <p className="text-gray-600">
                    {shippingInfo.fullName} | {shippingInfo.phone} | {shippingInfo.email}
                  </p>
                  <p className="text-gray-600">
                    {shippingInfo.address},{' '}
                    {wards.find((w) => w.code === parseInt(shippingInfo.ward))?.name || ''},{' '}
                    {districts.find((d) => d.code === parseInt(shippingInfo.district))?.name || ''},{' '}
                    {provinces.find((p) => p.code === parseInt(shippingInfo.province))?.name || ''}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Phương thức</h3>
                  <p className="text-gray-600">
                    Thanh toán: {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
                  </p>
                  <p className="text-gray-600">
                    Vận chuyển: {shippingMethod === 'fast' ? 'Giao hàng nhanh' : 'Giao hàng tiết kiệm'} (
                    {shippingFee.toLocaleString('vi-VN')} VND)
                  </p>
                  <p className="text-gray-600">Dự kiến giao hàng: {formatDisplayDate(getEstimatedDeliveryDate())}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Sản phẩm</h3>
                  {checkoutItems.length === 0 ? (
                    <p className="text-gray-600">Không có sản phẩm nào để hiển thị</p>
                  ) : (
                    checkoutItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                          <span>{item.name} (x{item.quantity})</span>
                        </div>
                        <span className="font-medium">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between mt-4">
                    <span className="text-lg font-semibold">Tổng cộng:</span>
                    <span className="text-lg font-bold text-indigo-600">{totalAmount.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={prevStep}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-all duration-300 font-semibold"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleOrderSubmit}
                  className="w-full py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                  disabled={isLoading || checkoutItems.length === 0}
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : null}
                  Xác nhận đặt hàng
                </button>
              </div>
            </motion.div>
          )}

          {step === 3.5 && paymentMethod === 'online' && (
            <motion.div
              key="step3.5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg text-center"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">Thanh toán với ZaloPay</h2>
              <p className="text-gray-600 mb-6">
                Vui lòng quét mã QR bên dưới hoặc nhấn nút để mở ứng dụng ZaloPay để thanh toán.
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center mb-6">
                  <QRCode value={qrCodeUrl} size={200} />
                </div>
              )}
              <p className="text-gray-600 mb-6">
                Tổng tiền: <strong>{totalAmount.toLocaleString('vi-VN')} VND</strong>
              </p>
              <a
                href={qrCodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-3 px-6 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 font-semibold mb-6"
              >
                Mở ZaloPay để thanh toán
              </a>
              {paymentStatus === 'pending' && (
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" /> Đang chờ thanh toán...
                </p>
              )}
              {paymentStatus === 'failed' && (
                <p className="text-red-600">
                  Thanh toán thất bại hoặc hết thời gian. Đơn hàng đã bị hủy. Vui lòng thử lại.
                </p>
              )}
              {paymentStatus === 'success' && (
                <p className="text-green-600">
                  Thanh toán thành công! Đang xử lý đơn hàng...
                </p>
              )}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-all duration-300 font-semibold"
                >
                  Quay lại
                </button>
                {paymentStatus === 'failed' && (
                  <button
                    onClick={handleOrderSubmit}
                    className="w-full py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 font-semibold"
                  >
                    Thử lại
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg text-center"
            >
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Đặt hàng thành công!</h2>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã đặt hàng. Mã đơn hàng: <strong>{orderId}</strong>. Chúng tôi sẽ liên hệ sớm để xác nhận.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/order/${orderId}`)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 font-semibold"
                >
                  Xem chi tiết đơn hàng
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-all duration-300 font-semibold"
                >
                  Quay về trang chủ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckoutPage;