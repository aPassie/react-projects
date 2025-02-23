import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export function ProjectStats() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStudents: 0,
    completedProjects: 0,
    averageCompletion: 0,
    difficultyDistribution: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    },
    categoryDistribution: {},
    completionRates: [],
    studentEngagement: []
  });

  useEffect(() => {
    if (currentUser?.user_metadata?.is_admin) {
      fetchStats();
    } else {
      setError('Unauthorized: Only administrators can access this page');
      setLoading(false);
    }
  }, [currentUser]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: projects, error: projectsError } = await supabaseAdmin
        .from('projects')
        .select('id, title, difficulty, category');

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw new Error('Failed to fetch project data');
      }

      const { data: students, error: studentsError } = await supabaseAdmin
        .from('users')
        .select('id, display_name, email, total_points, completed_projects');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw new Error('Failed to fetch student data');
      }

      const { data: progress, error: progressError } = await supabaseAdmin
        .from('project_progress')
        .select('id, user_id, project_id, completed, progress');

      if (progressError) throw progressError;

      // Calculate statistics
      const totalProjects = projects.length;
      const totalStudents = students.length;
      
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

      // Calculate category distribution
      const categoryDistribution = projects.reduce((acc, project) => {
        if (project.category) {
          acc[project.category] = (acc[project.category] || 0) + 1;
        }
        return acc;
      }, {});

      // Calculate completion rates
      const completedProjects = progress?.filter(p => p.completed)?.length || 0;
      const averageCompletion = progress?.length > 0
        ? Math.round((progress.reduce((sum, p) => sum + (p.progress || 0), 0) / progress.length))
        : 0;

      // Calculate student engagement (projects started per student)
      const studentEngagement = students.map(student => {
        const studentProgress = progress?.filter(p => p.user_id === student.id) || [];
        return {
          student: student.display_name || student.email,
          projectsStarted: studentProgress.length,
          projectsCompleted: studentProgress.filter(p => p.completed).length
        };
      }).sort((a, b) => b.projectsCompleted - a.projectsCompleted).slice(0, 10);

      setStats({
        totalProjects,
        totalStudents,
        completedProjects,
        averageCompletion,
        difficultyDistribution,
        categoryDistribution,
        studentEngagement
      });
    } catch (err) {
      setError('Failed to fetch statistics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const difficultyChartData = {
    labels: ['Beginner', 'Intermediate', 'Advanced'],
    datasets: [
      {
        data: [
          stats.difficultyDistribution.beginner,
          stats.difficultyDistribution.intermediate,
          stats.difficultyDistribution.advanced
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // Green for Beginner
          'rgba(59, 130, 246, 0.8)', // Blue for Intermediate
          'rgba(239, 68, 68, 0.8)'   // Red for Advanced
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(stats.categoryDistribution),
    datasets: [
      {
        label: 'Projects per Category',
        data: Object.values(stats.categoryDistribution),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const studentEngagementChartData = {
    labels: stats.studentEngagement.map(s => s.student),
    datasets: [
      {
        label: 'Projects Started',
        data: stats.studentEngagement.map(s => s.projectsStarted),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Projects Completed',
        data: stats.studentEngagement.map(s => s.projectsCompleted),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
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

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Projects</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Completed Projects</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.completedProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Average Completion</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.averageCompletion}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Project Difficulty Distribution</h3>
          <div className="w-full max-w-md mx-auto">
            <Pie data={difficultyChartData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Projects by Category</h3>
          <Bar
            data={categoryChartData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Student Engagement */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Top Student Engagement</h3>
        <Bar
          data={studentEngagementChartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
} 