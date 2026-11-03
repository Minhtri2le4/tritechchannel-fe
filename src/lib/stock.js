// stock trong danh sách là kho thật (backend đã cộng kho phiên bản / phân loại)
export const isSoldOut = (product) => product.stock != null && product.stock <= 0;
