import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const isDark = user?.theme === 'dark';
    const [name, setName] = useState(user?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(
        user?.avatar ? `/storage/${user.avatar}` : null
    );
    const [passwordForm, setPasswordForm] = useState({
        current_password: '', password: '', password_confirmation: '',
    });
    const [preferences, setPreferences] = useState({
        theme: user?.theme || 'light',
        font_size: user?.font_size || 'medium',
        note_color: user?.note_color || '#ffffff',
    });
    const [msgProfile, setMsgProfile] = useState('');
    const [msgPassword, setMsgPassword] = useState('');
    const [msgPrefs, setMsgPrefs] = useState('');
    const [errPassword, setErrPassword] = useState('');
    const fileRef = useRef();

    const updateProfile = async () => {
        try {
            const res = await axios.put('/api/profile', { name });
            updateUser(res.data);
            setMsgProfile('Cập nhật thành công!');
            setTimeout(() => setMsgProfile(''), 3000);
        } catch (err) { console.error(err); }
    };

    const updateAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const res = await axios.post('/api/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAvatarUrl(res.data.avatar_url);
        } catch (err) { console.error(err); }
    };

    const changePassword = async () => {
        setErrPassword(''); setMsgPassword('');
        try {
            await axios.post('/api/profile/change-password', passwordForm);
            setMsgPassword('Đổi mật khẩu thành công!');
            setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
            setTimeout(() => setMsgPassword(''), 3000);
        } catch (err) {
            setErrPassword(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const savePreferences = async () => {
        try {
            const res = await axios.put('/api/profile/preferences', preferences);
            updateUser(res.data);
            setMsgPrefs('Lưu thành công!');
            setTimeout(() => setMsgPrefs(''), 3000);
        } catch (err) { console.error(err); }
    };

    const inputClass = `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`;
    const cardClass = `rounded-xl shadow p-4 md:p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
            {/* Header */}
            <header className={`shadow px-4 md:px-6 py-3 md:py-4 flex justify-between items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h1 className="text-lg md:text-xl font-bold">Note App</h1>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/')}
                        className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        ← Về trang chủ
                    </button>
                    <button onClick={logout}
                        className="bg-red-500 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm hover:bg-red-600">
                        Đăng xuất
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-3 md:p-6 space-y-6">
                {/* Avatar + Tên */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg mb-4">👤 Thông tin cá nhân</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-blue-400 shrink-0"
                            onClick={() => fileRef.current.click()}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center text-2xl md:text-3xl ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <button onClick={() => fileRef.current.click()}
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600">
                                Đổi ảnh
                            </button>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG tối đa 2MB</p>
                        </div>
                        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={updateAvatar} />
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên hiển thị</label>
                            <input type="text" className={inputClass} value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="text" className={`${inputClass} opacity-60`} value={user?.email} disabled />
                        </div>
                        {msgProfile && <p className="text-green-500 text-sm">{msgProfile}</p>}
                        <button onClick={updateProfile} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Lưu thay đổi
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg mb-4">⚙️ Tùy chỉnh giao diện</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Giao diện</label>
                            <div className="flex gap-3">
                                <button onClick={() => setPreferences({...preferences, theme: 'light'})}
                                    className={`px-4 py-2 rounded-lg border text-sm ${preferences.theme === 'light' ? 'bg-blue-500 text-white border-blue-500' : isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                    ☀️ Sáng
                                </button>
                                <button onClick={() => setPreferences({...preferences, theme: 'dark'})}
                                    className={`px-4 py-2 rounded-lg border text-sm ${preferences.theme === 'dark' ? 'bg-blue-500 text-white border-blue-500' : isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                    🌙 Tối
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Cỡ chữ</label>
                            <div className="flex gap-3 flex-wrap">
                                {['small', 'medium', 'large'].map(size => (
                                    <button key={size} onClick={() => setPreferences({...preferences, font_size: size})}
                                        className={`px-4 py-2 rounded-lg border text-sm ${preferences.font_size === size ? 'bg-blue-500 text-white border-blue-500' : isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                        {size === 'small' ? 'Nhỏ' : size === 'medium' ? 'Vừa' : 'Lớn'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Màu note mặc định</label>
                            <div className="flex gap-3 flex-wrap">
                                {['#ffffff', '#fef9c3', '#dcfce7', '#dbeafe', '#fce7f3', '#f3e8ff'].map(color => (
                                    <button key={color} onClick={() => setPreferences({...preferences, note_color: color})}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform ${preferences.note_color === color ? 'border-blue-500 scale-110' : isDark ? 'border-gray-600' : 'border-gray-300'}`}
                                        style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        </div>

                        {msgPrefs && <p className="text-green-500 text-sm">{msgPrefs}</p>}
                        <button onClick={savePreferences} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Lưu tùy chỉnh
                        </button>
                    </div>
                </div>

                {/* Đổi mật khẩu */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg mb-4">🔑 Đổi mật khẩu</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
                            <input type="password" className={inputClass}
                                value={passwordForm.current_password}
                                onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
                            <input type="password" className={inputClass}
                                value={passwordForm.password}
                                onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
                            <input type="password" className={inputClass}
                                value={passwordForm.password_confirmation}
                                onChange={e => setPasswordForm({...passwordForm, password_confirmation: e.target.value})} />
                        </div>
                        {errPassword && <p className="text-red-500 text-sm">{errPassword}</p>}
                        {msgPassword && <p className="text-green-500 text-sm">{msgPassword}</p>}
                        <button onClick={changePassword} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Đổi mật khẩu
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}