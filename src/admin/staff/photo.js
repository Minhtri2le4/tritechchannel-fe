// Xử lý ảnh chụp của nhân viên ngay trên điện thoại trước khi tải lên:
// thu nhỏ (ảnh điện thoại 4–10MB -> ~300KB) và đóng dấu giờ + tên + nội dung lên góc ảnh như app chấm công.

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không đọc được ảnh'));
    img.src = src;
  });

const toFile = (canvas, name) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(new File([b], name, { type: 'image/jpeg' })) : reject(new Error('Không xử lý được ảnh'))), 'image/jpeg', 0.82)
  );

export const stampTime = (d = new Date()) =>
  d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

// Vẽ dải chữ mờ ở đáy ảnh: dòng 1 đậm (giờ), các dòng sau nhỏ (tên, việc…)
const drawStamp = (ctx, w, h, lines) => {
  if (!lines?.length) return;
  const size = Math.max(16, Math.round(w / 34));
  const pad = Math.round(size * 0.8);
  const lineH = Math.round(size * 1.35);
  const boxH = pad * 2 + lineH * lines.length;
  const grad = ctx.createLinearGradient(0, h - boxH * 1.4, 0, h);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - boxH * 1.4, w, boxH * 1.4);
  // vạch vàng thương hiệu
  ctx.fillStyle = '#FFD400';
  ctx.fillRect(pad, h - boxH + pad, Math.round(size * 0.22), lineH * lines.length - Math.round(size * 0.3));
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,.5)';
  ctx.shadowBlur = 4;
  lines.forEach((text, i) => {
    ctx.font = `${i === 0 ? 800 : 600} ${i === 0 ? Math.round(size * 1.15) : size}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = i === 0 ? '#FFD400' : '#fff';
    ctx.fillText(String(text).slice(0, 80), pad + Math.round(size * 0.7), h - boxH + pad + i * lineH);
  });
  ctx.shadowBlur = 0;
};

// source: File | HTMLVideoElement | HTMLCanvasElement. mirror: lật ngang (camera trước)
export async function processPhoto(source, { max = 1600, stamp, mirror = false, name = 'photo.jpg' } = {}) {
  let el = source;
  let url = null;
  if (source instanceof Blob) {
    url = URL.createObjectURL(source);
    el = await loadImage(url);
  }
  const sw = el.videoWidth || el.naturalWidth || el.width;
  const sh = el.videoHeight || el.naturalHeight || el.height;
  const scale = Math.min(1, max / Math.max(sw, sh));
  const w = Math.round(sw * scale);
  const h = Math.round(sh * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(el, 0, 0, w, h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawStamp(ctx, w, h, stamp);
  if (url) URL.revokeObjectURL(url);
  return toFile(canvas, name);
}

// Vị trí hiện tại (không bắt buộc – khách từ chối / máy không có GPS thì bỏ qua)
export const getPosition = (timeout = 6000) =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout, maximumAge: 60000 }
    );
  });
