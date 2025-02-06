import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await signInWithGoogle();
      console.log('Sign in successful:', result);
      
      // Check if user is admin
      if (result.user.email === 'cloud1byps@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in with Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-neutral-900 rounded-3xl shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome To React Projects</h2>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg">
            <p className="text-sm text-center">{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 
                   bg-white hover:bg-neutral-100 text-black rounded-lg 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-2xl" />
          <span className="font-medium">
            {loading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </button>
      </div>
    </div>
  );
}