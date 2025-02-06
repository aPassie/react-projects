import { useState } from 'react';
import { db, collection, addDoc, updateDoc, doc } from '../../config/firebase';
import { ProjectContent } from './ProjectContent';

export function ProjectForm({ project = null, onComplete, categories, difficultyLevels }) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || categories[0].id,
    difficulty: project?.difficulty || difficultyLevels[0].id,
    prerequisites: project?.prerequisites || [],
    estimatedHours: project?.estimatedHours || '',
    learningObjectives: project?.learningObjectives || [],
    steps: project?.steps || [{ title: '', description: '' }],
    resources: project?.resources || [],
    tags: project?.tags?.join(', ') || '',
    content: project?.content || {
      description: '',
      codeSnippets: {},
      images: [],
      videos: [],
      resources: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('basic'); // 'basic' or 'content'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const projectData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        prerequisites: formData.prerequisites.filter(p => p.trim()),
        learningObjectives: formData.learningObjectives.filter(o => o.trim()),
        updatedAt: new Date().toISOString()
      };

      if (project) {
        await updateDoc(doc(db, 'projects', project.id), projectData);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: new Date().toISOString(),
          completions: 0,
          averageRating: 0,
          totalRatings: 0
        });
      }

      onComplete();
    } catch (err) {
      setError('Failed to save project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPrerequisite = () => {
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, '']
    }));
  };

  const updatePrerequisite = (index, value) => {
    const newPrerequisites = [...formData.prerequisites];
    newPrerequisites[index] = value;
    setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const updateObjective = (index, value) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, learningObjectives: newObjectives }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { title: '', description: '' }]
    }));
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex space-x-4 border-b border-neutral-700">
        <button
          onClick={() => setActiveSection('basic')}
          className={`px-4 py-2 -mb-px ${
            activeSection === 'basic'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Basic Information
        </button>
        <button
          onClick={() => setActiveSection('content')}
          className={`px-4 py-2 -mb-px ${
            activeSection === 'content'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Content & Resources
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        {activeSection === 'basic' ? (
          <div className="space-y-6 bg-neutral-800 p-6 rounded-lg">
            {/* Basic Information Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300">
                    Brief Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    placeholder="React, Hooks, State..."
                  />
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Prerequisites
              </label>
              <div className="space-y-2">
                {formData.prerequisites.map((prerequisite, index) => (
                  <input
                    key={index}
                    type="text"
                    value={prerequisite}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    className="block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    placeholder="e.g., Basic JavaScript knowledge"
                  />
                ))}
                <button
                  type="button"
                  onClick={addPrerequisite}
                  className="w-full py-2 px-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Add Prerequisite
                </button>
              </div>
            </div>

            {/* Learning Objectives */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Learning Objectives
              </label>
              <div className="space-y-2">
                {formData.learningObjectives.map((objective, index) => (
                  <input
                    key={index}
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    placeholder="e.g., Understand React hooks"
                  />
                ))}
                <button
                  type="button"
                  onClick={addObjective}
                  className="w-full py-2 px-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Add Learning Objective
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-800 p-6 rounded-lg">
            <ProjectContent
              content={formData.content}
              onUpdate={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
              projectId={project?.id || 'new'}
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
} 