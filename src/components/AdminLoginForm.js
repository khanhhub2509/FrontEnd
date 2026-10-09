import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function AdminLoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.token) {
        setError(typeof payload === 'string' ? payload : 'Email hoặc mật khẩu không chính xác.');
        return;
      }

      localStorage.setItem('adminToken', payload.token);
      onLogin(payload.token);
    } catch (requestError) {
      console.error('Không thể đăng nhập quản trị:', requestError);
      setError('Không thể kết nối tới máy chủ. Hãy kiểm tra backend đang chạy.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="admin-login" aria-labelledby="admin-login-title">
      <div className="admin-login-card">
        <p className="eyebrow">Khu vực bảo mật</p>
        <h1 id="admin-login-title">Đăng nhập quản trị</h1>
        <p>Đăng nhập bằng tài khoản admin để xem và quản lý danh sách quản trị viên.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="admin-password">Mật khẩu</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="admin-login-error" role="alert">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AdminLoginForm;
