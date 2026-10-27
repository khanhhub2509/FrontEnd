import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const emptyPublisher = { name: '', email: '', phone: '' };

const toPublisherPayload = (publisher) => ({
  name: publisher.name.trim(),
  email: publisher.email.trim(),
  phone: publisher.phone.trim() ? Number(publisher.phone.trim()) : null,
});

function PublisherManagement({ onEdit }) {
  const [publishers, setPublishers] = useState([]);
  const [form, setForm] = useState(emptyPublisher);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const loadPublishers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/publishers`);
      if (!response.ok) throw new Error('Không thể tải danh sách nhà xuất bản.');
      const data = await response.json();
      setPublishers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublishers();
  }, [loadPublishers]);

  const closeForm = () => {
    setForm(emptyPublisher);
    setIsFormOpen(false);
  };

  const createPublisher = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/publishers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPublisherPayload(form)),
      });
      if (!response.ok) throw new Error('Thêm nhà xuất bản thất bại.');
      closeForm();
      await loadPublishers();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu nhà xuất bản.');
    } finally {
      setSaving(false);
    }
  };

  const deletePublisher = async (publisher) => {
    if (!window.confirm(`Xóa nhà xuất bản "${publisher.name}"?`)) return;
    setRemovingId(publisher.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/publishers/${publisher.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Xóa nhà xuất bản thất bại.');
      setPublishers((currentItems) => currentItems.filter((item) => item.id !== publisher.id));
    } catch (requestError) {
      setError(requestError.message || 'Xóa nhà xuất bản thất bại.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="customer-directory" aria-label="Quản lý nhà xuất bản">
      <div className="customer-directory-header">
        <div><p className="eyebrow">Danh mục sách</p><h2>Nhà xuất bản</h2></div>
        <div className="customer-header-actions"><button className="primary-button" type="button" onClick={() => { setError(''); setIsFormOpen(true); }}>Thêm nhà xuất bản</button></div>
      </div>

      {error && <p className="admin-list-error" role="alert">{error}</p>}

      {isFormOpen && (
        <form className="customer-form" onSubmit={createPublisher}>
          <div className="admin-form-heading"><div><h3>Thêm nhà xuất bản</h3><p>Điền thông tin liên hệ của nhà xuất bản.</p></div><button className="icon-button" type="button" onClick={closeForm} aria-label="Đóng biểu mẫu">×</button></div>
          <div className="customer-fields">
            <label>Tên nhà xuất bản<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength="255" autoFocus /></label>
            <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength="50" /></label>
            <label>Số điện thoại<input type="tel" inputMode="numeric" pattern="[0-9]+" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label>
          </div>
          <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={closeForm}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Tạo nhà xuất bản'}</button></div>
        </form>
      )}

      {loading ? <p className="admin-loading">Đang tải danh sách nhà xuất bản…</p> : (
        <div className="customer-table-wrap"><table className="customer-table"><thead><tr><th>Nhà xuất bản</th><th>Email</th><th>Số điện thoại</th><th className="admin-table-actions">Thao tác</th></tr></thead><tbody>
          {publishers.map((publisher) => <tr key={publisher.id}>
            <td><div className="admin-identity customer-avatar"><span>{(publisher.name || '?').charAt(0).toUpperCase()}</span><div><strong>{publisher.name || 'Chưa đặt tên'}</strong><small>#{publisher.id}</small></div></div></td>
            <td>{publisher.email || 'Chưa có email'}</td><td>{publisher.phone ?? 'Chưa có số điện thoại'}</td>
            <td className="admin-table-actions"><button className="table-action edit" type="button" onClick={() => onEdit(publisher)}>Sửa</button><button className="table-action delete" type="button" onClick={() => deletePublisher(publisher)} disabled={removingId === publisher.id}>{removingId === publisher.id ? 'Đang xóa…' : 'Xóa'}</button></td>
          </tr>)}
          {!publishers.length && <tr><td colSpan="4" className="admin-empty">Chưa có nhà xuất bản nào.</td></tr>}
        </tbody></table></div>
      )}
    </section>
  );
}

export default PublisherManagement;
