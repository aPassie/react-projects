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
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-neutral-400">Total Students</h3>
          <p className="text-3xl font-bold mt-2">{analytics.totalStudents}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-neutral-400">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">{analytics.totalProjects}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-neutral-400">Completion Rate</h3>
          <p className="text-3xl font-bold mt-2">{analytics.completionRate}%</p>
        </div>
      </div>

      {/* Popular Projects */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Most Popular Projects</h3>
        <div className="space-y-4">
          {analytics.popularProjects.map(project => (
            <div key={project.id} className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{project.title}</h4>
                <p className="text-sm text-neutral-400">{project.difficulty}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{project.completions}</span>
                <span className="text-sm text-neutral-400">completions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Activity Graph */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Student Activity</h3>
        <div className="h-64">
          <Line
            data={{
              labels: Object.keys(analytics.studentActivity),
              datasets: [{
                label: 'New Students',
                data: Object.values(analytics.studentActivity),
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { color: '#9CA3AF' }
                },
                x: {
                  ticks: { color: '#9CA3AF' }
                }
              },
              plugins: {
                legend: {
                  labels: { color: '#9CA3AF' }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Project Difficulty Distribution */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Project Difficulty Distribution</h3>
        <div className="h-64">
          <Bar
            data={{
              labels: ['Beginner', 'Intermediate', 'Advanced'],
              datasets: [{
                label: 'Number of Projects',
                data: [
                  analytics.projectDifficulty.beginner || 0,
                  analytics.projectDifficulty.intermediate || 0,
                  analytics.projectDifficulty.advanced || 0
                ],
                backgroundColor: [
                  'rgba(34, 197, 94, 0.5)',
                  'rgba(59, 130, 246, 0.5)',
                  'rgba(239, 68, 68, 0.5)'
                ],
                borderColor: [
                  'rgb(34, 197, 94)',
                  'rgb(59, 130, 246)',
                  'rgb(239, 68, 68)'
                ],
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { color: '#9CA3AF' }
                },
                x: {
                  ticks: { color: '#9CA3AF' }
                }
              },
              plugins: {
                legend: {
                  labels: { color: '#9CA3AF' }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 