import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useUser } from './UserContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { token, user } = useUser();

  const fetchCartFromDB = async () => {
    if (!token || !user?.UserId) {
      console.log('No token or UserId, skipping fetchCartFromDB');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/cart?userId=${user.UserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const updatedCart = data.cart.map((item) => {
          const existingItem = cart.find((cartItem) => cartItem.id === item.id);
          return {
            id: item.id,
            name: item.name || 'Sản phẩm không xác định',
            price: item.price || 0,
            image: item.image || null,
            quantity: item.quantity || 1,
            discountedPrice: existingItem?.discountedPrice || item.discountedPrice || item.price,
            appliedDiscountCode: existingItem?.appliedDiscountCode || '',
          };
        });
        setCart(updatedCart);
        console.log('Updated cart after fetch:', updatedCart);
      } else {
        console.error('Fetch cart failed:', data.message);
      }
    } catch (err) {
      console.error('Error fetching cart from DB:', err);
      toast.error('Không thể tải giỏ hàng từ server!', { autoClose: 2000 });
    }
  };

  useEffect(() => {
    if (cart.length > 0) { // Chỉ gọi fetchCartFromDB nếu giỏ hàng không trống
      fetchCartFromDB();
    }
  }, [token, user]);

  const addToCart = async (product) => {
    console.log('Adding to cart:', product);
    if (!product?.id || !product?.quantity) {
      console.error('Invalid product data:', product);
      toast.error('Thông tin sản phẩm không hợp lệ!', { autoClose: 2000 });
      return;
    }

    const productName = product.Name || product.name || 'Sản phẩm không xác định';
    const prevCart = [...cart];
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity, discountedPrice: product.discountedPrice, appliedDiscountCode: product.appliedDiscountCode }
            : item
        );
      } else {
        return [...prevCart, { ...product }];
      }
    });
    toast.success(`${product.quantity} ${productName} đã được thêm vào giỏ hàng!`, { autoClose: 2000 });

    if (token && user?.UserId) {
      try {
        const parsedUserId = parseInt(user.UserId, 10);
        if (isNaN(parsedUserId)) throw new Error('UserId không hợp lệ');

        const existingProduct = cart.find((item) => item.id === product.id);
        const newQuantity = existingProduct ? existingProduct.quantity + product.quantity : product.quantity;

        const response = await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: parsedUserId,
            productId: product.id,
            quantity: newQuantity,
            discountCode: product.appliedDiscountCode || undefined,
          }),
        });

        const data = await response.json();
        console.log('Add API response:', data);
        if (!data.success) {
          setCart(prevCart);
          toast.error(`Không thể lưu ${productName} lên server: ${data.message}`, { autoClose: 2000 });
          await fetchCartFromDB();
        }
      } catch (err) {
        setCart(prevCart);
        console.error('Error saving to cart DB:', err);
        toast.error(`Lỗi khi lưu ${productName} lên server: ${err.message}`, { autoClose: 2000 });
        await fetchCartFromDB();
      }
    }
  };

  const removeFromCart = async (productId, showToast = true) => {
    console.log('Removing product:', productId);
    const product = cart.find((item) => item.id === productId);
    if (!product) {
      if (showToast) {
        toast.error('Không tìm thấy sản phẩm để xóa!', { autoClose: 2000 });
      }
      return;
    }

    const productName = product.name || product.Name || 'Sản phẩm không xác định';
    const prevCart = [...cart];
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    if (showToast) {
      toast.success(`${productName} đã được xóa khỏi giỏ hàng!`, { autoClose: 2000 });
    }

    if (token && user?.UserId) {
      try {
        const parsedUserId = parseInt(user.UserId, 10);
        if (isNaN(parsedUserId)) throw new Error('UserId không hợp lệ');

        const response = await fetch('http://localhost:5000/api/cart/remove', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: parsedUserId,
            productId,
          }),
        });

        const data = await response.json();
        console.log('Remove API response:', data);
        if (!data.success) {
          setCart(prevCart);
          if (showToast) {
            toast.error(`Không thể xóa ${productName} khỏi giỏ hàng trên server: ${data.message}`, { autoClose: 2000 });
          }
        } else {
          // Đồng bộ giỏ hàng từ server sau khi xóa thành công
          setCart(data.cart);
        }
      } catch (err) {
        setCart(prevCart);
        console.error('Error removing from cart DB:', err);
        if (showToast) {
          toast.error(`Lỗi khi xóa ${productName} khỏi giỏ hàng trên server: ${err.message}`, { autoClose: 2000 });
        }
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const prevCart = [...cart];
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );

    if (token && user?.UserId) {
      try {
        const parsedUserId = parseInt(user.UserId, 10);
        if (isNaN(parsedUserId)) throw new Error('UserId không hợp lệ');

        const response = await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: parsedUserId,
            productId,
            quantity,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          setCart(prevCart);
          toast.error(`Không thể cập nhật số lượng trên server: ${data.message}`, { autoClose: 2000 });
          await fetchCartFromDB();
        }
      } catch (err) {
        setCart(prevCart);
        console.error('Error updating cart DB:', err);
        toast.error(`Lỗi khi cập nhật số lượng trên server: ${err.message}`, { autoClose: 2000 });
        await fetchCartFromDB();
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, fetchCartFromDB }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;