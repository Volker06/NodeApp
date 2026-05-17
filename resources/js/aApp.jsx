import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 text-sm">Đang tải...</span>
            </div>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 text-sm">Đang tải...</span>
            </div>
        </div>
    );
    return user ? <Navigate to="/" /> : children;
}

function AppWrapper({ children }) {
    const { user } = useAuth();
    const fontSizeMap = { small: '13px', medium: '15px', large: '18px' };
    const theme = user?.theme || 'light';
    const fontSize = fontSizeMap[user?.font_size] || '15px';
    const isDark = theme === 'dark';

    return (
        <div
            style={{ fontSize }}
            className={isDark
                ? 'bg-gray-900 text-white min-h-screen transition-colors duration-300'
                : 'bg-gray-100 text-gray-900 min-h-screen transition-colors duration-300'}
            data-theme={theme}
        >
            {children}
        </div>
    );
}

function AppRoutes() {
    return (
        <AppWrapper>
            <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Routes>
        </AppWrapper>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}