import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Hourglass, ImageIcon, ListTodo, Pencil, PlayCircle, Plus, RotateCcw, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { adminApi } from '../adminApi';
import { Badge, Button, Checkbox, ErrorBox, Field, Input, Modal, PageHeader, Select, Spinner, Textarea, errorText } from '../ui';
import { Avatar, DueTag, PRIORITY, PhotoStrip, TASK_STATUS, isOverdue } from '../staff/staffUi';

// Admin giao việc cho nhân viên, theo dõi tiến độ, duyệt ảnh báo cáo.

const TEMPLATES = [
  { title: 'Chụp ảnh kệ trưng bày', description: 'Chụp toàn bộ kệ, thấy rõ sản phẩm và bảng giá.', requirePhoto: true },
  { title: 'Kiểm kho cuối ngày', description: 'Đếm lại hàng trên kệ và trong kho, chụp ảnh khu vực kho.', requirePhoto: true },
  { title: 'Đóng gói đơn hàng', description: 'Đóng gói đơn, chụp ảnh gói hàng đã dán phiếu trước khi giao.', requirePhoto: true },
  { title: 'Vệ sinh cửa hàng', description: 'Lau quầy, kệ, sàn. Chụp ảnh sau khi dọn.', requirePhoto: true },
  { title: 'Gọi lại khách hàng', description: '', requirePhoto: false },
];

