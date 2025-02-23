import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
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
      // Get all users who currently have rank badges
      const { data: usersWithBadges, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .contains('badges', Object.values(RANK_BADGES));

      if (fetchError) throw fetchError;

      // Remove rank badges from users who no longer have them
      for (const user of usersWithBadges) {
        const badges = user.badges || [];
        const updatedBadges = badges.filter(badge => !Object.values(RANK_BADGES).includes(badge));
        
        if (badges.length !== updatedBadges.length) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ badges: updatedBadges })
            .eq('id', user.id);
          
          if (updateError) throw updateError;
        }
      }

      // Add rank badges to top 3 users
      const top3Users = rankedUsers.slice(0, 3);
      for (const [index, user] of top3Users.entries()) {
        if (!user) continue;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('badges')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        const currentBadges = userData?.badges || [];
        const newBadge = RANK_BADGES[index];
        
        if (!currentBadges.includes(newBadge)) {
          const { error: updateError } = await supabase
            .from('users')
            .update({
              badges: [...currentBadges, newBadge]
            })
            .eq('id', user.id);

          if (updateError) throw updateError;
        }
      }
    } catch (error) {
      console.error('Error updating badges:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError('');

        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .order('total_points', { ascending: false });

        if (error) throw error;

        setLeaderboardData(users);
        await updateUserBadges(users);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
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
      <div className="min-h-screen bg-black">
        {/* Background Animation */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_10s_ease-in-out_infinite]"></div>
          <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_12s_ease-in-out_infinite_2s]"></div>
          <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_14s_ease-in-out_infinite_4s]"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-full">
          <div className="px-8 py-4">
            <button
              onClick={handleBack}
              className="flex items-center text-purple-400 hover:text-purple-300 transition-colors group"
            >
              <svg 
                className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="px-8 py-6">
            <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl">
              <div className="p-8 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">Student Leaderboard</h2>
                <p className="text-neutral-400 mt-2">Top performers based on completed projects and total points</p>
              </div>

              <div className="divide-y divide-neutral-800/0">
                <div className="px-8 py-4 mx-4 my-2 flex items-center gap-4 bg-neutral-900/50 font-semibold text-neutral-400 rounded-xl backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <div className="w-16 text-center">Rank</div>
                  <div className="flex-1">Student</div>
                  <div className="flex items-center gap-12">
                    <div className="w-32 text-center">Projects</div>
                    <div className="w-32 text-center">Total Points</div>
                  </div>
                </div>

                <div className="p-12 text-center text-neutral-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
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
      <div className="min-h-screen bg-black">
        {/* Background Animation */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_10s_ease-in-out_infinite]"></div>
          <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_12s_ease-in-out_infinite_2s]"></div>
          <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_14s_ease-in-out_infinite_4s]"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-full">
          <div className="px-8 py-4">
            <button
              onClick={handleBack}
              className="flex items-center text-purple-400 hover:text-purple-300 transition-colors group"
            >
              <svg 
                className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="px-8 py-6">
            <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl">
              <div className="p-8 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white">Student Leaderboard</h2>
                <p className="text-neutral-400 mt-2">Top performers based on completed projects and total points</p>
              </div>

              <div className="divide-y divide-neutral-800/0">
                <div className="px-8 py-4 mx-4 my-2 flex items-center gap-4 bg-neutral-900/50 font-semibold text-neutral-400 rounded-xl backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <div className="w-16 text-center">Rank</div>
                  <div className="flex-1">Student</div>
                  <div className="flex items-center gap-12">
                    <div className="w-32 text-center">Projects</div>
                    <div className="w-32 text-center">Total Points</div>
                  </div>
                </div>

                <div className="p-12 text-center text-neutral-400">
                  <svg className="w-16 h-16 mx-auto text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-lg font-medium">{error}</p>
                  <button 
                    onClick={() => {
                      // Implement the logic to fetch leaderboard data again
                    }}
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
    <div className="min-h-screen bg-black">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_10s_ease-in-out_infinite]"></div>
        <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_12s_ease-in-out_infinite_2s]"></div>
        <div className="absolute w-full h-full bg-[url('/stars.svg')] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] animate-[twinkle_14s_ease-in-out_infinite_4s]"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-full">
        <div className="px-8 py-4">
          <button
            onClick={handleBack}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors group"
          >
            <svg 
              className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="px-8 py-6">
          {/* Title Section - adjusted margin to match table items */}
          <div className="mb-8 mx-4">
            <h2 className="text-2xl font-bold text-white">Student Leaderboard</h2>
            <p className="text-neutral-400 mt-2">Top performers based on completed projects and total points</p>
          </div>

          {/* Header Row */}
          <div className="px-8 py-4 mx-4 my-2 flex items-center gap-4 bg-neutral-900/50 font-semibold text-neutral-400 rounded-xl backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
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
              className={`px-8 py-4 mx-4 my-2 rounded-xl ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-neutral-900/90 border-yellow-500/20' 
                  : index === 1
                  ? 'bg-gradient-to-r from-neutral-400/20 via-neutral-300/10 to-neutral-900/90 border-neutral-400/20'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-700/20 via-amber-700/10 to-neutral-900/90 border-amber-700/20'
                  : 'bg-neutral-900/90'
              } hover:bg-neutral-800/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/50 ${
                index === 0 
                  ? 'hover:shadow-[0_8px_30px_rgba(234,179,8,0.15)]'
                  : index === 1
                  ? 'hover:shadow-[0_8px_30px_rgba(163,163,163,0.15)]'
                  : index === 2
                  ? 'hover:shadow-[0_8px_30px_rgba(180,83,9,0.15)]'
                  : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Number */}
                <div className="w-16 flex justify-center">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-500 ring-2 ring-yellow-500/50' :
                    index === 1 ? 'bg-neutral-500/20 text-neutral-400 ring-2 ring-neutral-500/50' :
                    index === 2 ? 'bg-amber-500/20 text-amber-500 ring-2 ring-amber-500/50' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-lg">
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
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400"
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
                    <div className="text-2xl font-bold text-cyan-500">
                      {user.completedProjects}
                    </div>
                  </div>

                  <div className="w-32 text-center">
                    <div className="text-2xl font-bold text-emerald-500">
                      {user.totalPoints}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {leaderboardData.length === 0 && (
            <div className="p-12 text-center text-neutral-400">
              <svg className="w-16 h-16 mx-auto text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-lg font-medium">No data available for the leaderboard yet.</p>
              <p className="text-sm text-neutral-500 mt-1">Complete some projects to see your ranking!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
