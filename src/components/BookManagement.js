import { useCallback, useEffect, useState } from 'react';
import BookForm from './BookForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function BookManagement({ onEdit }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [booksResponse, categoriesResponse, authorsResponse, publishersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/books`), fetch(`${API_BASE_URL}/categories`), fetch(`${API_BASE_URL}/authors`), fetch(`${API_BASE_URL}/publishers`),
      ]);
      if (![booksResponse, categoriesResponse, authorsResponse, publishersResponse].every((response) => response.ok)) throw new Error('Không thể tải dữ liệu quản lý sách.');
      const [bookData, categoryData, authorData, publisherData] = await Promise.all([booksResponse.json(), categoriesResponse.json(), authorsResponse.json(), publishersResponse.json()]);
      setBooks(Array.isArray(bookData) ? bookData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setAuthors(Array.isArray(authorData) ? authorData : []);
      setPublishers(Array.isArray(publisherData) ? publisherData : []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteBook = async (book) => {
    if (!window.confirm(`Xóa sách "${book.bookName}"?`)) return;
    setRemovingId(book.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/books/${book.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Xóa sách thất bại.');
      setBooks((currentBooks) => currentBooks.filter((item) => item.id !== book.id));
    } catch (requestError) {
      setError(requestError.message || 'Xóa sách thất bại.');
    } finally {
      setRemovingId(null);
    }
  };

  return <section className="customer-directory" aria-label="Quản lý sách">
    <div className="customer-directory-header"><div><p className="eyebrow">Kho sách</p><h2>Sách</h2></div><div className="customer-header-actions"><button className="primary-button" type="button" onClick={() => { setError(''); setIsFormOpen(true); }}>Thêm sách</button></div></div>
    {error && <p className="admin-list-error" role="alert">{error}</p>}
    {isFormOpen && <BookForm compact categories={categories} authors={authors} publishers={publishers} onCancel={() => setIsFormOpen(false)} onSaved={async () => { setIsFormOpen(false); await loadData(); }} />}
    {loading ? <p className="admin-loading">Đang tải danh sách sách…</p> : <div className="customer-table-wrap"><table className="customer-table book-management-table"><thead><tr><th>Sách</th><th>Danh mục</th><th>Tác giả</th><th>Nhà xuất bản</th><th>Giá</th><th>Tồn kho</th><th className="admin-table-actions">Thao tác</th></tr></thead><tbody>
      {books.map((book) => <tr key={book.id}><td><div className="book-management-title">{book.image && <img src={book.image} alt="" />}<div><strong>{book.bookName || 'Chưa đặt tên'}</strong><small>#{book.id} · {book.publishYear || 'Chưa rõ năm'}</small></div></div></td><td>{book.category?.name || '—'}</td><td>{book.author?.name || '—'}</td><td>{book.publisher?.name || '—'}</td><td>{Number(book.price || 0).toLocaleString('vi-VN')} ₫</td><td>{book.quantity ?? '—'}</td><td className="admin-table-actions"><button className="table-action edit" type="button" onClick={() => onEdit(book)}>Sửa</button><button className="table-action delete" type="button" onClick={() => deleteBook(book)} disabled={removingId === book.id}>{removingId === book.id ? 'Đang xóa…' : 'Xóa'}</button></td></tr>)}
      {!books.length && <tr><td colSpan="7" className="admin-empty">Chưa có sách nào.</td></tr>}
    </tbody></table></div>}
  </section>;
}

export default BookManagement;
