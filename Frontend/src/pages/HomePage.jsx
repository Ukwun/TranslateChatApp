import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

  return (
    <div className='flex items-center justify-center h-full w-full p-4'>
      <div className='w-full max-w-md'>
        <div className='flex flex-col items-center p-8 rounded-lg shadow-lg bg-gray-800/50 backdrop-blur-sm w-full'>
          <h1 className='text-4xl text-center mb-4'>
            <span className='font-serif italic text-gray-300'>Welcome to</span>
            <br />
            <span className='font-extrabold text-cyan-400'>Translation App</span>
          </h1>
          <p className='mb-6 text-gray-300 text-center'>
            Translate, connect, and communicate globally. Please sign in or create an account to get started.
          </p>
          <div className='flex gap-4 w-full'>
            <Link
              to='/login'
              className='w-1/2 rounded-lg bg-blue-600 py-2 px-4 text-center font-semibold text-white transition-colors hover:bg-blue-700'
            >
              Sign In
            </Link>
            <button
              className='w-1/2 rounded-lg border border-gray-400 py-2 px-4 text-center font-semibold text-gray-200 transition-colors hover:bg-gray-200 hover:text-black'
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;