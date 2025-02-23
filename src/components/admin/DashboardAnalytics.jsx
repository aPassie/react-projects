import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export function DashboardAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProjects: 0,
    completedProjects: 0,
    averageProgress: 0,
    difficultyDistribution: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch total students
        const { count: studentsCount, error: studentsError } = await supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('is_admin', false);

        if (studentsError) throw studentsError;

        // Fetch projects and their stats
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*');

        if (projectsError) throw projectsError;

        // Fetch project progress
        const { data: progress, error: progressError } = await supabase
          .from('project_progress')
          .select('*');

        if (progressError) throw progressError;

        // Calculate statistics
        const completedProjects = progress?.filter(p => p.completed)?.length || 0;
        const totalProgress = progress?.reduce((sum, p) => sum + (p.progress || 0), 0);
        const averageProgress = progress?.length ? Math.round(totalProgress / progress.length) : 0;

        // Calculate difficulty distribution
        const difficultyDistribution = projects.reduce((acc, project) => {
          const difficulty = project.difficulty?.toLowerCase() || 'beginner';
          acc[difficulty] = (acc[difficulty] || 0) + 1;
          return acc;
        }, {
          beginner: 0,
          intermediate: 0,
          advanced: 0
        });

        setStats({
          totalStudents: studentsCount || 0,
          totalProjects: projects.length,
          completedProjects,
          averageProgress,
          difficultyDistribution
        });

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartData = {
    labels: ['Beginner', 'Intermediate', 'Advanced'],
    datasets: [
      {
        data: [
          stats.difficultyDistribution.beginner,
          stats.difficultyDistribution.intermediate,
          stats.difficultyDistribution.advanced
        ],
        backgroundColor: [
          'rgba(52, 211, 153, 0.8)',  // Green for Beginner
          'rgba(251, 191, 36, 0.8)',  // Yellow for Intermediate
          'rgba(239, 68, 68, 0.8)'    // Red for Advanced
        ],
        borderColor: [
          'rgba(52, 211, 153, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded-lg">
        Error loading analytics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Projects</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Completed Projects</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.completedProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Average Progress</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.averageProgress}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-700 font-semibold mb-4">Project Difficulty Distribution</h3>
          <div className="w-full max-w-md mx-auto">
            <Pie data={chartData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>
      </div>
    </div>
  );
}