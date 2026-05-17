import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Trash2, Share2, Mail, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ShareModal({ note, onClose }) {
    const { user } = useAuth();
    const isDark = user?.theme === 'dark';
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('read');
    const [shares, setShares] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchShares(); }, []);

    const fetchShares = async () => {
        const res = await axios.get(`/api/notes/${note.id}/shares`);
        setShares(res.data);
    };

    const handleShare = async () => {
        setError(''); setSuccess(''); setLoading(true);
        try {
            await axios.post(`/api/notes/${note.id}/share`, { email, permission });
            setSuccess('Chia sẻ thành công!');
            setEmail('');
            fetchShares();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setLoading(false); }
    };

    const handleRevoke = async (shareId) => {
        if (!window.confirm('Thu hồi quyền truy cập?')) return;
        await axios.delete(`/api/shares/${shareId}`);
        fetchShares();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className={`rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden
                ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <div className={`flex justify-between items-center px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                        <Share2 size={16} className="text-indigo-500" />
                        <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Chia sẻ note</h2>
                    </div>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                        <X size={15} />
                    </button>
                </div>

                <div className="p-5">
                    <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="font-semibold">{note.title}</span>
                    </p>

                    {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-2.5 rounded-xl mb-3">{error}</div>}
                    {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs px-3 py-2.5 rounded-xl mb-3">✓ {success}</div>}

                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 relative">
                            <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input type="email" placeholder="Email người nhận..."
                                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
                                    ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'border-slate-200 placeholder-slate-400'}`}
                                value={email} onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && email && handleShare()} />
                        </div>
                        <div className="relative">
                            <select className={`appearance-none pl-3 pr-8 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition cursor-pointer
                                    ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                                value={permission} onChange={e => setPermission(e.target.value)}>
                                <option value="read">Chỉ đọc</option>
                                <option value="edit">Chỉnh sửa</option>
                            </select>
                            <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                        </div>
                    </div>
                    <button onClick={handleShare} disabled={loading || !email}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 mb-5">
                        {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang chia sẻ...</> : <><Share2 size={13} />Chia sẻ</>}
                    </button>

                    {shares.length > 0 && (
                        <div>
                            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Đã chia sẻ với {shares.length} người
                            </p>
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {shares.map(share => (
                                    <li key={share.id} className={`flex items-center justify-between p-3 rounded-xl border
                                        ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-indigo-600 font-semibold text-xs">
                                                    {share.name?.charAt(0)?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{share.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{share.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                                ${share.permission === 'edit' ? 'bg-emerald-100 text-emerald-600' : isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                                {share.permission === 'edit' ? 'Sửa' : 'Đọc'}
                                            </span>
                                            <button onClick={() => handleRevoke(share.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
