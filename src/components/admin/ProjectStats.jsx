import { useState, useEffect } from 'react';
import { db, collection, getDocs, query } from '../../config/firebase';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function ProjectStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProjects: 0,
    categoryDistribution: {},
    difficultyDistribution: {},
    completionRates: [],
    averageRatings: [],
    popularTags: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch projects
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch user completion data
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate statistics
      const categoryDist = {};
      const difficultyDist = {};
      const tagCounts = {};
      const projectStats = {};

      projects.forEach(project => {
        // Category distribution
        categoryDist[project.category] = (categoryDist[project.category] || 0) + 1;
        
        // Difficulty distribution
        difficultyDist[project.difficulty] = (difficultyDist[project.difficulty] || 0) + 1;
        
        // Tag counting
        project.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        // Initialize project stats
        projectStats[project.id] = {
          title: project.title,
          completions: 0,
          rating: project.averageRating || 0
        };
      });

      // Calculate completion rates
      users.forEach(user => {
        user.completedProjects?.forEach(projectId => {
          if (projectStats[projectId]) {
            projectStats[projectId].completions += 1;
          }
        });
      });

      // Sort tags by frequency
      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      setStats({
        totalProjects: projects.length,
        categoryDistribution: categoryDist,
        difficultyDistribution: difficultyDist,
        completionRates: Object.values(projectStats)
          .sort((a, b) => b.completions - a.completions)
          .slice(0, 10),
        averageRatings: Object.values(projectStats)
          .filter(p => p.rating > 0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10),
        popularTags: sortedTags
      });
    } catch (err) {
      setError('Failed to fetch statistics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-slate-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-slate-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-600">Total Projects</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">{stats.totalProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-600">Most Common Category</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">
            {Object.entries(stats.categoryDistribution)
              .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-600">Most Used Difficulty</h3>
          <p className="text-3xl font-bold mt-2 text-slate-800">
            {Object.entries(stats.difficultyDistribution)
              .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Category Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: Object.keys(stats.categoryDistribution),
                datasets: [{
                  data: Object.values(stats.categoryDistribution),
                  backgroundColor: [
                    '#3B82F6', '#EF4444', '#10B981',
                    '#F59E0B', '#6366F1', '#EC4899'
                  ]
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#475569' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Completion Rates */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Top Project Completions</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: stats.completionRates.map(p => p.title),
                datasets: [{
                  label: 'Completions',
                  data: stats.completionRates.map(p => p.completions),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  borderColor: '#3B82F6',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#475569' },
                    grid: { color: '#E2E8F0' }
                  },
                  x: {
                    ticks: { color: '#475569' },
                    grid: { display: false }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: '#475569' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {stats.popularTags.map(({ tag, count }) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
            >
              {tag} ({count})
            </span>
          ))}
        </div>
      </div>

      {/* Project Ratings */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Top Rated Projects</h3>
        <div className="space-y-4">
          {stats.averageRatings.map(project => (
            <div key={project.title} className="flex justify-between items-center">
              <span className="text-slate-700">{project.title}</span>
              <div className="flex items-center">
                <span className="text-slate-600 mr-2">{project.rating.toFixed(1)}</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(project.rating) ? 'fill-current' : 'fill-slate-200'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}