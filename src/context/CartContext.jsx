import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify'; // Import toast

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        const updatedCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        if (existingProduct.quantity === 1) {
          toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
        }
        return updatedCart;
      } else {
        const updatedCart = [...prevCart, { ...product, quantity: 1 }];
        toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
        return updatedCart;
      }
    });
  };

  const removeFromCart = (productId) => {
    const product = cart.find(item => item.id === productId);
    if (product) {
      setCart((prevCart) => {
        const updatedCart = prevCart.filter(item => item.id !== productId);

        // Trước khi hiển thị toast, kiểm tra nếu giỏ hàng còn sản phẩm hay không.
        toast.dismiss();  // Loại bỏ tất cả các toast cũ trước khi hiển thị toast mới.
        toast.error(`${product.name} đã được xóa khỏi giỏ hàng!`);

        return updatedCart;
      });
    }
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) => {
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
