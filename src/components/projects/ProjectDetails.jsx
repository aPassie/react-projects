import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, setDoc, collection, addDoc } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  IoMdCheckmark,
  IoMdArrowBack,
  IoMdTime,
  IoMdBookmark,
  IoMdPricetag,
  IoMdBulb,
  IoMdInformation
} from 'react-icons/io';
import { CodeBlock } from '../CodeBlock';
import { calculateProjectProgress } from '../../utils/progressCalculator';

export function ProjectDetails() {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project data
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (!projectDoc.exists()) {
          throw new Error('Project not found');
        }

        const projectData = { id: projectDoc.id, ...projectDoc.data() };
        setProject(projectData);

        // Fetch user's progress
        const progressDoc = await getDoc(doc(db, 'users', currentUser.uid, 'progress', projectId));
        if (progressDoc.exists()) {
          const { completedSteps: userCompletedSteps = [] } = progressDoc.data();
          setCompletedSteps(userCompletedSteps);
          setCurrentStep(Math.min(userCompletedSteps.length, projectData.steps.length - 1));
          setProgress(calculateProjectProgress(projectData, userCompletedSteps));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (projectId && currentUser) {
      fetchProject();
    }
  }, [projectId, currentUser]);

  // Helper function to calculate current progress
  const updateProgress = (steps) => {
    const uniqueSteps = [...new Set(steps)]; // Remove any duplicates
    const progressValue = calculateProjectProgress(project, uniqueSteps);
    return Math.min(progressValue, 100); // Ensure progress never exceeds 100%
  };

  // Handle step completion
  const handleStepComplete = async () => {
    try {
      const progressRef = doc(db, 'users', currentUser.uid, 'progress', projectId);

      // Only add the step if it hasn't been completed before
      let newCompletedSteps = [...completedSteps];
      if (!completedSteps.includes(currentStep)) {
        newCompletedSteps.push(currentStep);
      }

      // Calculate new progress
      const newProgress = updateProgress(newCompletedSteps);

      // Check if progress document exists
      const progressDoc = await getDoc(progressRef);

      // Update Firestore
      if (!progressDoc.exists()) {
        // Create new progress document
        await setDoc(progressRef, {
          completedSteps: newCompletedSteps,
          lastUpdated: new Date(),
          projectId: projectId,
          userId: currentUser.uid,
          progress: newProgress
        });
      } else {
        // Update existing progress document
        await updateDoc(progressRef, {
          completedSteps: newCompletedSteps,
          lastUpdated: new Date(),
          progress: newProgress
        });
      }

      // Update local state
      setCompletedSteps(newCompletedSteps);
      setProgress(newProgress);

      // Move to next step if not at the end
      if (currentStep < project.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (!progressDoc.data()?.completed) {
        // Mark project as completed if it wasn't already
        await updateDoc(progressRef, {
          completed: true,
          completedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // More descriptive error message
      if (error.code) {
        alert(`Failed to update progress: ${error.message}`);
      } else {
        alert('Failed to update progress. Please try again.');
      }
    }
  };

  // Handle step navigation
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      // No need to filter out completed steps when moving backward
      // The completed steps should remain as they are
    }
  };

  const handleProjectComplete = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        completedProjects: [...(currentUser.completedProjects || []), projectId],
        [`projectProgress.${projectId}`]: 100
      });

      // Create a project completion record
      const completionData = {
        userId: currentUser.uid,
        projectId: projectId,
        completedAt: new Date().toISOString(),
        status: 'completed',
        rating: 5, // Default rating
        userDisplayName: currentUser.displayName,
        userEmail: currentUser.email,
        projectName: project.title
      };

      // Add to projectCompletions collection
      await addDoc(collection(db, 'projectCompletions'), completionData);

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete project:', err);
      setError('Failed to complete project: ' + err.message);
    }
  };

  // Add new function to check if a step is accessible
  const isStepAccessible = (stepIndex) => {
    // A step is accessible if:
    // 1. It's a previous step (already completed)
    // 2. It's the current step
    // 3. It's the next step after the last completed step
    return stepIndex <= Math.max(...completedSteps, currentStep);
  };

  // Modify step navigation function
  const handleStepClick = (index) => {
    // Allow navigation to any completed step or the next available step
    if (isStepAccessible(index)) {
      setCurrentStep(index);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center">
        <div className="bg-white border border-red-500/50 rounded-2xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Project not found state
  if (!project || !project.steps || project.steps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center">
        <div className="bg-white border border-gray-300 rounded-2xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
          <p className="text-gray-700">The requested project could not be found or has no steps.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Ensure currentStep is within bounds
  const safeCurrentStep = Math.min(Math.max(0, currentStep), project.steps.length - 1);
  const currentStepData = project.steps[safeCurrentStep];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-500 hover:text-blue-600 transition-all duration-200 group"
          >
            <IoMdArrowBack className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">Progress:</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`${progress === 100 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
              {progress}%
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Project Overview */}
        <div className="bg-white border border-gray-300 rounded-2xl p-6 space-y-6 hover:border-gray-400 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-3 text-gray-900">
                {project.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <IoMdTime className="w-4 h-4" />
                  <span>{project.estimatedHours} hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <IoMdBookmark className="w-4 h-4" />
                  <span>{project.category}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{project.description}</p>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Steps and Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Steps Sidebar */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 hover:border-gray-400 transition-colors duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Project Steps
            </h2>
            <div className="space-y-2">
              {project.steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  disabled={!isStepAccessible(index)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${index === currentStep
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : completedSteps.includes(index)
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : !isStepAccessible(index)
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed opacity-60'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }
                    transform hover:scale-[1.02] hover:-translate-y-0.5
                  `}
                >
                  <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border
                    ${index === currentStep
                      ? 'border-white/30'
                      : completedSteps.includes(index)
                        ? 'border-green-500/30'
                        : 'border-gray-400'
                    }`}
                  >
                    {completedSteps.includes(index) ? (
                      <IoMdCheckmark className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="flex-1">{step.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="md:col-span-2">
            <div className="bg-white border border-gray-300 rounded-2xl p-6 hover:border-gray-400 transition-colors duration-300">
              <div className="space-y-6">
                {/* Step Title with Hint and Tips Buttons */}
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project.steps[safeCurrentStep].title}
                  </h1>
                  <div className="relative flex items-center gap-2">
                    {/* Tips Button */}
                    <button
                      onClick={() => {
                        setShowTips(!showTips);
                        setShowHint(false);
                      }}
                      className="p-2 rounded-full hover:bg-blue-100 transition-colors group"
                      title="Show Tips"
                    >
                      <IoMdInformation className="w-6 h-6 text-blue-500 group-hover:text-blue-600" />
                    </button>

                    {/* Tips Popup */}
                    {showTips && project.steps[safeCurrentStep].tips?.length > 0 && (
                      <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-gray-100 rounded-lg shadow-xl z-10 animate-fade-in border border-gray-300">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 text-blue-500">
                            <IoMdInformation className="w-5 h-5 flex-shrink-0" />
                            <span className="font-semibold">Pro Tips</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTips(false);
                            }}
                            className="text-gray-600 hover:text-gray-900 transition-colors text-xl leading-none"
                          >
                            ×
                          </button>
                        </div>
                        <div className="mt-2">
                          <ul className="space-y-2 text-sm text-gray-800">
                            {project.steps[safeCurrentStep].tips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Hint Button */}
                    <button
                      onClick={() => {
                        setShowHint(!showHint);
                        setShowTips(false);
                      }}
                      className="p-2 rounded-full hover:bg-yellow-100 transition-colors group"
                      title="Show Hint"
                    >
                      <IoMdBulb className="w-6 h-6 text-yellow-500 group-hover:text-yellow-600" />
                    </button>

                    {/* Hint Popup */}
                    {showHint && (
                      <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-gray-100 rounded-lg shadow-xl z-10 animate-fade-in border border-gray-300">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 text-yellow-500">
                            <IoMdBulb className="w-5 h-5 flex-shrink-0" />
                            <span className="font-semibold">Hint</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowHint(false);
                            }}
                            className="text-gray-600 hover:text-gray-900 transition-colors text-xl leading-none"
                          >
                            ×
                          </button>
                        </div>
                        <div className="mt-2 text-sm text-gray-800">
                          {project.steps[safeCurrentStep].hint || "Try breaking down the problem into smaller steps. If you're stuck, review the previous steps or check the project resources."}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Description */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{project.steps[safeCurrentStep].description}</p>
                </div>

                {/* Implementation Section */}
                {project.steps[safeCurrentStep].code && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Implementation
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-gray-300">
                      <CodeBlock
                        code={project.steps[safeCurrentStep].code}
                        language="javascript"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-300">
                  <button
                    onClick={handlePreviousStep}
                    className={`px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105
                      ${currentStep === 0
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    disabled={currentStep === 0}
                  >
                    Previous Step
                  </button>
                  <button
                    onClick={handleStepComplete}
                    disabled={progress === 100 && currentStep === project.steps.length - 1}
                    className={`px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105
                      ${progress === 100
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                      } text-white shadow-lg ${progress === 100 && currentStep === project.steps.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {progress === 100 ? 'Project Completed' : currentStep === project.steps.length - 1 ? 'Complete Project' : 'Next Step'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}