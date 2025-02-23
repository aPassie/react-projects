import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { calculateProjectProgress } from '../../utils/progressCalculator';
import { 
    IoMdTrophy, IoMdTime, IoMdCheckmark, IoMdTrendingUp, 
    IoMdStar, IoMdRocket, IoMdBook, IoMdPeople 
} from 'react-icons/io';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export function StudentDashboard() {
    const [error, setError] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [progress, setProgress] = useState({});
    const [stats, setStats] = useState({
        hoursSpent: 0,
        projectsDone: 0,
        currentStreak: 0,
        leaderboardRank: 0
    });
    const [leaderboardRank, setLeaderboardRank] = useState({ rank: 0, totalUsers: 0 });
    const [projectProgress, setProjectProgress] = useState({});

    const difficultyOrder = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch projects
                const { data: projectsData, error: projectsError } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (projectsError) throw projectsError;

                // Fetch user's progress for all projects
                const { data: progressData, error: progressError } = await supabase
                    .from('project_progress')
                    .select('*')
                    .eq('user_id', currentUser.id);

                if (progressError) throw progressError;

                // Create progress map
                const progressMap = {};
                progressData?.forEach(item => {
                    progressMap[item.project_id] = item.progress;
                });

                setProjects(projectsData);
                setProjectProgress(progressMap);

                // Fetch user stats
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (userError) throw userError;

                setStats({
                    hoursSpent: userData.total_hours || 0,
                    projectsDone: userData.completed_projects?.length || 0,
                    currentStreak: userData.current_streak || 0,
                    points: userData.total_points || 0
                });

                // Calculate leaderboard rank
                const { data: users, error: rankError } = await supabase
                    .from('users')
                    .select('id, total_points')
                    .order('total_points', { ascending: false });

                if (rankError) throw rankError;

                const userRank = users.findIndex(user => user.id === currentUser.id) + 1;
                setLeaderboardRank({
                    rank: userRank,
                    totalUsers: users.length
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            setError('Failed to sign out: ' + error.message);
        }
    };

    // Filter and search logic
    const filteredProjects = projects.filter(project => {
        const matchesFilter = filter === 'All' || project.difficulty === filter;
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const formatDifficulty = (difficulty) => {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    };

    const handleRankClick = () => {
        navigate('/leaderboard');
    };

    const calculateProgress = (projectId) => {
        return projectProgress[projectId] || 0;
    };

    const isLevelAccessible = (difficulty, projectProgress) => {
        // If it's beginner, always accessible
        if (difficulty.toLowerCase() === 'beginner') return true;

        // Get all projects of the previous difficulty level
        const previousDifficulty = difficulty.toLowerCase() === 'advanced' ? 'intermediate' : 'beginner';
        const previousLevelProjects = projects.filter(p => 
            p.difficulty?.toLowerCase() === previousDifficulty
        );

        // Check if all previous level projects are completed
        return previousLevelProjects.every(project => 
            (projectProgress[project.id] || 0) === 100
        );
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
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                {/* Subtle Gradient Orbs */}
                <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-6000" />
                
                {/* Moving Stars */}
                <div className="stars-container">
                    {[...Array(100)].map((_, i) => (
                        <div 
                            key={i} 
                            className="star"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 8}s`,
                                width: `${Math.random() * 3 + 1}px`,
                                height: `${Math.random() * 3 + 1}px`,
                                opacity: Math.random() * 0.3 + 0.2
                            }}
                        />
                    ))}
                </div>

                {/* Gradient Mesh */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
            </div>

            <div className="relative z-10">
                {/* Header with improved blending */}
                <header className="bg-transparent">
                    {/* Header Gradient Blend */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />
                    
                    <div className="container mx-auto relative">
                        <div className="px-4 py-6 backdrop-blur-sm bg-black/20">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="mb-4 md:mb-0">
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        Welcome, {currentUser?.displayName || 'Student'}!
                                    </h1>
                                    <p className="text-neutral-400">Your Learning Dashboard</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Link
                                        to="/leaderboard"
                                        className="px-6 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-sm flex items-center gap-2"
                                    >
                                        <IoMdTrophy className="w-5 h-5" />
                                        Leaderboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-sm"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content with smooth transition */}
                <main className="container mx-auto px-4 py-8 relative">
                    {/* Top gradient for blending */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 flex flex-col items-center transition-all duration-300 hover:border-[#2B9EFF] hover:shadow-[0_0_35px_rgba(43,158,255,0.35)] hover:scale-105">
                            <h3 className="text-neutral-400 text-base text-center group-hover:text-[#2B9EFF] transition-colors duration-300">
                                Hours Spent
                            </h3>
                            <p className="text-[#2B9EFF] text-4xl font-bold mt-1 text-center">
                                {stats.hoursSpent}hr
                            </p>
                            <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#2B9EFF]/10 text-[#2B9EFF] text-sm rounded-lg whitespace-nowrap border border-[#2B9EFF]/25">
                                Total time spent learning
                            </span>
                        </div>

                        <div className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 flex flex-col items-center transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:scale-105">
                            <h3 className="text-neutral-400 text-base text-center group-hover:text-emerald-500 transition-colors duration-300">
                                Projects Done
                            </h3>
                            <p className="text-emerald-500 text-4xl font-bold mt-1 text-center">
                                {stats.projectsDone || '0'}
                            </p>
                            <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-emerald-500/10 text-emerald-500 text-sm rounded-lg whitespace-nowrap border border-emerald-500/25">
                                Number of completed projects
                            </span>
                        </div>

                        <div className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 flex flex-col items-center transition-all duration-300 hover:border-orange-500 hover:shadow-[0_0_35px_rgba(249,115,22,0.35)] hover:scale-105">
                            <h3 className="text-neutral-400 text-base text-center group-hover:text-orange-500 transition-colors duration-300">
                                Current Streak
                            </h3>
                            <p className="text-orange-500 text-4xl font-bold mt-1 text-center">
                                {stats.currentStreak || '0'}
                            </p>
                            <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-orange-500/10 text-orange-500 text-sm rounded-lg whitespace-nowrap border border-orange-500/25">
                                Days in a row you've been active
                            </span>
                        </div>

                        <div className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 flex flex-col items-center transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)] hover:scale-105">
                            <h3 className="text-neutral-400 text-base text-center group-hover:text-purple-500 transition-colors duration-300">
                                Leaderboard Rank
                            </h3>
                            <p className="text-purple-500 text-4xl font-bold mt-1 text-center">
                                {stats.leaderboardRank || '0'}
                            </p>
                            <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-purple-500/10 text-purple-500 text-sm rounded-lg whitespace-nowrap border border-purple-500/25">
                                Your position on the leaderboard
                            </span>
                        </div>
                    </div>

                    {/* Main Content - Projects */}
                    <div className="w-full">
                        {/* Search and Filter */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            {/* Level Selection First */}
                            <div className="md:w-1/3">
                                <div className="flex gap-2.5">
                                    {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => handleFilterChange(level)}
                                            className={`px-5 py-2.5 rounded-full whitespace-nowrap text-base font-normal transition-all duration-300 transform hover:scale-105 ${
                                                filter === level
                                                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:shadow-[0_0_22px_rgba(6,182,212,0.35)]'
                                                    : 'bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Bar Second */}
                            <div className="md:w-2/3">
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full px-6 py-3 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-cyan-500/30"
                                    data-tooltip-id="search-tooltip"
                                    data-tooltip-content="Search for projects by name or description"
                                />
                            </div>
                        </div>

                        {/* Projects Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProjects.map((project) => (
                                <div className="group/card relative" key={project.id}>
                                    <Link
                                        to={isLevelAccessible(project.difficulty, projectProgress) ? `/project/${project.id}` : '#'}
                                        onClick={(e) => !isLevelAccessible(project.difficulty, projectProgress) && e.preventDefault()}
                                        className={`relative block bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl h-[220px] p-4 
                                        ${isLevelAccessible(project.difficulty, projectProgress) ? 
                                            'transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:scale-105 hover:-translate-y-1 hover:border-cyan-500/20 cursor-pointer' 
                                            : 'opacity-70 cursor-not-allowed pointer-events-none'
                                        }
                                        transform-gpu`}
                                    >
                                        {/* Card Content Container */}
                                        <div className={`h-full relative ${!isLevelAccessible(project.difficulty, projectProgress) ? 'blur-[4px]' : ''}`}>
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`px-3 py-1 rounded-full text-sm ${
                                                    project.difficulty?.toLowerCase() === 'beginner'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : project.difficulty?.toLowerCase() === 'intermediate'
                                                        ? 'bg-yellow-500/10 text-yellow-400'
                                                        : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                    {formatDifficulty(project.difficulty)}
                                                </span>

                                                <span className="text-neutral-400 text-sm">
                                                    {calculateProgress(project.id)}% Complete
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className={`text-xl font-bold mb-2 ${isLevelAccessible(project.difficulty, projectProgress) ? 
                                                'text-white group-hover/card:text-cyan-400 transition-colors duration-300' 
                                                : 'text-white'
                                            }`}>
                                                {project.title}
                                            </h3>

                                            {/* Description */}
                                            <p className={`text-neutral-400 line-clamp-3 text-sm ${
                                                isLevelAccessible(project.difficulty, projectProgress) 
                                                    ? 'group-hover/card:text-neutral-300' 
                                                    : ''
                                            }`}>
                                                {project.description}
                                            </p>

                                            {/* Tags Section - Absolutely positioned at bottom */}
                                            <div className="absolute bottom-0 left-0 right-0">
                                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                                    {project.tags?.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded-full text-sm whitespace-nowrap"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Locked Overlay */}
                                        {!isLevelAccessible(project.difficulty, projectProgress) && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <p className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">
                                                    {project.difficulty.toLowerCase() === 'intermediate' 
                                                        ? 'Complete all Beginner projects to unlock'
                                                        : 'Complete all Intermediate projects to unlock'}
                                                </p>
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Tooltips */}
            <Tooltip id="stat-tooltip" className="z-50" />
            <Tooltip id="search-tooltip" className="z-50" />
        </div>
    );
}