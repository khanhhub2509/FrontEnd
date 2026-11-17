import { Form } from 'react-bootstrap';
import BookCard from './BookCard';

function FeaturedBooks({
  books,
  formatCurrency,
  onAddToCart,
  onQueryChange,
  onSortChange,
  query,
  selectedCategory,
  sortBy,
  isLoading,
  error,
  onRetry,
}) {
  return (
    <div className="featured-section" id="featured">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lựa chọn phổ biến</p>
          <h2>Sách nổi bật</h2>
        </div>
        <span>
          <strong>{books.length}</strong> kết quả
          {selectedCategory !== 'Tất cả' ? ` trong ${selectedCategory}` : ''}
        </span>
      </div>

      <div className="book-toolbar">
        <Form.Control
          type="search"
          value={query}
          placeholder="Lọc nhanh theo sách hoặc tác giả"
          onChange={(event) => onQueryChange(event.target.value)}
        />

        <Form.Select
          aria-label="Sắp xếp sách"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
        >
          <option value="featured">Mặc định</option>
          <option value="price-asc">Giá thấp trước</option>
          <option value="rating">Đánh giá cao</option>
          <option value="sold">Bán chạy</option>
        </Form.Select>
      </div>

      {isLoading ? (
        <div className="empty-state" role="status">
          <strong>Đang tải kho sách…</strong>
          <span>BookNest đang lấy các tựa sách mới nhất.</span>
        </div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <strong>Chưa thể tải dữ liệu</strong>
          <span>{error}</span>
          <button className="retry-button" type="button" onClick={onRetry}>Thử lại</button>
        </div>
      ) : books.length > 0 ? (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard
              book={book}
              formatCurrency={formatCurrency}
              key={book.id}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>Chưa tìm thấy sách phù hợp</strong>
          <span>Thử đổi từ khóa hoặc chọn lại danh mục khác.</span>
        </div>
      )}
    </div>
  );
}

export default FeaturedBooks;
