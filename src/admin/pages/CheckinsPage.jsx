import { useMemo, useState } from 'react';
import { LogIn, LogOut, MapPin, Timer } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { adminApi } from '../adminApi';
import { assetUrl } from '../../lib/api';
import ImageLightbox from '../../components/ImageLightbox';
import { ErrorBox, Input, PageHeader, Spinner } from '../ui';
import { Avatar, timeOf } from '../staff/staffUi';

// Admin xem chấm công: mỗi ngày mỗi người 1 dòng – giờ vào / ra kèm ảnh selfie, tổng giờ làm, vị trí, đi trễ.

const SHIFT_KEY = 'tritech_shift_start';
const vnToday = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const addDays = (day, n) => new Date(new Date(`${day}T00:00:00Z`).getTime() + n * 86400e3).toISOString().slice(0, 10);
const minsOfDay = (d) => {
  const x = new Date(d);
  return x.getHours() * 60 + x.getMinutes();
};
const dur = (a, b) => {
  const m = Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000));
  return `${Math.floor(m / 60)}g${String(m % 60).padStart(2, '0')}`;
};
const dayLabel = (day) => {
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

function Shot({ c, onOpen, late }) {
  if (!c) return <span className="text-sm text-gray-300">—</span>;
  return (
    <button type="button" onClick={() => onOpen(c)} className="flex items-center gap-2 text-left">
      <img src={assetUrl(c.photo)} alt="" className="h-11 w-11 rounded-lg object-cover ring-1 ring-gray-200" />
      <span>
        <span className="block text-base font-black tabular-nums text-gray-900">{timeOf(c.createdAt)}</span>
        {late > 0 && <span className="rounded bg-red-100 px-1.5 text-[10px] font-bold text-red-700">Trễ {late < 60 ? `${late} phút` : `${Math.floor(late / 60)}g${String(late % 60).padStart(2, '0')}`}</span>}
      </span>
    </button>
  );
}

export default function CheckinsPage() {
  const [to, setTo] = useState(vnToday);
  const [from, setFrom] = useState(vnToday);
  const [shift, setShift] = useState(() => {
    try {
      return localStorage.getItem(SHIFT_KEY) || '08:30';
    } catch {
      return '08:30';
    }
  });
  const [photo, setPhoto] = useState(null);
  const { data, loading, error, reload } = useFetch(() => adminApi.staff.checkins({ from, to }), [from, to]);

  const shiftMins = (() => {
    const [h, m] = shift.split(':').map(Number);
    return h * 60 + (m || 0);
  })();

  // Gom theo ngày -> theo người
  const days = useMemo(() => {
    const byDay = new Map();
    for (const c of data || []) {
      if (!byDay.has(c.day)) byDay.set(c.day, new Map());
      const people = byDay.get(c.day);
      const row = people.get(c.userId) || { user: { id: c.userId, name: c.userName, avatar: c.userAvatar } };
      row[c.type] = c;
      people.set(c.userId, row);
    }
    return [...byDay.entries()].map(([day, people]) => ({ day, rows: [...people.values()] }));
  }, [data]);

  const setRange = (f, t) => {
    setFrom(f);
    setTo(t);
  };
  const today = vnToday();

  return (
    <div>
      <PageHeader title="Chấm công" subtitle="Giờ vào / ra ca của nhân viên kèm ảnh chụp tại chỗ" />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        {[['Hôm nay', today, today], ['Hôm qua', addDays(today, -1), addDays(today, -1)], ['7 ngày', addDays(today, -6), today], ['30 ngày', addDays(today, -29), today]].map(([l, f, t]) => (
          <button
            key={l}
            type="button"
            onClick={() => setRange(f, t)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${from === f && to === t ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white'}`}
          >
            {l}
          </button>
        ))}
        <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        <span className="pb-2 text-gray-400">→</span>
        <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="w-40" />
        <label className="ml-auto flex items-center gap-2 text-xs text-gray-600">
          Giờ vào ca chuẩn
          <Input
            type="time"
            value={shift}
            onChange={(e) => {
              setShift(e.target.value);
              try {
                localStorage.setItem(SHIFT_KEY, e.target.value);
              } catch {
                // bỏ qua
              }
            }}
            className="w-28"
          />
        </label>
      </div>

      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? (
        <Spinner />
      ) : days.length ? (
        <div className="space-y-4">
          {days.map(({ day, rows }) => (
            <section key={day} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
                <p className="text-sm font-bold capitalize text-gray-800">{dayLabel(day)}</p>
                <p className="text-xs text-gray-500">{rows.length} người chấm công</p>
              </div>
              <div className="divide-y divide-gray-100">
                {rows.map((r) => {
                  const late = r.IN && minsOfDay(r.IN.createdAt) > shiftMins ? minsOfDay(r.IN.createdAt) - shiftMins : 0;
                  const loc = r.IN?.lat != null ? r.IN : r.OUT?.lat != null ? r.OUT : null;
                  return (
                    <div key={r.user.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                      <span className="flex min-w-[160px] flex-1 items-center gap-2 font-semibold text-gray-900">
                        <Avatar person={r.user} size={34} /> {r.user.name}
                      </span>
                      <span className="flex items-center gap-2"><LogIn size={14} className="text-emerald-600" /><Shot c={r.IN} late={late} onOpen={setPhoto} /></span>
                      <span className="flex items-center gap-2">
                        <LogOut size={14} className="text-gray-500" />
                        {r.OUT ? <Shot c={r.OUT} onOpen={setPhoto} /> : <span className="text-xs text-amber-600">{day === today ? 'Đang trong ca' : 'Quên chấm ra'}</span>}
                      </span>
                      <span className="flex w-20 items-center gap-1 text-sm font-bold text-gray-800"><Timer size={14} className="text-gray-400" />{r.IN && r.OUT ? dur(r.IN.createdAt, r.OUT.createdAt) : '—'}</span>
                      {loc ? (
                        <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                          <MapPin size={13} /> Xem vị trí
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">Không có vị trí</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-gray-500">Chưa có ai chấm công trong khoảng ngày này</div>
      )}

      {photo && (
        <ImageLightbox
          images={[assetUrl(photo.photo)]}
          title={`${photo.userName} · ${photo.type === 'IN' ? 'Vào ca' : 'Ra ca'} ${timeOf(photo.createdAt)} ${photo.day.split('-').reverse().join('/')}`}
          onClose={() => setPhoto(null)}
        />
      )}
    </div>
  );
}
