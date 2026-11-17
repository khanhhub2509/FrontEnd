import { useCallback, useEffect, useState } from 'react';
import { formatOrderDate } from '../utils/formatDate';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' ₫';

function OrderDetailView({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [orderResponse, detailsResponse] = await Promise.all([fetch(`${API_BASE_URL}/orders/${orderId}`), fetch(`${API_BASE_URL}/order-details`)]);
      if (!orderResponse.ok || !detailsResponse.ok) throw new Error('Không thể tải chi tiết đơn hàng.');
      const [orderData, detailsData] = await Promise.all([orderResponse.json(), detailsResponse.json()]);
      setOrder(orderData);
      const embeddedDetails = Array.isArray(orderData.orderDetails) ? orderData.orderDetails : [];
      const matchingDetails = Array.isArray(detailsData) ? detailsData.filter((detail) => Number(detail.order?.id) === Number(orderId)) : [];
      setDetails(embeddedDetails.length ? embeddedDetails : matchingDetails);
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối tới máy chủ.');
    } finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => { loadDetail(); }, [loadDetail]);
  if (loading) return <p className="admin-loading">Đang tải chi tiết đơn hàng…</p>;
  if (error) return <><p className="admin-list-error" role="alert">{error}</p><button className="secondary-button" type="button" onClick={onBack}>Quay lại đơn hàng</button></>;

  return <section className="order-detail-card">
    <div className="order-detail-heading"><div><p className="eyebrow">Đơn hàng #{order.id}</p><h2>Chi tiết đơn hàng</h2><span>{order.status || 'Chưa cập nhật'}</span></div><button className="secondary-button" type="button" onClick={onBack}>Quay lại danh sách</button></div>
    <div className="order-detail-summary"><div><small>Khách hàng</small><strong>{order.customer?.fullName || '—'}</strong><span>{order.customer?.email || ''}</span></div><div><small>Ngày đặt</small><strong>{formatOrderDate(order.orderDate)}</strong><span>{order.paymentMethod?.name || 'Chưa chọn thanh toán'}</span></div><div><small>Người xử lý</small><strong>{order.admin?.fullName || '—'}</strong><span>{order.admin?.email || ''}</span></div><div><small>Tổng thanh toán</small><strong>{formatCurrency(order.totalAmount)}</strong><span>{details.length} dòng sản phẩm</span></div></div>
    <div className="customer-table-wrap"><table className="customer-table order-detail-table"><thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr></thead><tbody>
      {details.map((detail) => <tr key={detail.id}><td><div className="book-management-title">{detail.book?.image && <img src={detail.book.image} alt="" />}<strong>{detail.book?.bookName || 'Sách không xác định'}</strong></div></td><td>{formatCurrency(detail.price)}</td><td>{detail.quantity || 0}</td><td><strong>{formatCurrency(Number(detail.price || 0) * Number(detail.quantity || 0))}</strong></td></tr>)}
      {!details.length && <tr><td colSpan="4" className="admin-empty">Đơn hàng này chưa có chi tiết sản phẩm.</td></tr>}
    </tbody></table></div>
  </section>;
}

export default OrderDetailView;
