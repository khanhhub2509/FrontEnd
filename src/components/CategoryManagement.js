import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const emptyCategory = { name: '' };

function CategoryManagement({ onEdit }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Không thể tải danh sách danh mục.');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const closeForm = () => {
    setForm(emptyCategory);
    setIsFormOpen(false);
  };

  const createCategory = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/categories/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim() }),
      });
      if (!response.ok) throw new Error('Thêm danh mục thất bại.');
      closeForm();
      await loadCategories();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu danh mục.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;
    setRemovingId(category.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${category.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Xóa danh mục thất bại.');
      setCategories((currentCategories) => currentCategories.filter((item) => item.id !== category.id));
    } catch (requestError) {
      setError(requestError.message || 'Xóa danh mục thất bại.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="customer-directory" aria-label="Quản lý danh mục">
      <div className="customer-directory-header">
        <div><p className="eyebrow">Danh mục sách</p><h2>Danh mục</h2></div>
        <div className="customer-header-actions"><button className="primary-button" type="button" onClick={() => { setError(''); setIsFormOpen(true); }}>Thêm danh mục</button></div>
      </div>

      {error && <p className="admin-list-error" role="alert">{error}</p>}

      {isFormOpen && (
        <form className="customer-form" onSubmit={createCategory}>
          <div className="admin-form-heading"><div><h3>Thêm danh mục</h3><p>Nhập tên danh mục sách.</p></div><button className="icon-button" type="button" onClick={closeForm} aria-label="Đóng biểu mẫu">×</button></div>
          <div className="customer-fields payment-method-fields"><label>Tên danh mục<input value={form.name} onChange={(event) => setForm({ name: event.target.value })} required maxLength="255" autoFocus /></label></div>
          <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={closeForm}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : 'Tạo danh mục'}</button></div>
        </form>
      )}

      {loading ? <p className="admin-loading">Đang tải danh sách danh mục…</p> : (
        <div className="customer-table-wrap"><table className="customer-table payment-method-table"><thead><tr><th>Mã</th><th>Tên danh mục</th><th className="admin-table-actions">Thao tác</th></tr></thead><tbody>
          {categories.map((category) => <tr key={category.id}><td>#{category.id}</td><td><strong>{category.name || 'Chưa đặt tên'}</strong></td><td className="admin-table-actions"><button className="table-action edit" type="button" onClick={() => onEdit(category)}>Sửa</button><button className="table-action delete" type="button" onClick={() => deleteCategory(category)} disabled={removingId === category.id}>{removingId === category.id ? 'Đang xóa…' : 'Xóa'}</button></td></tr>)}
          {!categories.length && <tr><td colSpan="3" className="admin-empty">Chưa có danh mục nào.</td></tr>}
        </tbody></table></div>
      )}
    </section>
  );
}

export default CategoryManagement;
