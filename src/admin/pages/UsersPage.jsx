import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { formatDate } from '../../lib/api';
import { adminApi } from '../adminApi';
import { useAuth } from '../AuthContext';
import { Badge, Button, Card, Checkbox, ErrorBox, Field, Input, Modal, PageHeader, Select, Table, errorText } from '../ui';

const ROLE = {
  ADMIN: { label: 'Quản trị viên', className: 'bg-gray-900 text-white' },
  STAFF: { label: 'Nhân viên', className: 'bg-blue-100 text-blue-700' },
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useFetch(() => adminApi.users.list(), []);

  return (
    <>
      <PageHeader
        title="Nhân viên"
        subtitle="Nhân viên xử lý đơn, sản phẩm, thu cũ, bảo hành. Quản trị viên có toàn quyền."
        actions={<Button onClick={() => setEditing({})}><Plus size={16} /> Thêm tài khoản</Button>}
      />
      <Card>
        {error && <div className="p-3"><ErrorBox error={error} onRetry={reload} /></div>}
        <Table
          rows={data}
          loading={loading}
          columns={[
            { key: 'name', title: 'Tên', render: (u) => <><p className="font-semibold">{u.name} {u.id === me.id && <span className="text-xs text-gray-400">(bạn)</span>}</p><p className="text-xs text-gray-500">{u.email}</p></> },
            { key: 'role', title: 'Vai trò', render: (u) => <Badge map={ROLE} value={u.role} /> },
            { key: 'isActive', title: 'Trạng thái', render: (u) => (u.isActive ? <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge> : <Badge className="bg-red-100 text-red-700">Đã khóa</Badge>) },
            { key: 'createdAt', title: 'Ngày tạo', className: 'text-xs text-gray-500', render: (u) => formatDate(u.createdAt) },
            { key: 'actions', title: '', className: 'text-right', render: (u) => <Button size="sm" variant="ghost" onClick={() => setEditing(u)}><Pencil size={15} /></Button> },
          ]}
        />
      </Card>

      {editing && (
        <UserModal
          user={editing.id ? editing : null}
          isSelf={editing.id === me.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function UserModal({ user, isSelf, onClose, onSaved }) {
  const [form, setForm] = useState({ email: user?.email || '', name: user?.name || '', role: user?.role || 'STAFF', isActive: user?.isActive ?? true, password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (user) {
        // Email không đổi được; mật khẩu chỉ gửi khi có nhập
        const { name, role, isActive, password } = form;
        await adminApi.users.update(user.id, { name, role, isActive, ...(password ? { password } : {}) });
      } else {
        const { email, name, role, password } = form;
        await adminApi.users.create({ email, name, role, password });
      }
      onSaved();
    } catch (err) {
      setError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={user ? `Sửa tài khoản ${user.name}` : 'Thêm tài khoản'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" form="user-form" loading={saving}>Lưu</Button>
        </>
      }
    >
      <form id="user-form" onSubmit={save} className="space-y-3">
        <Field label="Email đăng nhập" required>
          <Input type="email" required disabled={Boolean(user)} value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Họ tên" required><Input required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Vai trò">
          <Select value={form.role} disabled={isSelf} onChange={(e) => set('role', e.target.value)}>
            <option value="STAFF">Nhân viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </Select>
        </Field>
        <Field label={user ? 'Đặt lại mật khẩu' : 'Mật khẩu'} required={!user} hint={user ? 'Để trống nếu không đổi' : 'Tối thiểu 8 ký tự'}>
          <Input type="password" required={!user} minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => set('password', e.target.value)} />
        </Field>
        {user && !isSelf && <Checkbox label="Cho phép đăng nhập" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
}
