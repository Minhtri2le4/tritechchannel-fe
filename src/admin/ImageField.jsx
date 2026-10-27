import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { assetUrl, imgFallback } from '../lib/api';
import { adminApi } from './adminApi';
import { Input } from './ui';

// Ô chọn 1 ảnh: tải ảnh từ máy lên server (khuyên dùng) hoặc dán link ảnh.
// value/onChange là URL ảnh ('' = chưa có). aspect: tỉ lệ khung xem trước, VD 'aspect-square', 'aspect-[16/7]'
export default function ImageField({ value, onChange, aspect = 'aspect-square', previewClass = 'w-24', hint }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const { data } = await adminApi.upload([files[0]]);
      onChange(data[0].url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-3 items-start">
      <div
        className={`relative shrink-0 ${previewClass} ${aspect} rounded-lg border border-dashed border-gray-300 bg-[repeating-conic-gradient(#f3f4f6_0_25%,#fff_0_50%)] bg-[length:16px_16px] overflow-hidden flex items-center justify-center`}
      >
        {value ? (
          <>
            <img onError={imgFallback} src={assetUrl(value)} alt="" className="w-full h-full object-contain" />
            <button
              type="button"
              title="Bỏ ảnh"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <ImagePlus size={20} className="text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3 py-2 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? 'Đang tải lên…' : 'Tải ảnh từ máy'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="…hoặc dán link ảnh https://" className="text-xs" />
        {error ? <p className="text-[11px] text-red-600">{error}</p> : hint && <p className="text-[11px] text-gray-500">{hint}</p>}
      </div>
    </div>
  );
}
