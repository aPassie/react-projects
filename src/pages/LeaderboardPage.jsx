import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, getDocs, where, orderBy, writeBatch, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const RANK_BADGES = {
    0: 'first_place',
    1: 'second_place',
    2: 'third_place'
  };

  const updateUserBadges = async (rankedUsers) => {
    try {
      const batch = writeBatch(db);
      const usersToUpdate = new Set();

      // Get all users who currently have rank badges
      const usersWithBadgesQuery = query(
        collection(db, 'users'),
        where('badges', 'array-contains-any', Object.values(RANK_BADGES))
      );
      const usersWithBadgesSnapshot = await getDocs(usersWithBadgesQuery);

      // Remove rank badges from users who no longer have them
      usersWithBadgesSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        const badges = userData.badges || [];
        const updatedBadges = badges.filter(badge => !Object.values(RANK_BADGES).includes(badge));
        
        if (badges.length !== updatedBadges.length) {
          batch.update(doc(db, 'users', userDoc.id), { badges: updatedBadges });
          usersToUpdate.add(userDoc.id);
        }
      });

      // Add rank badges to top 3 users
      const top3Users = rankedUsers.slice(0, 3);
      await Promise.all(top3Users.map(async (user, index) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.id);
        const rankBadge = RANK_BADGES[index];
        
        if (usersToUpdate.has(user.id)) {
          // User document will be updated, add the new badge to their updated badges
          const existingBadges = usersWithBadgesSnapshot.docs
            .find(doc => doc.id === user.id)
            ?.data()
            ?.badges || [];
          const updatedBadges = [...new Set([...existingBadges.filter(b => !Object.values(RANK_BADGES).includes(b)), rankBadge])];
          batch.update(userRef, { badges: updatedBadges });
        } else {
          // Get the current user data to preserve existing badges
          const userDoc = await getDoc(userRef);
          const currentBadges = userDoc.exists() ? (userDoc.data().badges || []) : [];
          
          // Filter out any existing rank badges and add the new one
          const updatedBadges = [
            ...currentBadges.filter(badge => !Object.values(RANK_BADGES).includes(badge)),
            rankBadge
          ];
          
          batch.update(userRef, {
            badges: updatedBadges
          });
        }
      }));

      await batch.commit();
      console.log('Successfully updated user badges');
    } catch (err) {
      console.error('Error updating badges:', err);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching leaderboard data...');
      
      // Get all non-admin users (students)
      const usersQuery = query(
        collection(db, 'users'),
        where('isAdmin', '==', false)
      );
      const usersSnapshot = await getDocs(usersQuery);
      console.log('Found users:', usersSnapshot.size);
      
      // Process user data and calculate rankings
      const leaderboard = usersSnapshot.docs
        .map(doc => {
          const userData = doc.data();
          console.log('User data:', userData);

          // Calculate total points from projectProgress
          const projectProgress = userData.projectProgress || {};
          const totalPoints = Object.values(projectProgress).reduce((sum, progress) => sum + (progress || 0), 0);
          
          return {
            id: doc.id,
            displayName: userData.displayName || 'Anonymous User',
            completedProjects: (userData.completedProjects || []).length,
            totalPoints: totalPoints,
            badges: userData.badges || []
          };
        })
        .sort((a, b) => {
          // Sort by completed projects first
          if (b.completedProjects !== a.completedProjects) {
            return b.completedProjects - a.completedProjects;
          }
          // If equal, sort by total points
          return b.totalPoints - a.totalPoints;
        })
        .slice(0, 10); // Only show top 10

      // Update badges for top 3 users
      await updateUserBadges(leaderboard);

      console.log('Final leaderboard data:', leaderboard);
      setLeaderboardData(leaderboard);
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Failed to fetch leaderboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'first_place': return '🥇';
      case 'second_place': return '🥈';
      case 'third_place': return '🥉';
      default: return '';
    }
  };

  const getRankBadge = (badges) => {
    return badges.find(badge => ['first_place', 'second_place', 'third_place'].includes(badge));
  };

  const getOtherBadges = (badges) => {
    return badges.filter(badge => !['first_place', 'second_place', 'third_place'].includes(badge));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-full">
          <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="px-8 py-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200">
              <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">Student Leaderboard</h2>
                <p className="text-blue-100 mt-2">Top performers based on completed projects and total points</p>
              </div>

              <div className="divide-y divide-slate-200">
                <div className="px-8 py-4 flex items-center gap-4 bg-slate-50 font-semibold text-slate-700">
                  <div className="w-16 text-center">#</div>
                  <div className="flex-1">Student</div>
                  <div className="flex items-center gap-12">
                    <div className="w-32 text-center">Projects</div>
                    <div className="w-32 text-center">Total Points</div>
                  </div>
                </div>

                <div className="p-12 text-center text-slate-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading leaderboard...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-full">
          <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="px-8 py-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200">
              <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">Student Leaderboard</h2>
                <p className="text-blue-100 mt-2">Top performers based on completed projects and total points</p>
              </div>

              <div className="divide-y divide-slate-200">
                <div className="px-8 py-4 flex items-center gap-4 bg-slate-50 font-semibold text-slate-700">
                  <div className="w-16 text-center">#</div>
                  <div className="flex-1">Student</div>
                  <div className="flex items-center gap-12">
                    <div className="w-32 text-center">Projects</div>
                    <div className="w-32 text-center">Total Points</div>
                  </div>
                </div>

                <div className="p-12 text-center text-slate-600">
                  <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-lg font-medium">{error}</p>
                  <button 
                    onClick={fetchLeaderboardData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-full">
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="px-8 py-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">Student Leaderboard</h2>
              <p className="text-blue-100 mt-2">Top performers based on completed projects and total points</p>
            </div>

            <div className="divide-y divide-slate-200">
              <div className="px-8 py-4 flex items-center gap-4 bg-slate-50 font-semibold text-slate-700">
                <div className="w-16 text-center">Rank</div>
                <div className="flex-1">Student</div>
                <div className="flex items-center gap-12">
                  <div className="w-32 text-center">Projects</div>
                  <div className="w-32 text-center">Total Points</div>
                </div>
              </div>

              {leaderboardData.map((user, index) => (
                <div
                  key={user.id}
                  className={`px-8 py-4 ${
                    index < 3 ? 'bg-gradient-to-r from-blue-50 to-blue-50/30' : ''
                  } hover:bg-slate-50 transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Number */}
                    <div className="w-16 flex justify-center">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400' :
                        index === 1 ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-400' :
                        index === 2 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 text-lg">
                          {user.displayName}
                        </h3>
                        {/* Rank Badge (if in top 3) */}
                        {getRankBadge(user.badges) && (
                          <span className="text-2xl">
                            {getBadgeIcon(getRankBadge(user.badges))}
                          </span>
                        )}
                      </div>
                      {/* Other Badges */}
                      {getOtherBadges(user.badges).length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {getOtherBadges(user.badges).map((badge, badgeIndex) => (
                            <span
                              key={badgeIndex}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-12">
                      <div className="w-32 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {user.completedProjects}
                        </div>
                      </div>

                      <div className="w-32 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {user.totalPoints}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {leaderboardData.length === 0 && (
                <div className="p-12 text-center text-slate-600">
                  <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-lg font-medium">No data available for the leaderboard yet.</p>
                  <p className="text-sm text-slate-500 mt-1">Complete some projects to see your ranking!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
