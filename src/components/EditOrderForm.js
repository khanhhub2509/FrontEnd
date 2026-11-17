import { useCallback, useEffect, useState } from 'react';
import OrderForm from './OrderForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function EditOrderForm({ order, onSaved, onCancel }) {
  const [references, setReferences] = useState({ customers: [], admins: [], paymentMethods: [], books: [] });
  const [initialDetails, setInitialDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadReferences = useCallback(async () => {
    try {
      const [customersResponse, adminsResponse, paymentMethodsResponse, booksResponse, detailsResponse] = await Promise.all([fetch(`${API_BASE_URL}/customers`), fetch(`${API_BASE_URL}/admins`), fetch(`${API_BASE_URL}/payment-methods`), fetch(`${API_BASE_URL}/books`), fetch(`${API_BASE_URL}/order-details`)]);
      if (![customersResponse, adminsResponse, paymentMethodsResponse, booksResponse, detailsResponse].every((response) => response.ok)) throw new Error('Không thể tải dữ liệu đơn hàng.');
      const [customers, admins, paymentMethods, books, details] = await Promise.all([customersResponse.json(), adminsResponse.json(), paymentMethodsResponse.json(), booksResponse.json(), detailsResponse.json()]);
      setReferences({ customers: Array.isArray(customers) ? customers : [], admins: Array.isArray(admins) ? admins : [], paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [], books: Array.isArray(books) ? books : [] });
      setInitialDetails(Array.isArray(details) ? details.filter((detail) => Number(detail.order?.id) === Number(order.id)) : []);
    } catch (requestError) { setError(requestError.message || 'Không thể kết nối tới máy chủ.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadReferences(); }, [loadReferences]);
  if (loading) return <p className="admin-loading">Đang tải thông tin đơn hàng…</p>;
  if (error) return <><p className="admin-list-error" role="alert">{error}</p><button className="secondary-button" type="button" onClick={onCancel}>Quay lại</button></>;
  return <OrderForm order={order} {...references} initialDetails={initialDetails} onSaved={onSaved} onCancel={onCancel} />;
}

export default EditOrderForm;
