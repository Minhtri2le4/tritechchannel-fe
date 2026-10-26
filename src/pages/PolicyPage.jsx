import { Link, NavLink, Navigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useSeo from '../hooks/useSeo';

// Nội dung các trang chính sách – sửa trực tiếp tại đây cho đúng quy định của shop
const POLICIES = {
  'chinh-sach-chung': {
    title: 'Chính sách chung',
    sections: [
      ['Phạm vi áp dụng', 'Áp dụng cho mọi đơn hàng đặt tại website tritechchannel.com, qua hotline, Zalo và mua trực tiếp tại cửa hàng TriTech Channel.'],
      ['Sản phẩm', 'Tất cả sản phẩm là hàng chính hãng, có nguồn gốc rõ ràng, xuất hóa đơn VAT theo yêu cầu. Hình ảnh trên website mang tính minh họa, màu sắc thực tế có thể chênh lệch nhẹ.'],
      ['Giá bán', 'Giá niêm yết đã bao gồm VAT (nếu có). Giá và chương trình khuyến mãi có thể thay đổi theo thời gian; đơn đã xác nhận được giữ nguyên giá tại thời điểm đặt.'],
      ['Xác nhận đơn hàng', 'Sau khi đặt hàng, nhân viên sẽ gọi điện xác nhận trong giờ làm việc. Đơn chỉ được giao sau khi xác nhận thành công.'],
    ],
  },
  'bao-hanh': {
    title: 'Chính sách bảo hành 1 đổi 1',
    sections: [
      ['1 đổi 1 trong 45 ngày', 'Sản phẩm lỗi phần cứng do nhà sản xuất trong 45 ngày kể từ ngày mua được đổi mới sản phẩm cùng loại hoặc tương đương, miễn phí.'],
      ['Bảo hành chính hãng', 'Sau 45 ngày, sản phẩm được bảo hành theo chính sách của hãng hoặc của TriTech Channel ghi trên phiếu bảo hành.'],
      ['Điều kiện', 'Sản phẩm còn tem bảo hành, không rơi vỡ, vào nước, cháy nổ hay can thiệp phần cứng/phần mềm trái phép. Kèm hóa đơn hoặc tra cứu được bằng số điện thoại/IMEI.'],
      ['Tra cứu bảo hành', 'Tra cứu thời hạn và lịch sử bảo hành tại trang Bảo hành bằng số điện thoại hoặc mã IMEI/Serial.'],
    ],
  },
  'giao-hang': {
    title: 'Giao hàng và kiểm tra',
    sections: [
      ['Phạm vi giao hàng', 'Giao hàng toàn quốc qua đối tác vận chuyển. Nội thành TP.HCM hỗ trợ giao nhanh trong 2 giờ; các tỉnh khác từ 1–3 ngày làm việc.'],
      ['Phí vận chuyển', 'Miễn phí giao hàng theo chương trình hiển thị khi đặt hàng. Trường hợp có phí sẽ được thông báo trước khi xác nhận đơn.'],
      ['Kiểm tra hàng', 'Quý khách được xem hàng trước khi thanh toán (không dùng thử). Vui lòng quay video khi mở hộp để được hỗ trợ nhanh nếu có sai sót.'],
      ['Thanh toán', 'Thanh toán khi nhận hàng (COD) hoặc chuyển khoản ngân hàng theo mã QR hiển thị sau khi đặt hàng.'],
    ],
  },
  'doi-tra': {
    title: 'Trả hàng và hoàn tiền',
    sections: [
      ['Trường hợp được trả hàng', 'Giao sai sản phẩm, sản phẩm lỗi do nhà sản xuất hoặc hư hỏng do vận chuyển (có video mở hộp).'],
      ['Thời hạn', 'Liên hệ hotline trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm trả lại cần còn đầy đủ hộp, phụ kiện và quà tặng kèm.'],
      ['Hoàn tiền', 'Hoàn tiền qua chuyển khoản trong 3–5 ngày làm việc sau khi cửa hàng nhận lại và kiểm tra sản phẩm.'],
    ],
  },
  'bao-mat': {
    title: 'Bảo mật thông tin',
    sections: [
      ['Thông tin thu thập', 'Họ tên, số điện thoại, email và địa chỉ nhận hàng do quý khách cung cấp khi đặt hàng, gửi yêu cầu thu cũ hoặc tra cứu bảo hành.'],
      ['Mục đích sử dụng', 'Chỉ dùng để xác nhận, giao hàng, bảo hành và chăm sóc khách hàng. Không bán hay chia sẻ cho bên thứ ba ngoài đơn vị vận chuyển phục vụ giao hàng.'],
      ['Lưu trữ và bảo vệ', 'Dữ liệu được lưu trên máy chủ có bảo mật. Quý khách có thể yêu cầu xem, sửa hoặc xóa thông tin bằng cách liên hệ hotline.'],
    ],
  },
};

export default function PolicyPage() {
  const { slug } = useParams();
  useSeo({ title: POLICIES[slug]?.title || 'Chính sách' });
  const policy = POLICIES[slug];
  if (!policy) return <Navigate to="/chinh-sach/chinh-sach-chung" replace />;

  return (
    <div className="max-w-[1100px] mx-auto px-3 md:px-4 py-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Link to="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight size={12} />
        <span className="font-medium text-gray-800">{policy.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 h-fit flex md:flex-col gap-1 overflow-x-auto">
          {Object.entries(POLICIES).map(([key, p]) => (
            <NavLink
              key={key}
              to={`/chinh-sach/${key}`}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold ${isActive ? 'bg-[#FFD400] text-black' : 'text-gray-700 hover:bg-gray-50'}`
              }
            >
              {p.title}
            </NavLink>
          ))}
        </nav>

        <article className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase mb-4">{policy.title}</h1>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            {policy.sections.map(([heading, text]) => (
              <section key={heading}>
                <h2 className="font-bold text-gray-900 mb-1">{heading}</h2>
                <p>{text}</p>
              </section>
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Cần hỗ trợ thêm? Gọi hotline <a href="tel:0325477841" className="font-semibold text-red-600">0325 477 841</a> hoặc nhắn Zalo cho TriTech Channel.
          </p>
        </article>
      </div>
    </div>
  );
}
