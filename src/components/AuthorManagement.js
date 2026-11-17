import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const emptyAuthor = { name: '' };

function AuthorManagement({ onEdit }) {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(emptyAuthor);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const loadAuthors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/authors`);
      if (!response.ok) throw new Error('Không thể tải danh sách tác giả.');
      const data = await response.json();
      setAuthors(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  const closeForm = () => {
    setForm(emptyAuthor);
    setIsFormOpen(false);
  };

  const createAuthor = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/authors/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim() }),
      });
      if (!response.ok) throw new Error('Thêm tác giả thất bại.');
      closeForm();
      await loadAuthors();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu tác giả.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAuthor = async (author) => {
    if (!window.confirm(`Xóa tác giả "${author.name}"?`)) return;
    setRemovingId(author.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/authors/${author.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Xóa tác giả thất bại.');
      setAuthors((currentAuthors) => currentAuthors.filter((item) => item.id !== author.id));
    } catch (requestError) {
      setError(requestError.message || 'Xóa tác giả thất bại.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="customer-directory" aria-label="Quản lý tác giả">
      <div className="customer-directory-header">
        <div><p className="eyebrow">Danh mục sách</p><h2>Tác giả</h2></div>
        <div className="customer-header-actions"><button className="primary-button" type="button" onClick={() => { setError(''); setIsFormOpen(true); }}>Thêm tác giả</button></div>
      </div>

      {error && <p className="admin-list-error" role="alert">{error}</p>}

      {isFormOpen && (
        <form className="customer-form" onSubmit={createAuthor}>
          <div className="admin-form-heading"><div><h3>Thêm tác giả</h3><p>Nhập họ và tên tác giả.</p></div><button className="icon-button" type="button" onClick={closeForm} aria-label="Đóng biểu mẫu">×</button></div>
          <div className="customer-fields payment-method-fields"><label>Tên tác giả<input value={form.name} onChange={(event) => setForm({ name: event.target.value })} required maxLength="100" autoFocus /></label></div>
          <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={closeForm}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Tạo tác giả'}</button></div>
        </form>
      )}

      {loading ? <p className="admin-loading">Đang tải danh sách tác giả…</p> : (
        <div className="customer-table-wrap"><table className="customer-table payment-method-table"><thead><tr><th>Mã</th><th>Tên tác giả</th><th className="admin-table-actions">Thao tác</th></tr></thead><tbody>
          {authors.map((author) => <tr key={author.id}><td>#{author.id}</td><td><strong>{author.name || 'Chưa đặt tên'}</strong></td><td className="admin-table-actions"><button className="table-action edit" type="button" onClick={() => onEdit(author)}>Sửa</button><button className="table-action delete" type="button" onClick={() => deleteAuthor(author)} disabled={removingId === author.id}>{removingId === author.id ? 'Đang xóa…' : 'Xóa'}</button></td></tr>)}
          {!authors.length && <tr><td colSpan="3" className="admin-empty">Chưa có tác giả nào.</td></tr>}
        </tbody></table></div>
      )}
    </section>
  );
}

export default AuthorManagement;
