import { useState } from 'react';
import { Check, Copy, PackageOpen } from 'lucide-react';
import { SHIP_TO } from '../lib/tradeIn';

// Hướng dẫn khách bán online gửi máy về shop: địa chỉ + SĐT người nhận, không gửi COD, shop hoàn phí ship
export default function ShipToShopGuide({ requestId }) {
  const [copied, setCopied] = useState(false);
  const text = `${SHIP_TO.name} - ${SHIP_TO.phone}\n${SHIP_TO.address}\nGhi chú: Thu cũ #${requestId}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // trình duyệt chặn copy – khách tự chép
    }
  };

  return (
    <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
      <p className="flex items-center gap-1.5 text-sm font-bold"><PackageOpen size={16} /> Quy trình gửi máy về shop</p>

      <div className="mt-2 rounded-lg border border-blue-200 bg-white p-2.5 text-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p>Người nhận: <b>{SHIP_TO.name}</b></p>
            <p>SĐT: <a href={`tel:${SHIP_TO.phone.replace(/\s/g, '')}`} className="font-bold text-blue-700">{SHIP_TO.phone}</a></p>
            <p>Địa chỉ: <b>{SHIP_TO.address}</b></p>
            <p>Ghi chú trên gói: <b>Thu cũ #{requestId}</b></p>
          </div>
          <button type="button" onClick={copy} className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2 py-1.5 font-semibold text-white hover:bg-blue-700">
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Đã chép' : 'Chép'}
          </button>
        </div>
      </div>

      <ol className="mt-2 list-decimal space-y-1 pl-4 leading-relaxed">
        <li>Đóng gói máy cẩn thận, kèm đủ phụ kiện như đã khai. Ghi <b>Thu cũ #{requestId}</b> bên ngoài gói hàng.</li>
        <li>Gửi qua đơn vị vận chuyển bất kỳ (GHTK, Viettel Post, J&amp;T…) tới địa chỉ trên.</li>
        <li><b>KHÔNG gửi COD / không thu hộ.</b> Bạn trả phí ship khi gửi và giữ lại biên lai.</li>
        <li>Shop nhận hàng, kiểm tra máy đúng tình trạng rồi <b>chuyển khoản tiền máy + hoàn lại phí ship</b> cho bạn. Gửi ảnh biên lai phí ship và số tài khoản qua Zalo {SHIP_TO.phone}.</li>
        <li>Nếu máy khác mô tả, shop sẽ gọi báo lại trước khi thanh toán.</li>
      </ol>
    </div>
  );
}
