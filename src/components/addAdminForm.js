import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AddAdminForm = ({ onAdded, token }) => {
    //Biến nhận dữ liệu từ form
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        //Kiểm tra đã nhập hay chưa 
        if ([fullName, email, phone, password].some((value) => !value.trim())) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        //Tạo biến mới để lưu
        const newAdmin = {
            fullName: fullName,
            email: email,
            phone: phone,
            password: password
        };

        //Gọi API lưu
        fetch(`${API_BASE_URL}/admins/create`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newAdmin)
        })
            .then(respone => {
                if (respone.ok) {
                    alert("Thêm admin thành công");
                    setFullName('');
                    setEmail('');
                    setPhone('');
                    setPassword('');
                    onAdded?.();
                } else {
                    alert("Thêm admin thất bại");
                }
            })
            .catch(error => {
                console.error("Lỗi", error);
                alert("Thêm admin thất bại");
            })
    }

    return <div className="admin-form">
        <form onSubmit={handleSubmit}>
            Họ tên: <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            Số điện thoại: <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            Mật khẩu: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">
                Thêm Admin
            </button>
        </form>
    </div>
}

export default AddAdminForm;
