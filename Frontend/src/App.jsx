import React, { useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from './pages/SettingsPage.jsx';
import ChatHomePage from './pages/ChatHomePage.jsx';
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminRoomPage from "./pages/AdminRoomPage.jsx";
import AdminRoomDetailPage from "./pages/AdminRoomDetailPage.jsx";
import { useAuthStore } from './store/useAuthStore.js';
import { useSocketStore } from './store/useSocket.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useThemeStore } from './store/useThemeStore.js';

const App = () => {
    const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
    const { theme } = useThemeStore();
    const { socket, connect, disconnect } = useSocketStore();
    const navigate = useNavigate();
    const prevAuthUser = useRef(authUser);

  useEffect(() => {
    // checkAuth only needs to run once on component mount
    checkAuth();
  }, []);

  useEffect(() => {
    if (authUser) {
      connect(authUser);
    }
    return () => {
      disconnect();
    };
  }, [authUser, connect, disconnect]);

  
  useEffect(() => {
    // This effect detects when the user logs out (authUser changes from an object to null)
    // and redirects them to the signup page.
    if (prevAuthUser.current && !authUser) {
      navigate("/signup");
    }
    prevAuthUser.current = authUser;
  }, [authUser, navigate]);
  
  useEffect(() => {
    if (socket) {
      socket.on('room-invite', ({ room, inviter }) => {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Room Invitation
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      <b>{inviter.fullName}</b> invited you to join <b>{room.name}</b>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => {
                    navigate(`/admin-rooms/${room._id}`);
                    toast.dismiss(t.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Accept
                </button>
                 <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Decline
                </button>
              </div>
            </div>
          ),
          { duration: 15000 }
        );
      });

      return () => {
        socket.off('room-invite');
      };
    }
  }, [socket, navigate]);

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
          <Route path='/admin-rooms' element={<ProtectedRoute><AdminRoomPage /></ProtectedRoute>} />
          <Route path='/admin-rooms/:roomId' element={<ProtectedRoute><AdminRoomDetailPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
