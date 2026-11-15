import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Copy, Heart, Link2, Loader2, MessageCircle, Send, Share2, Trash2, X } from 'lucide-react';
import { shopApi } from '../services/shop';
import { assetUrl } from '../lib/api';
import { useCustomer } from '../context/CustomerContext';
import { visitorId } from '../hooks/usePresence';
import { SITE_URL } from '../hooks/useSeo';

const PAGE = 5;

// "3 phút", "2 giờ", "5 ngày" như Facebook
const timeAgo = (d) => {
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} ngày`;
  return new Date(d).toLocaleDateString('vi-VN');
};
const short = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '')}K` : String(n));

function Avatar({ author, size = 36 }) {
  const style = { width: size, height: size };
  if (author?.avatar) {
    return <img src={assetUrl(author.avatar)} alt="" referrerPolicy="no-referrer" style={style} className={`shrink-0 rounded-full object-cover ${author.isShop ? 'bg-[#FFD400] p-1' : 'bg-gray-100'}`} />;
  }
  const letter = (author?.name || '?').trim().split(/\s+/).pop().charAt(0).toUpperCase();
  return <span className="flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ ...style, background: 'linear-gradient(135deg,#fbbf24,#f87171)' }}>{letter}</span>;
}

// Thả tim, bình luận, chia sẻ dưới bài blog – kiểu Facebook
export default function PostSocial({ post }) {
  const { customer } = useCustomer();
  const vid = useRef(visitorId());
  const [data, setData] = useState(null);
  const [pop, setPop] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // bình luận đang trả lời
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [show, setShow] = useState(PAGE);
  const [error, setError] = useState('');
  const box = useRef(null);

  const load = useCallback(
    () => shopApi.postSocial(post.slug, vid.current || undefined).then((r) => setData(r.data)).catch(() => {}),
    [post.slug]
  );
  // Đăng nhập / đăng xuất thì tải lại để biết mình đã tim chưa, bình luận nào của mình
  useEffect(() => {
    load();
  }, [load, customer?.id]);

  const url = `${SITE_URL}/blog/${post.slug}`;
  const loginLink = `/dang-nhap?next=${encodeURIComponent(`/blog/${post.slug}`)}`;

  const toggleLike = async () => {
    if (!data) return;
    const liked = !data.liked;
    setData({ ...data, liked, likes: data.likes + (liked ? 1 : -1) });
    if (liked) {
      setPop(true);
      setTimeout(() => setPop(false), 450);
    }
    try {
      const { data: r } = await shopApi.likePost(post.slug, vid.current || undefined);
      setData((d) => ({ ...d, ...r }));
    } catch {
      load();
    }
  };

  const countShare = () =>
    shopApi.sharePost(post.slug).then((r) => setData((d) => (d ? { ...d, shares: r.data.shares } : d))).catch(() => {});

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, 'fbshare', 'width=620,height=560');
    countShare();
    setShareOpen(false);
  };
  // Messenger chỉ mở thẳng được trên điện thoại (máy tính chia sẻ qua nút Facebook)
  const mobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent);
  const shareMessenger = () => {
    window.location.href = `fb-messenger://share?link=${encodeURIComponent(url)}`;
    countShare();
    setShareOpen(false);
  };
  const shareNative = async () => {
    try {
      await navigator.share({ title: post.title, url });
      countShare();
    } catch {
      // khách huỷ
    }
    setShareOpen(false);
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      countShare();
    } catch {
      // trình duyệt chặn copy
    }
  };

  const send = async (content, parentId = null) => {
    if (!content.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      const { data: comments } = await shopApi.commentPost(post.slug, { content: content.trim(), parentId });
      setData((d) => ({ ...d, comments, commentCount: comments.length }));
      if (parentId) {
        setReplyTo(null);
        setReplyText('');
      } else {
        setText('');
      }
    } catch (err) {
      setError(err.status === 401 ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' : err.details?.[0]?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  const likeComment = async (c) => {
    const flip = (list, r) => list.map((x) => (x.id === c.id ? { ...x, ...r } : x));
    setData((d) => ({ ...d, comments: flip(d.comments, { liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }) }));
    try {
      const { data: r } = await shopApi.likeComment(c.id, vid.current || undefined);
      setData((d) => ({ ...d, comments: flip(d.comments, r) }));
    } catch {
      load();
    }
  };

  const remove = async (c) => {
    if (!confirm('Xoá bình luận này?')) return;
    await shopApi.deleteComment(c.id).catch(() => {});
    load();
  };

  const startReply = (c, top) => {
    if (!customer) return;
    setReplyTo(top.id);
    setReplyText(c.id !== top.id ? `@${c.author.name} ` : '');
  };

  const comments = data?.comments || [];
  const tops = comments.filter((c) => !c.parentId).reverse(); // mới nhất lên đầu
  const repliesOf = (id) => comments.filter((c) => c.parentId === id);

  const bubble = (c, top) => (
    <div key={c.id} className="flex gap-2">
      <Avatar author={c.author} size={top.id === c.id ? 36 : 28} />
      <div className="min-w-0 flex-1">
        <div className="relative inline-block max-w-full rounded-2xl bg-gray-100 px-3 py-2">
          <p className="flex items-center gap-1 text-[13px] font-bold text-gray-900">
            {c.author.name}
            {c.author.isShop && (
              <span className="inline-flex items-center gap-0.5 rounded bg-red-600 px-1 py-px text-[9px] font-bold uppercase text-white">
                <BadgeCheck size={10} /> Shop
              </span>
            )}
          </p>
          <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.content}</p>
          {c.likes > 0 && (
            <span className="absolute -bottom-2.5 right-1 flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[11px] text-gray-600 shadow">
              <Heart size={11} className="fill-red-500 text-red-500" /> {c.likes}
            </span>
          )}
        </div>
        <div className={`${c.likes > 0 ? "mt-2.5" : "mt-1"} flex flex-wrap items-center gap-3 px-2 text-xs text-gray-500`}>
          <span>{timeAgo(c.createdAt)}</span>
          <button type="button" onClick={() => likeComment(c)} className={`font-bold hover:underline ${c.liked ? 'text-red-600' : ''}`}>Thích</button>
          {customer ? (
            <button type="button" onClick={() => startReply(c, top)} className="font-bold hover:underline">Trả lời</button>
          ) : (
            <Link to={loginLink} className="font-bold hover:underline">Trả lời</Link>
          )}
          {c.mine && <button type="button" onClick={() => remove(c)} className="inline-flex items-center gap-0.5 hover:text-red-600"><Trash2 size={11} /> Xoá</button>}
        </div>
      </div>
    </div>
  );

  return (
    <section ref={box} className="mt-4 rounded-2xl border border-gray-200 bg-white px-3 pb-3 shadow-sm md:px-5">
      {/* Số tim / bình luận / chia sẻ */}
      <div className="flex items-center justify-between border-b border-gray-100 py-2.5 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          {data?.likes > 0 && (
            <>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500"><Heart size={11} className="fill-white text-white" /></span>
              {short(data.likes)}
            </>
          )}
        </span>
        <span className="flex gap-3">
          {data?.commentCount > 0 && <span>{data.commentCount} bình luận</span>}
          {data?.shares > 0 && <span>{data.shares} lượt chia sẻ</span>}
        </span>
      </div>

      {/* Thích – Bình luận – Chia sẻ */}
      <div className="relative grid grid-cols-3 border-b border-gray-100 py-1 text-sm font-semibold text-gray-600">
        <button type="button" onClick={toggleLike} className={`flex items-center justify-center gap-2 rounded-lg py-2 hover:bg-gray-100 ${data?.liked ? 'text-red-600' : ''}`}>
          <Heart size={20} className={`${data?.liked ? 'fill-red-500 text-red-500' : ''} ${pop ? 'heart-pop' : ''}`} /> {data?.liked ? 'Đã thích' : 'Thích'}
        </button>
        <button type="button" onClick={() => box.current?.querySelector('textarea')?.focus()} className="flex items-center justify-center gap-2 rounded-lg py-2 hover:bg-gray-100">
          <MessageCircle size={20} /> Bình luận
        </button>
        <button type="button" onClick={() => setShareOpen((v) => !v)} className="flex items-center justify-center gap-2 rounded-lg py-2 hover:bg-gray-100">
          <Share2 size={20} /> Chia sẻ
        </button>

        {shareOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShareOpen(false)} />
            <div className="sheet-up absolute bottom-full right-0 z-50 mb-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-sm shadow-2xl">
              <div className="flex items-center justify-between px-3 py-2">
                <b className="text-gray-900">Chia sẻ bài viết</b>
                <button type="button" aria-label="Đóng" onClick={() => setShareOpen(false)} className="text-gray-400 hover:text-black"><X size={16} /></button>
              </div>
              <button type="button" onClick={shareFacebook} className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-gray-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07C0 18.06 4.39 23.03 10.13 23.93v-8.39H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.39C19.61 23.03 24 18.06 24 12.07z" /></svg>
                </span>
                Chia sẻ lên Facebook
              </button>
              {mobile && (
                <button type="button" onClick={shareMessenger} className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-gray-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: 'linear-gradient(135deg,#00B2FF,#A033FF)' }}><Send size={15} /></span>
                  Gửi qua Messenger
                </button>
              )}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button type="button" onClick={shareNative} className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-gray-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0068FF] text-xs font-black text-white">Zalo</span>
                  Zalo & ứng dụng khác
                </button>
              )}
              <button type="button" onClick={copyLink} className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-gray-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700">{copied ? <Copy size={15} /> : <Link2 size={15} />}</span>
                {copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Viết bình luận */}
      <div className="mt-3 flex gap-2">
        <Avatar author={customer ? { name: customer.fullName, avatar: customer.avatar } : { name: '?' }} />
        {customer ? (
          <form className="flex flex-1 items-end gap-2 rounded-2xl bg-gray-100 px-3 py-1.5" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <textarea
              rows={1}
              maxLength={1000}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
              placeholder={`Bình luận dưới tên ${customer.fullName}…`}
              className="max-h-[140px] flex-1 resize-none bg-transparent py-1.5 text-sm outline-none"
            />
            <button type="submit" disabled={!text.trim() || sending} aria-label="Gửi" className="mb-1 text-red-600 disabled:text-gray-300">
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        ) : (
          <Link to={loginLink} className="flex flex-1 items-center rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-200">
            Đăng nhập để bình luận…
          </Link>
        )}
      </div>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* Danh sách bình luận */}
      {!data ? (
        <div className="flex justify-center py-6 text-gray-300"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-4 space-y-4">
          {tops.slice(0, show).map((top) => (
            <div key={top.id}>
              {bubble(top, top)}
              {(repliesOf(top.id).length > 0 || replyTo === top.id) && (
                <div className="ml-11 mt-3 space-y-3">
                  {repliesOf(top.id).map((r) => bubble(r, top))}
                  {replyTo === top.id && (
                    <form className="flex items-end gap-2 rounded-2xl bg-gray-100 px-3 py-1.5" onSubmit={(e) => { e.preventDefault(); send(replyText, top.id); }}>
                      <textarea
                        rows={1}
                        autoFocus
                        maxLength={1000}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            send(replyText, top.id);
                          }
                          if (e.key === 'Escape') setReplyTo(null);
                        }}
                        placeholder={`Trả lời ${top.author.name}…`}
                        className="flex-1 resize-none bg-transparent py-1.5 text-sm outline-none"
                      />
                      <button type="submit" disabled={!replyText.trim() || sending} aria-label="Gửi trả lời" className="mb-1 text-red-600 disabled:text-gray-300"><Send size={17} /></button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
          {tops.length > show && (
            <button type="button" onClick={() => setShow((n) => n + PAGE)} className="text-sm font-semibold text-gray-600 hover:underline">
              Xem thêm {Math.min(PAGE, tops.length - show)} bình luận
            </button>
          )}
          {!tops.length && <p className="py-2 text-center text-sm text-gray-400">Chưa có bình luận nào. Hãy là người đầu tiên!</p>}
        </div>
      )}
    </section>
  );
}
