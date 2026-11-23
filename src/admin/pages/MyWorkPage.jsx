import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Camera, CheckCircle2, ChevronRight, Clock3, ImageIcon, ListTodo, LogIn, LogOut, PlayCircle,
  RotateCcw, Send, Hourglass, X,
} from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { adminApi } from '../adminApi';
import { useAuth } from '../AuthContext';
import { assetUrl } from '../../lib/api';
import { Badge, Button, ErrorBox, Spinner, Textarea } from '../ui';
import CheckinCamera from '../staff/CheckinCamera';
import { DueTag, PRIORITY, PhotoPicker, PhotoStrip, TASK_STATUS, isOverdue, timeOf } from '../staff/staffUi';

// Trang "Dành cho bạn": nhân viên đăng nhập là vào đây – chấm công vào/ra ca bằng ảnh, xem việc được giao,
// bắt đầu làm, chụp ảnh báo cáo hoàn thành.

const greeting = (h) => (h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối');
const hoursBetween = (a, b) => {
  const mins = Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000));
  return `${Math.floor(mins / 60)}g${String(mins % 60).padStart(2, '0')}`;
};

function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

// ───────── Thẻ chấm công ─────────
function ShiftTile({ kind, record, disabled, onClick }) {
  const isIn = kind === 'IN';
  const Icon = isIn ? LogIn : LogOut;
  if (record) {
    return (
      <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-white/10 p-2.5">
        <img src={assetUrl(record.photo)} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-[#FFD400]" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">{isIn ? 'Vào ca' : 'Ra ca'}</p>
          <p className="text-lg font-black leading-tight text-white tabular-nums">{timeOf(record.createdAt)}</p>
        </div>
      </div>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-2 rounded-2xl p-3 text-sm font-black transition active:scale-[.97] disabled:opacity-35"
      style={disabled ? { background: 'rgba(255,255,255,.08)', color: '#fff' } : { background: '#FFD400', color: '#111' }}
    >
      <Camera size={18} /> <Icon size={16} /> {isIn ? 'Chấm công vào ca' : 'Chấm công ra ca'}
    </button>
  );
}

// ───────── Thẻ công việc ─────────
function TaskCard({ task, onOpen }) {
  const redo = task.status === 'DOING' && task.reviewNote;
  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="relative flex w-full items-stretch overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-md active:scale-[.99]"
    >
      <span className="w-1.5 shrink-0" style={{ background: PRIORITY[task.priority]?.bar }} />
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-start gap-2">
          <p className={`flex-1 text-[14px] font-bold leading-snug ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
          <Badge map={TASK_STATUS} value={task.status} />
        </div>
        {task.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>}
        {redo && (
          <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 px-2 py-1.5 text-[11px] font-semibold text-red-700">
            <RotateCcw size={12} className="mt-0.5 shrink-0" /> Cần làm lại: {task.reviewNote}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge map={PRIORITY} value={task.priority} />
          <DueTag task={task} />
          {task.requirePhoto && task.status !== 'DONE' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500"><ImageIcon size={12} /> Cần ảnh</span>
          )}
          {task.reportImages?.length > 0 && <span className="inline-flex items-center gap-1 text-[11px] text-gray-500"><ImageIcon size={12} /> {task.reportImages.length} ảnh</span>}
        </div>
      </div>
      <ChevronRight size={18} className="mr-2 self-center text-gray-300" />
    </button>
  );
}

// ───────── Chi tiết việc + báo cáo ─────────
function TaskSheet({ task, onClose, onChanged }) {
  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const run = async (key, fn) => {
    setBusy(key);
    setError('');
    try {
      const { data } = await fn();
      navigator.vibrate?.(20);
      onChanged(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };
  const canReport = task.status === 'DOING' || (task.status === 'TODO' && !task.requirePhoto);
  const needPhoto = task.requirePhoto && !images.length;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 md:items-center md:p-6" onClick={onClose}>
      <div
        className="sheet-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-xl md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-gray-100 px-5 pb-3 pt-4">
          <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: PRIORITY[task.priority]?.bar }} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Badge map={TASK_STATUS} value={task.status} />
              <Badge map={PRIORITY} value={task.priority} />
              <DueTag task={task} />
            </div>
            <h2 className="text-lg font-black leading-snug text-gray-900">{task.title}</h2>
            <p className="text-[11px] text-gray-500">Giao bởi {task.createdBy?.name} · {new Date(task.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {task.description && <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{task.description}</p>}

          {task.status === 'DOING' && task.reviewNote && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="mb-0.5 flex items-center gap-1.5 font-bold"><RotateCcw size={14} /> Quản lý yêu cầu làm lại</p>
              {task.reviewNote}
            </div>
          )}

          {['REVIEW', 'DONE'].includes(task.status) && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                Báo cáo của bạn · {task.submittedAt && new Date(task.submittedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
              </p>
              {task.reportNote && <p className="mb-2 whitespace-pre-line text-sm text-gray-800">{task.reportNote}</p>}
              <PhotoStrip images={task.reportImages} title={task.title} />
              {task.status === 'REVIEW' ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-violet-700"><Hourglass size={14} /> Đã nộp – chờ quản lý duyệt</p>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} /> Đã duyệt hoàn thành{task.reviewNote ? ` · “${task.reviewNote}”` : ''}
                </p>
              )}
            </div>
          )}

          {canReport && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-900">
                Báo cáo hoàn thành {task.requirePhoto && <span className="text-xs font-semibold text-red-600">(bắt buộc có ảnh)</span>}
              </p>
              <PhotoPicker value={images} onChange={setImages} stampLines={[task.title]} />
              <Textarea rows={3} placeholder="Ghi chú thêm (không bắt buộc)…" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          )}
          {error && <ErrorBox error={{ message: error }} />}
        </div>

        <div className="border-t border-gray-100 px-5 pt-3" style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
          {task.status === 'TODO' && task.requirePhoto && (
            <Button className="h-12 w-full text-base" loading={busy === 'start'} onClick={() => run('start', () => adminApi.staff.start(task.id))}>
              <PlayCircle size={18} /> Bắt đầu làm
            </Button>
          )}
          {canReport && (
            <Button
              variant="dark"
              className="h-12 w-full text-base"
              disabled={needPhoto}
              loading={busy === 'submit'}
              onClick={() => run('submit', () => adminApi.staff.submit(task.id, { note, images }))}
            >
              <Send size={17} /> {needPhoto ? 'Chụp ít nhất 1 ảnh để nộp' : 'Nộp báo cáo hoàn thành'}
            </Button>
          )}
          {!canReport && task.status !== 'TODO' && (
            <Button variant="outline" className="h-11 w-full" onClick={onClose}>Đóng</Button>
          )}
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'TODO', label: 'Chưa làm' },
  { key: 'DOING', label: 'Đang làm' },
  { key: 'REVIEW', label: 'Chờ duyệt' },
  { key: 'late', label: 'Quá hạn' },
];

export default function MyWorkPage() {
  const { user } = useAuth();
  const now = useNow();
  const [tab, setTab] = useState('open');
  const [filter, setFilter] = useState('all');
  const [camera, setCamera] = useState(null); // 'IN' | 'OUT'
  const [openTask, setOpenTask] = useState(null);

  const { data: summary, reload: reloadSummary } = useFetch(() => adminApi.staff.summary(), []);
  const { data: tasks, loading, error, reload } = useFetch(
    () => adminApi.staff.tasks({ mine: true, status: tab === 'open' ? 'OPEN' : 'DONE', limit: 100 }),
    [tab]
  );
  const { data: history, reload: reloadHistory } = useFetch(() => adminApi.staff.checkins({ userId: user?.id }), []);

  // Có việc mới / quản lý vừa duyệt -> tự làm mới mỗi phút
  useEffect(() => {
    const t = setInterval(() => {
      reload();
      reloadSummary();
    }, 60000);
    return () => clearInterval(t);
  }, [reload, reloadSummary]);

  const list = useMemo(() => {
    const all = tasks || [];
    if (tab !== 'open' || filter === 'all') return all;
    if (filter === 'late') return all.filter(isOverdue);
    return all.filter((t) => t.status === filter);
  }, [tasks, tab, filter]);

  const counts = {
    all: tasks && tab === 'open' ? tasks.length : 0,
    TODO: summary?.byStatus?.TODO || 0,
    DOING: summary?.byStatus?.DOING || 0,
    REVIEW: summary?.byStatus?.REVIEW || 0,
    late: summary?.overdue || 0,
  };

  // 7 ngày gần nhất: gộp vào/ra theo ngày
  const days = useMemo(() => {
    const map = new Map();
    for (const c of history || []) {
      const d = map.get(c.day) || { day: c.day };
      d[c.type] = c;
      map.set(c.day, d);
    }
    return [...map.values()];
  }, [history]);

  const checkIn = summary?.checkIn;
  const checkOut = summary?.checkOut;
  const firstName = (user?.name || '').trim().split(/\s+/).slice(-1)[0];

  const onTaskChanged = (t) => {
    setOpenTask(t);
    reload();
    reloadSummary();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-10">
      {/* Đầu trang + chấm công */}
      <section className="overflow-hidden rounded-3xl p-4 text-white shadow-lg sm:p-5" style={{ background: 'linear-gradient(135deg,#111 0%,#1f1f1f 55%,#3a3000 100%)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#FFD400]">Dành cho bạn</p>
            <h1 className="mt-0.5 text-xl font-black sm:text-2xl">{greeting(now.getHours())}, {firstName} 👋</h1>
            <p className="text-xs text-white/60">{now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums leading-none">{timeOf(now)}</p>
            {checkIn && (
              <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-white/70">
                <Clock3 size={11} /> {checkOut ? `Đã làm ${hoursBetween(checkIn.createdAt, checkOut.createdAt)}` : `Đang trong ca ${hoursBetween(checkIn.createdAt, now)}`}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <ShiftTile kind="IN" record={checkIn} onClick={() => setCamera('IN')} />
          <ShiftTile kind="OUT" record={checkOut} disabled={!checkIn} onClick={() => setCamera('OUT')} />
        </div>
        {!checkIn && <p className="mt-2 text-center text-[11px] text-white/50">Chụp ảnh selfie để chấm công – ảnh tự đóng dấu giờ</p>}
      </section>

      {/* Số liệu nhanh */}
      <section className="grid grid-cols-4 gap-2">
        {[
          ['TODO', 'Chưa làm', ListTodo, 'text-gray-900'],
          ['DOING', 'Đang làm', PlayCircle, 'text-amber-600'],
          ['REVIEW', 'Chờ duyệt', Hourglass, 'text-violet-600'],
          ['late', 'Quá hạn', AlertTriangle, 'text-red-600'],
        ].map(([key, label, Icon, color]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab('open');
              setFilter(filter === key ? 'all' : key);
            }}
            className={`rounded-2xl border bg-white p-2.5 text-left shadow-sm transition active:scale-95 ${filter === key ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200'}`}
          >
            <Icon size={16} className={color} />
            <p className={`mt-1 text-2xl font-black tabular-nums leading-none ${color}`}>{counts[key]}</p>
            <p className="mt-0.5 truncate text-[11px] text-gray-500">{label}</p>
          </button>
        ))}
      </section>

      {/* Danh sách việc */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            {[['open', 'Việc cần làm'], ['done', 'Đã hoàn thành']].map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setTab(k);
                  setFilter('all');
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${tab === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                {l}
              </button>
            ))}
          </div>
          {tab === 'open' && filter !== 'all' && (
            <button type="button" onClick={() => setFilter('all')} className="text-xs font-semibold text-gray-500 underline">
              Bỏ lọc “{FILTERS.find((f) => f.key === filter)?.label}”
            </button>
          )}
        </div>
        <ErrorBox error={error} onRetry={reload} />
        {loading && !tasks ? (
          <Spinner />
        ) : list.length ? (
          <div className="space-y-2">{list.map((t) => <TaskCard key={t.id} task={t} onOpen={setOpenTask} />)}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-gray-700">{tab === 'open' ? 'Không còn việc nào – tuyệt vời!' : 'Chưa có việc hoàn thành'}</p>
          </div>
        )}
      </section>

      {/* Lịch sử chấm công */}
      {days.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-sm font-bold text-gray-900">Chấm công 7 ngày gần đây</p>
          <div className="divide-y divide-gray-100">
            {days.map((d) => (
              <div key={d.day} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-20 shrink-0 text-xs text-gray-500">{d.day.split('-').reverse().slice(0, 2).join('/')}</span>
                <span className="flex flex-1 items-center gap-1.5"><LogIn size={13} className="text-emerald-600" /> {d.IN ? timeOf(d.IN.createdAt) : '—'}</span>
                <span className="flex flex-1 items-center gap-1.5"><LogOut size={13} className="text-gray-500" /> {d.OUT ? timeOf(d.OUT.createdAt) : '—'}</span>
                <span className="w-14 text-right text-xs font-semibold text-gray-700">{d.IN && d.OUT ? hoursBetween(d.IN.createdAt, d.OUT.createdAt) : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {camera && (
        <CheckinCamera
          type={camera}
          user={user}
          onClose={() => setCamera(null)}
          onDone={() => {
            setCamera(null);
            reloadSummary();
            reloadHistory();
          }}
        />
      )}
      {openTask && <TaskSheet key={openTask.id + openTask.status} task={openTask} onClose={() => setOpenTask(null)} onChanged={onTaskChanged} />}
    </div>
  );
}
