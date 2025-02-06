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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Projects</h2>
        <button
          onClick={onNewProject}
          className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 active:scale-95"
        >
          Add New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
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
          className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
        />
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
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
          className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
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
            className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-slate-800">{project.title}</h3>
                <p className="text-slate-600 mt-1">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    project.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                  </span>
                  
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                    {categories.find(c => c.id === project.category)?.name || project.category}
                  </span>

                  {project.tags?.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditProject(project)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full transition-colors duration-200 active:scale-95"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No projects found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
} 