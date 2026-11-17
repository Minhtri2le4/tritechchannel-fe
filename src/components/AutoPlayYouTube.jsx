import { useEffect, useRef } from 'react';
import { youtubeEmbedUrl, youtubeId } from '../lib/youtube';

// Video YouTube tự chạy khi khách lướt tới (đang tắt tiếng – trình duyệt chỉ cho tự chạy khi tắt tiếng),
// chạy lặp liên tục. Khách bấm dừng thì thôi, không tự chạy lại nữa.
export default function AutoPlayYouTube({ url, title = 'YouTube video player', className = 'w-full h-full' }) {
  const frame = useRef(null);
  const userPaused = useRef(false);
  const visible = useRef(false);
  const id = youtubeId(url);

  const src = id
    ? `https://www.youtube.com/embed/${id}?enablejsapi=1&mute=1&playsinline=1&loop=1&playlist=${id}&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`
    : youtubeEmbedUrl(url);

  useEffect(() => {
    const el = frame.current;
    if (!el || !id) return undefined;
    const send = (func, args = []) => el.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    const play = () => {
      if (!userPaused.current) {
        send('mute');
        send('playVideo');
      }
    };

    // Nghe trạng thái từ YouTube: khách tự bấm dừng (state 2) khi video đang hiện -> không tự chạy lại
    const onMessage = (e) => {
      if (e.source !== el.contentWindow || typeof e.data !== 'string') return;
      try {
        const d = JSON.parse(e.data);
        const state = d.info?.playerState ?? (d.event === 'onStateChange' ? d.info : undefined);
        if (state === 2 && visible.current) userPaused.current = true;
        if (state === 1) userPaused.current = false;
      } catch {
        // tin nhắn khác
      }
    };
    window.addEventListener('message', onMessage);
    const onLoad = () => {
      el.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'tt-review' }), '*');
      if (visible.current) play();
    };
    el.addEventListener('load', onLoad);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) play();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.removeEventListener('load', onLoad);
      window.removeEventListener('message', onMessage);
    };
  }, [id]);

  return (
    <iframe
      ref={frame}
      className={className}
      src={src}
      title={title}
      frameBorder="0"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}
