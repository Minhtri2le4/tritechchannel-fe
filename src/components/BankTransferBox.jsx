import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';

// Tài khoản nhận chuyển khoản của shop
const BANK = {
  bankName: 'MB Bank (Quân Đội)',
  accountName: 'HỒ MINH TRÍ',
  accountNo: '200320047979',
};

const bankQrUrl = (amount, content) =>
  `https://img.vietqr.io/image/MB-${BANK.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK.accountName)}`;

// Khung thanh toán chuyển khoản của 1 đơn: số tiền, mã QR (điền sẵn tiền + nội dung), thông tin TK có nút chép.
// Dùng ở màn hình sau khi đặt hàng và nút "Thanh toán ngay" trong Đơn mua.
export default function BankTransferBox({ code, total, phone }) {
  const [copied, setCopied] = useState('');
  const qr = bankQrUrl(total, code);
  const rows = [
    ['Ngân hàng', BANK.bankName, null],
    ['Số tài khoản', BANK.accountNo, BANK.accountNo],
    ['Chủ tài khoản', BANK.accountName, null],
    ['Số tiền', `${Number(total).toLocaleString('vi-VN')}đ`, String(total)],
    ['Nội dung', code, code],
  ];
  const copy = (label, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">Số tiền cần chuyển</p>
        <p className="text-3xl font-black text-red-600">{Number(total).toLocaleString('vi-VN')}đ</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-3">
        <p className="mb-2 text-center text-xs font-semibold text-gray-700">Mở app ngân hàng → quét mã QR (đã điền sẵn số tiền & nội dung)</p>
        <img src={qr} alt="Mã QR chuyển khoản" className="mx-auto h-56 w-56 object-contain" />
        <a href={qr} download={`QR-${code}.png`} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-600">
          <Download size={13} /> Lưu ảnh QR
        </a>
      </div>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 text-xs">
        {rows.map(([label, value, text]) => (
          <div key={label} className="flex items-center gap-2 px-3 py-2">
            <span className="w-24 shrink-0 text-gray-500">{label}</span>
            <strong className={`flex-1 break-all ${label === 'Nội dung' ? 'text-red-600' : 'text-gray-900'}`}>{value}</strong>
            {text && (
              <button
                type="button"
                onClick={() => copy(label, text)}
                className="flex shrink-0 items-center gap-1 rounded-md bg-gray-100 px-2 py-1 font-semibold text-gray-700 active:bg-gray-200"
              >
                {copied === label ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                {copied === label ? 'Đã chép' : 'Chép'}
              </button>
            )}
          </div>
        ))}
      </div>

      <ul className="space-y-1.5 rounded-xl bg-gray-50 p-3 text-[11px] text-gray-600">
        <li>• Ghi <b>đúng nội dung {code}</b> để shop nhận ra đơn của bạn.</li>
        <li>• Shop kiểm tra tiền về rồi xác nhận{phone ? <> và gọi qua SĐT <b>{phone}</b></> : null}.</li>
        <li>• Lỡ thoát ra? Vào <b>Tài khoản › Đơn mua › Chờ thanh toán</b> bấm <b>Thanh toán ngay</b> để mở lại mã QR.</li>
      </ul>
    </div>
  );
}
