import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const emptyForm = { fullName: '', email: '', phone: '', password: '' };

const getErrorMessage = async (response, fallback) => {
  const body = await response.json().catch(() => null);
  return typeof body === 'string' ? body : fallback;
};

function AdminList({ token }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admins`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Không thể tải danh sách admin.');
      const data = await response.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const startEdit = (admin) => {
    setEditingAdmin(admin);
    setForm({ fullName: admin.fullName || '', email: '', phone: '', password: '' });
    setError('');
  };

  const cancelEdit = () => { setEditingAdmin(null); setForm(emptyForm); };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingAdmin) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName: form.fullName }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response, 'Cập nhật admin thất bại.'));
      cancelEdit();
      await loadAdmins();
    } catch (requestError) {
      setError(requestError.message || 'Cập nhật admin thất bại.');
    } finally { setIsSaving(false); }
  };

  const deleteAdmin = async (admin) => {
    if (!window.confirm(`Xóa tài khoản ${admin.email}?`)) return;
    setActionId(admin.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admins/${admin.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(await getErrorMessage(response, 'Xóa admin thất bại.'));
      setAdmins((currentAdmins) => currentAdmins.filter((item) => item.id !== admin.id));
    } catch (requestError) {
      setError(requestError.message || 'Xóa admin thất bại.');
    } finally { setActionId(null); }
  };

  if (loading) return <p className="admin-loading">Đang tải danh sách quản trị viên…</p>;

  return (
    <section className="admin-directory" aria-label="Danh sách quản trị viên">
      <div className="admin-directory-header">
        <div><p className="eyebrow">Quản lý tài khoản</p><h2>Danh sách quản trị viên</h2><span></span></div>
        {/* <button className="admin-refresh-button" type="button" onClick={loadAdmins}>Làm mới</button> */}
      </div>
      {error && <p className="admin-list-error" role="alert">{error}</p>}
      {editingAdmin && (
        <form className="admin-edit-form" onSubmit={handleEditSubmit}>
          <div className="admin-form-heading"><div><h3>Cập nhật quản trị viên</h3><p>API hiện tại hỗ trợ cập nhật họ và tên.</p></div><button className="icon-button" type="button" onClick={cancelEdit} aria-label="Đóng biểu mẫu">×</button></div>
          <div className="admin-fields">
            <label>Họ và tên<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></label>
          </div>
          <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={cancelEdit}>Hủy</button><button className="primary-button" disabled={isSaving}>{isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
        </form>
      )}
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Quản trị viên</th><th>Liên hệ</th><th className="admin-table-actions">Thao tác</th></tr></thead><tbody>
        {admins.map((admin) => <tr key={admin.id}>
          <td><div className="admin-identity"><span>{(admin.fullName || admin.email || '?').charAt(0).toUpperCase()}</span><div><strong>{admin.fullName || 'Chưa đặt tên'}</strong><small> #{admin.id}</small></div></div></td>
          <td><div className="admin-contact"><span>{admin.email}</span><small>{admin.phone || 'Chưa có số điện thoại'}</small></div></td>
          <td className="admin-table-actions"><button className="table-action edit" type="button" onClick={() => startEdit(admin)}>Sửa</button><button className="table-action delete" type="button" onClick={() => deleteAdmin(admin)} disabled={actionId === admin.id}>{actionId === admin.id ? 'Đang xóa…' : 'Xóa'}</button></td>
        </tr>)}
        {!admins.length && <tr><td colSpan="3" className="admin-empty">Chưa có tài khoản quản trị viên nào.</td></tr>}
      </tbody></table></div>
    </section>
  );
}

export default AdminList;
