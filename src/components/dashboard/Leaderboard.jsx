import { useState, useEffect } from 'react';
import { db, collection, query, orderBy, getDocs, where } from '../../config/firebase';

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all users with role 'student'
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const users = {};
      
      // Create a map of user data
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        users[doc.id] = {
          id: doc.id,
          displayName: userData.displayName,
          email: userData.email,
          role: userData.role,
          completedProjects: 0,
          totalPoints: 0,
          averageRating: 0
        };
      });

      // Get all project completions
      const completionsQuery = query(
        collection(db, 'projectCompletions'),
        where('status', '==', 'completed'),
        orderBy('completedAt', 'desc')
      );
      const completionsSnapshot = await getDocs(completionsQuery);
      
      // Calculate statistics for each user
      completionsSnapshot.forEach(doc => {
        const completion = doc.data();
        if (users[completion.userId]) {
          users[completion.userId].completedProjects++;
          users[completion.userId].totalPoints += completion.rating || 0;
        }
      });

      // Calculate average ratings and prepare leaderboard data
      const leaderboard = Object.values(users)
        .map(user => ({
          ...user,
          averageRating: user.completedProjects > 0 
            ? Number((user.totalPoints / user.completedProjects).toFixed(1))
            : 0
        }))
        .sort((a, b) => {
          // Sort by completed projects first
          if (b.completedProjects !== a.completedProjects) {
            return b.completedProjects - a.completedProjects;
          }
          // If equal, sort by average rating
          return b.averageRating - a.averageRating;
        })
        .slice(0, 10); // Only show top 10

      setLeaderboardData(leaderboard);
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Failed to fetch leaderboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading leaderboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={fetchLeaderboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">Student Leaderboard</h2>
        <p className="text-slate-600 mt-1">Top performers based on completed projects</p>
      </div>

      <div className="divide-y divide-slate-200">
        {leaderboardData.map((user, index) => (
          <div
            key={user.id}
            className={`p-4 flex items-center gap-4 ${
              index < 3 ? 'bg-blue-50/50' : ''
            }`}
          >
            {/* Rank */}
            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold ${
              index === 0 ? 'bg-yellow-100 text-yellow-700' :
              index === 1 ? 'bg-slate-100 text-slate-700' :
              index === 2 ? 'bg-amber-100 text-amber-700' :
              'bg-slate-50 text-slate-600'
            }`}>
              {index + 1}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h3 className="font-medium text-slate-800">
                {user.displayName || 'Anonymous User'}
              </h3>
              <p className="text-sm text-slate-600">
                {user.email}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              {/* Completed Projects */}
              <div className="text-center">
                <div className="text-xl font-semibold text-blue-600">
                  {user.completedProjects}
                </div>
                <div className="text-xs text-slate-600">Projects</div>
              </div>

              {/* Average Rating */}
              <div className="text-center">
                <div className="text-xl font-semibold text-green-600 flex items-center gap-1">
                  {user.averageRating}
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="text-xs text-slate-600">Avg Rating</div>
              </div>
            </div>
          </div>
        ))}

        {leaderboardData.length === 0 && (
          <div className="p-8 text-center text-slate-600">
            No data available for the leaderboard yet.
          </div>
        )}
      </div>
    </div>
  );
}
