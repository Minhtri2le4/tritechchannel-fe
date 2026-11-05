import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock, FileSignature, Loader2, PackageCheck, Store, Truck, XCircle } from 'lucide-react';
import { shopApi } from '../services/shop';
import { assetUrl, formatDate, imgFallback } from '../lib/api';
import { TRADE_IN_EVENT, fetchMyTradeIns, markSeen, needsAnswer, needsSign, saveToken, vnd } from '../lib/tradeIn';
import TradeInContractSheet from './TradeInContractSheet';
import ShipToShopGuide from './ShipToShopGuide';

// Trạng thái hiển thị cho khách
const stage = (t) => {
  if (t.status === 'COMPLETED') return { text: 'Đã thu máy – giao dịch hoàn tất', cls: 'bg-emerald-100 text-emerald-700', Icon: PackageCheck };
  if (t.status === 'REJECTED') return { text: 'Shop không thu được máy này', cls: 'bg-gray-100 text-gray-600', Icon: XCircle };
  if (t.decision === 'DECLINED') return { text: 'Bạn đã từ chối bán', cls: 'bg-gray-100 text-gray-600', Icon: XCircle };
  if (t.signed) return { text: 'Đã ký giấy – chờ giao máy', cls: 'bg-blue-100 text-blue-700', Icon: CheckCircle2 };
  if (needsSign(t)) return { text: 'Đã đồng ý – cần ký giấy mua bán', cls: 'bg-amber-100 text-amber-800', Icon: FileSignature };
  if (needsAnswer(t)) return { text: 'Đã có giá – chờ bạn trả lời', cls: 'bg-red-100 text-red-700', Icon: Clock };
  return { text: 'Shop đang định giá', cls: 'bg-yellow-100 text-yellow-800', Icon: Clock };
};

// Danh sách yêu cầu định giá của khách: xem giá shop báo, Đồng ý / Không bán, chọn hình thức, ký giấy mua bán
export default function TradeInRequests({ focusToken }) {
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState('');
  const [choose, setChoose] = useState(null); // yêu cầu đang chọn hình thức bán
  const [signing, setSigning] = useState(null);

  const load = useCallback(() => fetchMyTradeIns().then(setItems), []);
  useEffect(() => {
    load();
    window.addEventListener(TRADE_IN_EVENT, load);
    const t = setInterval(load, 60000);
    return () => {
      window.removeEventListener(TRADE_IN_EVENT, load);
      clearInterval(t);
    };
  }, [load]);

  // Mở từ thông báo: cuộn tới yêu cầu đó
  useEffect(() => {
    if (!focusToken || !items) return;
    document.getElementById(`ti-${focusToken}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusToken, items]);

  const replace = (t) => {
    saveToken(t.token);
    markSeen(t);
    setItems((list) => list.map((x) => (x.token === t.token ? t : x)));
  };

  const decide = async (t, accept, method) => {
    setBusy(t.token);
    try {
      const { data } = await shopApi.tradeInDecide(t.token, { accept, method });
      replace(data);
      setChoose(null);
      if (accept) setSigning(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy('');
    }
  };

  if (!items?.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-3 text-base font-bold text-gray-900 sm:text-lg">Yêu cầu định giá của bạn</h2>
      <div className="space-y-3">
        {items.map((t) => {
          const s = stage(t);
          return (
            <div key={t.token} id={`ti-${t.token}`} className={`rounded-xl border p-3 ${t.token === focusToken ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'}`}>
              <div className="flex gap-3">
                {t.images?.[0] ? (
                  <img src={assetUrl(t.images[0])} onError={imgFallback} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">#{t.id}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{t.brand} {t.deviceName}</p>
                  <p className="text-xs text-gray-500">{t.condition} · {t.accessoryIncluded} · gửi {formatDate(t.createdAt)}</p>
                  <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>
                    <s.Icon size={12} /> {s.text}
                  </span>
                </div>
                {t.quotedPrice != null && (
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-gray-500">Shop định giá</p>
                    <p className="text-base font-black text-red-600">{vnd(t.quotedPrice)}</p>
                  </div>
                )}
              </div>

              {needsAnswer(t) && (
                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={busy === t.token} onClick={() => decide(t, false)} className="h-10 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    Không bán
                  </button>
                  <button type="button" disabled={busy === t.token} onClick={() => setChoose(t)} className="h-10 flex-[1.4] rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                    Đồng ý bán
                  </button>
                </div>
              )}
              {needsSign(t) && (
                <button type="button" onClick={() => setSigning(t)} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-bold text-white hover:bg-amber-600">
                  <FileSignature size={16} /> Điền thông tin & ký giấy mua bán
                </button>
              )}
              {t.signed && t.status !== 'COMPLETED' && (t.sellMethod === 'ONLINE' ? (
                <ShipToShopGuide requestId={t.id} />
              ) : (
                <p className="mt-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-800">
                  Bạn mang máy tới cửa hàng tại Thanh Đa, Bình Thạnh (gọi trước 0325 477 841). Shop kiểm tra máy rồi thanh toán ngay.
                </p>
              ))}
            </div>
          );
        })}
      </div>

      {/* Chọn hình thức bán */}
      {choose && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 md:items-center md:p-4" onClick={() => setChoose(null)}>
          <div className="sheet-up w-full rounded-t-2xl bg-white p-4 shadow-2xl md:max-w-[420px] md:rounded-2xl" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <p className="font-bold text-gray-900">Bạn muốn bán theo cách nào?</p>
            <p className="mt-0.5 text-xs text-gray-500">{choose.brand} {choose.deviceName} · {vnd(choose.quotedPrice)}</p>
            <div className="mt-4 space-y-2">
              {[
                ['STORE', Store, 'Bán tại cửa hàng', 'Mang máy tới Thanh Đa, Bình Thạnh – kiểm tra & nhận tiền ngay'],
                ['ONLINE', Truck, 'Bán online', 'Tự gửi máy về shop (không COD) – shop kiểm tra, chuyển khoản tiền máy + hoàn phí ship'],
              ].map(([key, Icon, title, sub]) => (
                <button
                  key={key}
                  type="button"
                  disabled={busy === choose.token}
                  onClick={() => decide(choose, true, key)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 text-left hover:border-red-400 hover:bg-red-50/40 disabled:opacity-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100"><Icon size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-gray-900">{title}</span>
                    <span className="block text-xs text-gray-500">{sub}</span>
                  </span>
                  {busy === choose.token && <Loader2 size={16} className="animate-spin" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {signing && (
        <TradeInContractSheet
          item={signing}
          onClose={() => setSigning(null)}
          onSigned={(t) => {
            replace(t);
            setSigning(null);
          }}
        />
      )}
    </div>
  );
}
