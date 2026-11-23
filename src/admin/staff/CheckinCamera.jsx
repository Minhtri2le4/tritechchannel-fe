import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Loader2, MapPin, RefreshCw, X } from 'lucide-react';
import { adminApi } from '../adminApi';
import { getPosition, processPhoto, stampTime } from './photo';

// Chấm công bằng ảnh selfie: mở camera trước ngay trong trang (không cần app khác),
// chụp -> xem lại -> gửi. Ảnh được đóng dấu giờ + tên + "VÀO CA / RA CA". Có lấy vị trí nếu máy cho phép.
// Trình duyệt không mở được camera (VD trong Zalo) thì dùng nút chụp của hệ điều hành.
export default function CheckinCamera({ type, user, onClose, onDone }) {
  const video = useRef(null);
  const stream = useRef(null);
  const [ready, setReady] = useState(false);
  // Trình duyệt không có API camera -> dùng nút chụp của hệ điều hành ngay từ đầu
  const [fallback, setFallback] = useState(() => !navigator.mediaDevices?.getUserMedia);
  const [shot, setShot] = useState(null); // { file, url }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pos, setPos] = useState(undefined); // undefined: đang lấy, null: không có
  const label = type === 'IN' ? 'VÀO CA' : 'RA CA';
  const stamp = () => [stampTime(), `${label} · ${user?.name || ''}`, 'TriTech Channel'];

  const stop = () => stream.current?.getTracks().forEach((t) => t.stop());

  useEffect(() => {
    let cancelled = false;
    getPosition().then((p) => !cancelled && setPos(p));
    if (!navigator.mediaDevices?.getUserMedia) {
      return () => {
        cancelled = true;
      };
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream.current = s;
        if (video.current) {
          video.current.srcObject = s;
          video.current.play().catch(() => {});
        }
      })
      .catch(() => !cancelled && setFallback(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelled = true;
      stop();
      document.body.style.overflow = prev;
    };
  }, []);

  const capture = async () => {
    if (!video.current?.videoWidth) return;
    const file = await processPhoto(video.current, { max: 1280, mirror: true, stamp: stamp(), name: `checkin-${type}.jpg` });
    setShot({ file, url: URL.createObjectURL(file) });
  };
  const fromFile = async (f) => {
    if (!f) return;
    const file = await processPhoto(f, { max: 1280, stamp: stamp(), name: `checkin-${type}.jpg` });
    setShot({ file, url: URL.createObjectURL(file) });
  };
  const retake = () => {
    if (shot) URL.revokeObjectURL(shot.url);
    setShot(null);
    setError('');
  };
  const send = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await adminApi.staff.upload([shot.file]);
      await adminApi.staff.checkin({ type, photo: data[0].url, lat: pos?.lat ?? null, lng: pos?.lng ?? null });
      navigator.vibrate?.([30, 40, 30]);
      stop();
      onDone();
    } catch (err) {
      setError(err.message || 'Chấm công thất bại, thử lại');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <div>
          <p className="text-[11px] font-bold tracking-widest text-[#FFD400]">CHẤM CÔNG {label}</p>
          <p className="text-sm text-white/70">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}</p>
        </div>
        <button type="button" aria-label="Đóng" onClick={() => { stop(); onClose(); }} className="rounded-full bg-white/10 p-2">
          <X size={20} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {shot ? (
          <img src={shot.url} alt="Ảnh chấm công" className="max-h-full max-w-full object-contain" />
        ) : fallback ? (
          <div className="px-8 text-center">
            <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10"><Camera size={34} /></span>
            <p className="text-sm text-white/80">Bấm nút bên dưới để mở camera trước và chụp ảnh chấm công.</p>
          </div>
        ) : (
          <>
            <video
              ref={video}
              playsInline
              muted
              onLoadedMetadata={() => setReady(true)}
              className="h-full w-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {/* khung tròn hướng dẫn đặt mặt */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="aspect-square w-[68%] max-w-[340px] rounded-full border-[3px] border-dashed border-[#FFD400]/80" style={{ boxShadow: '0 0 0 2000px rgba(0,0,0,.35)' }} />
            </div>
            <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/80">Đưa mặt vào khung tròn</p>
          </>
        )}
      </div>

      <div className="space-y-3 px-5 pt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
        <p className="flex items-center justify-center gap-1 text-[11px] text-white/60">
          <MapPin size={12} />
          {pos === undefined ? 'Đang lấy vị trí…' : pos ? 'Đã ghi nhận vị trí' : 'Không có vị trí (vẫn chấm công được)'}
        </p>
        {error && <p className="rounded-lg bg-red-500/20 px-3 py-2 text-center text-sm text-red-200">{error}</p>}
        {shot ? (
          <div className="flex gap-3">
            <button type="button" disabled={busy} onClick={retake} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 font-semibold disabled:opacity-50">
              <RefreshCw size={18} /> Chụp lại
            </button>
            <button type="button" disabled={busy} onClick={send} className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-[#FFD400] font-black text-black disabled:opacity-60">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Xác nhận {label.toLowerCase()}
            </button>
          </div>
        ) : fallback ? (
          <label className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#FFD400] font-black text-black">
            <Camera size={20} /> Mở camera chụp
            <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => fromFile(e.target.files?.[0])} />
          </label>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              aria-label="Chụp"
              disabled={!ready}
              onClick={capture}
              className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white disabled:opacity-40 active:scale-95"
            >
              <span className="h-[60px] w-[60px] rounded-full bg-[#FFD400]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
