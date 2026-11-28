import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
import useFetch from '../../hooks/useFetch';
import { formatDate, formatPrice } from '../../lib/api';
import { adminApi } from '../adminApi';
import { LABEL_SIZES, SHOP } from '../shopInfo';
import { Button, ErrorBox, Spinner } from '../ui';

const SIZE_KEY = 'tritech_label_size';
const readSize = () => {
  try {
    return LABEL_SIZES[localStorage.getItem(SIZE_KEY)] ? localStorage.getItem(SIZE_KEY) : 'a7';
  } catch {
    return 'a7';
  }
};

// Dòng thu tiền in to ở cuối phiếu – shipper nhìn là biết thu bao nhiêu
const paymentLine = (o) => {
  if (o.paymentStatus === 'PAID') return { text: 'ĐÃ THANH TOÁN – KHÔNG THU TIỀN', strong: false };
  if (o.paymentMethod === 'COD') return { text: `THU HỘ: ${formatPrice(o.total)}`, strong: true };
  return { text: `CHƯA NHẬN CHUYỂN KHOẢN: ${formatPrice(o.total)}`, strong: true };
};

// Trang in phiếu giao hàng cho máy in nhiệt (mặc định khổ A7).
// /admin/orders/:id/print – 1 đơn; /admin/orders/print?ids=1,2,3 – in hàng loạt (mỗi phiếu 1 trang).
export default function OrderPrintPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const ids = id ? [id] : (params.get('ids') || '').split(',').filter(Boolean);
  const key = ids.join(',');
  const { data: orders, loading, error } = useFetch(() => Promise.all(ids.map((x) => adminApi.orders.get(x))).then((list) => ({ data: list.map((r) => r.data ?? r) })), [key]);
  const [sizeKey, setSizeKey] = useState(readSize);
  const printedRef = useRef(false);
  const size = LABEL_SIZES[sizeKey];

  // Tự mở hộp thoại in 1 lần khi dữ liệu sẵn sàng (thêm ?preview vào URL để chỉ xem trước)
  useEffect(() => {
    if (!orders?.length || printedRef.current || params.has('preview')) return;
    printedRef.current = true;
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, [orders, params]);

  const changeSize = (k) => {
    setSizeKey(k);
    try {
      localStorage.setItem(SIZE_KEY, k);
    } catch {
      // không lưu được thì thôi
    }
  };

  if (loading && !orders) return <Spinner className="min-h-screen" />;
  if (error) return <div className="p-6"><ErrorBox error={error} /></div>;
  if (!orders?.length) return <div className="p-6 text-sm text-gray-500">Chưa chọn đơn nào để in</div>;

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white">
      {/* Khổ giấy cho lệnh in – thay đổi theo lựa chọn */}
      <style>{`
        @page { size: ${size.width}mm ${size.height}mm; margin: 0; }
        @media print {
          html, body { width: ${size.width}mm; margin: 0; padding: 0; background: #fff; }
          .label-page { break-after: page; page-break-after: always; }
          .label-page:last-child { break-after: auto; page-break-after: auto; }
        }
      `}</style>

      {/* Thanh công cụ – không in */}
      <div className="print:hidden sticky top-0 z-10 bg-gray-900 text-white px-4 py-2 flex flex-wrap items-center gap-2">
        <span className="font-bold text-sm mr-auto">
          Phiếu giao hàng · {orders.length > 1 ? `${orders.length} đơn` : orders[0].code}
        </span>
        <select value={sizeKey} onChange={(e) => changeSize(e.target.value)} className="bg-white text-black text-sm rounded px-2 py-1">
          {Object.entries(LABEL_SIZES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <Button size="sm" onClick={() => window.print()}>🖨 In phiếu</Button>
        <Button size="sm" variant="outline" onClick={() => window.close()}>Đóng</Button>
      </div>

      <div className="py-6 print:p-0 flex flex-col items-center gap-4 print:gap-0">
        {orders.map((o) => (
          <div key={o.id} className="label-page">
            <Label order={o} size={size} big={sizeKey === 'a6'} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Label({ order, size, big }) {
  const barcodeRef = useRef(null);
  const pay = paymentLine(order);

  // Mã vạch Code128 cho mã đơn
  useEffect(() => {
    if (!barcodeRef.current) return;
    JsBarcode(barcodeRef.current, order.code, {
      format: 'CODE128',
      width: big ? 2.6 : 1.9,
      height: big ? 50 : 34,
      displayValue: false,
      margin: 0,
    });
  }, [order.code, big]);

  return (
    <div
      className="bg-white text-black shadow-lg print:shadow-none overflow-hidden"
      style={{
        width: `${size.width}mm`,
        height: `${size.height}mm`,
        padding: '2.5mm',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: big ? '11pt' : '7.5pt',
        lineHeight: 1.25,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Shop + đơn vị vận chuyển */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2mm' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: big ? '14pt' : '10pt' }}>{SHOP.name}</div>
          <div>Hotline: {SHOP.hotline}</div>
        </div>
        <div style={{ border: '1px solid #000', padding: '0.5mm 1.5mm', fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'right' }}>
          {order.deliveryMethod === 'HOME' ? order.carrier || SHOP.carrier : 'NHẬN TẠI SHOP'}
          {order.trackingCode && <div style={{ fontWeight: 400, fontSize: big ? '8pt' : '6pt' }}>{order.trackingCode}</div>}
        </div>
      </div>

      {/* Mã vạch mã đơn */}
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', margin: '1.5mm 0', padding: '1mm 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg ref={barcodeRef} style={{ maxWidth: '100%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5mm' }}>
          <b style={{ fontSize: big ? '13pt' : '9pt', letterSpacing: '0.3px' }}>{order.code}</b>
          <span>{formatDate(order.createdAt, true)}</span>
        </div>
      </div>

      {/* Người nhận */}
      <div>
        <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: big ? '9pt' : '6.5pt' }}>Người nhận</div>
        <div style={{ fontWeight: 900, fontSize: big ? '13pt' : '9pt' }}>
          {order.gender ? `${order.gender} ` : ''}{order.fullName}
        </div>
        <div style={{ fontWeight: 700, fontSize: big ? '12pt' : '8.5pt' }}>{order.phone}</div>
        <div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {order.deliveryMethod === 'HOME' ? order.address : 'Nhận trực tiếp tại Thanh Đa'}
        </div>
      </div>

      {/* Sản phẩm – co giãn để vừa khổ giấy */}
      <div style={{ borderTop: '1px dashed #000', marginTop: '1.5mm', paddingTop: '1mm', flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: big ? '9pt' : '6.5pt' }}>
          Sản phẩm ({order.items.reduce((s, i) => s + i.quantity, 0)})
        </div>
        {order.items.map((it) => (
          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5mm' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {it.productName}
              {[it.variantLabel, it.color].filter(Boolean).length > 0 && ` (${[it.variantLabel, it.color].filter(Boolean).join(', ')})`}
            </span>
            <b style={{ whiteSpace: 'nowrap' }}>x{it.quantity}</b>
          </div>
        ))}
        {order.note && (
          <div style={{ marginTop: '1mm', fontStyle: 'italic', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            Ghi chú: {order.note}
          </div>
        )}
      </div>

      {/* Thu tiền */}
      <div
        style={{
          border: '1.5px solid #000',
          padding: '1mm',
          textAlign: 'center',
          fontWeight: 900,
          fontSize: pay.strong ? (big ? '14pt' : '10pt') : big ? '10pt' : '7.5pt',
          background: pay.strong ? '#000' : '#fff',
          color: pay.strong ? '#fff' : '#000',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {pay.text}
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.8mm', fontSize: big ? '8pt' : '6pt' }}>Cho xem hàng · Không thử · Cảm ơn quý khách!</div>
    </div>
  );
}
