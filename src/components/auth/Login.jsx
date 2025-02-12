import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import loginBg from './banner.jpeg';
import googleIcon from './google.png';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const { user } = await signInWithGoogle();
      
      const isAdmin = ['cloud1byps@gmail.com', 'abhinavjha0239@gmail.com', 'shuklaparth2003@gmail.com'].includes(user.email);
      
      setTimeout(() => {
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in with Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black p-20">
    {/* Left Section with Image */}
    <div className="flex-1 relative flex items-center justify-center">
        <div className="relative group">
            {/* Outer Glow -  Visible Glow with Blur and Opacity */}
            <div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-300/20 via-cyan-300 to-[#61dafb] opacity-90 blur-3xl"
                />
            {/* Inner Shadow -  Subtle Inner Shadow */}
            <div className="absolute inset-0 rounded-3xl bg-black/20 shadow-inner" />

            {/* Main Image Container */}
            <div className="relative w-full max-w-xl h-[80vh] rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 z-10" />
                <img
                    src={loginBg} // Make sure loginBg is correctly defined!
                    alt="Landscape"
                    className="w-full h-full object-cover animate-subtle-zoom"
                />
            </div>
        </div>
    </div>

      {/* Right Section with Login */}
      <div className="flex-1 flex items-center justify-center mr-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white text-2xl font-semibold">
            <span>React</span>
            <div className="px-2 py-1 bg-white/10 rounded-md">
              <span className="text-white">Projects</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-white">
                Learn React by
              </h1>
              <h2 className="text-4xl font-semibold text-white">
                Doing Projects
              </h2>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Login Buttons */}
            <div className="space-y-4">
            <div className="relative group">
                {/* Gradient Border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-xl opacity-30 group-hover:opacity-100 transition duration-500 blur" />
                
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="relative w-full flex items-center justify-between px-4 py-3 bg-neutral-800/90 text-white rounded-lg backdrop-blur-sm transition duration-500 group-hover:bg-neutral-800/70"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={googleIcon} 
                      alt="Google"
                      className="w-6 h-6" 
                    />
                    <span className="text-sm font-medium">Continue with Google</span>
                  </div>
                </button>
              </div>
              </div>

            {/* Terms */}
            <p className="text-sm text-neutral-400">
              By signing in, you agree to our's{' '}
              <a href="#" className="underline hover:text-white">Terms of Service</a>,{' '}
              <a href="#" className="underline hover:text-white">Privacy Policy</a> and{' '}
              <a href="#" className="underline hover:text-white">Data Usage Properties</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
