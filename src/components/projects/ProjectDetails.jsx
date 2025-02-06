import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export function ProjectDetails() {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() });
      } else {
        setError('Project not found');
      }
    } catch (err) {
      setError('Failed to fetch project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async () => {
    try {
      // Update user's progress
      const userRef = doc(db, 'users', currentUser.uid);
      const progress = Math.round(((currentStep + 1) / project.steps.length) * 100);
      
      await updateDoc(userRef, {
        [`projectProgress.${projectId}`]: progress
      });

      if (currentStep < project.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (err) {
      setError('Failed to update progress: ' + err.message);
    }
  };

  const handleProjectComplete = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        completedProjects: [...(currentUser.completedProjects || []), projectId],
        [`projectProgress.${projectId}`]: 100
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to complete project: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Project not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
          <div className="flex flex-wrap gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm">
              {project.difficulty}
            </span>
            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">
              {project.estimatedHours} hours
            </span>
          </div>
          <p className="text-neutral-400">{project.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / project.steps.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-neutral-400 mt-2">
            Step {currentStep + 1} of {project.steps.length}
          </p>
        </div>

        {/* Current Step */}
        <div className="bg-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            {project.steps[currentStep].title}
          </h2>
          <div className="prose prose-invert max-w-none">
            {project.steps[currentStep].description}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-neutral-700">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-neutral-700 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            {currentStep === project.steps.length - 1 ? (
              <button
                onClick={handleProjectComplete}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Complete Project
              </button>
            ) : (
              <button
                onClick={handleStepComplete}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 