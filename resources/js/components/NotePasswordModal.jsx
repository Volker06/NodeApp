import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotePasswordModal({ note, mode, onClose, onSuccess }) {
    const { user } = useAuth();
    const isDark = user?.theme === 'dark';
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const passwordRef = useRef(null);

    // Chỉ focus 1 lần khi modal mở, không re-focus khi gõ
    useEffect(() => {
        const timer = setTimeout(() => {
            passwordRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async () => {
        setError(''); setLoading(true);
        try {
            if (mode === 'verify') {
                await axios.post(`/api/notes/${note.id}/verify-password`, { password });
                onSuccess();
            } else if (mode === 'set') {
                if (password !== passwordConfirm) {
                    setError('Mật khẩu xác nhận không khớp');
                    setLoading(false); return;
                }
                await axios.post(`/api/notes/${note.id}/set-password`, { password, password_confirmation: passwordConfirm });
                onSuccess();
            } else if (mode === 'remove') {
                await axios.post(`/api/notes/${note.id}/remove-password`, { password });
                onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setLoading(false); }
    };

    const config = {
        verify: { title: 'Xác minh mật khẩu', icon: '🔒', btn: 'Mở khóa', color: 'bg-indigo-500 hover:bg-indigo-600' },
        set: { title: note?.password ? 'Đổi mật khẩu' : 'Đặt mật khẩu', icon: '🔑', btn: 'Xác nhận', color: 'bg-indigo-500 hover:bg-indigo-600' },
        remove: { title: 'Tắt mật khẩu', icon: '🔓', btn: 'Tắt khóa', color: 'bg-rose-500 hover:bg-rose-600' },
    }[mode];

    const inputClass = `w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
        ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'border-slate-200 placeholder-slate-300'}`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className={`rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden
                ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <div className={`flex justify-between items-center px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{config.title}</h2>
                    </div>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                        <X size={15} />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-2.5 rounded-xl">{error}</div>
                    )}

                    {/* Ô mật khẩu */}
                    <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {mode === 'set' && note?.password ? 'Mật khẩu mới' : 'Mật khẩu'}
                        </label>
                        <div className="relative">
                            <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                ref={passwordRef}
                                type={showPass ? 'text' : 'password'}
                                className={inputClass}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />
                            <button
                                type="button"
                                onMouseDown={e => e.preventDefault()} // ngăn mất focus khi click
                                onClick={() => setShowPass(v => !v)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Ô xác nhận — chỉ hiện khi mode = set */}
                    {mode === 'set' && (
                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    className={inputClass}
                                    value={passwordConfirm}
                                    onChange={e => setPasswordConfirm(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                />
                                <button
                                    type="button"
                                    onMouseDown={e => e.preventDefault()} // ngăn mất focus khi click
                                    onClick={() => setShowConfirm(v => !v)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button onClick={onClose}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition
                                ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            Hủy
                        </button>
                        <button onClick={handleSubmit} disabled={loading || !password}
                            className={`flex-1 ${config.color} text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50`}>
                            {loading ? 'Đang xử lý...' : config.btn}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
