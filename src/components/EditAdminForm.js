import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function EditAdminForm({ admin, token, onSaved, onCancel }) {
  const [form, setForm] = useState({
    fullName: admin.fullName || '',
    email: admin.email || '',
    phone: admin.phone || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/admins/${admin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Cập nhật admin thất bại.');
      onSaved();
    } catch (requestError) {
      setError(requestError.message || 'Cập nhật admin thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return <form className="admin-form" onSubmit={submit}>
    <div className="admin-form-heading"><div><h2>Cập nhật quản trị viên</h2><p>Cập nhật thông tin liên hệ và mật khẩu cho tài khoản quản trị.</p></div></div>
    <div className="admin-fields">
      <label>Họ và tên<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></label>
      <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
      <label>Số điện thoại<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label>
      <label>Mật khẩu mới<input type="password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Để trống nếu không đổi mật khẩu" /></label>
    </div>
    {error && <p className="admin-list-error" role="alert">{error}</p>}
    <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={onCancel}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
  </form>;
}

export default EditAdminForm;
