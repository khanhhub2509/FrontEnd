import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function EditPaymentMethodForm({ paymentMethod, onSaved, onCancel }) {
  const [name, setName] = useState(paymentMethod.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${paymentMethod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!response.ok) throw new Error('Cập nhật phương thức thanh toán thất bại.');
      onSaved();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu phương thức thanh toán.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="customer-form customer-edit-page-form" onSubmit={submit}>
      <div className="admin-form-heading"><div><h2>Cập nhật phương thức thanh toán</h2><p>Thay đổi tên hiển thị của phương thức thanh toán.</p></div></div>
      <div className="customer-fields payment-method-fields"><label>Tên phương thức thanh toán<input value={name} onChange={(event) => setName(event.target.value)} required maxLength="255" autoFocus /></label></div>
      {error && <p className="admin-list-error" role="alert">{error}</p>}
      <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={onCancel}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
    </form>
  );
}

export default EditPaymentMethodForm;
