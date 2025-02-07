import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, collection, getDocs, query, orderBy, doc, updateDoc } from '../../config/firebase';
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
        completedProjects: 0,
        totalTime: 0,
        currentStreak: 0,
        rank: 0
    });
    const [leaderboardRank, setLeaderboardRank] = useState({ rank: 0, totalUsers: 0 });

    useEffect(() => {
        fetchProjects();
        fetchUserName();
        fetchProjectsAndProgress();
        fetchUserStats();
        fetchUserRank();
    }, []);

    const fetchUserName = async () => {
        if (currentUser) {
            try {
                const userDocSnap = await getDocs(query(collection(db, "users")));
                if (userDocSnap.docs.length > 0) {
                    const userData = userDocSnap.docs[0].data();
                    setUserName(userData.name || 'User');
                }
            } catch (err) {
                console.error("Failed to fetch user's name:", err);
                setUserName('User');
            }
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(projectsQuery);
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectsAndProgress = async () => {
        try {
            // Fetch all projects
            const projectsSnapshot = await getDocs(collection(db, 'projects'));
            const projectsData = projectsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch user's progress for all projects
            const progressSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'progress'));
            const progressData = {};
            
            progressSnapshot.docs.forEach(doc => {
                const { completedSteps } = doc.data();
                const project = projectsData.find(p => p.id === doc.id);
                progressData[doc.id] = calculateProjectProgress(project, completedSteps);
            });

            setProjects(projectsData);
            setProgress(progressData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchUserStats = async () => {
        try {
            // Fetch user stats from Firebase (mock data for now)
            setStats({
                completedProjects: 5,
                totalTime: 24,
                currentStreak: 3,
                rank: 42
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const fetchUserRank = async () => {
        try {
            const usersRef = collection(db, 'users');
            const usersSnapshot = await getDocs(usersRef);
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort users by completed projects (you can modify this based on your ranking criteria)
            const sortedUsers = users.sort((a, b) => 
                (b.completedProjects || 0) - (a.completedProjects || 0)
            );

            const userRank = sortedUsers.findIndex(user => user.id === currentUser.uid) + 1;
            setLeaderboardRank({
                rank: userRank,
                totalUsers: users.length
            });
        } catch (error) {
            console.error('Error fetching rank:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            setError('Failed to sign out: ' + error.message);
        }
    };

    const filteredProjects = projects.filter(project =>
        (filter === 'All' || project.difficulty.toLowerCase() === filter.toLowerCase()) &&
        project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { 
                                title: 'Hours Spent', 
                                value: `${stats.totalTime}h`, 
                                icon: <IoMdTime className="w-6 h-6 text-blue-400" />,
                                bgColor: 'bg-blue-500/10',
                                textColor: 'text-blue-400',
                                tooltip: 'Total time spent learning on the platform'
                            },
                            { 
                                title: 'Projects Done', 
                                value: stats.completedProjects, 
                                icon: <IoMdCheckmark className="w-6 h-6 text-green-400" />,
                                bgColor: 'bg-green-500/10',
                                textColor: 'text-green-400',
                                tooltip: 'Number of projects you have successfully completed'
                            },
                            {
                                title: 'Current Streak',
                                value: `${stats.currentStreak} days`,
                                icon: <IoMdRocket className="w-6 h-6 text-orange-400" />,
                                bgColor: 'bg-orange-500/10',
                                textColor: 'text-orange-400',
                                tooltip: 'Your consecutive days of learning'
                            },
                            {
                                title: 'Leaderboard Rank',
                                value: leaderboardRank.rank > 0 ? `#${leaderboardRank.rank} of ${leaderboardRank.totalUsers}` : 'Loading...',
                                icon: <IoMdTrophy className="w-6 h-6 text-purple-400" />,
                                bgColor: 'bg-purple-500/10',
                                textColor: 'text-purple-400',
                                link: '/leaderboard',
                                tooltip: 'Click to view the full leaderboard'
                            }
                        ].map((stat, index) => (
                            stat.link ? (
                                <Link
                                    key={index}
                                    to={stat.link}
                                    className="group bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 transform hover:scale-105 transition-all duration-300 cursor-pointer hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                                    data-tooltip-id="stat-tooltip"
                                    data-tooltip-content={stat.tooltip}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-neutral-400 text-sm group-hover:text-purple-400 transition-colors">{stat.title}</p>
                                            <p className="text-xl font-bold text-white mt-1 group-hover:text-purple-300 transition-colors">{stat.value}</p>
                                        </div>
                                        <div className={`${stat.bgColor} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div 
                                    key={index} 
                                    className="group bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 transform hover:scale-105 transition-all duration-300"
                                    data-tooltip-id="stat-tooltip"
                                    data-tooltip-content={stat.tooltip}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-neutral-400 text-sm group-hover:text-neutral-300 transition-colors">{stat.title}</p>
                                            <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
                                        </div>
                                        <div className={`${stat.bgColor} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Main Content - Projects */}
                    <div className="w-full">
                        {/* Search and Filter */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            {/* Level Selection First */}
                            <div className="md:w-1/3">
                                <div className="flex gap-2">
                                    {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => handleFilterChange(level)}
                                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                                                filter === level
                                                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <div className="group/card relative" key={project.id}>
                                    {/* Wrapper div for even expansion */}
                                    <div className="absolute inset-0 -m-6 transition-all duration-500 group-hover/card:m-0 pointer-events-none" />
                                    
                                    <Link
                                        to={`/project/${project.id}`}
                                        className="relative block bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-6 transition-all duration-500 group-hover/card:scale-110 group-hover/card:shadow-[0_0_30px_rgba(6,182,212,0.15)] cursor-pointer overflow-hidden z-10"
                                    >
                                        {/* Animated Background Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                                        
                                        {/* Glowing Border Effect */}
                                        <div className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover/card:border-cyan-500/20 transition-colors duration-500" />
                                        
                                        {/* Content */}
                                        <div className="relative">
                                            <h3 className="text-xl font-bold mb-2 text-white group-hover/card:text-cyan-400 transition-colors duration-300">
                                                {project.title}
                                            </h3>
                                            <p className="text-neutral-400 mb-4 group-hover/card:text-neutral-300 transition-colors duration-300 line-clamp-2">
                                                {project.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                                                    project.difficulty.toLowerCase() === 'beginner'
                                                        ? 'bg-green-500/10 text-green-400 group-hover/card:bg-green-500/20 group-hover/card:shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                                        : project.difficulty.toLowerCase() === 'intermediate'
                                                        ? 'bg-yellow-500/10 text-yellow-400 group-hover/card:bg-yellow-500/20 group-hover/card:shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                                        : 'bg-red-500/10 text-red-400 group-hover/card:bg-red-500/20 group-hover/card:shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                                }`}>
                                                    {formatDifficulty(project.difficulty)}
                                                </span>
                                                
                                                {/* Arrow indicator */}
                                                <div className="opacity-0 group-hover/card:opacity-100 transform translate-x-2 group-hover/card:translate-x-0 transition-all duration-300">
                                                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
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