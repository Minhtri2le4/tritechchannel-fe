import { useState } from 'react';
import { EyeOff, Pin, Plus, Save, X } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { adminApi } from './adminApi';
import { Button, Card, Input, errorText } from './ui';

// Quản lý mục "Mọi người cũng tìm kiếm" (cuối trang chủ):
// - Từ khoá ghim: luôn hiện đầu tiên
// - Khách tìm nhiều (30 ngày): tự hiện; ẩn từ nào không muốn khách thấy
export default function PopularSearchesCard() {
  const { data, loading, reload } = useFetch(() => adminApi.settings.getPopularSearches(), []);
  const [draft, setDraft] = useState(null); // { pinned, hidden } đang sửa; null = chưa sửa gì
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (loading && !data) return null;
  const form = draft ?? { pinned: data?.pinned || [], hidden: data?.hidden || [] };
  const top = data?.top || [];
  const has = (list, t) => list.some((x) => x.toLowerCase() === t.toLowerCase());
  const change = (patch) => {
    setDraft({ ...form, ...patch });
    setMessage('');
  };

  const addPinned = () => {
    const t = input.trim();
    if (t.length < 2 || has(form.pinned, t)) return setInput('');
    change({ pinned: [...form.pinned, t] });
    setInput('');
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.settings.savePopularSearches(form);
      setDraft(null);
      setMessage('✅ Đã lưu');
      reload();
    } catch (err) {
      setMessage(`❌ ${errorText(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4 space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">Mọi người cũng tìm kiếm</h2>
          <p className="text-[11px] text-gray-500">
            Hiện cuối trang chủ. Từ khoá ghim luôn đứng đầu, sau đó là những từ khách tìm từ 2 lần trở lên trong 30 ngày.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {message && <span className={`text-sm font-semibold ${message.startsWith('❌') ? 'text-red-600' : 'text-emerald-700'}`}>{message}</span>}
          <Button size="sm" loading={saving} disabled={!draft} onClick={save}><Save size={14} /> Lưu</Button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-gray-700">Từ khoá ghim</p>
        <div className="flex flex-wrap gap-1.5">
          {form.pinned.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
              <Pin size={11} /> {t}
              <button type="button" title="Bỏ ghim" onClick={() => change({ pinned: form.pinned.filter((x) => x !== t) })} className="hover:text-red-600"><X size={12} /></button>
            </span>
          ))}
          {!form.pinned.length && <span className="text-xs text-gray-400">Chưa ghim từ nào</span>}
        </div>
        <div className="mt-2 flex max-w-md gap-2">
          <Input value={input} placeholder="VD: iphone 17 pro max, sạc dự phòng…" onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPinned())} />
          <Button size="sm" variant="outline" onClick={addPinned}><Plus size={14} /> Ghim</Button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-gray-700">Khách tìm nhiều (30 ngày)</p>
        <div className="flex flex-wrap gap-1.5">
          {top.map(({ term, count }) => {
            const hidden = has(form.hidden, term);
            return (
              <span key={term} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${hidden ? 'bg-gray-100 text-gray-400 line-through' : 'bg-gray-100 text-gray-700'}`}>
                {term} <b className="text-[10px] text-gray-500 no-underline">{count}</b>
                {!has(form.pinned, term) && !hidden && (
                  <button type="button" title="Ghim" onClick={() => change({ pinned: [...form.pinned, term] })} className="text-gray-400 hover:text-amber-600"><Pin size={11} /></button>
                )}
                <button
                  type="button"
                  title={hidden ? 'Hiện lại' : 'Ẩn khỏi web'}
                  onClick={() => change({ hidden: hidden ? form.hidden.filter((x) => x.toLowerCase() !== term.toLowerCase()) : [...form.hidden, term] })}
                  className="text-gray-400 hover:text-red-600"
                >
                  {hidden ? <Plus size={11} /> : <EyeOff size={11} />}
                </button>
              </span>
            );
          })}
          {!top.length && <span className="text-xs text-gray-400">Chưa đủ dữ liệu – khi khách tìm nhiều, từ khoá sẽ tự hiện ở đây.</span>}
        </div>
      </div>
    </Card>
  );
}
