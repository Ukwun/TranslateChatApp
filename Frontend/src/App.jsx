import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from './pages/SettingsPage.jsx';
import ChatHomePage from './pages/ChatHomePage.jsx';
import ProfilePage from "./pages/ProfilePage.jsx";
import { useAuthStore } from './store/useAuthStore.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import api from './api/api.js';
import { useThemeStore } from './store/useThemeStore.js';

const App = () => {
    const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
    const { theme } = useThemeStore();

  useEffect(() => {
    // checkAuth only needs to run once on component mount
    checkAuth();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  if (isCheckingAuth) {
    return <div className='h-screen flex justify-center items-center'>
      <span className='loading loading-lg'></span>
    </div>
  }

  return (
    <div
      className='flex flex-col min-h-screen w-full'
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
    >
      <Navbar />
      <main className='flex-1 flex flex-col w-full pt-16'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/profile' />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/profile' />} />
          <Route path='/settings' element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path='/chat' element={<ProtectedRoute><ChatHomePage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
