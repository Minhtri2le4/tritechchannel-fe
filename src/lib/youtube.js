// Đổi mọi kiểu link YouTube (watch?v=, youtu.be/, /shorts/, /embed/, /live/) thành link nhúng /embed/<id>.
// Link không nhận ra thì trả về nguyên văn.
export function youtubeEmbedUrl(url) {
  const id = youtubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

export function youtubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    if (u.hostname.endsWith('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
    if (!u.hostname.includes('youtube.com')) return null;
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{6,})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}
