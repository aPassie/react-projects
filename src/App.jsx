import { useState } from 'react';
import { ProjectList } from './components/ProjectList';
import { ProjectSteps } from './components/ProjectSteps';
import { LearningPaths } from './components/LearningPaths';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UserProfile } from './components/UserProfile';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [completedProjects, setCompletedProjects] = useLocalStorage('completedProjects', []);
  const [projectProgress, setProjectProgress] = useLocalStorage('projectProgress', {});
  const [view, setView] = useState('home'); // 'home', 'projects', 'learning', 'profile'

  const handleProjectComplete = (projectId) => {
    if (!completedProjects.includes(projectId)) {
      setCompletedProjects([...completedProjects, projectId]);
      // Reset progress for this project since it's completed
      setProjectProgress(prev => ({
        ...prev,
        [projectId]: 0
      }));
      // Show success message
      toast.success('🎉 Project completed! Next project unlocked!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Return to project list after completion
      setSelectedProject(null);
      setView('projects');
    }
  };

  const updateProgress = (projectId, stepIndex) => {
    setProjectProgress(prev => ({
      ...prev,
      [projectId]: Math.max((prev[projectId] || 0), stepIndex + 1)
    }));
  };

  const renderContent = () => {
    if (selectedProject) {
      return (
        <ProjectSteps
          project={selectedProject}
          progress={projectProgress[selectedProject.id] || 0}
          onBack={() => setSelectedProject(null)}
          onComplete={handleProjectComplete}
          onProgressUpdate={(stepIndex) => updateProgress(selectedProject.id, stepIndex)}
        />
      );
    }

    switch (view) {
      case 'home':
        return (
          <div className="text-center py-20 px-4">
            <h1 className="text-5xl font-bold mb-8 animate-fade-in">
              Learn React Through Projects
            </h1>
            <p className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto">
              Master React with hands-on experience. Start with beginner-friendly projects
              and progress to advanced applications.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => setView('projects')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Start Learning
              </button>
              <button
                onClick={() => setView('learning')}
                className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                View Learning Paths
              </button>
            </div>
          </div>
        );
      case 'projects':
        return (
          <ProjectList
            completedProjects={completedProjects}
            projectProgress={projectProgress}
            onProjectSelect={setSelectedProject}
          />
        );
      case 'learning':
        return (
          <LearningPaths onSelectProject={setSelectedProject} />
        );
      case 'profile':
        return (
          <UserProfile
            completedProjects={completedProjects}
            projectProgress={projectProgress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      <Header onNavigate={setView} currentView={view} />

      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderContent()}
      </main>

      <Footer />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={3000}
      />
    </div>
  );
}

export default App;
