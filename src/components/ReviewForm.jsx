import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Star, Video, X } from 'lucide-react';
import { shopApi } from '../services/shop';
import { assetUrl, imgFallback } from '../lib/api';

const LABELS = ['', 'Tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];
const MAX_IMAGES = 5;
const MAX_VIDEO_MB = 30;

// Form đánh giá sản phẩm kiểu Shopee: chọn sao, viết nhận xét, thêm tối đa 5 ảnh + 1 video, ẩn tên
export default function ReviewForm({ item, onDone, onClose }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [uploading, setUploading] = useState('');
  const [videoProgress, setVideoProgress] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const imageRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const addImages = async (files) => {
    const list = [...(files || [])].filter((f) => /^image\/(jpeg|png|webp|heic)$/.test(f.type)).slice(0, MAX_IMAGES - images.length);
    if (!list.length) return;
    setError('');
    setUploading('image');
    try {
      const { data } = await shopApi.uploadReviewImages(list);
      setImages((cur) => [...cur, ...data.map((d) => d.url)].slice(0, MAX_IMAGES));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading('');
      if (imageRef.current) imageRef.current.value = '';
    }
  };

  const addVideo = async (file) => {
    if (!file) return;
    if (!/^video\/(mp4|webm|quicktime)$/.test(file.type)) return setError('Video phải là MP4, WEBM hoặc MOV');
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) return setError(`Video tối đa ${MAX_VIDEO_MB}MB`);
    setError('');
    setUploading('video');
    setVideoProgress(0);
    try {
      const { data } = await shopApi.uploadReviewVideo(file, setVideoProgress);
      setVideoUrl(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading('');
      setVideoProgress(null);
      if (videoRef.current) videoRef.current.value = '';
    }
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await shopApi.createReview({ orderItemId: item.id, rating, content, images, videoUrl: videoUrl || null, isAnonymous: anonymous });
      onDone();
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const shown = hover || rating;

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="sheet-up flex max-h-[92vh] w-full md:max-w-[560px] flex-col rounded-t-2xl md:rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="font-bold text-gray-900">Đánh giá sản phẩm</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="p-1 text-gray-500 hover:text-black"><X size={22} /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex items-center gap-3">
            <img src={assetUrl(item.image)} onError={imgFallback} alt="" className="h-14 w-14 rounded-lg border border-gray-100 object-contain" />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm text-gray-800">{item.productName}</p>
              {(item.color || item.variantLabel) && <p className="text-xs text-gray-500">Phân loại: {[item.color, item.variantLabel].filter(Boolean).join(', ')}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-700">Chất lượng sản phẩm</span>
            <div className="flex" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-label={`${n} sao`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="p-0.5">
                  <Star size={30} className={n <= shown ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <span className={`text-sm font-semibold ${shown >= 4 ? 'text-amber-600' : 'text-gray-600'}`}>{LABELS[shown]}</span>
          </div>

          <textarea
            rows={4}
            maxLength={2000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hãy chia sẻ cảm nhận của bạn: chất lượng, đúng mô tả, đóng gói, giao hàng…"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-amber-400"
          />

          <div className="flex flex-wrap gap-2">
            {images.map((src) => (
              <div key={src} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                <img src={assetUrl(src)} alt="" className="h-full w-full object-cover" />
                <button type="button" aria-label="Bỏ ảnh" onClick={() => setImages((cur) => cur.filter((x) => x !== src))} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button>
              </div>
            ))}
            {videoUrl && (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-black">
                <video src={assetUrl(videoUrl)} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                <Video size={16} className="absolute bottom-1 left-1 text-white" />
                <button type="button" aria-label="Bỏ video" onClick={() => setVideoUrl('')} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button>
              </div>
            )}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                disabled={!!uploading}
                onClick={() => imageRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-red-300 text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {uploading === 'image' ? <Loader2 size={18} className="animate-spin" /> : <Camera size={20} />}
                Thêm ảnh ({images.length}/{MAX_IMAGES})
              </button>
            )}
            {!videoUrl && (
              <button
                type="button"
                disabled={!!uploading}
                onClick={() => videoRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-red-300 text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {uploading === 'video' ? <span className="font-bold">{videoProgress ?? 0}%</span> : <Video size={20} />}
                Thêm video
              </button>
            )}
            <input ref={imageRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic" hidden onChange={(e) => addImages(e.target.files)} />
            <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => addVideo(e.target.files?.[0])} />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 accent-amber-500" />
            Ẩn tên của tôi trong đánh giá này
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex gap-2 border-t border-gray-100 p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Trở lại</button>
          <button type="button" onClick={submit} disabled={busy || !!uploading} className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold uppercase text-white hover:bg-red-700 disabled:opacity-60">
            {busy && <Loader2 size={16} className="animate-spin" />} Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}
