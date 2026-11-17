import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const orderStatuses = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

const initialForm = (order) => ({
  orderDate: order?.orderDate || new Date().toISOString().slice(0, 10),
  status: order?.status || 'Chờ xác nhận',
  customerId: order?.customer?.id?.toString() || '',
  adminId: order?.admin?.id?.toString() || '',
  paymentMethodId: order?.paymentMethod?.id?.toString() || '',
});

function OrderForm({ order, customers, admins, paymentMethods, books, initialDetails = [], onSaved, onCancel, compact = false }) {
  const [form, setForm] = useState(() => initialForm(order));
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');
  const [lineItems, setLineItems] = useState(() => initialDetails.map((detail) => ({
    bookId: detail.book?.id,
    bookName: detail.book?.bookName || 'Sách không xác định',
    image: detail.book?.image || '',
    price: Number(detail.price ?? detail.book?.price ?? 0),
    quantity: Number(detail.quantity || 1),
  })).filter((item) => item.bookId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const totalAmount = lineItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const addBook = () => {
    const book = books.find((item) => Number(item.id) === Number(selectedBookId));
    const quantity = Number(selectedQuantity);
    if (!book || !Number.isInteger(quantity) || quantity < 1) return;

    setLineItems((currentItems) => {
      const existingItem = currentItems.find((item) => Number(item.bookId) === Number(book.id));
      if (existingItem) return currentItems.map((item) => Number(item.bookId) === Number(book.id) ? { ...item, quantity: item.quantity + quantity } : item);
      return [...currentItems, { bookId: book.id, bookName: book.bookName, image: book.image, price: Number(book.price || 0), quantity }];
    });
    setSelectedBookId('');
    setSelectedQuantity('1');
  };

  const updateItemQuantity = (bookId, quantity) => {
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) return;
    setLineItems((currentItems) => currentItems.map((item) => Number(item.bookId) === Number(bookId) ? { ...item, quantity: parsedQuantity } : item));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!lineItems.length) {
      setError('Vui lòng chọn ít nhất một sản phẩm cho đơn hàng.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      orderDate: form.orderDate,
      totalAmount,
      status: form.status,
      customer: { id: Number(form.customerId) },
      admin: { id: Number(form.adminId) },
      paymentMethod: { id: Number(form.paymentMethodId) },
    };
    try {
      const response = await fetch(`${API_BASE_URL}/orders${order ? `/${order.id}` : '/create'}`, {
        method: order ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(order ? 'Cập nhật đơn hàng thất bại.' : 'Tạo đơn hàng thất bại.');
      const savedOrder = await response.json();
      const orderId = savedOrder.id || order?.id;

      if (order) {
        await Promise.all(initialDetails.map(async (detail) => {
          const detailResponse = await fetch(`${API_BASE_URL}/order-details/${detail.id}`, { method: 'DELETE' });
          if (!detailResponse.ok) throw new Error('Không thể cập nhật chi tiết đơn hàng.');
        }));
      }

      await Promise.all(lineItems.map(async (item) => {
        const detailResponse = await fetch(`${API_BASE_URL}/order-details/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: item.quantity, price: item.price, book: { id: item.bookId }, order: { id: orderId } }),
        });
        if (!detailResponse.ok) throw new Error('Không thể lưu chi tiết đơn hàng.');
      }));
      onSaved();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu đơn hàng.');
    } finally {
      setSaving(false);
    }
  };

  return <form className={`customer-form${compact ? '' : ' customer-edit-page-form'}`} onSubmit={submit}>
    <div className="admin-form-heading"><div><h2>{order ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng mới'}</h2><p>Chọn khách hàng, quản trị viên và phương thức thanh toán.</p></div>{compact && <button className="icon-button" type="button" onClick={onCancel} aria-label="Đóng biểu mẫu">×</button>}</div>
    <div className="customer-fields order-fields">
      <label>Ngày đặt<input type="date" value={form.orderDate} onChange={(event) => updateField('orderDate', event.target.value)} required /></label>
      <label>Tổng tiền (VNĐ)<input value={totalAmount.toLocaleString('vi-VN')} readOnly aria-label="Tổng tiền tự động tính từ sản phẩm" /></label>
      <label>Trạng thái<select value={form.status} onChange={(event) => updateField('status', event.target.value)} required>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      <label>Khách hàng<select value={form.customerId} onChange={(event) => updateField('customerId', event.target.value)} required><option value="">Chọn khách hàng</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName || customer.email} (#{customer.id})</option>)}</select></label>
      <label>Quản trị viên<select value={form.adminId} onChange={(event) => updateField('adminId', event.target.value)} required><option value="">Chọn quản trị viên</option>{admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.fullName || admin.email} (#{admin.id})</option>)}</select></label>
      <label>Phương thức thanh toán<select value={form.paymentMethodId} onChange={(event) => updateField('paymentMethodId', event.target.value)} required><option value="">Chọn phương thức</option>{paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}</select></label>
    </div>
    <section className="order-product-picker" aria-label="Sản phẩm trong đơn hàng">
      <div><h3>Sản phẩm trong đơn hàng</h3><p>Chọn sách và số lượng; tổng tiền được tính tự động.</p></div>
      <div className="order-product-controls"><select value={selectedBookId} onChange={(event) => setSelectedBookId(event.target.value)}><option value="">Chọn sản phẩm</option>{books.map((book) => <option key={book.id} value={book.id}>{book.bookName} — {Number(book.price || 0).toLocaleString('vi-VN')} ₫</option>)}</select><input type="number" min="1" value={selectedQuantity} onChange={(event) => setSelectedQuantity(event.target.value)} aria-label="Số lượng sản phẩm" /><button className="secondary-button" type="button" onClick={addBook} disabled={!selectedBookId}>Thêm sản phẩm</button></div>
      <div className="order-product-list">
        {lineItems.map((item) => <div className="order-product-item" key={item.bookId}>{item.image && <img src={item.image} alt="" />}<div><strong>{item.bookName}</strong><span>{item.price.toLocaleString('vi-VN')} ₫ / cuốn</span></div><label>Số lượng<input type="number" min="1" value={item.quantity} onChange={(event) => updateItemQuantity(item.bookId, event.target.value)} /></label><div className="order-item-total"><span>Thành tiền</span><strong>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</strong></div><button className="icon-button" type="button" onClick={() => setLineItems((currentItems) => currentItems.filter((currentItem) => currentItem.bookId !== item.bookId))} aria-label={`Xóa ${item.bookName}`}>×</button></div>)}
        {!lineItems.length && <p className="order-product-empty">Chưa có sản phẩm. Hãy chọn sách ở phía trên.</p>}
      </div>
    </section>
    {error && <p className="admin-list-error" role="alert">{error}</p>}
    <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={onCancel}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang lưu…' : order ? 'Lưu thay đổi' : 'Tạo đơn hàng'}</button></div>
  </form>;
}

export default OrderForm;
