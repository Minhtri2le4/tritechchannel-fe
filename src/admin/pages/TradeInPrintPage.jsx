import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { formatPrice } from '../../lib/api';
import { moneyInWords } from '../../lib/tradeIn';
import { adminApi } from '../adminApi';
import { SHOP } from '../shopInfo';
import { Button, ErrorBox, Spinner } from '../ui';

// In "Giấy mua bán" khổ A5 cho máy thu cũ – lưu hồ sơ nguồn gốc hàng khi quản lý thị trường kiểm tra.
// Khách đã ký online thì điền sẵn thông tin + chữ ký; chưa ký thì in bản có sẵn thông tin máy để ký tay.
const dots = { flex: 1, borderBottom: '1px dotted #000', minHeight: '1.25em', padding: '0 1mm', fontWeight: 600 };

function Line({ label, value, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1mm', marginTop: '1.6mm' }}>
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
      <span style={dots}>{value}</span>
      {children}
    </div>
  );
}
function Pair({ a, av, b, bv }) {
  return (
    <div style={{ display: 'flex', gap: '3mm' }}>
      <div style={{ flex: 1.2 }}><Line label={a} value={av} /></div>
      <div style={{ flex: 1 }}><Line label={b} value={bv} /></div>
    </div>
  );
}

const vnDate = (d) => {
  if (!d) return null;
  const x = new Date(d);
  return { d: String(x.getDate()).padStart(2, '0'), m: String(x.getMonth() + 1).padStart(2, '0'), y: x.getFullYear() };
};
const ddmmyyyy = (s) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.split('-').reverse().join('/') : s || '');

