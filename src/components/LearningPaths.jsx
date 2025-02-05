import { useState } from 'react';
import { projects } from '../data/projects';

export function LearningPaths({ onSelectProject, completedProjects }) {
  const [expandedPath, setExpandedPath] = useState('Beginner');
  
  const paths = {
    Beginner: projects.filter(project => project.difficulty === 'Beginner'),
    Intermediate: projects.filter(project => project.difficulty === 'Intermediate'),
    Advanced: projects.filter(project => project.difficulty === 'Advanced'),
  };

  const getPathProgress = (pathProjects) => {
    if (!pathProjects.length) return 0;
    const completed = pathProjects.filter(project => 
      completedProjects.includes(project.id)
    ).length;
    return Math.round((completed / pathProjects.length) * 100);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {Object.entries(paths).map(([level, pathProjects]) => {
        const progress = getPathProgress(pathProjects);
        
        return (
          <div 
            key={level} 
            className={`bg-neutral-800 rounded-lg p-6 transition-all duration-300
              ${expandedPath === level ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-500/50'}`}
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedPath(level)}
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">{level} Path</h2>
                <p className="text-neutral-400">
                  {pathProjects.length} Projects • {progress}% Complete
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-neutral-700 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-2xl">
                  {expandedPath === level ? '↓' : '→'}
                </span>
              </div>
            </div>

            {expandedPath === level && (
              <div className="mt-6 space-y-4">
                {pathProjects.map((project, index) => {
                  const isCompleted = completedProjects.includes(project.id);
                  const isLocked = index > 0 && !completedProjects.includes(pathProjects[index - 1].id);

                  return (
                    <div 
                      key={project.id}
                      className={`flex justify-between items-center p-4 rounded-lg
                        ${isCompleted ? 'bg-green-900/20' : 'bg-neutral-700/50'}
                        ${isLocked ? 'opacity-50' : 'hover:bg-neutral-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {isCompleted ? '✅' : isLocked ? '🔒' : '📝'}
                        </span>
                        <div>
                          <h3 className="font-medium">{project.title}</h3>
                          <p className="text-sm text-neutral-400">{project.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLocked) onSelectProject(project);
                        }}
                        disabled={isLocked}
                        className={`px-4 py-2 rounded
                          ${isCompleted 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : isLocked
                            ? 'bg-neutral-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'} 
                          transition-colors`}
                      >
                        {isCompleted ? 'Review' : isLocked ? 'Locked' : 'Start'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}