import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

// Đưa Field ra ngoài để tránh re-render mất focus
const Field = ({ label, icon: Icon, type = 'text', placeholder, showToggle, showPass, onToggle, value, onChange }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
        <div className="relative">
            <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type={showToggle ? (showPass ? 'text' : 'password') : type}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white transition"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />
            {showToggle && (
                <button type="button" onClick={onToggle}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            )}
        </div>
    </div>
);

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false); 

    const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        if (form.password !== form.password_confirmation) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false); return;
        }
        try {
            await register(form.name, form.email, form.password, form.password_confirmation);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-indigo-300 blur-3xl" />
                </div>
                <div className="relative flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className="text-white font-bold text-xl">NoteApp</span>
                </div>
                <div className="relative">
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">Bắt đầu<br />ngay hôm nay</h2>
                    <p className="text-indigo-200 text-base">Miễn phí. Không giới hạn. Bảo mật tuyệt đối.</p>
                </div>
                <p className="relative text-indigo-300 text-sm">© 2026 NoteApp</p>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">N</span>
                        </div>
                        <span className="text-slate-800 font-bold text-lg">NoteApp</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Tạo tài khoản</h1>
                    <p className="text-slate-400 text-sm mb-8">Điền thông tin để bắt đầu</p>

                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field
                            label="Tên hiển thị" icon={User}
                            placeholder="Nguyễn Văn A"
                            value={form.name} onChange={handleChange('name')}
                        />
                        <Field
                            label="Email" icon={Mail} type="email"
                            placeholder="email@example.com"
                            value={form.email} onChange={handleChange('email')}
                        />
                        <Field
                            label="Mật khẩu" icon={Lock}
                            placeholder="Tối thiểu 8 ký tự"
                            showToggle showPass={showPass} onToggle={() => setShowPass(!showPass)}
                            value={form.password} onChange={handleChange('password')}
                        />
                       <Field
    label="Xác nhận mật khẩu" icon={Lock}
    placeholder="Nhập lại mật khẩu"
    showToggle showPass={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
    value={form.password_confirmation} onChange={handleChange('password_confirmation')}
/>

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm disabled:opacity-60 mt-2">
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo tài khoản...</>
                            ) : (
                                <>Đăng ký<ArrowRight size={15} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-indigo-500 hover:text-indigo-700 font-semibold">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
