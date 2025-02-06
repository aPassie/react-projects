import { useState, useEffect } from 'react';
import { db, collection, getDocs, deleteDoc, doc, query, orderBy } from '../../config/firebase';

export function ProjectList({ onNewProject, onEditProject, categories, difficultyLevels }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(projectsQuery);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to fetch projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      await fetchProjects();
    } catch (err) {
      setError('Failed to delete project: ' + err.message);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || project.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Projects</h2>
        <button
          onClick={onNewProject}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Add New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="px-4 py-2 bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Difficulties</option>
          {difficultyLevels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            className="bg-neutral-800 p-6 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{project.title}</h3>
                <p className="text-neutral-400 mt-1">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    project.difficulty === 'beginner' ? 'bg-green-500/10 text-green-500' :
                    project.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                  </span>
                  
                  <span className="px-2 py-1 bg-neutral-700 rounded text-sm">
                    {categories.find(c => c.id === project.category)?.name || project.category}
                  </span>

                  {project.tags?.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-neutral-700 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditProject(project)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-8 text-neutral-400">
            No projects found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
} 