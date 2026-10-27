import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const emptyCustomer = { fullName: '', email: '', phone: '', address: '', password: '' };

function CustomerManagement({ onEdit }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/customers`);
      if (!response.ok) throw new Error('Không thể tải danh sách khách hàng.');
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const openCreate = () => {
    setForm(emptyCustomer);
    setError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(emptyCustomer);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/create`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) },
      );
      if (!response.ok) throw new Error('Thêm khách hàng thất bại.');
      closeForm();
      await loadCustomers();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu thông tin khách hàng.');
    } finally {
      setSaving(false);
    }
  };

  const removeCustomer = async (customer) => {
    if (!window.confirm(`Xóa khách hàng ${customer.fullName || customer.email}?`)) return;
    setRemovingId(customer.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customer.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Xóa khách hàng thất bại.');
      setCustomers((currentCustomers) => currentCustomers.filter((item) => item.id !== customer.id));
    } catch (requestError) {
      setError(requestError.message || 'Xóa khách hàng thất bại.');
    } finally {
      setRemovingId(null);
    }
  };

  return <section className="customer-directory" aria-label="Quản lý khách hàng">
    <div className="customer-directory-header">
      <div><p className="eyebrow">Quản lý khách hàng</p><h2>Khách hàng</h2><span>{customers.length} khách hàng trong hệ thống</span></div>
      <div className="customer-header-actions"><button className="primary-button" type="button" onClick={openCreate}>Thêm khách hàng</button></div>
    </div>

    {error && <p className="admin-list-error" role="alert">{error}</p>}

    {isFormOpen && <form className="customer-form" onSubmit={submit}>
      <div className="admin-form-heading"><div><h3>Thêm khách hàng</h3><p>Điền đầy đủ thông tin liên hệ của khách hàng.</p></div><button className="icon-button" type="button" onClick={closeForm} aria-label="Đóng biểu mẫu">×</button></div>
      <div className="customer-fields">
        <label>Họ và tên<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label>Số điện thoại<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label>
        <label>Địa chỉ<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required /></label>
        <label>Mật khẩu<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
      </div>
      <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={closeForm}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Tạo khách hàng'}</button></div>
    </form>}

    {loading ? <p className="admin-loading">Đang tải danh sách khách hàng…</p> : <div className="customer-table-wrap"><table className="customer-table"><thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Địa chỉ</th><th className="admin-table-actions">Thao tác</th></tr></thead><tbody>
      {customers.map((customer) => <tr key={customer.id}>
        <td><div className="admin-identity customer-avatar"><span>{(customer.fullName || customer.email || '?').charAt(0).toUpperCase()}</span><div><strong>{customer.fullName || 'Chưa đặt tên'}</strong><small>#{customer.id}</small></div></div></td>
        <td><div className="admin-contact"><span>{customer.email}</span><small>{customer.phone || 'Chưa có số điện thoại'}</small></div></td>
        <td className="customer-address">{customer.address || 'Chưa có địa chỉ'}</td>
        <td className="admin-table-actions"><button className="table-action edit" type="button" onClick={() => onEdit(customer)}>Sửa</button><button className="table-action delete" type="button" onClick={() => removeCustomer(customer)} disabled={removingId === customer.id}>{removingId === customer.id ? 'Đang xóa…' : 'Xóa'}</button></td>
      </tr>)}
      {!customers.length && <tr><td colSpan="4" className="admin-empty">Chưa có khách hàng nào.</td></tr>}
    </tbody></table></div>}
  </section>;
}

export default CustomerManagement;
