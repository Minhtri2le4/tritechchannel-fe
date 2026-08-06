import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lấy giỏ hàng từ localStorage hoặc khởi tạo mảng rỗng []
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('tritech_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Tự động lưu vào localStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem('tritech_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 1. Thêm sản phẩm vào giỏ
  const addToCart = (product, quantity = 1, selectedColor = '') => {
    setCartItems((prev) => {
      // Kiểm tra sản phẩm đã có trong giỏ chưa (trùng ID + trùng Màu)
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.color === (selectedColor || product.color)
      );

      if (existingIndex > -1) {
        // Nếu đã có -> Tăng số lượng
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        // Chưa có -> Thêm mới vào giỏ
        return [
          ...prev,
          {
            id: product.id,
            name: product.name || product.title,
            price: product.price,
            oldPrice: product.oldPrice || null,
            image: product.image || product.images?.[0] || 'https://via.placeholder.com/100',
            color: selectedColor || product.color || 'Mặc định',
            quantity: quantity,
            selected: true, // Mặc định tích chọn
            perks: product.perks || []
          }
        ];
      }
    });
  };

  // 2. Cập nhật số lượng (+ / -)
  const updateQuantity = (id, color, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.color === color) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      })
    );
  };

  // 3. Toggle chọn / bỏ chọn 1 sản phẩm
  const toggleSelect = (id, color) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.color === color ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // 4. Toggle chọn tất cả
  const toggleSelectAll = () => {
    const allSelected = cartItems.every((i) => i.selected);
    setCartItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  };

  // 5. Xóa 1 sản phẩm
  const removeItem = (id, color) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === id && i.color === color)));
  };

  // 6. Xóa tất cả sản phẩm
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        toggleSelect,
        toggleSelectAll,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);