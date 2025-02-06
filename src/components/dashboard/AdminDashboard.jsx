import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, collection, getDocs, deleteDoc, doc, query, orderBy } from '../../config/firebase';
import { ProjectForm } from '../admin/ProjectForm';
import { DashboardAnalytics } from '../admin/DashboardAnalytics';
import { StudentManagement } from '../admin/StudentManagement';
import { ProjectManagement } from '../admin/ProjectManagement';
import { SettingsManagement } from '../admin/SettingsManagement';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out: ' + error.message);
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

  const fetchStudents = async () => {
    try {
      const studentsQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(studentsQuery);
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Filter out admin users
      setStudents(studentsData.filter(user => !user.isAdmin));
    } catch (err) {
      setError('Failed to fetch students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
    } else {
      fetchStudents();
    }
  }, [activeTab]);

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        await fetchProjects();
      } catch (err) {
        setError('Failed to delete project: ' + err.message);
      }
    }
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingProject(null);
    fetchProjects();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-neutral-800 border-r border-neutral-700 fixed h-full">
        <div className="p-4 border-b border-neutral-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {currentUser?.displayName || currentUser?.email}
          </p>
        </div>
        
        <nav className="p-4">
          {[
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'projects', label: 'Projects', icon: '📂' },
            { id: 'students', label: 'Students', icon: '👥' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-neutral-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <div className="bg-neutral-800 border-b border-neutral-700 p-6">
          <h2 className="text-2xl font-bold">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
        </div>

        {/* Error Display */}
        {error && (
          <div className="m-6 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'analytics' && <DashboardAnalytics />}
          {activeTab === 'projects' && <ProjectManagement />}
          {activeTab === 'students' && <StudentManagement />}
          {activeTab === 'settings' && <SettingsManagement />}
        </div>
      </div>
    </div>
  );
} 