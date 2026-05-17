import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-indigo-300 blur-3xl" />
                </div>
                <div className="relative">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <span className="text-white font-bold text-xl">NoteApp</span>
                    </div>
                </div>
                <div className="relative">
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                        Ghi chú mọi<br />ý tưởng của bạn
                    </h2>
                    <p className="text-indigo-200 text-base leading-relaxed">
                        Tổ chức công việc, chia sẻ ý tưởng và bảo mật thông tin quan trọng một cách dễ dàng.
                    </p>
                </div>
                <p className="relative text-indigo-300 text-sm">© 2026 NoteApp</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">N</span>
                        </div>
                        <span className="text-slate-800 font-bold text-lg">NoteApp</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Chào mừng trở lại</h1>
                    <p className="text-slate-400 text-sm mb-8">Đăng nhập để tiếp tục</p>

                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="email"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white transition"
                                    placeholder="email@example.com"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mật khẩu</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type={showPass ? 'text' : 'password'}
                                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white transition"
                                    placeholder="••••••••"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm disabled:opacity-60 mt-2">
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang đăng nhập...</>
                            ) : (
                                <>Đăng nhập<ArrowRight size={15} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-indigo-500 hover:text-indigo-700 font-semibold">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
