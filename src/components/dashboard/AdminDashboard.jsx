//AdminDashboard.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
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
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to fetch projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('users')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;
      setStudents(studentsData);
    } catch (err) {
      setError('Failed to fetch students: ' + err.message);
    }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchProjects();
      fetchStudents();
    } else {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleCreateProject = async (projectData) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      setProjects([...projects, data[0]]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create project: ' + err.message);
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select();

      if (error) throw error;

      setProjects(projects.map(p => p.id === projectId ? data[0] : p));
      setEditingProject(null);
      setShowForm(false);
    } catch (err) {
      setError('Failed to update project: ' + err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      setError('Failed to delete project: ' + err.message);
    }
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingProject(null);
    fetchProjects();
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
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-white py-4 px-6 border-b border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold">
              Welcome, {currentUser?.displayName || currentUser?.email}!
            </h1>
            <p className="text-slate-600">Admin Dashboard</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="py-8 px-6">
        <div className="animate-fade-in-up">
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'analytics'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'projects'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'students'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                activeTab === 'settings'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow'
              }`}
            >
              Settings
            </button>
          </div>

          {error && (
            <div className="mb-8 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in-up">
            {activeTab === 'analytics' && <DashboardAnalytics />}
            {activeTab === 'projects' && <ProjectManagement />}
            {activeTab === 'students' && <StudentManagement />}
            {activeTab === 'settings' && <SettingsManagement />}
          </div>
        </div>
      </main>
    </div>
  );
}