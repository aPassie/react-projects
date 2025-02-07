import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { IoMdArrowBack, IoMdTime, IoMdCode, IoMdTrophy } from 'react-icons/io';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export function ProjectDetails() {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const { projectId } = useParams();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const docRef = doc(db, 'projects', projectId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProject({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>Project not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Animated Background - matching dashboard */}
            <div className="fixed inset-0 z-0">
                {/* Gradient Orbs */}
                <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-6000" />
                
                {/* Stars */}
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
                {/* Header */}
                <header className="bg-transparent">
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />
                    
                    <div className="container mx-auto relative">
                        <div className="px-4 py-6 backdrop-blur-sm bg-black/20">
                            <Link 
                                to="/dashboard"
                                className="inline-flex items-center gap-2 text-neutral-400 hover:text-cyan-400 transition-colors duration-300 group"
                            >
                                <IoMdArrowBack className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8 relative">
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                    
                    <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                        {/* Project Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                                {project.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 items-center text-neutral-400">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    project.difficulty.toLowerCase() === 'beginner'
                                        ? 'bg-green-500/10 text-green-400'
                                        : project.difficulty.toLowerCase() === 'intermediate'
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : 'bg-red-500/10 text-red-400'
                                }`}>
                                    {project.difficulty}
                                </span>
                                <div className="flex items-center gap-2 hover:text-cyan-400 transition-colors duration-300">
                                    <IoMdTime className="w-5 h-5" />
                                    <span>{project.estimatedTime} hours</span>
                                </div>
                                <div className="flex items-center gap-2 hover:text-cyan-400 transition-colors duration-300">
                                    <IoMdCode className="w-5 h-5" />
                                    <span>{project.techStack?.join(', ')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Description */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 text-white hover:text-cyan-400 transition-colors duration-300">Description</h2>
                            <p className="text-neutral-300 leading-relaxed hover:text-neutral-200 transition-colors duration-300">{project.description}</p>
                        </div>

                        {/* Project Requirements */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 text-white hover:text-cyan-400 transition-colors duration-300">Requirements</h2>
                            <ul className="space-y-3">
                                {project.requirements?.map((req, index) => (
                                    <li key={index} className="flex items-start gap-3 text-neutral-300 hover:text-neutral-200 transition-colors duration-300">
                                        <span className="mt-1 w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button 
                                className="px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-sm flex items-center gap-2"
                                data-tooltip-id="project-tooltip"
                                data-tooltip-content="Start working on this project"
                            >
                                <IoMdCode className="w-5 h-5" />
                                Start Project
                            </button>
                            <button 
                                className="px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-sm flex items-center gap-2"
                                data-tooltip-id="project-tooltip"
                                data-tooltip-content="View solutions from other students"
                            >
                                <IoMdTrophy className="w-5 h-5" />
                                View Solutions
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <Tooltip id="project-tooltip" className="z-50" />
        </div>
    );
} 