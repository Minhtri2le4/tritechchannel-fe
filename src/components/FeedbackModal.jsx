import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, Loader2, MessageSquareHeart, Star, X } from 'lucide-react';
import { shopApi } from '../services/shop';
import { useCustomer } from '../context/CustomerContext';

const TOPICS = ['Giao diện', 'Lỗi website', 'Sản phẩm / giá', 'Giao hàng / dịch vụ', 'Khác'];
const STAR_TEXT = ['', 'Rất tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

// Khách góp ý về website (mở từ footer): chủ đề, chấm sao, nội dung, tên/liên hệ (không bắt buộc)
export default function FeedbackModal({ onClose }) {
  const { pathname } = useLocation();
  const { customer } = useCustomer();
  const [topic, setTopic] = useState(TOPICS[0]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState('');
  const [name, setName] = useState(customer?.fullName || '');
  const [contact, setContact] = useState(customer?.phone || customer?.email || '');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (message.trim().length < 5) return setError('Vui lòng viết góp ý của bạn (ít nhất 5 ký tự)');
    setBusy(true);
    try {
      await shopApi.sendFeedback({ topic, rating: rating || null, message: message.trim(), name: name.trim(), contact: contact.trim(), page: pathname });
      setDone(true);
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const shown = hover || rating;
  const input = 'w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white';

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 md:items-center md:p-4" onClick={onClose}>
      <div
        className="sheet-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-w-[480px] md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold text-gray-900"><MessageSquareHeart size={18} className="text-red-600" /> Góp ý về website</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="p-1 text-gray-500 hover:text-black"><X size={22} /></button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 size={52} className="mx-auto text-emerald-500" />
            <p className="mt-3 text-lg font-bold text-gray-900">Cảm ơn bạn đã góp ý!</p>
            <p className="mt-1 text-sm text-gray-600">TriTech Channel đã nhận được và sẽ cải thiện website tốt hơn mỗi ngày.</p>
            <button type="button" onClick={onClose} className="mt-6 h-11 w-full rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700">Đóng</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex-1 space-y-4 overflow-y-auto p-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <div>
              <p className="mb-2 text-xs font-bold text-gray-700">Bạn muốn góp ý về</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${topic === t ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold text-gray-700">Bạn thấy website thế nào? <span className="font-normal text-gray-400">(không bắt buộc)</span></p>
              <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${n} sao`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n === rating ? 0 : n)} className="p-0.5">
                    <Star size={28} className={n <= shown ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                  </button>
                ))}
                {shown > 0 && <span className="ml-2 text-sm font-semibold text-amber-600">{STAR_TEXT[shown]}</span>}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold text-gray-700">Nội dung góp ý *</p>
              <textarea
                rows={4}
                maxLength={2000}
                className={`${input} resize-none`}
                placeholder="VD: Trang sản phẩm tải chậm, muốn có thêm bộ lọc theo giá, gặp lỗi khi thanh toán..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-bold text-gray-700">Tên của bạn</p>
                <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Không bắt buộc" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold text-gray-700">SĐT / email để shop phản hồi</p>
                <input className={input} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Không bắt buộc" />
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
              {busy && <Loader2 size={16} className="animate-spin" />} Gửi góp ý
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
