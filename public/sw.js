const CACHE_NAME = 'noteapp-v2';
const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];
 
// ─── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});
 
// ─── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});
 
// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
 
    const url = new URL(request.url);
 
    // ── API /api/notes và /api/labels: Network first, fallback cache ──────────
    if (url.pathname === '/api/notes' || url.pathname === '/api/labels') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Lưu response vào cache khi online
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(async () => {
                    // Offline: trả về dữ liệu đã cache
                    const cached = await caches.match(request);
                    if (cached) return cached;
                    return new Response(JSON.stringify([]), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                })
        );
        return;
    }
 
    // ── Các API khác: Network first, trả lỗi offline nếu không có mạng ────────
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() =>
                new Response(JSON.stringify({ offline: true, message: 'Bạn đang offline' }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 503,
                })
            )
        );
        return;
    }
 
    // ── Static assets: Cache first, rồi mới network ───────────────────────────
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request)
                .then((response) => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => {
                    if (request.mode === 'navigate') return caches.match('/offline.html');
                });
        })
    );
});
 
// ─── SYNC (Background Sync khi có mạng lại) ───────────────────────────────────
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-pending-notes') {
        event.waitUntil(syncPendingActions());
    }
});
 
async function syncPendingActions() {
    // Gửi message cho client để trigger sync từ IndexedDB
    const clients = await self.clients.matchAll();
    clients.forEach((client) => client.postMessage({ type: 'SYNC_PENDING' }));
}
 
// ─── MESSAGE từ app ────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});