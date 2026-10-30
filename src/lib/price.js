// Giá khách trả cho 1 lựa chọn: phân loại có giá riêng thì lấy giá đó, không thì giá phiên bản, không thì giá sản phẩm
// (backend tính tiền đơn hàng theo đúng thứ tự này)
export const optionPrice = (product, variant, colorName) => {
  const color = product.colors?.find((c) => c.name === colorName);
  if (color?.price != null) return { price: color.price, originalPrice: color.originalPrice || null };
  if (variant) return { price: variant.price, originalPrice: variant.originalPrice || null };
  return { price: product.price, originalPrice: product.originalPrice || null };
};

// Mọi mức giá có thể mua được – để hiện khoảng giá "từ … đến …" khi khách chưa chọn
export const allPrices = (product) => {
  const base = product.variants?.length ? product.variants.map((v) => v.price) : [product.price];
  const colors = product.colors || [];
  return colors.length ? colors.flatMap((c) => (c.price != null ? [c.price] : base)) : base;
};
