import { useState } from 'react';
import { adminApi } from '../adminApi';
import { Button, Field, Input, Modal, errorText } from '../ui';

const empty = { currentPassword: '', newPassword: '', confirm: '' };

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const close = () => {
    setForm(empty);
    setError('');
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setError('Mật khẩu nhập lại không khớp');
    setSaving(true);
    setError('');
    try {
      await adminApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      alert('Đổi mật khẩu thành công');
      close();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Đổi mật khẩu"
      footer={
        <>
          <Button variant="outline" onClick={close}>Hủy</Button>
          <Button type="submit" form="change-pw" loading={saving}>Lưu</Button>
        </>
      }
    >
      <form id="change-pw" onSubmit={submit} className="space-y-3">
        <Field label="Mật khẩu hiện tại" required>
          <Input type="password" required value={form.currentPassword} onChange={set('currentPassword')} />
        </Field>
        <Field label="Mật khẩu mới" required hint="Tối thiểu 8 ký tự">
          <Input type="password" required minLength={8} value={form.newPassword} onChange={set('newPassword')} />
        </Field>
        <Field label="Nhập lại mật khẩu mới" required>
          <Input type="password" required value={form.confirm} onChange={set('confirm')} />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
}
