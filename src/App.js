import { useEffect, useMemo, useState } from 'react';
import './App.css';
import CategoryStrip from './components/CategoryStrip';
import FeaturedBooks from './components/FeaturedBooks';
import Header from './components/Header';
import Hero from './components/Hero';
import OrderPanel from './components/OrderPanel';
import AdminList from './components/adminList';
import AddAdminForm from './components/addAdminForm';
import AdminLoginForm from './components/AdminLoginForm';
import CustomerManagement from './components/CustomerManagement';
import EditAdminForm from './components/EditAdminForm';
import EditCustomerForm from './components/EditCustomerForm';
import PaymentMethodManagement from './components/PaymentMethodManagement';
import EditPaymentMethodForm from './components/EditPaymentMethodForm';
import PublisherManagement from './components/PublisherManagement';
import EditPublisherForm from './components/EditPublisherForm';
import AuthorManagement from './components/AuthorManagement';
import EditAuthorForm from './components/EditAuthorForm';
import CategoryManagement from './components/CategoryManagement';
import EditCategoryForm from './components/EditCategoryForm';
import BookManagement from './components/BookManagement';
import EditBookForm from './components/EditBookForm';
import OrderManagement from './components/OrderManagement';
import EditOrderForm from './components/EditOrderForm';
import OrderDetailView from './components/OrderDetailView';
import {
  formatCurrency,
} from './components/bookData';
import { getBookImageUrl } from './components/bookImage';

