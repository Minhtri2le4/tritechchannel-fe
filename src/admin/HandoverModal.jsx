import { useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { CARRIERS } from '../lib/orderFlow';
import { Button, Input, Modal } from './ui';

// Chọn đơn vị vận chuyển khi bàn giao (dùng chung cho nhiều đơn)
export default function HandoverModal({ ids, busy, onClose, onSubmit, withTracking = false }) {
  const [carrier, setCarrier] = useState('SPX');
  const [tracking, setTracking] = useState('');
  return (
    <Modal
      open={Boolean(ids)}
      title={ids?.length > 1 ? `Bàn giao ${ids.length} đơn cho đơn vị vận chuyển` : 'Bàn giao cho đơn vị vận chuyển'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Để sau</Button>
          <Button variant="dark" loading={busy} onClick={() => onSubmit(carrier, tracking.trim())}>
            <PackageCheck size={16} /> Xác nhận bàn giao
          </Button>
        </>
      }
    >
      <p className="mb-2 text-sm text-gray-600">Đơn vị vận chuyển</p>
      <div className="flex flex-wrap gap-2">
        {CARRIERS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCarrier(c)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${carrier === c ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}
          >
            {c}
          </button>
        ))}
      </div>
      {withTracking && (
        <div className="mt-4">
          <p className="mb-1 text-sm text-gray-600">Mã vận đơn (không bắt buộc)</p>
          <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="VD: SPXVN0123456789" />
          <p className="mt-1 text-xs text-gray-400">Khách sẽ thấy mã này trong mục Đơn mua để tự tra hành trình.</p>
        </div>
      )}
      <p className="mt-4 rounded-lg bg-blue-50 p-2 text-xs text-blue-800">
        Sau khi bàn giao, khách không tự đổi địa chỉ được nữa. Khi shipper lấy hàng, bấm <b>Đang giao</b>.
      </p>
    </Modal>
  );
}
