import { useEffect, useState } from 'react';
import { getBookImageUrl } from './bookImage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const initialForm = (book) => ({
  bookName: book?.bookName || '',
  publishYear: book?.publishYear?.toString() || '',
  quantity: book?.quantity?.toString() || '',
  price: book?.price?.toString() || '',
  categoryId: book?.category?.id?.toString() || '',
  authorId: book?.author?.id?.toString() || '',
  publisherId: book?.publisher?.id?.toString() || '',
});

function BookForm({ book, categories, authors, publishers, onSaved, onCancel, compact = false }) {
  const [form, setForm] = useState(() => initialForm(book));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => getBookImageUrl(book?.image));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const selectImage = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : getBookImageUrl(book?.image));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = new FormData();
    payload.append('bookName', form.bookName.trim());
    payload.append('publishYear', form.publishYear);
    payload.append('quantity', form.quantity);
    payload.append('price', form.price);
    payload.append('category.id', form.categoryId);
    payload.append('author.id', form.authorId);
    payload.append('publisher.id', form.publisherId);
    if (imageFile) payload.append('imageFile', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/books${book ? `/${book.id}` : '/create'}`, {
        method: book ? 'PUT' : 'POST',
        body: payload,
      });
      if (!response.ok) throw new Error(book ? 'Cập nhật sách thất bại.' : 'Thêm sách thất bại.');
      onSaved();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu thông tin sách.');
    } finally {
      setSaving(false);
    }
  };

  return <form className={`customer-form${compact ? '' : ' customer-edit-page-form'}`} onSubmit={submit}>
    <div className="admin-form-heading"><div><h2>{book ? 'Cập nhật sách' : 'Thêm sách mới'}</h2><p>Điền thông tin và chọn danh mục, tác giả, nhà xuất bản cho sách.</p></div>{compact && <button className="icon-button" type="button" onClick={onCancel} aria-label="Đóng biểu mẫu">×</button>}</div>
    <div className="customer-fields book-fields">
      <label>Tên sách<input value={form.bookName} onChange={(event) => updateField('bookName', event.target.value)} required maxLength="100" autoFocus /></label>
      <label>Ảnh bìa<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={selectImage} required={!book} /></label>
      {imagePreview && <div className="book-image-preview"><img src={imagePreview} alt="Xem trước ảnh bìa" /><span>{imageFile ? imageFile.name : 'Ảnh bìa hiện tại'}</span></div>}
      <label>Năm xuất bản<input type="number" min="1000" max="9999" value={form.publishYear} onChange={(event) => updateField('publishYear', event.target.value)} required /></label>
      <label>Số lượng<input type="number" min="1" value={form.quantity} onChange={(event) => updateField('quantity', event.target.value)} required /></label>
      <label>Giá (VNĐ)<input type="number" min="1" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} required /></label>
      <label>Danh mục<select value={form.categoryId} onChange={(event) => updateField('categoryId', event.target.value)} required><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Tác giả<select value={form.authorId} onChange={(event) => updateField('authorId', event.target.value)} required><option value="">Chọn tác giả</option>{authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}</select></label>
      <label>Nhà xuất bản<select value={form.publisherId} onChange={(event) => updateField('publisherId', event.target.value)} required><option value="">Chọn nhà xuất bản</option>{publishers.map((publisher) => <option key={publisher.id} value={publisher.id}>{publisher.name}</option>)}</select></label>
    </div>
    {error && <p className="admin-list-error" role="alert">{error}</p>}
    <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={onCancel}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : book ? 'Lưu thay đổi' : 'Tạo sách'}</button></div>
  </form>;
}

export default BookForm;
