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
    <div className="p-6">
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-3 mb-8 border-b border-neutral-700 pb-4">
        {[
          { id: 'list', label: '📋 Project List' },
          { id: 'form', label: '✏️ Add/Edit Project' },
          { id: 'templates', label: '📑 Templates' },
          { id: 'import-export', label: '💾 Import/Export' },
          { id: 'stats', label: '📊 Statistics' }
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeView === view.id
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700/50 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-neutral-900 rounded-lg">
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