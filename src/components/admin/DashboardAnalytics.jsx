import { useState, useEffect } from 'react';
import { db, collection, getDocs, query, orderBy } from '../../config/firebase';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function DashboardAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalProjects: 0,
    completionRate: 0,
    popularProjects: [],
    studentActivity: {},
    projectDifficulty: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all students
      const studentsQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const studentsSnapshot = await getDocs(studentsQuery);
      const students = studentsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => !user.isAdmin);

      // Fetch all projects
      const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate total completions
      const totalCompletions = students.reduce((sum, student) => 
        sum + (student.completedProjects?.length || 0), 0);

      // Calculate project popularity
      const projectCompletions = {};
      students.forEach(student => {
        student.completedProjects?.forEach(projectId => {
          projectCompletions[projectId] = (projectCompletions[projectId] || 0) + 1;
        });
      });

      // Calculate student activity over time
      const activityData = {};
      students.forEach(student => {
        const date = new Date(student.createdAt).toLocaleDateString();
        activityData[date] = (activityData[date] || 0) + 1;
      });

      // Calculate project difficulty distribution
      const difficultyCount = projects.reduce((acc, project) => {
        acc[project.difficulty] = (acc[project.difficulty] || 0) + 1;
        return acc;
      }, {});

      setAnalytics({
        totalStudents: students.length,
        totalProjects: projects.length,
        completionRate: students.length ? 
          (totalCompletions / (students.length * projects.length) * 100).toFixed(1) : 0,
        popularProjects: projects
          .map(project => ({
            ...project,
            completions: projectCompletions[project.id] || 0
          }))
          .sort((a, b) => b.completions - a.completions)
          .slice(0, 5),
        studentActivity: activityData,
        projectDifficulty: difficultyCount
      });

    } catch (err) {
      setError('Failed to fetch analytics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 animate-pulse">
        <div className="text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg animate-fade-in">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
          <h3 className="text-lg font-medium text-slate-600">Total Students</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">{analytics.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
          <h3 className="text-lg font-medium text-slate-600">Total Projects</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">{analytics.totalProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
          <h3 className="text-lg font-medium text-slate-600">Completion Rate</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">{analytics.completionRate}%</p>
        </div>
      </div>

      {/* Popular Projects */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Most Popular Projects</h3>
        <div className="space-y-4">
          {analytics.popularProjects.map(project => (
            <div 
              key={project.id} 
              className="flex justify-between items-center p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
            >
              <div>
                <h4 className="font-medium text-slate-800">{project.title}</h4>
                <p className="text-sm text-slate-600">{project.difficulty}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800">{project.completions}</span>
                <span className="text-sm text-slate-600">completions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Activity Graph */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Student Activity</h3>
        <div className="h-64">
          <Line
            data={{
              labels: Object.keys(analytics.studentActivity),
              datasets: [{
                label: 'New Students',
                data: Object.values(analytics.studentActivity),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                  },
                  ticks: { color: '#64748b' }
                },
                x: {
                  grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                  },
                  ticks: { color: '#64748b' }
                }
              },
              plugins: {
                legend: {
                  labels: { color: '#64748b' }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Project Difficulty Distribution */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Project Difficulty Distribution</h3>
        <div className="h-64">
          <Bar
            data={{
              labels: Object.keys(analytics.projectDifficulty),
              datasets: [{
                label: 'Projects',
                data: Object.values(analytics.projectDifficulty),
                backgroundColor: [
                  'rgba(34, 197, 94, 0.8)',  // green for beginner
                  'rgba(59, 130, 246, 0.8)', // blue for intermediate
                  'rgba(249, 115, 22, 0.8)'  // orange for advanced
                ],
                borderRadius: 8
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                  },
                  ticks: { color: '#64748b' }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: { color: '#64748b' }
                }
              },
              plugins: {
                legend: {
                  labels: { color: '#64748b' }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}