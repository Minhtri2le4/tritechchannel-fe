/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { AlertTriangle, CalendarClock, Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { assetUrl, imgFallback } from '../../lib/api';
import ImageLightbox from '../../components/ImageLightbox';
import { adminApi } from '../adminApi';
import { processPhoto, stampTime } from './photo';

export const PRIORITY = {
  URGENT: { label: 'Gấp', className: 'bg-red-600 text-white', bar: '#DC2626' },
  HIGH: { label: 'Cao', className: 'bg-orange-100 text-orange-700', bar: '#F97316' },
  NORMAL: { label: 'Thường', className: 'bg-blue-50 text-blue-700', bar: '#3B82F6' },
  LOW: { label: 'Thấp', className: 'bg-gray-100 text-gray-600', bar: '#9CA3AF' },
};

export const TASK_STATUS = {
  TODO: { label: 'Chưa làm', className: 'bg-gray-100 text-gray-700' },
  DOING: { label: 'Đang làm', className: 'bg-amber-100 text-amber-800' },
  REVIEW: { label: 'Chờ duyệt', className: 'bg-violet-100 text-violet-700' },
  DONE: { label: 'Hoàn thành', className: 'bg-emerald-100 text-emerald-700' },
};

export const isOverdue = (t) => t.status !== 'DONE' && t.dueAt && new Date(t.dueAt) < new Date();

const pad = (n) => String(n).padStart(2, '0');
export const timeOf = (d) => {
  const x = new Date(d);
  return `${pad(x.getHours())}:${pad(x.getMinutes())}`;
};

// "Hạn 17:00 hôm nay", "Hạn 25/11 09:00", "Quá hạn 2 giờ"
export function dueText(t) {
  if (!t.dueAt) return null;
  const d = new Date(t.dueAt);
  const now = new Date();
  if (isOverdue(t)) {
    const mins = Math.round((now - d) / 60000);
    const span = mins < 60 ? `${mins} phút` : mins < 1440 ? `${Math.round(mins / 60)} giờ` : `${Math.round(mins / 1440)} ngày`;
    return `Quá hạn ${span}`;
  }
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now.getTime() + 86400000).toDateString() === d.toDateString();
  return `Hạn ${timeOf(d)} ${sameDay ? 'hôm nay' : tomorrow ? 'ngày mai' : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`}`;
}

export function DueTag({ task, className = '' }) {
  const text = dueText(task);
  if (!text) return null;
  const late = isOverdue(task);
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${late ? 'text-red-600' : 'text-gray-500'} ${className}`}>
      {late ? <AlertTriangle size={12} /> : <CalendarClock size={12} />} {text}
    </span>
  );
}

export function Avatar({ person, size = 32 }) {
  const initials = (person?.name || '?').trim().split(/\s+/).slice(-1)[0]?.[0]?.toUpperCase() || '?';
  return person?.avatar ? (
    <img src={assetUrl(person.avatar)} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-gray-900 font-bold text-[#FFD400]" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {initials}
    </span>
  );
}

// Dãy ảnh nhỏ, bấm để phóng to
export function PhotoStrip({ images, size = 64, title }) {
  const [open, setOpen] = useState(-1);
  if (!images?.length) return null;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <button key={src + i} type="button" onClick={() => setOpen(i)} className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50" style={{ width: size, height: size }}>
            <img src={assetUrl(src)} onError={imgFallback} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {open >= 0 && <ImageLightbox images={images.map(assetUrl)} start={open} title={title} onClose={() => setOpen(-1)} />}
    </>
  );
}

// Chọn / chụp nhiều ảnh báo cáo: nén + đóng dấu giờ, tải lên ngay, trả về danh sách URL
export function PhotoPicker({ value, onChange, stampLines, max = 8 }) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState('');
  const add = async (files) => {
    const list = [...files].slice(0, max - value.length);
    if (!list.length) return;
    setError('');
    setBusy(list.length);
    try {
      const processed = await Promise.all(list.map((f, i) => processPhoto(f, { stamp: [stampTime(), ...(stampLines || [])], name: `report-${i}.jpg` })));
      const { data } = await adminApi.staff.upload(processed);
      onChange([...value, ...data.map((d) => d.url)]);
    } catch (err) {
      setError(err.message || 'Tải ảnh thất bại');
    } finally {
      setBusy(0);
    }
  };
  const input = (capture) => (
    <input
      type="file"
      accept="image/*"
      multiple={!capture}
      {...(capture ? { capture: 'environment' } : {})}
      className="hidden"
      onChange={(e) => {
        add(e.target.files);
        e.target.value = '';
      }}
    />
  );
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((src, i) => (
          <div key={src} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200">
            <img src={assetUrl(src)} alt="" className="h-full w-full object-cover" />
            <button type="button" aria-label="Bỏ ảnh" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white">
              <X size={14} />
            </button>
          </div>
        ))}
        {Array.from({ length: busy }, (_, i) => (
          <div key={`b${i}`} className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
            <Loader2 size={18} className="animate-spin text-gray-400" />
          </div>
        ))}
        {value.length + busy < max && (
          <>
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 text-[11px] font-semibold text-amber-800 active:scale-95">
              <Camera size={20} /> Chụp ảnh
              {input(true)}
            </label>
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-[11px] font-semibold text-gray-600 active:scale-95">
              <ImagePlus size={20} /> Thư viện
              {input(false)}
            </label>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
