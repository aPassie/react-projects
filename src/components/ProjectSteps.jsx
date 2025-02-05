import { useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { CodeExplanation } from './CodeExplanation';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function ProjectSteps({ project, progress, onBack, onComplete, onProgressUpdate }) {
  const [currentStep, setCurrentStep] = useState(progress);
  const [showHint, setShowHint] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useLocalStorage(`notes-${project?.id}`, {});

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    onProgressUpdate(nextStep);
    setShowHint(false);
  };

  const handlePrevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
    setShowHint(false);
  };

  // Use optional chaining to handle potentially undefined project or steps
  const currentStepData = project?.steps?.[currentStep];
  const isLastStep = currentStep === project?.steps?.length - 1;
  const currentProgress = (currentStep / project?.steps?.length) * 100;

  const handleSaveNote = (note) => {
    setNotes((prev) => ({
      ...prev,
      [currentStep]: note,
    }));
  };

  // Add this near the top of the component
  const handleComplete = () => {
    if (project?.id) {
      onComplete(project.id);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-blue-400 hover:text-blue-300"
        >
          ← Back to Projects
        </button>
        <div className="flex items-center gap-4">
          <span className="text-neutral-400">
            Progress: {Math.round(currentProgress)}%
          </span>
          <div className="w-32 h-2 bg-neutral-800 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Steps sidebar */}
        <div className="md:col-span-1">
          <div className="bg-neutral-800 rounded-lg p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Project Steps</h3>
            <div className="space-y-2">
              {/* Use optional chaining when mapping over steps */}
              {project?.steps?.map((step, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-3 rounded-lg transition-colors
                    ${
                      currentStep === index
                        ? 'bg-blue-600'
                        : index <= currentStep
                        ? 'bg-green-600 opacity-75'
                        : 'bg-neutral-700'
                    }
                    ${
                      index <= currentStep
                        ? 'hover:opacity-100'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  disabled={index > currentStep}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {index < currentStep ? (
                        <span className="mr-2">✓</span>
                      ) : (
                        <span className="mr-2">{index + 1}</span>
                      )}
                      {/* Render step title only if step is defined */}
                      {step?.title}
                    </div>
                    {notes[index] && (
                      <span className="text-yellow-400 text-sm">📝</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="md:col-span-2">
          <div className="bg-neutral-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              {/* Render title only if currentStepData is defined */}
              <h2 className="text-3xl font-bold">{currentStepData?.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-neutral-400 hover:text-white transition-colors"
                  title="Toggle Notes"
                >
                  📝
                </button>
                {currentStepData?.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-neutral-400 hover:text-white transition-colors"
                    title="Show Hint"
                  >
                    💡
                  </button>
                )}
              </div>
            </div>

            {/* Render description only if currentStepData is defined */}
            <p className="text-neutral-300 mb-8">
              {currentStepData?.description}
            </p>

            {showHint && currentStepData?.hint && (
              <div className="mb-8 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <h4 className="font-bold mb-2">Hint:</h4>
                <p className="text-neutral-300">{currentStepData?.hint}</p>
              </div>
            )}

            {currentStepData?.code && (
              <div className="space-y-8">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Implementation</h3>
                  <div className="code-block-wrapper">
                    <CodeBlock
                      code={currentStepData.code}
                      language="jsx"
                      disableCopy={true}
                    />
                  </div>
                </div>

                {/* Add Code Explanation Section */}
                <CodeExplanation
                  code={currentStepData.code}
                  explanations={currentStepData.codeExplanations || []}
                />
              </div>
            )}

            {showNotes && (
              <div className="mb-8">
                <h4 className="text-xl font-bold mb-4">Notes</h4>
                <textarea
                  value={notes[currentStep] || ''}
                  onChange={(e) => handleSaveNote(e.target.value)}
                  className="w-full h-32 bg-neutral-700 rounded-lg p-3 text-white"
                  placeholder="Add your notes here..."
                />
              </div>
            )}

            <div className="mt-8">
              <h4 className="text-xl font-bold mb-4">Why This Works:</h4>
              <p className="text-neutral-300 mb-4">
                {currentStepData?.explanation}
              </p>
              {currentStepData?.keyPoints && (
                <ul className="list-disc list-inside text-neutral-300 space-y-2">
                  {currentStepData?.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-8 border-t border-neutral-700">
              <button
                onClick={() => handlePrevStep()}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous Step
              </button>

              {/* Update the complete project button */}
              {isLastStep ? (
                <button
                  onClick={handleComplete}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 
                           transition-colors flex items-center gap-2"
                >
                  <span>Complete Project</span>
                  <span className="text-xl">✨</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNextStep()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Next Step →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
