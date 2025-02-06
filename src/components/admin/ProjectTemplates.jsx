import { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, query, where } from '../../config/firebase';

export function ProjectTemplates({ onUseTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const templatesQuery = query(collection(db, 'projectTemplates'));
      const snapshot = await getDocs(templatesQuery);
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(templatesData);
    } catch (err) {
      setError('Failed to fetch templates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAsTemplate = async (project) => {
    try {
      await addDoc(collection(db, 'projectTemplates'), {
        ...project,
        isTemplate: true,
        createdAt: new Date().toISOString()
      });
      await fetchTemplates();
    } catch (err) {
      setError('Failed to save template: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Project Templates</h2>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-neutral-800 p-6 rounded-lg space-y-4"
          >
            <div>
              <h3 className="text-lg font-medium">{template.title}</h3>
              <p className="text-neutral-400 text-sm mt-1">{template.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {template.tags?.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-neutral-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className={`px-2 py-1 rounded text-sm ${
                template.difficulty === 'beginner' ? 'bg-green-500/10 text-green-500' :
                template.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
              </span>
              <button
                onClick={() => onUseTemplate(template)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 