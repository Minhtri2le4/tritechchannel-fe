/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { optionPrice } from '../lib/price';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lấy giỏ hàng từ localStorage hoặc khởi tạo mảng rỗng [].
  // Bỏ các món kiểu cũ (từ mock data, không có productId) vì backend không đặt hàng được.
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tritech_cart') || '[]');
      return Array.isArray(saved) ? saved.filter((i) => Number.isInteger(i.productId)) : [];
    } catch {
      return [];
    }
  });

  // Tự động lưu vào localStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem('tritech_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 1. Thêm sản phẩm vào giỏ
  // product: sản phẩm từ API; variant: phiên bản đã chọn (nếu có); selectedColor: tên màu (nếu có)
  const addToCart = (product, quantity = 1, selectedColor = '', variant = null) => {
    // id = sản phẩm + phiên bản; cùng id khác màu vẫn là 2 dòng riêng
    const id = `${product.id}:${variant?.id ?? 0}`;
    const color = selectedColor || '';

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === id && item.color === color);

      if (existingIndex > -1) {
        // Nếu đã có -> Tăng số lượng
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      // Chưa có -> Thêm mới vào giỏ
      return [
        ...prev,
        {
          id,
          productId: product.id,
          variantId: variant?.id ?? null,
          variantLabel: variant?.label ?? '',
          name: variant ? `${product.name} (${variant.label})` : product.name,
          price: optionPrice(product, variant, color).price,
          oldPrice: optionPrice(product, variant, color).originalPrice,
          image: product.image || product.images?.[0] || '',
          color,
          quantity,
          selected: true, // Mặc định tích chọn
          perks: product.perks || []
        }
      ];
    });
  };

  // Đổi phân loại / phiên bản của 1 món trong giỏ: bỏ dòng cũ, thêm dòng mới (gộp nếu trùng), giữ vị trí & trạng thái chọn
  const changeOption = (item, product, selectedColor, variant, quantity) => {
    const id = `${product.id}:${variant?.id ?? 0}`;
    const color = selectedColor || '';
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id && i.color === item.color);
      if (idx < 0) return prev;
      const rest = prev.filter((_, i) => i !== idx);
      const dup = rest.findIndex((i) => i.id === id && i.color === color);
      if (dup > -1) return rest.map((i, k) => (k === dup ? { ...i, quantity: i.quantity + quantity } : i));
      const next = {
        ...prev[idx],
        id,
        variantId: variant?.id ?? null,
        variantLabel: variant?.label ?? '',
        name: variant ? `${product.name} (${variant.label})` : product.name,
        price: optionPrice(product, variant, color).price,
        oldPrice: optionPrice(product, variant, color).originalPrice,
        image: product.colors?.find((c) => c.name === color)?.image || product.image || prev[idx].image,
        color,
        quantity,
      };
      return [...rest.slice(0, idx), next, ...rest.slice(idx)];
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

  // 7. Xóa các sản phẩm đã đặt hàng (đang tích chọn), giữ lại phần còn lại
  const removeSelected = () => setCartItems((prev) => prev.filter((i) => !i.selected));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        toggleSelect,
        toggleSelectAll,
        removeItem,
        clearCart,
        removeSelected,
        changeOption
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);