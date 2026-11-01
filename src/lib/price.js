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

// Kho của 1 lựa chọn: phân loại có kho riêng thì lấy kho đó, không thì kho phiên bản / sản phẩm (giống backend khi trừ kho)
export const optionStock = (product, variant, colorName) => {
  const color = product.colors?.find((c) => c.name === colorName);
  if (color?.stock != null) return color.stock;
  if (variant) return variant.stock;
  return product.variants?.length ? product.variants.reduce((n, v) => n + v.stock, 0) : product.stock;
};
