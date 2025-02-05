import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function CodeBlock({ code, language, disableCopy = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (disableCopy) return; // Prevent copying if disabled
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group">
      {!disableCopy && (
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 px-3 py-1 rounded bg-neutral-600 
                     hover:bg-neutral-500 text-sm opacity-0 group-hover:opacity-100 
                     transition-all duration-200"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.5rem',
          backgroundColor: '#1a1a1a',
        }}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}