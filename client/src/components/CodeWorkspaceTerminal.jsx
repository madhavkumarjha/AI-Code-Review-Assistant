import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Terminal, Check, X, AlertCircle, Clock, Trash2, ShieldAlert, Cpu } from 'lucide-react';

export default function CodeWorkspaceTerminal({
  outputData,
  isRunning,
  onClear,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('stdout'); // 'stdout' | 'stderr'

  if (!outputData && !isRunning) return null;

  const {
    status = 'Completed',
    stdout = '',
    stderr = '',
    exitCode = 0,
    executionTimeMs = 0,
    runtime = 'Execution Sandbox',
    language = 'Code'
  } = outputData || {};

  const isSuccess = exitCode === 0 && !stderr;

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 mt-2.5">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 min-w-0">
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 tracking-wide font-mono">
            Output
          </span>

          {/* Status Badge */}
          {isRunning ? (
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>Running...</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                status === 'Completed' && exitCode === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {status === 'Completed' && exitCode === 0 ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-rose-400" />
              )}
              <span>{status}</span>
            </span>
          )}

          {/* Language & Runtime Badge */}
          {runtime && (
            <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[160px]">{runtime}</span>
            </span>
          )}
        </div>

        {/* Right Info: Exit Code, Timing & Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {!isRunning && (
            <div className="flex items-center space-x-2 text-[11px] font-mono">
              <span className="text-slate-400">
                Exit code: <strong className={exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}>{exitCode}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{executionTimeMs}ms</span>
              </span>
            </div>
          )}

          {onClear && (
            <button
              onClick={onClear}
              type="button"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Clear Terminal Output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Close Terminal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stream Tabs Selector (STDOUT vs STDERR) */}
      <div className="flex items-center space-x-1 px-3 py-1.5 bg-slate-950 border-b border-slate-900 text-[11px] font-mono">
        <button
          onClick={() => setActiveTab('stdout')}
          type="button"
          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
            activeTab === 'stdout'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          STDOUT
        </button>
        {stderr && (
          <button
            onClick={() => setActiveTab('stderr')}
            type="button"
            className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 cursor-pointer ${
              activeTab === 'stderr'
                ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800/40'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Errors / STDERR</span>
          </button>
        )}
      </div>

      {/* Terminal Output Body */}
      <div
        className="p-3.5 max-h-[220px] overflow-y-auto font-mono text-xs leading-5 select-text touch-pan-x touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isRunning ? (
          <div className="flex items-center space-x-2 text-slate-400 py-4">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <span>Executing {language} program in isolated environment...</span>
          </div>
        ) : activeTab === 'stdout' ? (
          stdout ? (
            <pre className="text-slate-100 whitespace-pre-wrap break-words font-mono">
              {stdout}
            </pre>
          ) : stderr ? (
            <div className="text-amber-400/90 text-xs italic">
              [No output sent to STDOUT. Check the Errors tab for execution diagnostics.]
            </div>
          ) : (
            <div className="text-slate-500 text-xs italic">
              [Program completed successfully with no console output.]
            </div>
          )
        ) : (
          <pre className="text-rose-300 whitespace-pre-wrap break-words font-mono bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40">
            {stderr}
          </pre>
        )}
      </div>

      {/* Decoupling Principle Footer Banner */}
      <div className="px-3.5 py-1.5 bg-slate-900/50 border-t border-slate-900/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center space-x-1.5">
          <ShieldAlert className="w-3 h-3 text-cyan-400/70 shrink-0" />
          <span>Execution success (Exit code 0) ≠ Bug-free logic. Review findings independently.</span>
        </div>
      </div>
    </div>
  );
}

CodeWorkspaceTerminal.propTypes = {
  outputData: PropTypes.shape({
    status: PropTypes.string,
    stdout: PropTypes.string,
    stderr: PropTypes.string,
    exitCode: PropTypes.number,
    executionTimeMs: PropTypes.number,
    runtime: PropTypes.string,
    language: PropTypes.string
  }),
  isRunning: PropTypes.bool,
  onClear: PropTypes.func,
  onClose: PropTypes.func
};
