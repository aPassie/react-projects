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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Project Templates</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
          >
            <div>
              <h3 className="text-lg font-medium text-slate-800">{template.title}</h3>
              <p className="text-slate-600 text-sm mt-1">{template.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {template.tags?.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
              </span>
              <button
                onClick={() => onUseTemplate(template)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 active:scale-95"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-3 text-center py-8 text-slate-500">
            No templates available.
          </div>
        )}
      </div>
    </div>
  );
}