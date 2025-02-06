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
    <div className="p-0"> {/* Reduced padding */}
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-3 mb-6 border-b border-slate-200 pb-4">
        {[
          { id: 'list', label: 'Project List' },
          { id: 'form', label: 'Add/Edit Project' },
          { id: 'templates', label: 'Templates' },
          { id: 'import-export', label: 'Import/Export' },
          { id: 'stats', label: 'Statistics' }
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`px-6 py-3 rounded-full  transition-colors duration-200 font-medium ${activeView === view.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm ">
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