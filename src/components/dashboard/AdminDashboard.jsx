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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Welcome {currentUser?.displayName || currentUser?.email}
          </h1>
          <p className="text-neutral-400">Admin Dashboard</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white"
          >
            Log Out
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {activeTab === 'analytics' && <DashboardAnalytics />}
      {activeTab === 'projects' && <ProjectManagement />}
      {activeTab === 'students' && <StudentManagement />}
      {activeTab === 'settings' && <SettingsManagement />}
    </div>
  );
} 