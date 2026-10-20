import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const initialForm = { fullName: '', email: '', phone: '', password: '' };

function AddAdminForm({ onAdded, token }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admins/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      if (!response.ok) { const message = await response.json().catch(() => null); throw new Error(typeof message === 'string' ? message : 'Không thể thêm admin.'); }
      setForm(initialForm); onAdded?.();
    } catch (requestError) { setError(requestError.message || 'Không thể thêm admin.'); }
    finally { setIsSaving(false); }
  };

  return <form className="admin-form" onSubmit={submit}>
    <div className="admin-form-heading"><div><h2>Tạo tài khoản quản trị</h2><p>Thông tin đăng nhập được bảo vệ bằng mật khẩu mã hóa.</p></div></div>
    <div className="admin-fields">
      <label>Họ và tên<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></label>
      <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
      <label>Số điện thoại<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label>
      <label>Mật khẩu<input type="password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
    </div>
    {error && <p className="admin-list-error" role="alert">{error}</p>}
    <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Đang tạo…' : 'Tạo tài khoản'}</button>
  </form>;
}

export default AddAdminForm;