const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (d) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` : '');
const at = (dayOffset, h, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
};

const EMPTY = { title: '', description: '', assigneeId: '', priority: 'NORMAL', dueAt: toLocalInput(at(0, 17)), requirePhoto: true };

function TaskForm({ open, task, people, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    task
      ? { title: task.title, description: task.description || '', assigneeId: String(task.assignee.id), priority: task.priority, dueAt: task.dueAt ? toLocalInput(new Date(task.dueAt)) : '', requirePhoto: task.requirePhoto }
      : { ...EMPTY, assigneeId: people?.find((p) => p.role === 'STAFF')?.id?.toString() || '' }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const body = {
        title: form.title,
        description: form.description,
        assigneeId: Number(form.assigneeId),
        priority: form.priority,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
        requirePhoto: form.requirePhoto,
      };
      const { data } = task ? await adminApi.staff.updateTask(task.id, body) : await adminApi.staff.createTask(body);
      onSaved(data);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={task ? 'Sửa công việc' : 'Giao việc mới'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button loading={busy} disabled={!form.title.trim() || !form.assigneeId} onClick={save}>{task ? 'Lưu' : 'Giao việc'}</Button>
        </>
      }
    >
      <div className="space-y-3">
        {!task && (
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-700">Mẫu nhanh</p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button key={t.title} type="button" onClick={() => setForm((f) => ({ ...f, ...t }))} className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:border-amber-400 hover:bg-amber-50">
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
        <Field label="Công việc" required>
          <Input value={form.title} onChange={set('title')} placeholder="VD: Chụp ảnh kệ trưng bày tai nghe" maxLength={200} />
        </Field>
        <Field label="Giao cho" required>
          <div className="flex flex-wrap gap-2">
            {(people || []).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, assigneeId: String(p.id) }))}
                className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition ${form.assigneeId === String(p.id) ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <Avatar person={p} size={26} /> {p.name}
                {p.role === 'ADMIN' && <span className="text-[10px] opacity-60">(QTV)</span>}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Mức ưu tiên">
          <div className="grid grid-cols-4 gap-1.5">
            {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setForm((f) => ({ ...f, priority: k }))}
                className={`rounded-lg border py-1.5 text-xs font-bold transition ${form.priority === k ? 'border-transparent ' + PRIORITY[k].className : 'border-gray-200 text-gray-600'}`}
              >
                {PRIORITY[k].label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Hạn hoàn thành">
          <Input type="datetime-local" value={form.dueAt} onChange={set('dueAt')} />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {[['Trong 1 giờ', () => new Date(Date.now() + 3600e3)], ['17:00 hôm nay', () => at(0, 17)], ['21:00 hôm nay', () => at(0, 21)], ['9:00 ngày mai', () => at(1, 9)], ['Không hạn', () => null]].map(([l, d]) => (
              <button key={l} type="button" onClick={() => setForm((f) => ({ ...f, dueAt: toLocalInput(d()) }))} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 hover:bg-gray-200">
                {l}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Mô tả / hướng dẫn">
          <Textarea rows={3} value={form.description} onChange={set('description')} placeholder="Làm gì, chụp ảnh gì để báo cáo…" />
        </Field>
        <Checkbox label="Bắt buộc chụp ảnh khi báo cáo hoàn thành" checked={form.requirePhoto} onChange={set('requirePhoto')} />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}

function TaskDetail({ task, onClose, onChanged, onEdit, onDeleted }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const run = async (key, fn) => {
    setBusy(key);
    setError('');
    try {
      const res = await fn();
      return res;
    } catch (err) {
      setError(errorText(err));
      return null;
    } finally {
      setBusy('');
    }
  };
  const review = async (approve) => {
    const res = await run(approve ? 'ok' : 'redo', () => adminApi.staff.review(task.id, { approve, note }));
    if (res) onChanged(res.data);
  };
  const remove = async () => {
    if (!confirm(`Xoá công việc “${task.title}”?`)) return;
    const res = await run('del', () => adminApi.staff.removeTask(task.id));
    if (res) onDeleted();
  };
  const fmt = (d) => d && new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

  return (
    <Modal open title="Chi tiết công việc" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-12 w-1.5 shrink-0 rounded-full" style={{ background: PRIORITY[task.priority]?.bar }} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Badge map={TASK_STATUS} value={task.status} />
              <Badge map={PRIORITY} value={task.priority} />
              <DueTag task={task} />
            </div>
            <h3 className="text-lg font-black text-gray-900">{task.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <Avatar person={task.assignee} size={22} /> {task.assignee.name}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={onEdit}><Pencil size={14} /> Sửa</Button>
            <Button size="sm" variant="ghost" loading={busy === 'del'} onClick={remove}><Trash2 size={14} className="text-red-600" /></Button>
          </div>
        </div>
        {task.description && <p className="whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{task.description}</p>}

        {/* Dòng thời gian */}
        <ol className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          {[['Giao việc', task.createdAt], ['Bắt đầu', task.startedAt], ['Nộp báo cáo', task.submittedAt], ['Hoàn thành', task.doneAt]].map(([l, d]) => (
            <li key={l} className={`rounded-lg border p-2 ${d ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 text-gray-400'}`}>
              <p className="font-semibold">{l}</p>
              <p className="tabular-nums">{fmt(d) || '—'}</p>
            </li>
          ))}
        </ol>

        {(task.reportNote || task.reportImages.length > 0) && (
          <div className="rounded-xl border border-gray-200 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Báo cáo của nhân viên</p>
            {task.reportNote && <p className="mb-2 whitespace-pre-line text-sm text-gray-800">{task.reportNote}</p>}
            <PhotoStrip images={task.reportImages} size={96} title={task.title} />
          </div>
        )}
        {task.reviewNote && task.status !== 'REVIEW' && (
          <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">Lời nhắn của bạn: {task.reviewNote}</p>
        )}

        {task.status === 'REVIEW' && (
          <div className="space-y-2 rounded-xl border-2 border-violet-200 bg-violet-50/50 p-3">
            <p className="text-sm font-bold text-violet-800">Duyệt báo cáo</p>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lời nhắn (bắt buộc nếu yêu cầu làm lại)…" />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" loading={busy === 'redo'} onClick={() => review(false)}>
                <RotateCcw size={15} /> Yêu cầu làm lại
              </Button>
              <Button className="flex-1 !bg-emerald-600 !text-white hover:!bg-emerald-700" loading={busy === 'ok'} onClick={() => review(true)}>
                <CheckCircle2 size={15} /> Duyệt hoàn thành
              </Button>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}

export default function StaffTasksPage() {
  const [status, setStatus] = useState('OPEN');
  const [assigneeId, setAssigneeId] = useState('');
  const [form, setForm] = useState(null); // { task? }
  const [detail, setDetail] = useState(null);
  const { data: people } = useFetch(() => adminApi.staff.people(), []);
  const { data: tasks, loading, error, reload } = useFetch(
    () => adminApi.staff.tasks({ status: status || undefined, assigneeId: assigneeId || undefined, limit: 200 }),
    [status, assigneeId]
  );
  const { data: open } = useFetch(() => adminApi.staff.tasks({ status: 'OPEN', limit: 200 }), [tasks]);

  const stats = useMemo(() => {
    const all = open || [];
    return {
      REVIEW: all.filter((t) => t.status === 'REVIEW').length,
      DOING: all.filter((t) => t.status === 'DOING').length,
      TODO: all.filter((t) => t.status === 'TODO').length,
      late: all.filter(isOverdue).length,
    };
  }, [open]);

  const STAT = [
    ['REVIEW', 'Chờ bạn duyệt', Hourglass, 'text-violet-600', 'REVIEW'],
    ['DOING', 'Đang làm', PlayCircle, 'text-amber-600', 'DOING'],
    ['TODO', 'Chưa làm', ListTodo, 'text-gray-900', 'TODO'],
    ['late', 'Quá hạn', AlertTriangle, 'text-red-600', 'OPEN'],
  ];

  return (
    <div>
      <PageHeader
        title="Giao việc"
        subtitle="Giao việc cho nhân viên, xem ảnh báo cáo và duyệt hoàn thành"
        actions={<Button onClick={() => setForm({})}><Plus size={16} /> Giao việc mới</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STAT.map(([k, l, Icon, color, st]) => (
          <button key={k} type="button" onClick={() => setStatus(st)} className="rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-gray-400">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{l}</span>
              <Icon size={16} className={color} />
            </div>
            <p className={`mt-1 text-2xl font-black tabular-nums ${color}`}>{stats[k]}</p>
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setAssigneeId('')} className={`rounded-full border px-3 py-1 text-xs font-semibold ${!assigneeId ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white'}`}>
            Tất cả
          </button>
          {(people || []).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setAssigneeId(String(p.id))}
              className={`flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-xs font-semibold ${assigneeId === String(p.id) ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white'}`}
            >
              <Avatar person={p} size={22} /> {p.name}
            </button>
          ))}
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="ml-auto w-36">
          <option value="OPEN">Chưa xong</option>
          <option value="REVIEW">Chờ duyệt</option>
          <option value="DOING">Đang làm</option>
          <option value="TODO">Chưa làm</option>
          <option value="DONE">Hoàn thành</option>
          <option value="">Tất cả</option>
        </Select>
      </div>

      <ErrorBox error={error} onRetry={reload} />
      {loading && !tasks ? (
        <Spinner />
      ) : tasks?.length ? (
        <div className="space-y-2">
          {tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setDetail(t)}
              className={`flex w-full items-stretch overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:shadow-md ${t.status === 'REVIEW' ? 'border-violet-300 ring-1 ring-violet-200' : 'border-gray-200'}`}
            >
              <span className="w-1.5 shrink-0" style={{ background: PRIORITY[t.priority]?.bar }} />
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1.5 p-3">
                <div className="min-w-[200px] flex-1">
                  <p className={`font-bold ${t.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <Badge map={PRIORITY} value={t.priority} />
                    <DueTag task={t} />
                    {t.reportImages.length > 0 && <span className="inline-flex items-center gap-1 text-[11px] text-gray-500"><ImageIcon size={12} /> {t.reportImages.length} ảnh</span>}
                  </div>
                </div>
                <span className="flex items-center gap-2 text-sm text-gray-700"><Avatar person={t.assignee} size={26} /> {t.assignee.name}</span>
                <span className="w-24 text-right">
                  {t.status === 'REVIEW' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white"><ClipboardCheck size={12} /> Duyệt</span>
                  ) : (
                    <Badge map={TASK_STATUS} value={t.status} />
                  )}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-gray-500">
          Chưa có công việc nào.{' '}
          <button type="button" onClick={() => setForm({})} className="font-semibold text-gray-900 underline">Giao việc đầu tiên</button>
        </div>
      )}

      {form && (
        <TaskForm
          open
          task={form.task}
          people={people}
          onClose={() => setForm(null)}
          onSaved={(t) => {
            setForm(null);
            if (detail) setDetail(t);
            reload();
          }}
        />
      )}
      {detail && !form && (
        <TaskDetail
          key={detail.id + detail.status}
          task={detail}
          onClose={() => setDetail(null)}
          onEdit={() => setForm({ task: detail })}
          onChanged={(t) => {
            setDetail(t);
            reload();
          }}
          onDeleted={() => {
            setDetail(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
