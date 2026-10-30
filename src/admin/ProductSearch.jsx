import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from './adminApi';
import { assetUrl, formatPrice, imgFallback } from '../lib/api';
import { Input, useDebounced } from './ui';

// Ô tìm sản phẩm trong shop theo tên, bấm 1 kết quả để chọn (chương trình khuyến mãi, video review…)
export default function ProductSearch({ selectedIds = [], onAdd, placeholder = 'Gõ tên sản phẩm để thêm vào chương trình…', addLabel = '+ Thêm' }) {
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    adminApi.products
      .list({ search: q, limit: 8 })
      .then(({ data }) => !cancelled && setResults(data))
      .catch(() => !cancelled && setResults([]));
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
      <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} />
      {q && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.length ? (
            results.map((p) => {
              const added = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={added}
                  onClick={() => onAdd(p)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-amber-50 disabled:opacity-50"
                >
                  <img src={assetUrl(p.image)} onError={imgFallback} alt="" className="h-10 w-10 rounded object-contain bg-gray-50" />
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-red-600 font-semibold">{formatPrice(p.price)}</span>
                    {p.status === 'HIDDEN' && <span className="ml-2 text-xs text-gray-500">(đang ẩn – sẽ không hiện)</span>}
                  </span>
                  <span className="text-xs font-bold text-amber-600">{added ? 'Đã chọn' : addLabel}</span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-3 text-sm text-gray-500">Không tìm thấy sản phẩm</p>
          )}
        </div>
      )}
    </div>
  );
}
