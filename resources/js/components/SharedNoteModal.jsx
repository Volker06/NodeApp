import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SharedNoteModal({ shareId, onClose }) {
    const { user } = useAuth();
    const isDark = user?.theme === 'dark';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', content: '' });
    const saveTimer = useRef(null);

    useEffect(() => { fetchNote(); }, []);

    useEffect(() => {
        if (!data || data.permission !== 'edit') return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => saveNote(), 1000);
        return () => clearTimeout(saveTimer.current);
    }, [form]);

    const fetchNote = async () => {
        try {
            const res = await axios.get(`/api/shares/${shareId}/view`);
            setData(res.data);
            setForm({ title: res.data.note.title, content: res.data.note.content || '' });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const saveNote = async () => {
        setSaving(true);
        try { await axios.put(`/api/shares/${shareId}/update`, form); }
        catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className={`rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-lg p-4 md:p-6 max-h-[85vh] overflow-y-auto ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">📄 Note được chia sẻ</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <div className="text-xs text-gray-400 mb-4 flex gap-3">
                            <span>👤 {data.owner_name}</span>
                            <span>•</span>
                            <span className={data.permission === 'edit' ? 'text-green-500' : 'text-gray-400'}>
                                {data.permission === 'edit' ? '✏️ Có thể chỉnh sửa' : '👁️ Chỉ đọc'}
                            </span>
                        </div>

                        {data.permission === 'edit' ? (
                            <>
                                <input type="text"
                                    className={`w-full text-lg font-bold border-b pb-2 mb-2 focus:outline-none ${isDark ? 'bg-gray-800 text-white border-gray-600' : ''}`}
                                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                                <textarea
                                    className={`w-full h-48 focus:outline-none resize-none ${isDark ? 'bg-gray-800 text-white' : ''}`}
                                    value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
                                <p className="text-xs text-gray-400 mt-2">
                                    {saving ? '💾 Đang lưu...' : '✅ Tự động lưu'}
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="font-bold text-xl mb-3">{data.note.title}</h3>
                                <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{data.note.content}</p>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}