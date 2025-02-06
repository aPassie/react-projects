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
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-neutral-400">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProjects}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-neutral-400">Most Common Category</h3>
          <p className="text-3xl font-bold mt-2">
            {Object.entries(stats.categoryDistribution)
              .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
          </p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-neutral-400">Most Used Difficulty</h3>
          <p className="text-3xl font-bold mt-2">
            {Object.entries(stats.difficultyDistribution)
              .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Category Distribution</h3>
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
                    labels: { 
                      color: '#9CA3AF',
                      font: {
                        size: 12
                      },
                      padding: 20
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Completion Rates */}
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Top Project Completions</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: stats.completionRates.map(p => p.title),
                datasets: [{
                  label: 'Completions',
                  data: stats.completionRates.map(p => p.completions),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  borderColor: 'rgb(59, 130, 246)',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: { 
                      color: '#9CA3AF',
                      font: {
                        size: 12
                      }
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: { 
                      color: '#9CA3AF',
                      font: {
                        size: 12
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: { 
                      color: '#9CA3AF',
                      font: {
                        size: 12
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {stats.popularTags.map(({ tag, count }) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full"
            >
              {tag} ({count})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 