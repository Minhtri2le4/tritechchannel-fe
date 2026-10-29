import { youtubeId } from './youtube';

// Nhận link video YouTube / TikTok / Facebook, trả về thông tin để nhúng:
// { kind, src (link iframe), thumb (ảnh xem trước nếu có), vertical (video dọc) } hoặc null nếu không nhận ra.
export function videoEmbed(url) {
  if (!url) return null;
  const yt = youtubeId(url);
  if (yt) {
    return {
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${yt}`,
      thumb: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
      vertical: /\/shorts\//.test(url),
    };
  }
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('tiktok.com')) {
      const id = u.pathname.match(/\/video\/(\d+)/)?.[1];
      return id ? { kind: 'tiktok', src: `https://www.tiktok.com/embed/v2/${id}`, thumb: null, vertical: true } : null;
    }
    if (u.hostname.includes('facebook.com') || u.hostname === 'fb.watch') {
      const vertical = /\/reel\//.test(u.pathname);
      return {
        kind: 'facebook',
        src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.trim())}&show_text=false`,
        thumb: null,
        vertical,
      };
    }
  } catch {
    // link không hợp lệ
  }
  return null;
}
