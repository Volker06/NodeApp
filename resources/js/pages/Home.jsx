import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LayoutGrid, List, Pin, Lock, X, Menu, Upload, Search, Plus, Tag, Share2, Trash2, LogOut, User, ChevronRight, Bell } from 'lucide-react';
import Labels from './Labels';
import NotePasswordModal from '../components/NotePasswordModal';
import ShareModal from '../components/ShareModal';
import SharedNoteModal from '../components/SharedNoteModal';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { user, logout } = useAuth();
    const [notes, setNotes] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editNote, setEditNote] = useState(null);
    const [form, setForm] = useState({ title: '', content: '' });
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [search, setSearch] = useState('');
    const [showLabels, setShowLabels] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [noteLabels, setNoteLabels] = useState([]);
    const [passwordModal, setPasswordModal] = useState(null);
    const [shareModal, setShareModal] = useState(null);
    const [showSharedWithMe, setShowSharedWithMe] = useState(false);
    const [sharedWithMe, setSharedWithMe] = useState([]);
    const [viewingShare, setViewingShare] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [verifyMsg, setVerifyMsg] = useState('');
    const saveTimer = useRef(null);
    const isRemoteUpdate = useRef(false);
    const navigate = useNavigate();

    useEffect(() => { fetchNotes(); fetchLabels(); }, []);
    useEffect(() => {
    if (!editNote) return;

    const channel = window.Echo.join(`note.${editNote.id}`)
        .here((users) => {
            console.log('Đang online:', users);
        })
        .joining((user) => {
            console.log(user.name, 'vừa vào');
        })
        .leaving((user) => {
            console.log(user.name, 'vừa ra');
        })
        .listen('.note.updated', (e) => {
    if (e.editor_id !== user?.id) {
        isRemoteUpdate.current = true;
        setForm({ title: e.title, content: e.content });
    }
});

    return () => {
        window.Echo.leave(`note.${editNote.id}`);
    };
}, [editNote?.id]);

    

