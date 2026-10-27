import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function EditCustomerForm({ customer, onSaved, onCancel }) {
  const [form, setForm] = useState({
    fullName: customer.fullName || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    password: customer.password || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm((currentForm) => ({ ...currentForm, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Cập nhật khách hàng thất bại.');
      onSaved();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu thông tin khách hàng.');
    } finally {
      setSaving(false);
    }
  };

  return <form className="customer-form customer-edit-page-form" onSubmit={submit}>
    <div className="admin-form-heading"><div><h2>Cập nhật khách hàng</h2><p>Điền đầy đủ thông tin liên hệ của khách hàng.</p></div></div>
    <div className="customer-fields">
      <label>Họ và tên<input value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} required /></label>
      <label>Email<input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required /></label>
      <label>Số điện thoại<input type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} required /></label>
      <label>Địa chỉ<input value={form.address} onChange={(event) => updateField('address', event.target.value)} required /></label>
      <label>Mật khẩu<input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} required /></label>
    </div>
    {error && <p className="admin-list-error" role="alert">{error}</p>}
    <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={onCancel}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
  </form>;
}

export default EditCustomerForm;
