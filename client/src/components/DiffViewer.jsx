import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { diffLines } from 'diff';
import { Check, Copy, Columns, AlignJustify } from 'lucide-react';

export default function DiffViewer({ originalCode = '', refactoredCode = '' }) {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'unified'
  const [copied, setCopied] = useState(false);

  // Compute unified diff chunks
  const diffChunks = useMemo(() => {
    if (!originalCode && !refactoredCode) return [];
    return diffLines(originalCode || '', refactoredCode || '');
  }, [originalCode, refactoredCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(refactoredCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs shadow-inner w-full max-w-full">
      {/* Diff Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs w-full">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-semibold text-slate-300">Git-Style Diff Inspection</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
            - Original
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            + Refactored
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded text-[11px] flex items-center space-x-1 cursor-pointer transition-colors ${
                viewMode === 'split' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Side-by-side comparison"
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2 py-1 rounded text-[11px] flex items-center space-x-1 cursor-pointer transition-colors ${
                viewMode === 'unified' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Inline unified diff"
            >
              <AlignJustify className="w-3 h-3" />
              <span>Unified</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Diff Content View */}
      <div
        className="flex-1 overflow-auto p-2 w-full max-w-full touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full w-full max-w-full">
            {/* Left: Original Code */}
            <div
              className="border border-slate-800/80 rounded-lg bg-slate-900/40 p-2.5 sm:p-3 overflow-x-auto w-full max-w-full touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 pb-1 border-b border-slate-800">
                Original Input
              </div>
              <pre className="text-slate-300 leading-5 whitespace-pre-wrap break-words font-mono overflow-x-auto w-full max-w-full">
                <code className="break-words font-mono">{originalCode || '// No original code'}</code>
              </pre>
            </div>

            {/* Right: Refactored Code */}
            <div
              className="border border-emerald-500/20 rounded-lg bg-emerald-950/10 p-2.5 sm:p-3 overflow-x-auto w-full max-w-full touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}
            >
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 pb-1 border-b border-emerald-500/20">
                AI Refactored Result
              </div>
              <pre className="text-emerald-200 leading-5 whitespace-pre-wrap break-words font-mono overflow-x-auto w-full max-w-full">
                <code className="break-words font-mono">{refactoredCode || '// No refactored code'}</code>
              </pre>
            </div>
          </div>
        ) : (
          /* Unified Diff View */
          <div className="space-y-0.5">
            {diffChunks.map((chunk, chunkIdx) => {
              const lines = chunk.value.replace(/\n$/, '').split('\n');
              let bg = 'bg-transparent text-slate-300';
              let prefix = ' ';
              let borderClass = '';

              if (chunk.added) {
                bg = 'bg-emerald-950/30 text-emerald-200';
                prefix = '+';
                borderClass = 'border-l-2 border-emerald-500';
              } else if (chunk.removed) {
                bg = 'bg-rose-950/30 text-rose-300 line-through opacity-80';
                prefix = '-';
                borderClass = 'border-l-2 border-rose-500';
              }

              return lines.map((line, lineIdx) => (
                <div
                  key={`${chunkIdx}-${lineIdx}`}
                  className={`px-3 py-0.5 font-mono text-[12px] flex items-start space-x-2 ${bg} ${borderClass}`}
                >
                  <span className="w-4 select-none opacity-60 font-bold">{prefix}</span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              ));
            })}
          </div>
        )}
      </div>
    </div>
  );
}

DiffViewer.propTypes = {
  originalCode: PropTypes.string,
  refactoredCode: PropTypes.string
};
