import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Labels({ onClose }) {
    const { user } = useAuth();
    const isDark = user?.theme === 'dark';
    const [labels, setLabels] = useState([]);
    const [newLabel, setNewLabel] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => { fetchLabels(); }, []);

    const fetchLabels = async () => {
        const res = await axios.get('/api/labels');
        setLabels(res.data);
    };

    const addLabel = async () => {
        if (!newLabel.trim()) return;
        await axios.post('/api/labels', { name: newLabel });
        setNewLabel('');
        fetchLabels();
    };

    const startEdit = (label) => {
        setEditingId(label.id);
        setEditingName(label.name);
    };

    const saveEdit = async (id) => {
        await axios.put(`/api/labels/${id}`, { name: editingName });
        setEditingId(null);
        fetchLabels();
    };

    const deleteLabel = async (id) => {
        if (!window.confirm('Xóa label này?')) return;
        await axios.delete(`/api/labels/${id}`);
        fetchLabels();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
            <div className={`rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-4 md:p-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Quản lý Labels</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Tên label mới..."
                        className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                        value={newLabel} onChange={e => setNewLabel(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addLabel()} />
                    <button onClick={addLabel} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
                        Thêm
                    </button>
                </div>

                <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {labels.length === 0 && (
                        <p className="text-center text-gray-400 text-sm">Chưa có label nào</p>
                    )}
                    {labels.map(label => (
                        <li key={label.id} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                            {editingId === label.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input className={`flex-1 border rounded px-2 py-1 text-sm focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        value={editingName} onChange={e => setEditingName(e.target.value)} autoFocus />
                                    <button onClick={() => saveEdit(label.id)} className="text-green-500 hover:text-green-700"><Check size={16} /></button>
                                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm">🏷️ {label.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(label)} className="text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                                        <button onClick={() => deleteLabel(label.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}