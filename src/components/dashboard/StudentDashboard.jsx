import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, collection, getDocs, query, orderBy } from '../../config/firebase';

export function StudentDashboard() {
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(projectsQuery);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to fetch projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to sign out: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-neutral-400">{currentUser.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-neutral-800 rounded-lg overflow-hidden hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">{project.title}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  project.difficulty === 'beginner' ? 'bg-green-500/10 text-green-500' :
                  project.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {project.difficulty}
                </span>
              </div>
              
              <p className="text-neutral-400 mb-4 line-clamp-2">{project.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {project.tags?.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-neutral-700 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center py-8 text-neutral-400">
          No projects available.
        </div>
      )}
    </div>
  );
} 