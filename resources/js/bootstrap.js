import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set token cho axios từ localStorage
const token = localStorage.getItem('token');
if (token) {
    window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 9000,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 9000,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/api/broadcasting/auth',
    auth: {
        headers: {
            Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
        },
    },
});