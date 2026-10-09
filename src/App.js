import { useMemo, useState } from 'react';
import './App.css';
import CategoryStrip from './components/CategoryStrip';
import FeaturedBooks from './components/FeaturedBooks';
import Header from './components/Header';
import Hero from './components/Hero';
import OrderPanel from './components/OrderPanel';
import AdminList from './components/adminList';
import AddAdminForm from './components/addAdminForm';
import AdminLoginForm from './components/AdminLoginForm';
import {
  books,
  categories,
  formatCurrency,
  startingCartItems,
} from './components/bookData';

const ALL_CATEGORIES = 'Tất cả';

const sortBooks = (bookList, sortBy) =>
  [...bookList].sort((firstBook, secondBook) => {
    if (sortBy === 'price-asc') {
      return firstBook.price - secondBook.price;
    }

    if (sortBy === 'rating') {
      return secondBook.rating - firstBook.rating;
    }

    if (sortBy === 'sold') {
      return secondBook.sold - firstBook.sold;
    }

    return firstBook.id - secondBook.id;
  });

function App() {
  const [page, setPage] = useState('home');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [sortBy, setSortBy] = useState('featured');
  const [cartItems, setCartItems] = useState(startingCartItems);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [adminListVersion, setAdminListVersion] = useState(0);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));

  // Cộng toàn bộ số lượng từng dòng hàng để hiển thị tổng sách trong giỏ.
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    // Lọc sách theo danh mục và từ khóa, sau đó sắp xếp theo lựa chọn của người dùng.
    const filteredBooks = books.filter((book) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES || book.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        [book.title, book.author, book.category].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });

    return sortBooks(filteredBooks, sortBy);
  }, [query, selectedCategory, sortBy]);

  // Ghép bookId trong giỏ với dữ liệu sách đầy đủ để OrderPanel có đủ thông tin hiển thị.
  const detailedCartItems = cartItems
    .map((item) => {
      const book = books.find((currentBook) => currentBook.id === item.bookId);
      return book ? { ...book, quantity: item.quantity } : null;
    })
    .filter(Boolean);

  const handleAddToCart = (book) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.bookId === book.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.bookId === book.id
            ? { ...item, quantity: Math.min(item.quantity + 1, book.stock) }
            : item,
        );
      }

      return [...currentItems, { bookId: book.id, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (bookId, direction) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.bookId !== bookId) {
            return item;
          }

          const book = books.find((currentBook) => currentBook.id === bookId);
          const nextQuantity =
            direction === 'increase' ? item.quantity + 1 : item.quantity - 1;

          // Giữ số lượng trong khoảng hợp lệ: không âm và không vượt quá tồn kho.
          return {
            ...item,
            quantity: Math.max(0, Math.min(nextQuantity, book?.stock || 1)),
          };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (bookId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.bookId !== bookId),
    );
  };

  const handleNavigate = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogin = (token) => {
    setAdminToken(token);
    handleNavigate('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    handleNavigate('admin-login');
  };

  const handleCheckoutSuccess = (orderTotal) => {
    setLastOrderTotal(orderTotal);
    setCartItems([]);
    handleNavigate('success');
  };

  const renderHomePage = () => (
    <>
      <Hero query={query} onQueryChange={setQuery} />

      <CategoryStrip
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <section className="content-grid">
        <FeaturedBooks
          books={visibleBooks}
          formatCurrency={formatCurrency}
          onAddToCart={handleAddToCart}
          query={query}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          onQueryChange={setQuery}
          onSortChange={setSortBy}
        />
      </section>

      <section className="support-section" id="support">
        <div>
          <p className="eyebrow">Tư vấn chọn sách</p>
          <h2>Gợi ý theo nhu cầu đọc</h2>
          <p>
            BookNest gom các đầu sách theo mục tiêu học tập, làm việc và thư
            giãn để bạn chọn nhanh hơn thay vì lướt quá nhiều lựa chọn.
          </p>
        </div>

        <div className="support-grid">
          <article>
            <span>01</span>
            <strong>Bắt đầu thói quen đọc</strong>
            <p>Ưu tiên sách ngắn, chương rõ, dễ đọc 15 phút mỗi ngày.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Nâng cấp công việc</strong>
            <p>Chọn sách kỹ năng, kinh tế và tư duy hệ thống có ví dụ thực tế.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Quà tặng ý nghĩa</strong>
            <p>Lọc theo độ tuổi, chủ đề và thông điệp để tặng đúng người.</p>
          </article>
        </div>
      </section>
    </>
  );

  const renderCartPage = () => (
    <section className="cart-page">
      <div className="page-heading">
        <p className="eyebrow">Giỏ hàng</p>
        <h1>Kiểm tra đơn hàng của bạn</h1>
        <p>
          Cập nhật số lượng, nhập thông tin nhận hàng và hoàn tất đặt sách tại đây.
        </p>
      </div>

      <OrderPanel
        items={detailedCartItems}
        formatCurrency={formatCurrency}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </section>
  );

  const renderSuccessPage = () => (
    <section className="success-page">
      <div className="success-card">
        <span className="success-icon">✓</span>
        <p className="eyebrow">Thanh toán thành công</p>
        <h1>Cảm ơn bạn đã đặt sách tại BookNest</h1>
        <p>
          Đơn hàng trị giá {formatCurrency(lastOrderTotal)} đã được ghi nhận.
          BookNest sẽ liên hệ xác nhận và giao sách trong thời gian sớm nhất.
        </p>
        <button
          className="btn checkout-button"
          type="button"
          onClick={() => handleNavigate('home')}
        >
          Tiếp tục mua sách
        </button>
      </div>
    </section>
  );

  const renderAdminPage = () => (
    <section className="page-heading">
      <p className="eyebrow">Quản trị</p>
      <h1>Danh sách Admin</h1>
      <button
        className="admin-add-button"
        type="button"
        onClick={() => handleNavigate('add-admin')}
      >
        Thêm Admin
      </button>
      <button className="admin-logout-button" type="button" onClick={handleAdminLogout}>
        Đăng xuất
      </button>
      <AdminList key={adminListVersion} token={adminToken} />
    </section>
  );

  const renderAddAdminPage = () => (
    <section className="page-heading">
      <p className="eyebrow">Quản trị</p>
      <h1>Thêm Admin</h1>
      <AddAdminForm
        token={adminToken}
        onAdded={() => {
          setAdminListVersion((version) => version + 1);
          handleNavigate('admin');
        }}
      />
      <button
        className="admin-back-button"
        type="button"
        onClick={() => handleNavigate('admin')}
      >
        Quay lại danh sách Admin
      </button>
    </section>
  );

  const renderAdminArea = () => {
    if (!adminToken) {
      return <AdminLoginForm onLogin={handleAdminLogin} />;
    }

    return page === 'add-admin' ? renderAddAdminPage() : renderAdminPage();
  };

  return (
    <div className="bookstore">
      <Header
        cartCount={cartCount}
        currentPage={page}
        onNavigate={handleNavigate}
      />

      <main>
        {(page === 'add-admin' || page === 'admin' || page === 'admin-login') && renderAdminArea()}
        {page === 'cart' && renderCartPage()}
        {page === 'success' && renderSuccessPage()}
        {page === 'home' && renderHomePage()}
      </main>
    </div>
  );
}

export default App;
