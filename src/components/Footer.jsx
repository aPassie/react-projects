export function Footer() {
    return (
      <footer className="bg-neutral-800 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">React Learning Platform</h3>
              <p className="text-neutral-400">
                Master React through hands-on project-based learning. Build real-world applications 
                and understand core concepts through practical examples.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Learning Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://react.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    React Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="https://vitejs.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Vite Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <i className="fab fa-github text-xl"></i>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <i className="fab fa-twitter text-xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }