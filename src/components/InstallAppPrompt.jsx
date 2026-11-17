import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share, SquarePlus, X } from 'lucide-react';

const KEY = 'tritech_install_dismissed';
const HIDE_DAYS = 7;
export const OPEN_INSTALL = 'tritech:open-install';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
// iPhone/iPad dùng Safari (Chrome trên iPhone không cài được web app)
const isIosSafari = () => {
  const ua = window.navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  return ios && !/CriOS|FxiOS|EdgiOS|Zalo|FBAN|FBAV|Instagram/.test(ua);
};
const dismissedRecently = () => {
  try {
    return Date.now() - Number(localStorage.getItem(KEY) || 0) < HIDE_DAYS * 86400000;
  } catch {
    return false;
  }
};

// Gợi ý cài web lên màn hình chính như một app (PWA).
// Android/Chrome máy tính: bấm "Cài đặt" là hiện hộp cài của trình duyệt. iPhone: hướng dẫn Chia sẻ → Thêm vào MH chính.
export default function InstallAppPrompt() {
  const { pathname } = useLocation();
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);
  const [installed, setInstalled] = useState(() => isStandalone());

  useEffect(() => {
    if (installed) return undefined;
    const onPrompt = (e) => {
      e.preventDefault(); // tự hiện nút của mình thay vì thanh mặc định
      setDeferred(e);
      if (!dismissedRecently()) setTimeout(() => setShow(true), 6000);
    };
    const onInstalled = () => {
      setInstalled(true);
      setShow(false);
    };
    // Nút "Cài app" ở chân trang mở lại gợi ý bất cứ lúc nào
    const onOpen = () => {
      if (isIosSafari()) setIosGuide(true);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener(OPEN_INSTALL, onOpen);
    let t;
    if (isIosSafari() && !dismissedRecently()) t = setTimeout(() => setShow(true), 8000);
    return () => {
      clearTimeout(t);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener(OPEN_INSTALL, onOpen);
    };
  }, [installed]);

  if (installed || !show || pathname.startsWith('/admin') || pathname === '/cart') return null;
  const canInstall = !!deferred;
  const ios = isIosSafari();
  if (!canInstall && !ios) {
    // Trình duyệt không hỗ trợ cài (VD trong Zalo/Facebook): chỉ hiện khi khách bấm nút ở chân trang
    return (
      <Shell onClose={() => setShow(false)}>
        <p className="text-xs text-gray-600">Mở <b>tritechchannel.com</b> bằng <b>Chrome</b> (Android) hoặc <b>Safari</b> (iPhone) để cài app TriTech.</p>
      </Shell>
    );
  }

  const close = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      // không lưu được thì thôi
    }
    setShow(false);
    setIosGuide(false);
  };
  const install = async () => {
    if (ios) return setIosGuide(true);
    deferred.prompt();
    const { outcome } = await deferred.userChoice.catch(() => ({ outcome: 'dismissed' }));
    setDeferred(null);
    if (outcome === 'accepted') setShow(false);
    else close();
  };

  return (
    <Shell onClose={close}>
      {iosGuide ? (
        <ol className="space-y-2 text-[13px] text-gray-700">
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">1</span>
            Bấm nút <b className="inline-flex items-center gap-0.5">Chia sẻ <Share size={14} className="text-blue-600" /></b> ở thanh dưới Safari
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">2</span>
            Chọn <b className="inline-flex items-center gap-0.5">Thêm vào MH chính <SquarePlus size={14} /></b>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">3</span>
            Bấm <b>Thêm</b> – biểu tượng TriTech hiện trên màn hình
          </li>
        </ol>
      ) : (
        <div className="flex items-center gap-3">
          <p className="flex-1 text-xs text-gray-600">Mua sắm nhanh hơn, mở 1 chạm từ màn hình chính, không cần tải từ cửa hàng ứng dụng.</p>
          <button type="button" onClick={install} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
            <Download size={16} /> Cài đặt
          </button>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children, onClose }) {
  return (
    <div className="fixed inset-x-3 bottom-20 z-[75] md:bottom-6 md:left-auto md:right-6 md:w-[380px]">
      <div className="toast-in rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl">
        <div className="mb-2 flex items-center gap-3">
          <img src="/app/icon-192.png" alt="" className="h-11 w-11 rounded-xl shadow" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-gray-900">Cài app TriTech Channel</p>
            <p className="text-[11px] text-gray-500">Miễn phí · nhẹ · không tốn dung lượng</p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="self-start p-1 text-gray-400 hover:text-black"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
