import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { RETURN_REASONS } from '../lib/orderFlow';
import { Button, Input, Modal } from './ui';

// Đánh dấu giao không thành công – đơn vị vận chuyển đang hoàn hàng về shop
export default function ReturnModal({ ids, busy, onClose, onSubmit }) {
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [other, setOther] = useState('');
  const text = reason === 'other' ? other.trim() : reason;
  return (
    <Modal
      open={Boolean(ids)}
      title={ids?.length > 1 ? `Hoàn hàng ${ids.length} đơn` : 'Giao không thành công – hoàn hàng về shop'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Để sau</Button>
          <Button variant="dark" loading={busy} disabled={!text} onClick={() => onSubmit(text)}>
            <Undo2 size={16} /> Chuyển sang Đang hoàn về
          </Button>
        </>
      }
    >
      <p className="mb-2 text-sm text-gray-600">Lý do giao không thành công</p>
      <div className="space-y-1.5">
        {[...RETURN_REASONS, 'other'].map((r) => (
          <label key={r} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${reason === r ? 'border-gray-900 bg-gray-50 font-semibold' : 'border-gray-200'}`}>
            <input type="radio" name="return-reason" checked={reason === r} onChange={() => setReason(r)} className="accent-gray-900" />
            {r === 'other' ? 'Lý do khác' : r}
          </label>
        ))}
      </div>
      {reason === 'other' && <Input className="mt-2" value={other} onChange={(e) => setOther(e.target.value)} placeholder="Ghi lý do…" autoFocus />}
      <p className="mt-4 rounded-lg bg-orange-50 p-2 text-xs text-orange-800">
        Đơn chuyển sang tab <b>Hoàn hàng</b>. Khi nhận lại gói hàng, bấm <b>Đã nhận lại hàng hoàn</b> để hàng tự cộng lại vào kho. Nếu liên hệ lại được khách thì bấm <b>Giao lại</b>.
      </p>
    </Modal>
  );
}
