import { useState } from 'react';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';
import { ProjectTemplates } from './ProjectTemplates';
import { ProjectImportExport } from './ProjectImportExport';
import { ProjectStats } from './ProjectStats';

export function ProjectManagement() {
  const [activeView, setActiveView] = useState('list'); // list, form, templates, import-export, stats
  const [selectedProject, setSelectedProject] = useState(null);

  const CATEGORIES = [
    { id: 'frontend', name: 'Frontend Development' },
    { id: 'backend', name: 'Backend Development' },
    { id: 'fullstack', name: 'Full Stack' },
    { id: 'mobile', name: 'Mobile Development' },
    { id: 'database', name: 'Database' },
    { id: 'api', name: 'API Development' }
  ];

  const DIFFICULTY_LEVELS = [
    { id: 'beginner', name: 'Beginner', color: 'green' },
    { id: 'intermediate', name: 'Intermediate', color: 'blue' },
    { id: 'advanced', name: 'Advanced', color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-neutral-700">
        <button
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 -mb-px ${
            activeView === 'list'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveView('templates')}
          className={`px-4 py-2 -mb-px ${
            activeView === 'templates'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveView('import-export')}
          className={`px-4 py-2 -mb-px ${
            activeView === 'import-export'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Import/Export
        </button>
        <button
          onClick={() => setActiveView('stats')}
          className={`px-4 py-2 -mb-px ${
            activeView === 'stats'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Content Area */}
      <div>
        {activeView === 'list' && (
          <ProjectList
            onNewProject={() => {
              setSelectedProject(null);
              setActiveView('form');
            }}
            onEditProject={(project) => {
              setSelectedProject(project);
              setActiveView('form');
            }}
            categories={CATEGORIES}
            difficultyLevels={DIFFICULTY_LEVELS}
          />
        )}

        {activeView === 'form' && (
          <ProjectForm
            project={selectedProject}
            onComplete={() => {
              setSelectedProject(null);
              setActiveView('list');
            }}
            categories={CATEGORIES}
            difficultyLevels={DIFFICULTY_LEVELS}
          />
        )}

        {activeView === 'templates' && (
          <ProjectTemplates
            onUseTemplate={(template) => {
              setSelectedProject(template);
              setActiveView('form');
            }}
          />
        )}

        {activeView === 'import-export' && (
          <ProjectImportExport />
        )}

        {activeView === 'stats' && (
          <ProjectStats />
        )}
      </div>
    </div>
  );
} 