import { useState, useEffect } from 'react';
import { projectTemplates } from '../../templates/projectTemplates';

export function ProjectTemplates({ onUseTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeTemplates();
  }, []);

  const initializeTemplates = async () => {
    try {
      setLoading(true);
      // Use the predefined templates directly
      setTemplates(projectTemplates.map((template, index) => ({
        ...template,
        id: `template-${index}`,
      })));
    } catch (err) {
      setError('Failed to initialize templates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template) => {
    try {
      // Create project data from template, ensuring all fields are properly initialized
      const projectData = {
        title: '',  // Leave empty for user to fill
        description: '',  // Leave empty for user to fill
        difficulty: template.difficulty || 'beginner',
        category: template.category || 'frontend',
        estimatedHours: template.estimatedHours || 0,
        tags: [], // Initialize as empty array, will be filled by user
        steps: template.steps || [],
        prerequisites: [],
        learningObjectives: [],
        resources: [],
        content: {
          description: '',
          codeSnippets: {},
          images: [],
          videos: [],
          resources: []
        },
        status: 'draft'
      };

      // Pass the project data to parent
      onUseTemplate(projectData);
    } catch (err) {
      setError('Failed to use template: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Project Templates</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
          >
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{template.title}</h3>
              <p className="text-slate-600">{template.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                {template.estimatedHours} hours
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {template.tags?.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleUseTemplate(template)}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Use Template</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">No templates available.</div>
          </div>
        )}
      </div>
    </div>
  );
}