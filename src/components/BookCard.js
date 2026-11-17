import { Button, Card } from 'react-bootstrap';

function BookCard({ book, formatCurrency, onAddToCart }) {
  const {
    author,
    category,
    color,
    description,
    originalPrice,
    pages,
    publishYear,
    price,
    rating,
    sold,
    stock,
    tag,
    title,
    image,
  } = book;
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <Card className="book-card">
      <div className="book-thumb" style={{ backgroundColor: color }}>
        <img className="book-image" src={image} alt={title} />
        <span>{tag}</span>
        {discountPercent > 0 && <em>-{discountPercent}%</em>}
      </div>

      <Card.Body className="book-info">
        <div className="book-meta">
          <span>{category}</span>
          {rating ? <span className="book-rating">★ {rating.toFixed(1)}</span> : <span>Còn {stock}</span>}
        </div>
        <Card.Title as="h3">{title}</Card.Title>
        <Card.Text>{author}</Card.Text>
        <p className="book-description">{description}</p>
        <div className="stock-line">
          <span>{publishYear ? `Xuất bản ${publishYear}` : `${pages || '—'} trang`}</span>
          {sold && <span>Đã bán {sold}</span>}
          <span>Còn {stock}</span>
        </div>
        <div className="price-row">
          <span>
            <strong>{formatCurrency(price)}</strong>
          </span>
          <Button type="button" onClick={() => onAddToCart(book)}>
            Thêm vào giỏ
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default BookCard;
