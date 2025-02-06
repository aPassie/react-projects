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
    <div className="space-y-8">
      {/* Section Tabs */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => setActiveSection('basic')}
          className={`px-8 py-4 -mb-px font-medium text-base transition-all duration-200 hover:text-blue-500 ${
            activeSection === 'basic'
              ? 'border-b-2 border-blue-500 text-blue-500 scale-105'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Basic Information
        </button>
        <button
          onClick={() => setActiveSection('content')}
          className={`px-8 py-4 -mb-px font-medium text-base transition-all duration-200 hover:text-blue-500 ${
            activeSection === 'content'
              ? 'border-b-2 border-blue-500 text-blue-500 scale-105'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Content & Resources
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}

        {activeSection === 'basic' ? (
          <div className="space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            {/* Basic Information Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-base font-medium text-slate-700 mb-2 group-hover:text-blue-500 transition-colors">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full rounded-lg bg-slate-50 border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-base font-medium text-slate-700 mb-2 group-hover:text-blue-500 transition-colors">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full rounded-lg bg-slate-50 border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-base font-medium text-slate-700 mb-2 group-hover:text-blue-500 transition-colors">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="block w-full rounded-lg bg-slate-50 border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-base font-medium text-slate-700 mb-2 group-hover:text-blue-500 transition-colors">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    className="block w-full rounded-lg bg-slate-50 border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-base font-medium text-slate-700 mb-2 group-hover:text-blue-500 transition-colors">
                    Brief Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="block w-full rounded-lg bg-slate-50 border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                    rows="4"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-base font-medium text-slate-700 mb-2 group-hover:text-blue-500 transition-colors">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="block w-full rounded-lg bg-slate-50 border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                    placeholder="e.g. python, beginner, web"
                  />
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="space-y-4">
              <div className="flex justify-between items-center group">
                <label className="block text-base font-medium text-slate-700 group-hover:text-blue-500 transition-colors">Prerequisites</label>
                <button
                  type="button"
                  onClick={addPrerequisite}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Add Prerequisite
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.prerequisites.map((prereq, index) => (
                  <input
                    key={index}
                    type="text"
                    value={prereq}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    className="block w-full rounded-lg bg-slate-50 border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                    placeholder="Enter prerequisite"
                  />
                ))}
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-4">
              <div className="flex justify-between items-center group">
                <label className="block text-base font-medium text-slate-700 group-hover:text-blue-500 transition-colors">Learning Objectives</label>
                <button
                  type="button"
                  onClick={addObjective}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Add Objective
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.learningObjectives.map((objective, index) => (
                  <input
                    key={index}
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="block w-full rounded-lg bg-slate-50 border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                    placeholder="Enter learning objective"
                  />
                ))}
              </div>
            </div>

            {/* Project Steps */}
            <div className="space-y-4">
              <div className="flex justify-between items-center group">
                <label className="block text-base font-medium text-slate-700 group-hover:text-blue-500 transition-colors">Project Steps</label>
                <button
                  type="button"
                  onClick={addStep}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Add Step
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {formData.steps.map((step, index) => (
                  <div key={index} className="space-y-4 p-6 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-200 transition-all duration-200">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(index, 'title', e.target.value)}
                      className="block w-full rounded-lg bg-white border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                      placeholder="Step title"
                    />
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      className="block w-full rounded-lg bg-white border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
                      rows="3"
                      placeholder="Step description"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ProjectContent
            content={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          />
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => onComplete()}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}