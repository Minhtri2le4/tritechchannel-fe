// Trạng thái online kiểu Messenger từ lần cuối khách mở web (backend nhận "nhịp tim" ~45 giây/lần)
export const ONLINE_MS = 100 * 1000;

export const onlineInfo = (lastSeenAt, now = Date.now()) => {
  if (!lastSeenAt) return { online: false, text: 'Chưa truy cập' };
  const ago = now - new Date(lastSeenAt).getTime();
  if (ago < ONLINE_MS) return { online: true, text: 'Đang online' };
  const min = Math.floor(ago / 60000);
  if (min < 60) return { online: false, text: `Hoạt động ${Math.max(1, min)} phút trước` };
  const hours = Math.floor(min / 60);
  if (hours < 24) return { online: false, text: `Hoạt động ${hours} giờ trước` };
  const days = Math.floor(hours / 24);
  return { online: false, text: days < 30 ? `Hoạt động ${days} ngày trước` : 'Lâu rồi không truy cập' };
};

// Tên dễ đọc cho trang khách đang xem
export const pageName = (path = '/') => {
  if (path === '/' || path === '') return 'Trang chủ';
  if (path.startsWith('/product/')) return 'Xem sản phẩm';
  if (path.startsWith('/category/')) return 'Danh mục / tìm kiếm';
  if (path.startsWith('/cart')) return 'Giỏ hàng';
  if (path.startsWith('/tai-khoan')) return 'Tài khoản';
  if (path.startsWith('/blog')) return 'Blog';
  if (path.startsWith('/bao-hanh')) return 'Tra cứu bảo hành';
  if (path.startsWith('/thu-cu-doi-moi')) return 'Thu cũ đổi mới';
  if (path.startsWith('/dang-nhap')) return 'Đăng nhập';
  return path;
};
