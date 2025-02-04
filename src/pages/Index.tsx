import React, { useEffect, useState } from 'react';
import DifficultySection from '@/components/DifficultySection';
import { ThemeToggle } from '@/components/ThemeToggle';
import ProgressTracker from '@/components/ProgressTracker';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
}

const PROJECTS_DATA: { [key: string]: Project[] } = {
  beginner: [
    {
      id: 'todo-app',
      title: 'Todo App',
      description: 'Build a simple todo application to learn React basics, components, and state management.',
      difficulty: 'beginner',
      duration: '2-3 hours',
    },
    {
      id: 'counter-app',
      title: 'Counter App',
      description: 'Create a counter application to understand React state and events.',
      difficulty: 'beginner',
      duration: '1-2 hours',
    },
    {
      id: 'weather-widget',
      title: 'Weather Widget',
      description: 'Build a weather widget to learn about props and basic API integration.',
      difficulty: 'beginner',
      duration: '2-3 hours',
    },
  ],
  intermediate: [
    {
      id: 'shopping-cart',
      title: 'Shopping Cart',
      description: 'Create a shopping cart to learn about complex state management and context.',
      difficulty: 'intermediate',
      duration: '4-5 hours',
    },
    {
      id: 'movie-search',
      title: 'Movie Search',
      description: 'Build a movie search app to master API integration and custom hooks.',
      difficulty: 'intermediate',
      duration: '3-4 hours',
    },
    {
      id: 'task-manager',
      title: 'Task Manager',
      description: 'Develop a task manager to understand CRUD operations and data persistence.',
      difficulty: 'intermediate',
      duration: '5-6 hours',
    },
  ],
  advanced: [
    {
      id: 'social-media-dashboard',
      title: 'Social Media Dashboard',
      description: 'Create a social media dashboard with real-time updates and complex data visualization.',
      difficulty: 'advanced',
      duration: '8-10 hours',
    },
    {
      id: 'code-editor',
      title: 'Code Editor',
      description: 'Build a code editor with syntax highlighting and file system integration.',
      difficulty: 'advanced',
      duration: '10-12 hours',
    },
    {
      id: 'video-chat',
      title: 'Video Chat App',
      description: 'Develop a video chat application using WebRTC and socket connections.',
      difficulty: 'advanced',
      duration: '12-15 hours',
    },
  ],
};

const Index = () => {
  const { getUserProgress } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [activeLevel, setActiveLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await getUserProgress();
        setUserProgress(progress);
        
        // Count completed projects in each level
        const beginnerCompleted = Object.values(progress?.beginner || {}).filter((p: any) => p.completed).length;
        const intermediateCompleted = Object.values(progress?.intermediate || {}).filter((p: any) => p.completed).length;
        const advancedCompleted = Object.values(progress?.advanced || {}).filter((p: any) => p.completed).length;
        
        console.log('Completed projects:', {
          beginner: beginnerCompleted,
          intermediate: intermediateCompleted,
          advanced: advancedCompleted
        });

        // Determine active level based on completion
        if (beginnerCompleted >= 3) {
          if (intermediateCompleted >= 3) {
            setActiveLevel('advanced');
          } else {
            setActiveLevel('intermediate');
          }
        } else {
          setActiveLevel('beginner');
        }

        console.log('Setting active level to:', activeLevel);
      } catch (error) {
        console.error('Error fetching progress:', error);
        setActiveLevel('beginner');
      }
    };

    fetchProgress();
    // Set up interval to check for updates
    const intervalId = setInterval(fetchProgress, 2000);
    return () => clearInterval(intervalId);
  }, [getUserProgress]);

  const handleProgressUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      <Navbar onSearch={(query) => {
        // Implement search functionality here
        console.log('Searching for:', query);
      }} />
      
      <main className="container py-12">
        {/* Progress Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
          <ProgressTracker 
            level={activeLevel} 
            onProgressUpdate={handleProgressUpdate}
          />
        </section>

        {/* Beginner Section */}
        <DifficultySection
          title="Beginner Projects"
          description="Start your React journey with these fundamental projects. Perfect for beginners learning the basics of React."
          projects={PROJECTS_DATA.beginner}
        />

        {/* Intermediate Section */}
        <DifficultySection
          title="Intermediate Projects"
          description="Level up your React skills with these more complex projects focusing on state management and API integration."
          projects={PROJECTS_DATA.intermediate}
        />

        {/* Advanced Section */}
        <DifficultySection
          title="Advanced Projects"
          description="Challenge yourself with these advanced projects incorporating complex state management and real-time features."
          projects={PROJECTS_DATA.advanced}
        />
      </main>
    </div>
  );
};

export default Index;