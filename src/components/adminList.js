import React, { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AdminList = ({ token }) => {
    //State lưu admin được gửi về
    const [admin, setAdmin] = useState([]);
    //State quản lý trạng thái loading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //Gọi API ngay khi component được chạy lần đầu
    useEffect(() => {
        fetch(`${API_BASE_URL}/admins`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(response.status === 401 ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : 'Không thể tải danh sách admin.');
                }

                return response.json();
            })
            .then(data => {
                setAdmin(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi tải dữ liệu", error);
                setError(error.message);
                setLoading(false);
            })
    }, [token]);

    //Hiển thị chữ loading
    if(loading){
        return <p>Đang load data...</p>;
    }

    if (error) {
        return <p className="admin-list-error" role="alert">{error}</p>;
    }

    return (
        <div>
            <h3>Danh sách Admin</h3>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                    </tr>
                </thead>
                <tbody>
                    {admin.map(admin => (
                        <tr key={admin.id}>
                            <td>{admin.id}</td>
                            <td>{admin.fullName}</td>
                            <td>{admin.email}</td>
                            <td>{admin.phone}</td>
                        </tr>
                    ))}
                    {admin.length === 0 && (
                        <tr>
                            <td colSpan="4">Chưa có tài khoản admin nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AdminList;