useEffect(() => {
    if (!showForm || !form.title) return;
    if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(), 1000);
    return () => clearTimeout(saveTimer.current);
}, [form]);

    const fetchNotes = async () => {
        try {
            const res = await axios.get('/api/notes');
            setNotes(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchLabels = async () => {
        const res = await axios.get('/api/labels');
        setLabels(res.data);
    };

    const fetchSharedWithMe = async () => {
        const res = await axios.get('/api/shared-with-me');
        setSharedWithMe(res.data);
    };

    const saveNote = async () => {
        if (!form.title) return;
        setSaving(true);
        try {
            if (editNote) {
                await axios.put(`/api/notes/${editNote.id}`, form);
            } else {
                const res = await axios.post('/api/notes', form);
                setEditNote(res.data);
            }
            fetchNotes();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const togglePin = async (note, e) => {
        e.stopPropagation();
        await axios.put(`/api/notes/${note.id}`, {
            title: note.title, content: note.content,
            is_pinned: !note.is_pinned,
            pinned_at: !note.is_pinned ? new Date().toISOString() : null,
        });
        fetchNotes();
    };

    const openCreate = () => {
        setEditNote(null); setForm({ title: '', content: '' }); setNoteLabels([]); setShowForm(true);
    };

    const openEdit = (note) => {
        if (note.password) {
            setPasswordModal({ note, mode: 'verify' });
            return;
        }
        setEditNote(note);
        setForm({ title: note.title, content: note.content || '' });
        setNoteLabels(note.labels ? note.labels.map(l => l.id) : []);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false); setEditNote(null); setForm({ title: '', content: '' }); setNoteLabels([]);
    };

    // BUG FIX: note có password -> phải verify trước khi xóa
    const deleteNote = async (note, e) => {
        e.stopPropagation();
        if (note.password) {
            setPasswordModal({ note, mode: 'verify', afterVerify: () => confirmDelete(note.id) });
            return;
        }
        confirmDelete(note.id);
    };

    const confirmDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa note này không?')) return;
        await axios.delete(`/api/notes/${id}`);
        fetchNotes();
    };

    // BUG FIX: note có password -> phải verify trước khi share
    const openShare = (note, e) => {
        e.stopPropagation();
        if (note.password) {
            setPasswordModal({ note, mode: 'verify', afterVerify: () => setShareModal(note) });
            return;
        }
        setShareModal(note);
    };

    const toggleNoteLabel = async (labelId) => {
        if (!editNote) return;
        const updated = noteLabels.includes(labelId)
            ? noteLabels.filter(id => id !== labelId)
            : [...noteLabels, labelId];
        setNoteLabels(updated);
        await axios.post(`/api/notes/${editNote.id}/labels`, { label_ids: updated });
        fetchNotes();
    };

    const uploadImage = async (e) => {
        const files = Array.from(e.target.files);
        setUploadingImage(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                await axios.post(`/api/notes/${editNote.id}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchNotes();
            const res = await axios.get('/api/notes');
            const updated = res.data.find(n => n.id === editNote.id);
            if (updated) setEditNote(updated);
        } finally { setUploadingImage(false); }
    };

    const sendVerifyEmail = async () => {
        try {
            const res = await axios.post('/api/email/verify');
            setVerifyMsg(res.data.message);
            setTimeout(() => setVerifyMsg(''), 5000);
        } catch { setVerifyMsg('Có lỗi khi gửi email xác thực'); }
    };

    const deleteImage = async (imageId) => {
        await axios.delete(`/api/notes/${editNote.id}/images/${imageId}`);
        const res = await axios.get('/api/notes');
        const updated = res.data.find(n => n.id === editNote.id);
        if (updated) setEditNote(updated);
        fetchNotes();
    };

    const filterBySearch = (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.content && n.content.toLowerCase().includes(search.toLowerCase()));
    const filterByLabel = (n) =>
        selectedLabel ? n.labels && n.labels.some(l => l.id === selectedLabel) : true;

    const pinnedNotes = notes.filter(n => n.is_pinned).filter(filterBySearch).filter(filterByLabel);
    const unpinnedNotes = notes.filter(n => !n.is_pinned).filter(filterBySearch).filter(filterByLabel);
    const isDark = user?.theme === 'dark';
    const noteColor = user?.note_color || '#ffffff';

    const SidebarItems = () => (
        <ul className="space-y-0.5">
            <li>
                <button onClick={() => { setSelectedLabel(null); setShowMobileSidebar(false); }}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition font-medium
                        ${!selectedLabel ? 'bg-indigo-500 text-white' : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                    Tất cả
                </button>
            </li>
            {labels.map(label => (
                <li key={label.id}>
                    <button onClick={() => { setSelectedLabel(label.id); setShowMobileSidebar(false); }}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl transition
                            ${selectedLabel === label.id ? 'bg-indigo-500 text-white font-medium' : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                        🏷️ {label.name}
                    </button>
                </li>
            ))}
        </ul>
    );

    const NoteCard = ({ note }) => (
        <div onClick={() => openEdit(note)}
            style={{ backgroundColor: isDark ? '#1e293b' : noteColor }}
            className={`group rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col
                ${isDark ? 'border-slate-700 hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)]' : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg'}
                ${viewMode === 'list' ? '' : ''}`}>
            <div className={`h-0.5 w-full flex-shrink-0 transition-all duration-300 ${note.is_pinned ? 'bg-amber-400' : 'bg-indigo-500 opacity-0 group-hover:opacity-100'}`} />
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-semibold text-sm leading-snug line-clamp-2 flex-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        {note.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {note.password && <Lock size={12} className="text-rose-400" />}
                        <button onClick={(e) => togglePin(note, e)}
                            className={`p-1 rounded-lg transition-colors ${note.is_pinned ? 'text-amber-400' : isDark ? 'text-slate-600 hover:text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}>
                            <Pin size={12} fill={note.is_pinned ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>
                {note.password ? (
                    <p className={`text-xs italic mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>🔒 Nội dung được bảo vệ</p>
                ) : (
                    <p className={`text-xs leading-relaxed line-clamp-3 mb-3 flex-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {note.content || <span className="italic opacity-40">Không có nội dung</span>}
                    </p>
                )}
                {note.labels && note.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {note.labels.map(label => (
                            <span key={label.id} className={`text-xs px-2 py-0.5 rounded-full font-medium
                                ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                                {label.name}
                            </span>
                        ))}
                    </div>
                )}
                {note.images && note.images.length > 0 && (
                    <div className="flex gap-1 mb-2">
                        {note.images.slice(0, 3).map(img => (
                            <img key={img.id} src={`/storage/${img.path}`} className="w-12 h-12 object-cover rounded-lg" />
                        ))}
                        {note.images.length > 3 && (
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                +{note.images.length - 3}
                            </div>
                        )}
                    </div>
                )}
                <div className={`flex items-center gap-1 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity
                    ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <button onClick={(e) => { e.stopPropagation(); setPasswordModal({ note, mode: note.password ? 'remove' : 'set' }); }}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition
                            ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}>
                        <Lock size={10} />{note.password ? 'Tắt khóa' : 'Đặt khóa'}
                    </button>
                    <button onClick={(e) => openShare(note, e)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition
                            ${isDark ? 'hover:bg-indigo-900/40 text-slate-400 hover:text-indigo-300' : 'hover:bg-indigo-50 text-slate-400 hover:text-indigo-600'}`}>
                        <Share2 size={10} />Chia sẻ
                    </button>
                    <button onClick={(e) => deleteNote(note, e)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ml-auto transition
                            ${isDark ? 'hover:bg-rose-900/30 text-slate-500 hover:text-rose-400' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-500'}`}>
                        <Trash2 size={10} />Xóa
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen font-sans ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            {/* HEADER */}
            <header className={`sticky top-0 z-30 border-b backdrop-blur-md
                ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                            className={`md:hidden p-2 rounded-xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                            <Menu size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">N</span>
                            </div>
                            <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>NoteApp</span>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-1 max-w-sm relative">
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input type="text" placeholder="Tìm kiếm note..."
                            className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
                                ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 placeholder-slate-400'}`}
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setShowSharedWithMe(true); fetchSharedWithMe(); }}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition
                                ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                            <Bell size={14} /><span className="hidden sm:inline">Chia sẻ với tôi</span>
                        </button>
                        <button onClick={() => navigate('/profile')}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition
                                ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                            <User size={14} /><span className="hidden sm:inline">{user?.name?.split(' ').slice(-1)[0]}</span>
                        </button>
                        <button onClick={logout}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition">
                            <LogOut size={14} /><span className="hidden sm:inline">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </header>

            {user && !user.email_verified_at && (
                <div className={`border-b px-4 py-2.5 flex items-center justify-between gap-2
                    ${isDark ? 'bg-amber-900/20 border-amber-800/40' : 'bg-amber-50 border-amber-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>⚠️ Email chưa xác thực</p>
                    <div className="flex items-center gap-2">
                        {verifyMsg && <span className="text-emerald-500 text-xs">{verifyMsg}</span>}
                        <button onClick={sendVerifyEmail}
                            className="text-xs px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white">Gửi lại</button>
                    </div>
                </div>
            )}

            {showMobileSidebar && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
                    <aside className={`absolute left-0 top-0 bottom-0 w-60 shadow-2xl p-4 z-50 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Labels</p>
                            <button onClick={() => setShowMobileSidebar(false)}><X size={16} /></button>
                        </div>
                        <SidebarItems />
                    </aside>
                </div>
            )}

            <div className="flex max-w-7xl mx-auto">
                <aside className={`w-52 min-h-[calc(100vh-3.5rem)] border-r hidden md:block sticky top-14 self-start
                    ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Labels</p>
                        <SidebarItems />
                    </div>
                </aside>

                <main className="flex-1 p-4 md:p-6 min-w-0">
                    <div className="md:hidden mb-4 relative">
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input type="text" placeholder="Tìm kiếm note..."
                            className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400
                                ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 placeholder-slate-400'}`}
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-6">
                        <div className="flex gap-2">
                            <button onClick={openCreate}
                                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm">
                                <Plus size={14} />Tạo Note
                            </button>
                            <button onClick={() => setShowLabels(true)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition
                                    ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}>
                                <Tag size={13} /><span className="hidden sm:inline">Labels</span>
                            </button>
                        </div>
                        <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <button onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                <LayoutGrid size={14} />
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-500 text-white' : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                <List size={14} />
                            </button>
                        </div>
                    </div>

                    {showForm && (
                        <div className={`rounded-2xl border mb-6 overflow-hidden shadow-lg
                            ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className={`px-4 py-2.5 border-b flex items-center justify-between
                                ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
                                <span className="text-xs font-semibold text-indigo-500">
                                    {editNote ? '✏️ Đang chỉnh sửa' : '📝 Tạo note mới'}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-medium ${saving ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {saving ? '● Đang lưu...' : '● Đã lưu'}
                                    </span>
                                    <button onClick={closeForm}
                                        className={`p-1 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <input type="text" placeholder="Tiêu đề note..."
                                    className={`w-full text-base font-bold pb-3 mb-3 border-b focus:outline-none bg-transparent
                                        ${isDark ? 'text-white border-slate-700 placeholder-slate-600' : 'text-slate-800 border-slate-200 placeholder-slate-300'}`}
                                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
                                <textarea placeholder="Nội dung..."
                                    className={`w-full h-28 focus:outline-none resize-none text-sm bg-transparent leading-relaxed
                                        ${isDark ? 'text-slate-300 placeholder-slate-600' : 'text-slate-600 placeholder-slate-300'}`}
                                    value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                                {editNote && labels.length > 0 && (
                                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                        <p className="text-xs font-medium text-slate-400 mb-2">Nhãn:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {labels.map(label => (
                                                <button key={label.id} onClick={() => toggleNoteLabel(label.id)}
                                                    className={`text-xs px-3 py-1 rounded-full border transition font-medium
                                                        ${noteLabels.includes(label.id)
                                                            ? 'bg-indigo-500 text-white border-indigo-500'
                                                            : isDark ? 'border-slate-600 text-slate-400 hover:border-indigo-400' : 'border-slate-200 text-slate-500 hover:border-indigo-400'}`}>
                                                    {label.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {editNote && (
                                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                        <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition
                                            ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                            <Upload size={12} />{uploadingImage ? 'Đang tải...' : 'Đính kèm ảnh'}
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={uploadImage} disabled={uploadingImage} />
                                        </label>
                                        {editNote.images && editNote.images.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {editNote.images.map(img => (
                                                    <div key={img.id} className="relative group/img">
                                                        <img src={`/storage/${img.path}`} className="w-20 h-20 object-cover rounded-xl" />
                                                        <button onClick={() => deleteImage(img.id)}
                                                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition">
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-slate-400">Đang tải...</p>
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>📝</div>
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Chưa có note nào. Tạo note đầu tiên đi!</p>
                            <button onClick={openCreate}
                                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
                                <Plus size={13} />Tạo Note
                            </button>
                        </div>
                    ) : (
                        <>
                            {pinnedNotes.length > 0 && (
                                <div className="mb-6">
                                    <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>📌 Đã ghim</p>
                                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' : 'flex flex-col gap-2'}>
                                        {pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
                                    </div>
                                </div>
                            )}
                            {unpinnedNotes.length > 0 && (
                                <div>
                                    {pinnedNotes.length > 0 && (
                                        <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>📄 Các note khác</p>
                                    )}
                                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' : 'flex flex-col gap-2'}>
                                        {unpinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
                                    </div>
                                </div>
                            )}
                            {pinnedNotes.length === 0 && unpinnedNotes.length === 0 && (
                                <p className="text-center text-slate-400 py-12 text-sm">Không tìm thấy note nào!</p>
                            )}
                        </>
                    )}
                </main>
            </div>

            {showLabels && <Labels onClose={() => { setShowLabels(false); fetchLabels(); }} />}

            {passwordModal && (
                <NotePasswordModal
                    note={passwordModal.note}
                    mode={passwordModal.mode}
                    onClose={() => setPasswordModal(null)}
                    onSuccess={() => {
                        if (passwordModal.mode === 'verify') {
                            const note = passwordModal.note;
                            const afterVerify = passwordModal.afterVerify;
                            setPasswordModal(null);
                            if (afterVerify) {
                                afterVerify();
                            } else {
                                setEditNote(note);
                                setForm({ title: note.title, content: note.content || '' });
                                setNoteLabels(note.labels ? note.labels.map(l => l.id) : []);
                                setShowForm(true);
                            }
                        } else {
                            setPasswordModal(null);
                            fetchNotes();
                        }
                    }}
                />
            )}

            {shareModal && <ShareModal note={shareModal} onClose={() => setShareModal(null)} />}

            {showSharedWithMe && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
                    <div className={`rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col
                        ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className={`flex justify-between items-center px-5 py-4 border-b flex-shrink-0
                            ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <div>
                                <h2 className="font-bold text-sm">Notes chia sẻ với tôi</h2>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sharedWithMe.length} note</p>
                            </div>
                            <button onClick={() => setShowSharedWithMe(false)}
                                className={`p-2 rounded-xl transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4">
                            {sharedWithMe.length === 0 ? (
                                <div className="flex flex-col items-center py-10 gap-3">
                                    <div className="text-3xl">📭</div>
                                    <p className="text-sm text-slate-400">Chưa có note nào được chia sẻ với bạn</p>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {sharedWithMe.map(item => (
                                        <li key={item.share_id}
                                            className={`border rounded-xl p-4 cursor-pointer transition flex items-start justify-between gap-3
                                                ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-200 hover:bg-slate-50'}`}
                                            onClick={() => setViewingShare(item.share_id)}>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm truncate">{item.note.title}</h3>
                                                <p className={`text-xs mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.note.content}</p>
                                                <div className="flex gap-2 mt-1.5 text-xs">
                                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>👤 {item.owner_name}</span>
                                                    <span className={item.permission === 'edit' ? 'text-emerald-500 font-medium' : 'text-slate-400'}>
                                                        {item.permission === 'edit' ? '✏️ Chỉnh sửa' : '👁️ Chỉ đọc'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={15} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {viewingShare && (
                <SharedNoteModal shareId={viewingShare} onClose={() => { setViewingShare(null); fetchSharedWithMe(); }} />
            )}
        </div>
    );
}
