// Service worker của app TriTech (PWA).
// - Trang (HTML): luôn lấy bản mới từ mạng; mất mạng thì dùng bản đã lưu, không có thì trang "mất kết nối".
// - File giao diện /assets/* (tên có mã băm, không bao giờ đổi nội dung): lưu lại, lần sau mở tức thì.
// - Ảnh sản phẩm: dùng bản đã lưu ngay rồi cập nhật ngầm.
// - API, admin, thanh toán: KHÔNG lưu, luôn lấy mới (giá, kho, đơn hàng phải luôn đúng).
const VERSION = 'tt-v1';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const IMAGES = `${VERSION}-images`;
const PRECACHE = ['/offline.html', '/app/icon-192.png', '/assets/logo.png', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const trim = async (name, max) => {
  const c = await caches.open(name);
  const keys = await c.keys();
  for (const k of keys.slice(0, Math.max(0, keys.length - max))) await c.delete(k);
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Trang web (điều hướng) – trừ trang quản trị
  if (req.mode === 'navigate') {
    if (url.pathname.startsWith('/admin')) return;
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put('/', copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/')) || caches.match('/offline.html'))
    );
    return;
  }

  // File giao diện có mã băm trên cùng tên miền
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/') && /-[\w-]{8,}\.(js|css)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSETS).then((c) => c.put(req, copy)).then(() => trim(ASSETS, 60)).catch(() => {});
            }
            return res;
          })
      )
    );
    return;
  }

  // Ảnh (ảnh web + ảnh sản phẩm trên máy chủ API): dùng bản lưu ngay, cập nhật ngầm
  const isImage = req.destination === 'image' && (url.origin === self.location.origin || url.pathname.startsWith('/uploads/'));
  if (isImage) {
    e.respondWith(
      caches.open(IMAGES).then(async (c) => {
        const hit = await c.match(req);
        const fresh = fetch(req)
          .then((res) => {
            if (res.ok || res.type === 'opaque') c.put(req, res.clone()).then(() => trim(IMAGES, 150)).catch(() => {});
            return res;
          })
          .catch(() => hit);
        return hit || fresh;
      })
    );
  }
  // Còn lại (API, bản đồ, YouTube...) để trình duyệt tự xử lý như bình thường
});
