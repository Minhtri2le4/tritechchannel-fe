/* eslint-disable react-refresh/only-export-components */
// Component giao diện dùng chung cho trang quản trị
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';

const cx = (...c) => c.filter(Boolean).join(' ');

// ─────────── Nhãn trạng thái ───────────

export const ORDER_STATUS = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
  SHIPPING: { label: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Hoàn tất', className: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-gray-200 text-gray-600' },
};

export const PAYMENT_STATUS = {
  UNPAID: { label: 'Chưa thanh toán', className: 'bg-red-50 text-red-700' },
  PAID: { label: 'Đã thanh toán', className: 'bg-emerald-50 text-emerald-700' },
  REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-gray-100 text-gray-600' },
};

export const TRADE_IN_STATUS = {
  NEW: { label: 'Mới', className: 'bg-red-100 text-red-700' },
  CONTACTED: { label: 'Đã liên hệ', className: 'bg-blue-100 text-blue-800' },
  QUOTED: { label: 'Đã báo giá', className: 'bg-amber-100 text-amber-800' },
  COMPLETED: { label: 'Đã thu', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Từ chối', className: 'bg-gray-200 text-gray-600' },
};

export function Badge({ map, value, children, className }) {
  const item = map?.[value];
  return (
    <span className={cx('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap', item?.className || 'bg-gray-100 text-gray-700', className)}>
      {children ?? item?.label ?? value}
    </span>
  );
}

// ─────────── Form ───────────

export function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }) {
  const variants = {
    primary: 'bg-[#FFD400] hover:bg-amber-400 text-black',
    dark: 'bg-gray-900 hover:bg-black text-white',
    outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-gray-100 text-gray-700',
  };
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

const inputBase =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50';
// Mặc định rộng 100%, trừ khi className tự đặt độ rộng (w-auto, w-40...) – tránh 2 class w- đánh nhau
const inputClass = (className) => cx(inputBase, /(^|\s)w-/.test(className || '') ? '' : 'w-full', className);

export const Input = ({ className, ...props }) => <input {...props} className={inputClass(className)} />;
export const Textarea = ({ className, ...props }) => <textarea rows={3} {...props} className={inputClass(className)} />;
export const Select = ({ className, children, ...props }) => (
  <select {...props} className={cx(inputClass(className), 'pr-8')}>
    {children}
  </select>
);

export function Field({ label, required, hint, error, className, children }) {
  return (
    <label className={cx('block', className)}>
      {label && (
        <span className="block text-xs font-semibold text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      {children}
      {error ? <span className="block text-[11px] text-red-600 mt-1">{error}</span> : hint && <span className="block text-[11px] text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
      <input type="checkbox" {...props} className="w-4 h-4 accent-amber-500" />
      {label}
    </label>
  );
}

// Ô nhập tiền VND: hiển thị 1.000.000, giá trị trả về là số
export function MoneyInput({ value, onChange, ...props }) {
  return (
    <Input
      {...props}
      inputMode="numeric"
      value={value === null || value === undefined || value === '' ? '' : Number(value).toLocaleString('vi-VN')}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '');
        onChange(digits === '' ? null : Number(digits));
      }}
    />
  );
}

// ─────────── Bố cục ───────────

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const Card = ({ className, children }) => (
  <div className={cx('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>{children}</div>
);

export function Spinner({ className }) {
  return (
    <div className={cx('flex items-center justify-center py-12 text-gray-400', className)}>
      <Loader2 className="animate-spin" />
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center justify-between gap-3">
      <span>{error.message}</span>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

// Bảng dữ liệu: columns = [{ key, title, render?(row), className? }]
export function Table({ columns, rows, loading, empty = 'Chưa có dữ liệu', onRowClick, rowKey = 'id' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            {columns.map((c) => (
              <th key={c.key} className={cx('px-3 py-2.5 font-semibold whitespace-nowrap', c.className)}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={loading && rows?.length ? 'opacity-60' : ''}>
          {rows?.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cx('border-b border-gray-100 last:border-0', onRowClick && 'cursor-pointer hover:bg-amber-50/50')}
            >
              {columns.map((c) => (
                <td key={c.key} className={cx('px-3 py-2.5 align-middle', c.className)}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {loading && !rows?.length && <Spinner />}
      {!loading && !rows?.length && <p className="py-10 text-center text-sm text-gray-500">{empty}</p>}
    </div>
  );
}

export function Pagination({ meta, onChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-t border-gray-100 text-xs text-gray-600">
      <span>
        Trang {meta.page}/{meta.totalPages} · {meta.total} mục
      </span>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}>
          <ChevronLeft size={14} />
        </Button>
        <Button size="sm" variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)}>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onMouseDown={onClose}>
      <div
        className={cx('w-full rounded-xl bg-white shadow-2xl', wide ? 'max-w-3xl' : 'max-w-lg')}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

// Trì hoãn giá trị (VD: ô tìm kiếm) để không gọi API mỗi lần gõ phím
export function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Hiển thị lỗi từ API (kèm chi tiết từng trường nếu có)
export const errorText = (err) =>
  err?.details?.length ? `${err.message}: ${err.details.map((d) => d.message).join(', ')}` : err?.message;
