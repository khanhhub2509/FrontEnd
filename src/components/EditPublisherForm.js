import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function EditPublisherForm({ publisher, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: publisher.name || '', email: publisher.email || '', phone: publisher.phone?.toString() || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/publishers/${publisher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() ? Number(form.phone.trim()) : null }),
      });
      if (!response.ok) throw new Error('Cập nhật nhà xuất bản thất bại.');
      onSaved();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu nhà xuất bản.');
    } finally {
      setSaving(false);
    }
  };

  return <form className="customer-form customer-edit-page-form" onSubmit={submit}>
    <div className="admin-form-heading"><div><h2>Cập nhật nhà xuất bản</h2><p>Thay đổi thông tin liên hệ của nhà xuất bản.</p></div></div>
    <div className="customer-fields">
      <label>Tên nhà xuất bản<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength="255" autoFocus /></label>
      <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength="50" /></label>
      <label>Số điện thoại<input type="tel" inputMode="numeric" pattern="[0-9]+" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label>
    </div>
    {error && <p className="admin-list-error" role="alert">{error}</p>}
    <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={onCancel}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
  </form>;
}

export default EditPublisherForm;
