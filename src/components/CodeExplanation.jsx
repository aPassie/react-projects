import { useState } from 'react';
import { CodeBlock } from './CodeBlock';

export function CodeExplanation({ code, explanations }) {
  const [selectedLine, setSelectedLine] = useState(null);
  const [showExplanations, setShowExplanations] = useState(true);

  const codeLines = code.split('\n');

  // Find explanation for selected line
  const getExplanationForLine = (lineNumber) => {
    return explanations.find(exp => exp.line === lineNumber);
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Code Explanation</h3>
        <button
          onClick={() => setShowExplanations(!showExplanations)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showExplanations ? 'Hide' : 'Show'} Explanations
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Section with Line Numbers */}
        <div className="relative overflow-hidden rounded-lg">
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-neutral-900 flex flex-col">
            {codeLines.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedLine(index)}
                className={`text-xs py-1 transition-colors
                  ${selectedLine === index 
                    ? 'bg-blue-500/20 text-white' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="pl-10 overflow-x-auto">
            <CodeBlock
              code={code}
              language="jsx"
              disableCopy={true}
            />
          </div>
        </div>

        {/* Explanations Panel */}
        {showExplanations && (
          <div className="bg-neutral-700/50 rounded-lg p-4">
            <div className="space-y-4">
              {selectedLine !== null ? (
                <div>
                  <h4 className="font-bold text-blue-400 mb-2">
                    Line {selectedLine + 1}:
                  </h4>
                  {getExplanationForLine(selectedLine) ? (
                    <div className="space-y-2">
                      <p className="text-sm text-neutral-200">
                        {getExplanationForLine(selectedLine).explanation}
                      </p>
                      {getExplanationForLine(selectedLine).tips && (
                        <div className="mt-2 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                          <p className="text-sm">
                            <span className="font-bold text-blue-400">💡 Tip: </span>
                            {getExplanationForLine(selectedLine).tips}
                          </p>
                        </div>
                      )}
                      {getExplanationForLine(selectedLine).warning && (
                        <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                          <p className="text-sm">
                            <span className="font-bold text-yellow-400">⚠️ Warning: </span>
                            {getExplanationForLine(selectedLine).warning}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-neutral-400">
                      No explanation available for this line
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-neutral-400 text-center py-8">
                  <p>Click on a line number to see its explanation</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}