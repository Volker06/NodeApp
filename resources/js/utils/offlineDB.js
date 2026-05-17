const DB_NAME = 'noteapp_offline';
const DB_VERSION = 1;
 
function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
 
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('notes')) {
                db.createObjectStore('notes', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('labels')) {
                db.createObjectStore('labels', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('pending')) {
                db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
            }
        };
 
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
 
// ─── NOTES ───────────────────────────────────────────────────────────────────
 
export async function saveNotesToLocal(notes) {
    const db = await openDB();
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    store.clear();
    notes.forEach(note => store.put(note));
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}
 
export async function getNotesFromLocal() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('notes', 'readonly');
        const req = tx.objectStore('notes').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}
 
// ─── LABELS ──────────────────────────────────────────────────────────────────
 
export async function saveLabelsToLocal(labels) {
    const db = await openDB();
    const tx = db.transaction('labels', 'readwrite');
    const store = tx.objectStore('labels');
    store.clear();
    labels.forEach(label => store.put(label));
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}
 
export async function getLabelsFromLocal() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('labels', 'readonly');
        const req = tx.objectStore('labels').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}
 
// ─── PENDING ACTIONS ─────────────────────────────────────────────────────────
 
export async function addPendingAction(action) {
    const db = await openDB();
    const tx = db.transaction('pending', 'readwrite');
    tx.objectStore('pending').add({ ...action, createdAt: Date.now() });
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}
 
export async function getPendingActions() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pending', 'readonly');
        const req = tx.objectStore('pending').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}
 
export async function deletePendingAction(id) {
    const db = await openDB();
    const tx = db.transaction('pending', 'readwrite');
    tx.objectStore('pending').delete(id);
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}
 
// ─── HELPER ──────────────────────────────────────────────────────────────────
 
export function isOnline() {
    return navigator.onLine;
}