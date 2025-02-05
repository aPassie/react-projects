import { useState } from 'react';
import { projects } from '../data/projects';

export function ProjectList({ completedProjects, projectProgress, onProjectSelect }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isProjectLocked = (projectId) => {
    if (projectId === 'project1') return false;
    const previousProject = `project${Number(projectId.slice(7)) - 1}`;
    return !completedProjects.includes(previousProject);
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.difficulty.toLowerCase() === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-500' : 'bg-neutral-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('beginner')}
            className={`px-4 py-2 rounded-lg ${filter === 'beginner' ? 'bg-blue-500' : 'bg-neutral-700'}`}
          >
            Beginner
          </button>
          <button
            onClick={() => setFilter('intermediate')}
            className={`px-4 py-2 rounded-lg ${filter === 'intermediate' ? 'bg-green-500' : 'bg-neutral-700'}`}
          >
            Intermediate
          </button>
          <button
            onClick={() => setFilter('advanced')}
            className={`px-4 py-2 rounded-lg ${filter === 'advanced' ? 'bg-purple-500' : 'bg-neutral-700'}`}
          >
            Advanced
          </button>
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-lg bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className={`bg-neutral-800 rounded-lg p-6 transition-all duration-300 
              ${isProjectLocked(project.id) 
                ? 'opacity-50 cursor-not-allowed filter blur-sm' 
                : 'hover:transform hover:scale-105 cursor-pointer'}`}
            onClick={() => !isProjectLocked(project.id) && onProjectSelect(project)}
          >
            <div className="flex justify-between items-center mb-4">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full
                ${project.difficulty === 'Beginner' ? 'bg-blue-600' :
                  project.difficulty === 'Intermediate' ? 'bg-green-600' : 'bg-purple-600'}`}>
                {project.difficulty}
              </span>
              {isProjectLocked(project.id) ? (
                <span className="text-neutral-400">
                  🔒 Locked
                </span>
              ) : (
                <span className="text-neutral-400">
                  {projectProgress[project.id] ? 
                    `${Math.round((projectProgress[project.id] / project.steps.length) * 100)}% Complete` : 
                    'Not Started'}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
            <p className="text-neutral-300 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="bg-neutral-700 px-2 py-1 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}