import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, collection, getDocs, query, orderBy, doc, updateDoc } from '../../config/firebase';
import { calculateProjectProgress } from '../../utils/progressCalculator';

export function StudentDashboard() {
    const [error, setError] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [progress, setProgress] = useState({});

    useEffect(() => {
        fetchProjects();
        fetchUserName();
        fetchProjectsAndProgress();
    }, []);

    const fetchUserName = async () => {
        if (currentUser) {
            try {
                const userDocSnap = await getDocs(query(collection(db, "users")));
                if (userDocSnap.docs.length > 0) {
                    const userData = userDocSnap.docs[0].data();
                    setUserName(userData.name || 'User');
                }
            } catch (err) {
                console.error("Failed to fetch user's name:", err);
                setUserName('User');
            }
        }
    };

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

    const fetchProjectsAndProgress = async () => {
        try {
            // Fetch all projects
            const projectsSnapshot = await getDocs(collection(db, 'projects'));
            const projectsData = projectsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch user's progress for all projects
            const progressSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'progress'));
            const progressData = {};
            
            progressSnapshot.docs.forEach(doc => {
                const { completedSteps } = doc.data();
                const project = projectsData.find(p => p.id === doc.id);
                progressData[doc.id] = calculateProjectProgress(project, completedSteps);
            });

            setProjects(projectsData);
            setProgress(progressData);
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const filteredProjects = projects.filter(project =>
        (filter === 'All' || project.difficulty === filter.toLowerCase()) &&
        project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-slate-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-slate-500"></div>
            </div>
          </div>
        </div>
      );
    }
    return (
        <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800">
          <header className="bg-white py-4 px-8 flex justify-between items-center border-b border-slate-200 shadow-sm">
            <div>
              <h1 className="text-3xl font-semibold">Welcome, {userName}!</h1>
              <p className="text-slate-600">{currentUser.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-4 py-2 bg-slate-50 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-200 transition-all duration-200"
              />
              <button
                onClick={handleSignOut}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full transition-colors duration-200 active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </header>

          <main className="flex-grow px-8 py-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Filter Projects</h2>
              <div className="flex space-x-4">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button
                    key={level}
                    onClick={() => handleFilterChange(level)}
                    className={`px-4 py-2 rounded-full transition duration-200 ${
                      filter === level
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    } active:scale-95`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-8 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-white/80 rounded-lg border border-slate-200/50 backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-white/90 cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-800'
                          : project.difficulty === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                      </span>
                      <span className={`text-sm ${
                        progress[project.id] === 100 
                          ? 'text-green-600 font-semibold' 
                          : 'text-slate-500'
                      }`}>
                        {progress[project.id] ? `${progress[project.id]}% Complete` : '0% Complete'}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-slate-800">{project.title}</h3>
                    </div>

                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.tags?.map(tag => (
                        <span
                        key={tag}
                        className="px-2 py-1 bg-slate-200/75 rounded-full text-sm text-slate-600 transition-colors duration-200 hover:bg-slate-300/75"
                      >
                        {tag}
                      </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProjects.length === 0 && !loading && (
              <div className="text-center py-8 text-slate-500">
                No projects available matching your criteria.
              </div>
            )}
          </main>
          <footer className="bg-white text-slate-600 text-center py-6 mt-auto border-t border-slate-200">
            {new Date().getFullYear()} Your App Name. All rights reserved.
          </footer>
        </div>
      );
    }