import { useCallback, useEffect, useState } from 'react';
import OrderForm from './OrderForm';
import { formatOrderDate } from '../utils/formatDate';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' ₫';

function OrderManagement({ onEdit, onViewDetail }) {
  const [orders, setOrders] = useState([]);
  const [references, setReferences] = useState({ customers: [], admins: [], paymentMethods: [], books: [] });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersResponse, customersResponse, adminsResponse, paymentMethodsResponse, booksResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/orders`), fetch(`${API_BASE_URL}/customers`), fetch(`${API_BASE_URL}/admins`), fetch(`${API_BASE_URL}/payment-methods`), fetch(`${API_BASE_URL}/books`),
      ]);
      if (![ordersResponse, customersResponse, adminsResponse, paymentMethodsResponse, booksResponse].every((response) => response.ok)) throw new Error('Không thể tải dữ liệu đơn hàng.');
      const [ordersData, customers, admins, paymentMethods, books] = await Promise.all([ordersResponse.json(), customersResponse.json(), adminsResponse.json(), paymentMethodsResponse.json(), booksResponse.json()]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setReferences({ customers: Array.isArray(customers) ? customers : [], admins: Array.isArray(admins) ? admins : [], paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [], books: Array.isArray(books) ? books : [] });
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteOrder = async (order) => {
    if (!window.confirm(`Xóa đơn hàng #${order.id}?`)) return;
    setRemovingId(order.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${order.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Xóa đơn hàng thất bại.');
      setOrders((currentOrders) => currentOrders.filter((item) => item.id !== order.id));
    } catch (requestError) {
      setError(requestError.message || 'Xóa đơn hàng thất bại.');
    } finally {
      setRemovingId(null);
    }
  };

  return <section className="customer-directory" aria-label="Quản lý đơn hàng">
    <div className="customer-directory-header"><div><p className="eyebrow">Bán hàng</p><h2>Đơn hàng</h2><span>{orders.length} đơn hàng trong hệ thống</span></div><div className="customer-header-actions"><button className="primary-button" type="button" onClick={() => { setError(''); setIsFormOpen(true); }}>Tạo đơn hàng</button></div></div>
    {error && <p className="admin-list-error" role="alert">{error}</p>}
    {isFormOpen && <OrderForm compact {...references} onCancel={() => setIsFormOpen(false)} onSaved={async () => { setIsFormOpen(false); await loadData(); }} />}
    {loading ? <p className="admin-loading">Đang tải danh sách đơn hàng…</p> : <div className="customer-table-wrap"><table className="customer-table order-management-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th className="admin-table-actions">Thao tác</th></tr></thead><tbody>
      {orders.map((order) => <tr key={order.id}><td><button className="order-id-button" type="button" onClick={() => onViewDetail(order)}>#{order.id}</button></td><td><strong>{order.customer?.fullName || order.customer?.email || '—'}</strong></td><td>{formatOrderDate(order.orderDate)}</td><td>{formatCurrency(order.totalAmount)}</td><td>{order.paymentMethod?.name || '—'}</td><td><span className="order-status">{order.status || 'Chưa cập nhật'}</span></td><td className="admin-table-actions"><button className="table-action view" type="button" onClick={() => onViewDetail(order)}>Chi tiết</button><button className="table-action edit" type="button" onClick={() => onEdit(order)}>Sửa</button><button className="table-action delete" type="button" onClick={() => deleteOrder(order)} disabled={removingId === order.id}>{removingId === order.id ? 'Đang xóa…' : 'Xóa'}</button></td></tr>)}
      {!orders.length && <tr><td colSpan="7" className="admin-empty">Chưa có đơn hàng nào.</td></tr>}
    </tbody></table></div>}
  </section>;
}

export default OrderManagement;
