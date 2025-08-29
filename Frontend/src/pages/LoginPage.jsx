import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/api.js";


function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await login({ email, password });
      navigate("/profile");
    } catch (err) {
      // The error toast is already handled by the login action in the store
    }
  };

  return (
    <div className='flex items-center justify-center min-h-full px-4'>
      <div className='w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg'>
        <h2 className='text-3xl font-extrabold text-center text-white'>Sign in to your account</h2>
        <form className='mt-8 space-y-6' onSubmit={handleLogin}>
          <div className='space-y-4 rounded-md shadow-sm'>
            <input
              id='email-address'
              name='email'
              type='email'
              autoComplete='email'
              required
              className='relative block w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md appearance-none placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
              placeholder='Email address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              required
              className='relative block w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md appearance-none placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type='submit'
            disabled={isLoggingIn}
            className='relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed'
          >
            {isLoggingIn ? <span className='loading loading-spinner loading-xs'></span> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;