// Ghép địa chỉ đầy đủ gửi lên đơn hàng: "Số nhà đường, Phường X, Tỉnh/Thành Y"
export const formatAddress = ({ street, ward, province }) => [street.trim(), ward, province].filter(Boolean).join(', ');
