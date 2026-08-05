import React from 'react';

interface MathFormulaProps {
  content: string;
  className?: string;
}

/**
 * 간단하고 우아한 수학 수식 렌더러
 * LaTeX 구문 ($...$ 또는 $$...$$)을 감지하여 고대비 수식 블록으로 시각화합니다.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({ content, className = '' }) => {
  // Check if content contains LaTeX math delimiters
  const hasMath = content.includes('$');

  if (!hasMath) {
    return <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>{content}</div>;
  }

  // Split by math delimiters
  const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/gs);

  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2);
          return (
            <div 
              key={index} 
              className="my-3 p-3 bg-slate-900 text-amber-300 font-mono text-sm sm:text-base rounded-xl border border-slate-700 overflow-x-auto shadow-inner text-center"
            >
              <div className="text-xs text-slate-400 mb-1 select-none">📐 수식 블록</div>
              <code>{formula}</code>
            </div>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          return (
            <span 
              key={index} 
              className="mx-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-sm rounded-md border border-indigo-200 dark:border-indigo-800"
            >
              {formula}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};
