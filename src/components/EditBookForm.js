import { useCallback, useEffect, useState } from 'react';
import BookForm from './BookForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function EditBookForm({ book, onSaved, onCancel }) {
  const [references, setReferences] = useState({ categories: [], authors: [], publishers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReferences = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesResponse, authorsResponse, publishersResponse] = await Promise.all([fetch(`${API_BASE_URL}/categories`), fetch(`${API_BASE_URL}/authors`), fetch(`${API_BASE_URL}/publishers`)]);
      if (![categoriesResponse, authorsResponse, publishersResponse].every((response) => response.ok)) throw new Error('Không thể tải dữ liệu danh mục sách.');
      const [categories, authors, publishers] = await Promise.all([categoriesResponse.json(), authorsResponse.json(), publishersResponse.json()]);
      setReferences({ categories: Array.isArray(categories) ? categories : [], authors: Array.isArray(authors) ? authors : [], publishers: Array.isArray(publishers) ? publishers : [] });
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReferences(); }, [loadReferences]);
  if (loading) return <p className="admin-loading">Đang tải thông tin sách…</p>;
  if (error) return <><p className="admin-list-error" role="alert">{error}</p><button className="secondary-button" type="button" onClick={onCancel}>Quay lại</button></>;
  return <BookForm book={book} {...references} onSaved={onSaved} onCancel={onCancel} />;
}

export default EditBookForm;