export default function TradeInPrintPage() {
  const { id } = useParams();
  const { data: t, loading, error } = useFetch(() => adminApi.tradeIns.get(id), [id]);
  const printed = useRef(false);

  useEffect(() => {
    if (!t || printed.current || new URLSearchParams(window.location.search).has('preview')) return;
    printed.current = true;
    const timer = setTimeout(() => window.print(), 500);
    return () => clearTimeout(timer);
  }, [t]);

  if (loading && !t) return <Spinner className="min-h-screen" />;
  if (error) return <div className="p-6"><ErrorBox error={error} /></div>;

  const s = t.sellerInfo || {};
  const isPhone = /điện thoại|tablet|máy tính bảng/i.test(t.category);
  const thing = isPhone ? 'điện thoại' : 'thiết bị';
  const date = vnDate(t.signedAt);
  const price = t.quotedPrice;

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white">
      <style>{`
        @page { size: 148mm 210mm; margin: 0; }
        @media print { html, body { width: 148mm; margin: 0; padding: 0; background: #fff; } }
      `}</style>

      <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-gray-900 px-4 py-2 text-white">
        <span className="mr-auto text-sm font-bold">Giấy mua bán · Thu cũ #{t.id} · {t.fullName}</span>
        {!t.signedAt && <span className="rounded bg-amber-400 px-2 py-0.5 text-xs font-bold text-black">Khách chưa ký online – in để ký tay</span>}
        <Button size="sm" onClick={() => window.print()}>🖨 In A5</Button>
        <Button size="sm" variant="outline" onClick={() => window.close()}>Đóng</Button>
      </div>

      <div className="flex justify-center py-6 print:p-0">
        <div
          className="bg-white text-black shadow-lg print:shadow-none"
          style={{
            width: '148mm',
            minHeight: '210mm',
            padding: '9mm 10mm',
            boxSizing: 'border-box',
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '10.5pt',
            lineHeight: 1.3,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '11pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div>Độc Lập - Tự Do - Hạnh Phúc</div>
            <div style={{ letterSpacing: '1px' }}>-------oOo-------</div>
            <div style={{ fontWeight: 700, fontSize: '15pt', marginTop: '3mm' }}>GIẤY MUA BÁN {thing.toUpperCase()}</div>
            <div style={{ fontStyle: 'italic', marginTop: '1mm' }}>
              Ngày {date ? date.d : '........'} tháng {date ? date.m : '........'} năm {date ? date.y : '20......'}
            </div>
          </div>

          <div style={{ marginTop: '3mm' }}>
            <Line label="Tôi tên là:" value={s.fullName || t.fullName} />
            <Pair a="Điện thoại:" av={s.phone || t.phone} b="Số CCCD:" bv={s.cccd} />
            <Pair a="cấp ngày:" av={ddmmyyyy(s.cccdDate)} b="Nơi cấp:" bv={s.cccdPlace} />
            <Line label="HKTT:" value={s.address} />
            <div style={{ fontWeight: 700, marginTop: '1.6mm' }}>Là chủ {thing}.</div>
            <Line label="Imei:" value={s.imei} />
            <Pair a="Loại máy:" av={s.deviceType || t.category?.replace(/^Khác:\s*/, '')} b="Mẫu máy:" bv={s.model || `${t.brand} ${t.deviceName}`} />
            <Line label="Tình trạng máy:" value={s.condition || t.condition} />

            <div style={{ fontWeight: 700, marginTop: '2mm' }}>Chiếc {thing} trên được tiến hành bán cho:</div>
            <Line label="Ông/Bà:" value={`${SHOP.ownerName} (${SHOP.name})`} />
            <Pair a="Điện thoại:" av={SHOP.hotline} b="Số CCCD:" bv="" />
            <Pair a="cấp ngày:" av="" b="Nơi cấp:" bv="" />
            <Line label="Địa chỉ:" value={SHOP.fullAddress} />

            <Line label="Bên bán đã tiến hành giao máy và các giấy tờ liên quan đến máy bao gồm:" value="" />
            <Line label="" value={t.accessoryIncluded?.replace(/^Khác:\s*/, '')} />
            <Line label={`Bên mua đã tiến hành giao đủ số tiền mua chiếc ${thing} là:`} value={price != null ? formatPrice(price) : ''} />
            <Line label="(Bằng chữ:" value={price != null ? moneyInWords(price) : ''}>
              <span>)</span>
            </Line>
            <Line label={`Kể từ ngày ${date ? `${date.d}/${date.m}/${date.y}` : '...../...../20.....'}, chiếc ${thing} kiểm soát:`} value={s.imei} />
            <Line label="thuộc quyền sở hữu của Ông/bà" value={SHOP.ownerName} />
            <p style={{ marginTop: '1.6mm' }}>
              Chủ {thing} mới hoàn toàn chịu trách nhiệm pháp lý về việc sử dụng, lưu hành chiếc {thing} theo quy định của pháp luật.
              Bên bán cam kết {thing} thuộc sở hữu hợp pháp, không phải tài sản trộm cắp, tranh chấp hay cầm cố.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '4mm' }}>
            <div style={{ width: '45%' }}>
              <div style={{ fontWeight: 700 }}>NGƯỜI BÁN</div>
              <div style={{ fontStyle: 'italic', fontSize: '9pt' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: '20mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.signature && <img src={t.signature} alt="" style={{ maxHeight: '20mm', maxWidth: '100%' }} />}
              </div>
              <div style={{ fontWeight: 700 }}>{t.signedAt ? s.fullName : ''}</div>
            </div>
            <div style={{ width: '45%' }}>
              <div style={{ fontWeight: 700 }}>NGƯỜI MUA</div>
              <div style={{ fontStyle: 'italic', fontSize: '9pt' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: '20mm' }} />
              <div style={{ fontWeight: 700 }}>{SHOP.ownerName}</div>
            </div>
          </div>
          {t.signedAt && (
            <div style={{ marginTop: '3mm', fontSize: '7.5pt', color: '#555', textAlign: 'center' }}>
              Người bán ký điện tử trên tritechchannel.com lúc {new Date(t.signedAt).toLocaleString('vi-VN')} · Mã yêu cầu #{t.id}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
