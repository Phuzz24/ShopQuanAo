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
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

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
  const [zpTransToken, setZpTransToken] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [transactionId, setTransactionId] = useState('');
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false); // Biến để kiểm soát toast.success
  const [hasFetchedCart, setHasFetchedCart] = useState(false); // Biến để kiểm soát fetchCartFromDB

  const timeZone = 'Asia/Ho_Chi_Minh';

  const checkPaymentStatus = async (transactionId, retries = 3) => {
    console.log('checkPaymentStatus - Starting with TransactionId:', transactionId, 'Retries left:', retries);
    if (!transactionId) {
      console.error('checkPaymentStatus - Missing TransactionId');
      setPaymentStatus('failed');
      setIsPaymentProcessed(true);
      setOrderId(null);
      toast.error('Không thể kiểm tra trạng thái thanh toán: Thiếu TransactionId', { autoClose: 2000 });
      return true;
    }
  
    try {
      console.log('Checking payment status for TransactionId:', transactionId, 'Current paymentStatus:', paymentStatus, 'isPaymentProcessed:', isPaymentProcessed);
  
      const dbResponse = await axios.get(
        `http://localhost:5000/api/payments/status?transactionId=${transactionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Response from /api/payments/status:', dbResponse.data);
  
      if (dbResponse.data.success && dbResponse.data.status === 'Đã thanh toán') {
        console.log('Payment status is "Đã thanh toán" from database');
        setPaymentStatus('success');
        setIsPaymentProcessed(true);
        console.log('Updated paymentStatus to success based on database:', paymentStatus);
  
        // Xử lý xóa giỏ hàng
        const itemsToRemove = state?.fromBuyNow ? [checkoutItems[0]] : checkoutItems;
        for (const item of itemsToRemove) {
          console.log('Removing item with ProductId:', item.id);
          try {
            const response = await axios.delete('http://localhost:5000/api/cart/remove', {
              headers: { Authorization: `Bearer ${token}` },
              data: { userId: parseInt(user.UserId, 10), productId: item.id },
            });
            console.log('Response from /api/cart/remove:', response.data);
  
            if (response.data.cart) {
              setCheckoutItems(response.data.cart);
            }
  
            removeFromCart(item.id, false); // Không hiển thị toast
          } catch (err) {
            console.error('Error removing item from cart on server:', err.response?.data || err.message);
            // Bỏ qua lỗi và tiếp tục xóa trên client
            removeFromCart(item.id, false); // Không hiển thị toast
            if (err.response?.data?.cart) {
              setCheckoutItems(err.response.data.cart);
            }
          }
        }
  
        // Chỉ gọi fetchCartFromDB một lần sau khi xóa tất cả sản phẩm
        if (!hasFetchedCart) {
          fetchCartFromDB();
          setHasFetchedCart(true);
        }
  
        setStep(4);
        setPendingOrder(null);
        return true;
      }
  
      const response = await axios.post(
        'http://localhost:5000/api/zalopay/check-status',
        { transactionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Response from /api/zalopay/check-status:', response.data);
  
      if (response.data.success && response.data.status === 1) {
        console.log('Payment status is success from ZaloPay');
        setPaymentStatus('success');
        setIsPaymentProcessed(true);
        console.log('Updated paymentStatus to success:', paymentStatus);
  
        // Xử lý xóa giỏ hàng
        const itemsToRemove = state?.fromBuyNow ? [checkoutItems[0]] : checkoutItems;
        for (const item of itemsToRemove) {
          try {
            const response = await axios.delete('http://localhost:5000/api/cart/remove', {
              headers: { Authorization: `Bearer ${token}` },
              data: { userId: parseInt(user.UserId, 10), productId: item.id },
            });
            console.log('Response from /api/cart/remove:', response.data);
  
            if (response.data.cart) {
              setCheckoutItems(response.data.cart);
            }
  
            removeFromCart(item.id, false); // Không hiển thị toast
          } catch (err) {
            console.error('Error removing item from cart:', err.response?.data || err.message);
            // Bỏ qua lỗi và tiếp tục xóa trên client
            removeFromCart(item.id, false); // Không hiển thị toast
            if (err.response?.data?.cart) {
              setCheckoutItems(err.response.data.cart);
            }
          }
        }
  
        // Chỉ gọi fetchCartFromDB một lần sau khi xóa tất cả sản phẩm
        if (!hasFetchedCart) {
          fetchCartFromDB();
          setHasFetchedCart(true);
        }
  
        setStep(4);
        setPendingOrder(null);
        return true;
      } else if (response.data.success && (response.data.status === 0 || response.data.status === 3)) {
        console.log('Payment is still processing, status:', response.data.status);
        setPaymentStatus('pending');
        toast.warning('Đang chờ thanh toán, vui lòng quét mã QR hoặc mở ứng dụng ZaloPay để hoàn tất.', {
          autoClose: 5000,
          position: toast.POSITION.TOP_CENTER,
          className: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        });
        return false;
      } else if (response.data.success && response.data.status === -1) {
        console.log('Payment failed, status:', response.data.status);
        setPaymentStatus('failed');
        setIsPaymentProcessed(true);
        setOrderId(null);
        toast.error('Thanh toán thất bại. Đơn hàng đã bị hủy. Vui lòng thử lại.', { autoClose: 2000 });
        return true;
      } else {
        console.log('Unknown response from /api/zalopay/check-status:', response.data);
        if (retries > 0) {
          console.log('Retrying checkPaymentStatus due to unknown response, retries left:', retries - 1);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return checkPaymentStatus(transactionId, retries - 1);
        }
        setPaymentStatus('failed');
        setIsPaymentProcessed(true);
        setOrderId(null);
        toast.error(`Lỗi khi kiểm tra trạng thái thanh toán: ${response.data.message}`, { autoClose: 2000 });
        return true;
      }
    } catch (err) {
      console.error('Error in checkPaymentStatus:', err.response?.data || err.message);
      if (retries > 0) {
        console.log('Retrying checkPaymentStatus, retries left:', retries - 1);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return checkPaymentStatus(transactionId, retries - 1);
      }
      setPaymentStatus('failed');
      setIsPaymentProcessed(true);
      setOrderId(null);
      toast.error(`Lỗi khi kiểm tra trạng thái thanh toán: ${err.response?.data?.message || err.message}`, { autoClose: 2000 });
      return true;
    }
  };


  useEffect(() => {
    console.log('Toast success useEffect - paymentStatus:', paymentStatus, 'hasShownSuccessToast:', hasShownSuccessToast);
    if (paymentStatus === 'success' && !hasShownSuccessToast) {
      console.log('Showing toast.success for orderId:', orderId);
      toast.success(`Đơn hàng ${orderId} đã được thanh toán thành công!`, { autoClose: 2000 });
      setHasShownSuccessToast(true);
    }
  }, [paymentStatus, orderId, hasShownSuccessToast]);

  useEffect(() => {
    console.log('Initial useEffect - Current paymentStatus:', paymentStatus);
    const query = new URLSearchParams(window.location.search);
    const orderIdFromQuery = query.get('orderId');
    const transactionIdFromQuery = query.get('transactionId');

    const checkInitialStatus = async () => {
      if (orderIdFromQuery && transactionIdFromQuery) {
        console.log('Initial check - OrderId:', orderIdFromQuery, 'TransactionId:', transactionIdFromQuery);
        setOrderId(orderIdFromQuery);
        setTransactionId(transactionIdFromQuery);
        setStep(3.5);

        try {
          const dbResponse = await axios.get(
            `http://localhost:5000/api/payments/status?transactionId=${transactionIdFromQuery}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Initial check response from /api/payments/status:', dbResponse.data);

          if (dbResponse.data.success && dbResponse.data.status === 'Đã thanh toán') {
            setPaymentStatus('success');
            setIsPaymentProcessed(true);
            setStep(4);
            setPendingOrder(null);
          } else {
            checkPaymentStatus(transactionIdFromQuery);
          }
        } catch (err) {
          console.error('Error checking initial payment status:', err.response?.data || err.message);
          checkPaymentStatus(transactionIdFromQuery);
        }
      } else {
        setStep(1);
        setPaymentStatus('pending');
        setQrCodeUrl('');
        setZpTransToken('');
        setTransactionId('');
        setIsPaymentProcessed(false);
      }
    };

    checkInitialStatus();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const query = new URLSearchParams(window.location.search);
      const orderIdFromQuery = query.get('orderId');
      const transactionIdFromQuery = query.get('transactionId');

      if (orderIdFromQuery && transactionIdFromQuery) {
        setOrderId(orderIdFromQuery);
        setTransactionId(transactionIdFromQuery);
        setStep(3.5);
        checkPaymentStatus(transactionIdFromQuery);
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
      if (cart.length === 0 && token && !hasFetchedCart) { // Chỉ gọi fetchCartFromDB nếu cần
        await fetchCartFromDB();
        setHasFetchedCart(true);
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
}, [state, token, fetchCartFromDB]); // Loại bỏ cart khỏi phụ thuộc

  const shippingFee = shippingMethod === 'fast' ? 30000 : 15000;
  const totalAmount = checkoutItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price * item.quantity;
  }, 0) + shippingFee;

  const getEstimatedDeliveryDate = () => {
    const today = toZonedTime(new Date(), timeZone);
    const daysToAdd = shippingMethod === 'fast' ? 2 : 5;
    const deliveryDate = addDays(today, daysToAdd);
    return fromZonedTime(deliveryDate, timeZone).toISOString();
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
    console.log('Timeout useEffect - Current paymentStatus:', paymentStatus, 'isPaymentProcessed:', isPaymentProcessed, 'TransactionId:', transactionId, 'PaymentMethod:', paymentMethod);
    let interval, timeout;
  
    if (paymentMethod === 'online' && transactionId && !isPaymentProcessed) {
      console.log('Starting payment status check for TransactionId:', transactionId);
      setTimeout(() => {
        if (!isPaymentProcessed) {
          checkPaymentStatus(transactionId);
        }
      }, 5000);
  
      interval = setInterval(async () => {
        if (!isPaymentProcessed) {
          console.log('Interval check for TransactionId:', transactionId);
          const isProcessed = await checkPaymentStatus(transactionId);
          if (isProcessed) {
            console.log('Payment processed, clearing interval');
            clearInterval(interval);
          } else {
            console.log('Payment still processing, continuing interval');
          }
        } else {
          console.log('Payment already processed, clearing interval');
          clearInterval(interval);
        }
      }, 5000);
  
      timeout = setTimeout(async () => {
        console.log('Timeout reached for TransactionId:', transactionId);
        clearInterval(interval);
        if (paymentStatus !== 'success' && !isPaymentProcessed) {
          try {
            console.log('Final check with /api/payments/status for TransactionId:', transactionId);
            const dbResponse = await axios.get(
              `http://localhost:5000/api/payments/status?transactionId=${transactionId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Final check response:', dbResponse.data);
  
            if (dbResponse.data.success && dbResponse.data.status === 'Đã thanh toán') {
              console.log('Final check: Payment status is "Đã thanh toán"');
              setPaymentStatus('success');
              setIsPaymentProcessed(true);
              setStep(4);
              setPendingOrder(null);
            } else {
              console.log('Final check: Payment status is not "Đã thanh toán"');
              setPaymentStatus('failed');
              setIsPaymentProcessed(true);
              setOrderId(null);
              toast.error('Thanh toán đã hết thời gian. Đơn hàng đã bị hủy. Vui lòng thử lại.', { autoClose: 2000 });
            }
          } catch (err) {
            console.error('Error checking payment status on timeout:', err.response?.data || err.message);
            setPaymentStatus('failed');
            setIsPaymentProcessed(true);
            setOrderId(null);
            toast.error('Thanh toán đã hết thời gian. Đơn hàng đã bị hủy. Vui lòng thử lại.', { autoClose: 2000 });
          }
        }
      }, 5 * 60 * 1000);
    } else {
      console.log('Conditions not met for payment status check:', { paymentMethod, transactionId, isPaymentProcessed });
    }
  
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [transactionId, paymentMethod, isPaymentProcessed, paymentStatus, token, user, state, checkoutItems, removeFromCart, fetchCartFromDB, setStep, setPendingOrder]);

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

        toast.success(`Đơn hàng ${orderData.orderId} đã được đặt thành công! Email xác nhận đã được gửi đến ${shippingInfo.email}.`, { autoClose: 2000 });
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

        const { orderUrl, zpTransToken, transactionId } = zalopayResponse.data;
        if (!transactionId) {
          throw new Error('Không nhận được TransactionId từ ZaloPay');
        }

        setQrCodeUrl(orderUrl);
        setZpTransToken(zpTransToken);
        setTransactionId(transactionId);
        setStep(3.5);

        window.open(orderUrl, '_blank');
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

  const handleOpenZaloPay = () => {
    if (zpTransToken) {
      const zalopayUrl = `zalopay://app?zp_trans_token=${zpTransToken}`;
      window.location.href = zalopayUrl;

      setTimeout(() => {
        toast.warning('Nếu ứng dụng ZaloPay không mở, vui lòng quét mã QR hoặc cài đặt ZaloPay.', {
          autoClose: 5000, // Tăng thời gian hiển thị lên 5 giây
          position: toast.POSITION.TOP_CENTER, // Đặt vị trí ở giữa trên cùng
          className: 'bg-yellow-100 text-yellow-800 border border-yellow-300', // Tùy chỉnh kiểu dáng
        });
      }, 2000);
    } else {
      toast.error('Không thể mở ZaloPay. Vui lòng thử lại.', { autoClose: 2000 });
    }
  };

  const formatDisplayDate = (isoDate) => {
    const date = toZonedTime(new Date(isoDate), timeZone);
    return format(date, 'dd/MM/yyyy', { timeZone });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Thanh tiến trình */}
        <div className="flex justify-between items-center mb-12 relative">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`flex-1 text-center relative z-10 ${step >= s ? 'text-indigo-600' : 'text-gray-400'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-semibold text-lg shadow-md transition-all duration-300 ${
                  step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              <p className="mt-3 text-sm font-medium tracking-wide">
                {s === 1 ? 'Thông Tin Giao Hàng' : s === 2 ? 'Thanh Toán & Vận Chuyển' : s === 3 ? 'Xác Nhận Đơn Hàng' : 'Hoàn Tất'}
              </p>
            </motion.div>
          ))}
          <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 z-0">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Bước 1: Thông tin giao hàng */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-6">
                Thông Tin Giao Hàng
              </h2>
              <div className="space-y-5">
                <input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleShippingChange}
                  placeholder="Họ và tên *"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 placeholder-gray-400"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  placeholder="Số điện thoại *"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 placeholder-gray-400"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  placeholder="Email *"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 placeholder-gray-400"
                  required
                />
                <select
                  name="province"
                  value={shippingInfo.province}
                  onChange={handleShippingChange}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-gray-700"
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
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-gray-700"
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
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-gray-700"
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
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 placeholder-gray-400"
                  required
                />
              </div>
              <button
                onClick={nextStep}
                className="mt-8 w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
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
                Tiếp Tục
              </button>
            </motion.div>
          )}

          {/* Bước 2: Phương thức thanh toán & vận chuyển */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-6">
                Phương Thức Thanh Toán & Vận Chuyển
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Chọn phương thức thanh toán</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-5 border rounded-lg cursor-pointer flex items-center gap-4 transition-all duration-200 ${
                        paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <FaMoneyBillWave className="text-indigo-600 text-2xl" />
                      <span className="text-gray-700 font-medium">Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    <div
                      onClick={() => setPaymentMethod('online')}
                      className={`p-5 border rounded-lg cursor-pointer flex items-center gap-4 transition-all duration-200 ${
                        paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <FaCreditCard className="text-indigo-600 text-2xl" />
                      <span className="text-gray-700 font-medium">Thanh toán online (ZaloPay)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Chọn phương thức vận chuyển</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setShippingMethod('standard')}
                      className={`p-5 border rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200 ${
                        shippingMethod === 'standard' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <FaTruck className="text-indigo-600 text-2xl" />
                        <span className="text-gray-700 font-medium">Giao hàng tiết kiệm</span>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">15.000 VND</span>
                    </div>
                    <div
                      onClick={() => setShippingMethod('fast')}
                      className={`p-5 border rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200 ${
                        shippingMethod === 'fast' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <FaTruck className="text-indigo-600 text-2xl" />
                        <span className="text-gray-700 font-medium">Giao hàng nhanh</span>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">30.000 VND</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={prevStep}
                  className="w-full py-4 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 font-semibold shadow-sm"
                >
                  Quay Lại
                </button>
                <button
                  onClick={nextStep}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                >
                  Tiếp Tục
                </button>
              </div>
            </motion.div>
          )}

          {/* Bước 3: Xác nhận đơn hàng */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-6">
                Xác Nhận Đơn Hàng
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông Tin Giao Hàng</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <span className="font-medium">{shippingInfo.fullName}</span> | {shippingInfo.phone} | {shippingInfo.email}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {shippingInfo.address},{' '}
                    {wards.find((w) => w.code === parseInt(shippingInfo.ward))?.name || ''},{' '}
                    {districts.find((d) => d.code === parseInt(shippingInfo.district))?.name || ''},{' '}
                    {provinces.find((p) => p.code === parseInt(shippingInfo.province))?.name || ''}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Phương Thức</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <span className="font-medium">Thanh toán:</span> {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    <span className="font-medium">Vận chuyển:</span> {shippingMethod === 'fast' ? 'Giao hàng nhanh' : 'Giao hàng tiết kiệm'} (
                    {shippingFee.toLocaleString('vi-VN')} VND)
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    <span className="font-medium">Dự kiến giao hàng:</span> {formatDisplayDate(getEstimatedDeliveryDate())}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Sản Phẩm</h3>
                  {checkoutItems.length === 0 ? (
                    <p className="text-gray-600">Không có sản phẩm nào để hiển thị</p>
                  ) : (
                    checkoutItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg shadow-sm" />
                          <div>
                            <span className="text-gray-800 font-medium">{item.name}</span>
                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-indigo-600">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between mt-6">
                    <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                    <span className="text-xl font-bold text-indigo-600">{totalAmount.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={prevStep}
                  className="w-full py-4 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 font-semibold shadow-sm"
                >
                  Quay Lại
                </button>
                <button
                  onClick={handleOrderSubmit}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  disabled={isLoading || checkoutItems.length === 0}
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : null}
                  Xác Nhận Đặt Hàng
                </button>
              </div>
            </motion.div>
          )}

          {/* Bước 3.5: Thanh toán với ZaloPay */}
          {step === 3.5 && paymentMethod === 'online' && (
            <motion.div
              key="step3.5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center"
            >
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-6">
                Thanh Toán Với ZaloPay
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Vui lòng quét mã QR bên dưới hoặc nhấn nút để mở ứng dụng ZaloPay và hoàn tất thanh toán.
              </p>
              {zpTransToken && (
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                    <QRCode value={`zalopay://app?zp_trans_token=${zpTransToken}`} size={220} />
                  </div>
                </div>
              )}
              <p className="text-gray-600 mb-6">
                <span className="font-medium">Tổng tiền:</span>{' '}
                <strong className="text-indigo-600 text-lg">{totalAmount.toLocaleString('vi-VN')} VND</strong>
              </p>
              <div className="flex flex-col gap-4 mb-6">
                <button
                  onClick={handleOpenZaloPay}
                  className="py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                >
                  Mở Ứng Dụng ZaloPay
                </button>
                <a
                  href={qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 px-6 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 font-semibold shadow-sm"
                >
                  Xem Trang Thanh Toán ZaloPay
                </a>
              </div>
              {paymentStatus === 'pending' && (
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-indigo-600" /> Đang chờ thanh toán...
                </p>
              )}
              {paymentStatus === 'failed' && (
                <p className="text-red-600 font-medium">
                  Thanh toán thất bại hoặc hết thời gian. Đơn hàng đã bị hủy. Vui lòng thử lại.
                </p>
              )}
              {paymentStatus === 'success' && (
                <p className="text-green-600 font-medium">
                  Thanh toán thành công! Đang xử lý đơn hàng...
                </p>
              )}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 font-semibold shadow-sm"
                >
                  Quay Lại
                </button>
                {paymentStatus === 'failed' && (
                  <button
                    onClick={handleOrderSubmit}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Thử Lại
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Bước 4: Hoàn tất */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center"
            >
              <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-6 animate-bounce" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-4">
                Đặt Hàng Thành Công!
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Cảm ơn bạn đã đặt hàng. Mã đơn hàng: <strong className="text-indigo-600">{orderId}</strong>. Chúng tôi sẽ liên hệ sớm để xác nhận.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/order/${orderId}`)}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                >
                  Xem Chi Tiết Đơn Hàng
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 font-semibold shadow-sm"
                >
                  Quay Về Trang Chủ
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