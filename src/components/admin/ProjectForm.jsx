import { useState } from 'react';
import { db, collection, addDoc, updateDoc, doc } from '../../config/firebase';
import { ProjectContent } from './ProjectContent';
import Editor from "@monaco-editor/react";

export function ProjectForm({ project = null, onComplete, categories, difficultyLevels }) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || categories[0].id,
    difficulty: project?.difficulty || difficultyLevels[0].id,
    prerequisites: project?.prerequisites || [],
    estimatedHours: project?.estimatedHours || '',
    learningObjectives: project?.learningObjectives || [],
    steps: project?.steps || [{
      title: '',
      description: '',
      code: '',
      hint: '',
      tips: []
    }],
    resources: project?.resources || [],
    tags: '', // Initialize as empty string, will be filled by user
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
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        prerequisites: formData.prerequisites.filter(p => p && p.trim()),
        learningObjectives: formData.learningObjectives.filter(o => o && o.trim()),
        updatedAt: new Date().toISOString()
      };

      if (project?.id) {
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

  const handleStepCodeChange = (index, code) => {
    const newSteps = [...formData.steps];
    newSteps[index].code = code;
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        title: '',
        description: '',
        code: '',
        hint: '',
        tips: []
      }]
    }));
  };

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Project Steps</h3>
                <button
                  type="button"
                  onClick={addStep}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Step
                </button>
              </div>

              {formData.steps.map((step, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-700">Step {index + 1}</h4>
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Step Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Step Title
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter step title"
                    />
                  </div>

                  {/* Step Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Step Description
                    </label>
                    <textarea
                      value={step.description}
                      onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Enter step description"
                    />
                  </div>

                  {/* Step Hint */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Step Hint
                    </label>
                    <textarea
                      value={step.hint}
                      onChange={(e) => handleStepChange(index, 'hint', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter helpful hint for this step"
                    />
                    <p className="mt-1 text-sm text-slate-500">
                      Provide a helpful hint that students can use if they get stuck on this step.
                    </p>
                  </div>

                  {/* Step Tips */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Pro Tips
                    </label>
                    <div className="space-y-2">
                      {Array.isArray(step.tips) && step.tips.map((tip, tipIndex) => (
                        <div key={tipIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={tip}
                            onChange={(e) => {
                              const newTips = [...step.tips];
                              newTips[tipIndex] = e.target.value;
                              handleStepChange(index, 'tips', newTips);
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter a pro tip"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newTips = step.tips.filter((_, i) => i !== tipIndex);
                              handleStepChange(index, 'tips', newTips);
                            }}
                            className="px-3 py-2 text-red-500 hover:text-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newTips = Array.isArray(step.tips) ? [...step.tips, ''] : [''];
                          handleStepChange(index, 'tips', newTips);
                        }}
                        className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        + Add Pro Tip
                      </button>
                    </div>
                  </div>

                  {/* Step Code */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Step Code
                    </label>
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <Editor
                        height="200px"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={step.code}
                        onChange={(value) => handleStepChange(index, 'code', value)}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 14,
                          lineNumbers: 'on',
                          wordWrap: 'on',
                        }}
                      />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Add the code implementation for this step (optional)
                    </p>
                  </div>
                </div>
              ))}
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
            {loading ? 'Saving...' : (project?.id ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
}