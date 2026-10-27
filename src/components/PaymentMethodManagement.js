import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const emptyPaymentMethod = { name: '' };

function PaymentMethodManagement({ onEdit }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [form, setForm] = useState(emptyPaymentMethod);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const loadPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods`);
      if (!response.ok) throw new Error('Không thể tải danh sách phương thức thanh toán.');
      const data = await response.json();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const closeForm = () => {
    setForm(emptyPaymentMethod);
    setIsFormOpen(false);
  };

  const createPaymentMethod = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim() }),
      });
      if (!response.ok) throw new Error('Thêm phương thức thanh toán thất bại.');

      closeForm();
      await loadPaymentMethods();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu phương thức thanh toán.');
    } finally {
      setSaving(false);
    }
  };

  const deletePaymentMethod = async (paymentMethod) => {
    if (!window.confirm(`Xóa phương thức thanh toán "${paymentMethod.name}"?`)) return;

    setRemovingId(paymentMethod.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${paymentMethod.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Xóa phương thức thanh toán thất bại.');
      setPaymentMethods((currentItems) => currentItems.filter((item) => item.id !== paymentMethod.id));
    } catch (requestError) {
      setError(requestError.message || 'Xóa phương thức thanh toán thất bại.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="customer-directory" aria-label="Quản lý phương thức thanh toán">
      <div className="customer-directory-header">
        <div>
          <p className="eyebrow">Thanh toán</p>
          <h2>Phương thức thanh toán</h2>
        </div>
        <div className="customer-header-actions">
          <button className="primary-button" type="button" onClick={() => { setError(''); setIsFormOpen(true); }}>
            Thêm phương thức
          </button>
        </div>
      </div>

      {error && <p className="admin-list-error" role="alert">{error}</p>}

      {isFormOpen && (
        <form className="customer-form" onSubmit={createPaymentMethod}>
          <div className="admin-form-heading">
            <div><h3>Thêm phương thức thanh toán</h3><p>Nhập tên phương thức, ví dụ: COD hoặc Chuyển khoản.</p></div>
            <button className="icon-button" type="button" onClick={closeForm} aria-label="Đóng biểu mẫu">×</button>
          </div>
          <div className="customer-fields payment-method-fields">
            <label>Tên phương thức thanh toán<input value={form.name} onChange={(event) => setForm({ name: event.target.value })} required maxLength="255" autoFocus /></label>
          </div>
          <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={closeForm}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Tạo phương thức'}</button></div>
        </form>
      )}

      {loading ? <p className="admin-loading">Đang tải danh sách phương thức thanh toán…</p> : (
        <div className="customer-table-wrap">
          <table className="customer-table payment-method-table">
            <thead><tr><th>Mã</th><th>Tên phương thức thanh toán</th><th className="admin-table-actions">Thao tác</th></tr></thead>
            <tbody>
              {paymentMethods.map((paymentMethod) => (
                <tr key={paymentMethod.id}>
                  <td>#{paymentMethod.id}</td>
                  <td><strong>{paymentMethod.name || 'Chưa đặt tên'}</strong></td>
                  <td className="admin-table-actions">
                    <button className="table-action edit" type="button" onClick={() => onEdit(paymentMethod)}>Sửa</button>
                    <button className="table-action delete" type="button" onClick={() => deletePaymentMethod(paymentMethod)} disabled={removingId === paymentMethod.id}>{removingId === paymentMethod.id ? 'Đang xóa…' : 'Xóa'}</button>
                  </td>
                </tr>
              ))}
              {!paymentMethods.length && <tr><td colSpan="3" className="admin-empty">Chưa có phương thức thanh toán nào.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default PaymentMethodManagement;