const ALL_CATEGORIES = 'Tất cả';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const toHomeBook = (book) => ({
  id: book.id,
  title: book.bookName || 'Chưa đặt tên',
  author: book.author?.name || 'Chưa có tác giả',
  category: book.category?.name || 'Chưa phân loại',
  price: Number(book.price) || 0,
  originalPrice: Number(book.price) || 0,
  tag: book.publishYear ? `XB ${book.publishYear}` : 'Sách hay',
  color: '#315f72',
  image: getBookImageUrl(book.image),
  rating: null,
  sold: null,
  stock: Number(book.quantity) || 0,
  publishYear: book.publishYear,
  description: book.publisher?.name ? `Nhà xuất bản: ${book.publisher.name}` : 'Khám phá tựa sách đang có tại BookNest.',
});

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
  const [cartItems, setCartItems] = useState([]);
  const [homeBooks, setHomeBooks] = useState([]);
  const [homeCategories, setHomeCategories] = useState([]);
  const [isHomeLoading, setIsHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState('');
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [adminListVersion, setAdminListVersion] = useState(0);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadHomeData = async () => {
    setIsHomeLoading(true);
    setHomeError('');

    try {
      const [booksResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/books`),
        fetch(`${API_BASE_URL}/categories`),
      ]);

      if (!booksResponse.ok || !categoriesResponse.ok) {
        throw new Error('Không thể tải sách và danh mục từ máy chủ.');
      }

      const [bookData, categoryData] = await Promise.all([
        booksResponse.json(),
        categoriesResponse.json(),
      ]);
      setHomeBooks(Array.isArray(bookData) ? bookData.map(toHomeBook) : []);
      setHomeCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (requestError) {
      setHomeError(requestError.message || 'Không thể kết nối tới máy chủ.');
      setHomeBooks([]);
      setHomeCategories([]);
    } finally {
      setIsHomeLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const categoryNames = useMemo(
    () => [ALL_CATEGORIES, ...homeCategories.map((category) => category.name).filter(Boolean)],
    [homeCategories],
  );

  // Cộng toàn bộ số lượng từng dòng hàng để hiển thị tổng sách trong giỏ.
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    // Lọc sách theo danh mục và từ khóa, sau đó sắp xếp theo lựa chọn của người dùng.
    const filteredBooks = homeBooks.filter((book) => {
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
  }, [homeBooks, query, selectedCategory, sortBy]);

  // Ghép bookId trong giỏ với dữ liệu sách đầy đủ để OrderPanel có đủ thông tin hiển thị.
  const detailedCartItems = cartItems
    .map((item) => {
      const book = homeBooks.find((currentBook) => currentBook.id === item.bookId);
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

          const book = homeBooks.find((currentBook) => currentBook.id === bookId);
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
        categories={categoryNames}
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
          isLoading={isHomeLoading}
          error={homeError}
          onRetry={loadHomeData}
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
      <AdminList
        key={adminListVersion}
        token={adminToken}
        onEdit={(admin) => {
          setSelectedAdmin(admin);
          handleNavigate('edit-admin');
        }}
      />
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

  const renderCustomerPage = () => (
    <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p>
      <h1>Quản lý khách hàng</h1>
      <p>Theo dõi, thêm mới và cập nhật thông tin khách hàng.</p>
      <CustomerManagement
        onEdit={(customer) => {
          setSelectedCustomer(customer);
          handleNavigate('edit-customer');
        }}
      />
    </section>
  );

  const renderEditAdminPage = () => {
    if (!selectedAdmin) {
      handleNavigate('admin');
      return null;
    }

    return (
      <section className="page-heading">
        <p className="eyebrow">Quản trị</p>
        <h1>Sửa Admin</h1>
        <EditAdminForm
          admin={selectedAdmin}
          token={adminToken}
          onSaved={() => {
            setAdminListVersion((version) => version + 1);
            handleNavigate('admin');
          }}
          onCancel={() => handleNavigate('admin')}
        />
      </section>
    );
  };

  const renderEditCustomerPage = () => {
    if (!selectedCustomer) {
      handleNavigate('customers');
      return null;
    }

    return (
      <section className="page-heading customer-page">
        <p className="eyebrow">Quản trị</p>
        <h1>Sửa khách hàng</h1>
        <EditCustomerForm
          customer={selectedCustomer}
          onSaved={() => handleNavigate('customers')}
          onCancel={() => handleNavigate('customers')}
        />
      </section>
    );
  };

  const renderPaymentMethodsPage = () => (
    <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p>
      <h1>Quản lý phương thức thanh toán</h1>
      <p>Thêm, cập nhật hoặc xóa các phương thức thanh toán sử dụng khi tạo đơn hàng.</p>
      <PaymentMethodManagement
        onEdit={(paymentMethod) => {
          setSelectedPaymentMethod(paymentMethod);
          handleNavigate('edit-payment-method');
        }}
      />
    </section>
  );

  const renderEditPaymentMethodPage = () => {
    if (!selectedPaymentMethod) {
      handleNavigate('payment-methods');
      return null;
    }

    return (
      <section className="page-heading customer-page">
        <p className="eyebrow">Quản trị</p>
        <h1>Sửa phương thức thanh toán</h1>
        <EditPaymentMethodForm
          paymentMethod={selectedPaymentMethod}
          onSaved={() => handleNavigate('payment-methods')}
          onCancel={() => handleNavigate('payment-methods')}
        />
      </section>
    );
  };

  const renderPublishersPage = () => (
    <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p>
      <h1>Quản lý nhà xuất bản</h1>
      <p>Theo dõi và cập nhật thông tin các nhà xuất bản sách.</p>
      <PublisherManagement onEdit={(publisher) => { setSelectedPublisher(publisher); handleNavigate('edit-publisher'); }} />
    </section>
  );

  const renderEditPublisherPage = () => {
    if (!selectedPublisher) {
      handleNavigate('publishers');
      return null;
    }
    return <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p><h1>Sửa nhà xuất bản</h1>
      <EditPublisherForm publisher={selectedPublisher} onSaved={() => handleNavigate('publishers')} onCancel={() => handleNavigate('publishers')} />
    </section>;
  };

  const renderAuthorsPage = () => (
    <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p>
      <h1>Quản lý tác giả</h1>
      <p>Thêm, cập nhật hoặc xóa các tác giả hiển thị cùng sách.</p>
      <AuthorManagement onEdit={(author) => { setSelectedAuthor(author); handleNavigate('edit-author'); }} />
    </section>
  );

  const renderEditAuthorPage = () => {
    if (!selectedAuthor) {
      handleNavigate('authors');
      return null;
    }
    return <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p><h1>Sửa tác giả</h1>
      <EditAuthorForm author={selectedAuthor} onSaved={() => handleNavigate('authors')} onCancel={() => handleNavigate('authors')} />
    </section>;
  };

  const renderCategoriesPage = () => (
    <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p>
      <h1>Quản lý danh mục</h1>
      <p>Thêm, cập nhật hoặc xóa các danh mục dùng để phân loại sách.</p>
      <CategoryManagement onEdit={(category) => { setSelectedCategoryForEdit(category); handleNavigate('edit-category'); }} />
    </section>
  );

  const renderEditCategoryPage = () => {
    if (!selectedCategoryForEdit) {
      handleNavigate('categories');
      return null;
    }
    return <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p><h1>Sửa danh mục</h1>
      <EditCategoryForm category={selectedCategoryForEdit} onSaved={() => handleNavigate('categories')} onCancel={() => handleNavigate('categories')} />
    </section>;
  };

  const renderBooksPage = () => (
    <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p>
      <h1>Quản lý sách</h1>
      <p>Quản lý thông tin sách, tồn kho, giá bán và các đơn vị liên quan.</p>
      <BookManagement onEdit={(book) => { setSelectedBook(book); handleNavigate('edit-book'); }} />
    </section>
  );

  const renderEditBookPage = () => {
    if (!selectedBook) {
      handleNavigate('books');
      return null;
    }
    return <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p><h1>Sửa sách</h1>
      <EditBookForm book={selectedBook} onSaved={() => handleNavigate('books')} onCancel={() => handleNavigate('books')} />
    </section>;
  };

  const renderOrdersPage = () => (
    <section className="page-heading customer-page">
      <p className="eyebrow">Quản trị</p>
      <h1>Quản lý đơn hàng</h1>
      <p>Theo dõi, tạo mới, cập nhật và xem chi tiết từng đơn hàng.</p>
      <OrderManagement
        onEdit={(order) => { setSelectedOrder(order); handleNavigate('edit-order'); }}
        onViewDetail={(order) => { setSelectedOrder(order); handleNavigate('order-detail'); }}
      />
    </section>
  );

  const renderEditOrderPage = () => {
    if (!selectedOrder) { handleNavigate('orders'); return null; }
    return <section className="page-heading customer-page"><p className="eyebrow">Quản trị</p><h1>Sửa đơn hàng</h1><EditOrderForm order={selectedOrder} onSaved={() => handleNavigate('orders')} onCancel={() => handleNavigate('orders')} /></section>;
  };

  const renderOrderDetailPage = () => {
    if (!selectedOrder) { handleNavigate('orders'); return null; }
    return <section className="page-heading customer-page"><p className="eyebrow">Quản trị</p><h1>Chi tiết đơn hàng</h1><OrderDetailView orderId={selectedOrder.id} onBack={() => handleNavigate('orders')} /></section>;
  };

  const renderAdminArea = () => {
    if (!adminToken) {
      return <AdminLoginForm onLogin={handleAdminLogin} />;
    }

    if (page === 'add-admin') return renderAddAdminPage();
    if (page === 'customers') return renderCustomerPage();
    if (page === 'edit-admin') return renderEditAdminPage();
    if (page === 'edit-customer') return renderEditCustomerPage();
    if (page === 'payment-methods') return renderPaymentMethodsPage();
    if (page === 'edit-payment-method') return renderEditPaymentMethodPage();
    if (page === 'publishers') return renderPublishersPage();
    if (page === 'edit-publisher') return renderEditPublisherPage();
    if (page === 'authors') return renderAuthorsPage();
    if (page === 'edit-author') return renderEditAuthorPage();
    if (page === 'categories') return renderCategoriesPage();
    if (page === 'edit-category') return renderEditCategoryPage();
    if (page === 'books') return renderBooksPage();
    if (page === 'edit-book') return renderEditBookPage();
    if (page === 'orders') return renderOrdersPage();
    if (page === 'edit-order') return renderEditOrderPage();
    if (page === 'order-detail') return renderOrderDetailPage();
    return renderAdminPage();
  };

  return (
    <div className="bookstore">
      <Header
        cartCount={cartCount}
        currentPage={page}
        onNavigate={handleNavigate}
        isAdminLoggedIn={Boolean(adminToken)}
        onAdminLogout={handleAdminLogout}
      />

      <main>
        {(page === 'add-admin' || page === 'admin' || page === 'admin-login' || page === 'customers' || page === 'edit-admin' || page === 'edit-customer' || page === 'payment-methods' || page === 'edit-payment-method' || page === 'publishers' || page === 'edit-publisher' || page === 'authors' || page === 'edit-author' || page === 'categories' || page === 'edit-category' || page === 'books' || page === 'edit-book' || page === 'orders' || page === 'edit-order' || page === 'order-detail') && renderAdminArea()}
        {page === 'cart' && renderCartPage()}
        {page === 'success' && renderSuccessPage()}
        {page === 'home' && renderHomePage()}
      </main>
    </div>
  );
}



export default App;
