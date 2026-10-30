import { useEffect, useRef, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { shopApi } from '../services/shop';

// Tải script ngoài 1 lần (Google Identity Services, Facebook SDK)
const loaded = {};
const loadScript = (src) =>
  (loaded[src] ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => {
      delete loaded[src];
      reject(new Error('Không tải được nút đăng nhập, kiểm tra mạng'));
    };
    document.head.appendChild(s);
  }));

function GoogleButton({ clientId, onSession, onError }) {
  const ref = useRef(null);
  const cb = useRef({ onSession, onError });
  useEffect(() => {
    cb.current = { onSession, onError };
  });

  useEffect(() => {
    let cancelled = false;
    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              const { data } = await shopApi.loginGoogle(credential);
              cb.current.onSession(data);
            } catch (err) {
              cb.current.onError(err.message);
            }
          },
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          locale: 'vi',
          width: Math.min(ref.current.offsetWidth || 360, 400),
        });
      })
      .catch((err) => cb.current.onError(err.message));
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return <div ref={ref} className="flex h-11 w-full justify-center" />;
}

function FacebookButton({ appId, onSession, onError }) {
  const [busy, setBusy] = useState(false);

  const login = async () => {
    setBusy(true);
    try {
      await loadScript('https://connect.facebook.net/vi_VN/sdk.js');
      if (!window.__fbInit) {
        window.FB.init({ appId, cookie: false, xfbml: false, version: 'v21.0' });
        window.__fbInit = true;
      }
      const resp = await new Promise((resolve) => window.FB.login(resolve, { scope: 'public_profile,email' }));
      if (!resp.authResponse) return; // khách đóng cửa sổ
      const { data } = await shopApi.loginFacebook(resp.authResponse.accessToken);
      onSession(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={login}
      disabled={busy}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1877F2] text-sm font-semibold text-white hover:bg-[#166FE5] disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
      {busy ? 'Đang kết nối Facebook…' : 'Tiếp tục với Facebook'}
    </button>
  );
}

// Các nút đăng nhập mạng xã hội – chỉ hiện nút nào shop đã cấu hình trên server
export default function SocialLogin({ onSession, onError }) {
  const { data: config } = useFetch(() => shopApi.customerConfig(), []);
  if (!config?.googleClientId && !config?.facebookAppId) return null;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" /> hoặc <span className="h-px flex-1 bg-gray-200" />
      </div>
      {config.googleClientId && <GoogleButton clientId={config.googleClientId} onSession={onSession} onError={onError} />}
      {config.facebookAppId && <FacebookButton appId={config.facebookAppId} onSession={onSession} onError={onError} />}
    </div>
  );
}
