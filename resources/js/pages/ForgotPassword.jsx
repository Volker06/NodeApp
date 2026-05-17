import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setMsg('');
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('/api/forgot-password', { email });
            setMsg(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-2">Quên mật khẩu</h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Nhập email để nhận link đặt lại mật khẩu
                </p>

                {msg && <div className="bg-green-100 text-green-600 p-3 rounded mb-4 text-sm">{msg}</div>}
                {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !email}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi email'}
                    </button>
                </div>

                <p className="text-center text-sm mt-4">
                    <Link to="/login" className="text-blue-500 hover:underline">
                        ← Quay lại đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}