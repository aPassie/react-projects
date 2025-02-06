import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-neutral-400 mb-8">Page not found</p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
} 