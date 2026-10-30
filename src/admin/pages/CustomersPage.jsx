import { useState } from 'react';
import { KeyRound, Lock, Search, Unlock } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { assetUrl, formatDate } from '../../lib/api';
import { adminApi } from '../adminApi';
import { Button, Card, ErrorBox, Input, PageHeader, Pagination, Table, errorText, useDebounced } from '../ui';

// Admin → Khách hàng: tài khoản khách đăng ký trên web (SĐT, Google, Facebook)
export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const { data, meta, loading, error, reload } = useFetch(() => adminApi.customers.list({ search: q || undefined, page, limit: 20 }), [q, page]);

  const toggleLock = async (c) => {
    if (!confirm(c.isActive ? `Khoá tài khoản "${c.fullName}"? Khách sẽ không đăng nhập được.` : `Mở khoá tài khoản "${c.fullName}"?`)) return;
    try {
      await adminApi.customers.update(c.id, { isActive: !c.isActive });
      reload();
    } catch (err) {
      alert(errorText(err));
    }
  };

  // Khách quên mật khẩu nhắn Zalo -> shop đặt mật khẩu tạm rồi gửi lại cho khách
  const resetPassword = async (c) => {
    const pw = prompt(`Đặt mật khẩu mới cho ${c.fullName}${c.phone ? ` (${c.phone})` : ''} – tối thiểu 6 ký tự:`);
    if (!pw) return;
    try {
      await adminApi.customers.update(c.id, { password: pw });
      alert('Đã đặt mật khẩu mới. Gửi mật khẩu này cho khách và nhắc khách đổi lại trong Tài khoản.');
    } catch (err) {
      alert(errorText(err));
    }
  };

  return (
    <>
      <PageHeader title="Khách hàng" subtitle={meta ? `${meta.total} tài khoản` : 'Tài khoản khách đăng ký trên website'} />
      <Card>
        <div className="p-3 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input className="pl-9" placeholder="Tìm theo tên, SĐT, email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}
        <Table
          rows={data}
          loading={loading}
          empty="Chưa có khách hàng nào đăng ký"
          columns={[
            {
              key: 'name',
              title: 'Khách hàng',
              render: (c) => (
                <div className="flex items-center gap-2.5 min-w-[200px]">
                  {c.avatar ? (
                    <img src={assetUrl(c.avatar)} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">{c.fullName.trim().split(/\s+/).pop()?.[0]}</span>
                  )}
                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${c.isActive ? '' : 'text-gray-400 line-through'}`}>{c.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{c.phone || 'Chưa có SĐT'}{c.email ? ` · ${c.email}` : ''}</p>
                  </div>
                </div>
              ),
            },
            { key: 'loginWith', title: 'Đăng nhập bằng', render: (c) => c.loginWith.join(', ') || '—' },
            { key: 'orderCount', title: 'Đơn', className: 'text-right', render: (c) => c.orderCount },
            { key: 'createdAt', title: 'Ngày đăng ký', className: 'whitespace-nowrap text-gray-500', render: (c) => formatDate(c.createdAt) },
            {
              key: 'actions',
              title: '',
              className: 'text-right whitespace-nowrap',
              render: (c) => (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" title="Đặt lại mật khẩu" onClick={() => resetPassword(c)}><KeyRound size={15} /></Button>
                  <Button size="sm" variant="ghost" title={c.isActive ? 'Khoá tài khoản' : 'Mở khoá'} className={c.isActive ? 'hover:text-red-600' : 'text-red-600'} onClick={() => toggleLock(c)}>
                    {c.isActive ? <Lock size={15} /> : <Unlock size={15} />}
                  </Button>
                </div>
              ),
            },
          ]}
        />
        <Pagination meta={meta} onChange={setPage} />
      </Card>
    </>
  );
}
