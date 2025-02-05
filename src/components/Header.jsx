import { useState } from 'react';

export function Header({ onNavigate, currentView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-neutral-800 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <button
          onClick={() => onNavigate('home')}
          className="text-2xl font-bold hover:text-blue-400 transition-colors"
        >
          React Projects
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-neutral-400 hover:text-white"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation links */}
        <nav
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:block absolute md:static top-full left-0 w-full bg-neutral-800 md:bg-transparent shadow-lg md:shadow-none z-10`}
        >
          <ul className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-0">
            <li>
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMenuOpen(false);
                }}
                className={`${
                  currentView === 'home' ? 'text-blue-400' : 'text-white'
                } hover:text-blue-400 transition-colors`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onNavigate('projects');
                  setIsMenuOpen(false);
                }}
                className={`${
                  currentView === 'projects' ? 'text-blue-400' : 'text-white'
                } hover:text-blue-400 transition-colors`}
              >
                Projects
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onNavigate('learning');
                  setIsMenuOpen(false);
                }}
                className={`${
                  currentView === 'learning' ? 'text-blue-400' : 'text-white'
                } hover:text-blue-400 transition-colors`}
              >
                Learning Paths
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setIsMenuOpen(false);
                }}
                className={`${
                  currentView === 'profile' ? 'text-blue-400' : 'text-white'
                } hover:text-blue-400 transition-colors`}
              >
                Profile
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}