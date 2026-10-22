import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
  Bug,
  Zap,
  ShieldAlert,
  Lightbulb,
  Code2,
  Check,
  Copy,
  AlertTriangle,
  Sparkles,
  GitCompare,
  HelpCircle,
  X,
  FileCode,
  FolderGit2,
  Layers,
  ChevronRight
} from 'lucide-react';
import ExportPanel from './ExportPanel';
import ScoreRing from './ScoreRing';
import DiffViewer from './DiffViewer';
import ExplainModal from './ExplainModal';
import { normalizeCodeFormatting } from '../utils/codeFormatter';

// Severity badge formatting with standard labels
const getSeverityMeta = (level) => {
  const l = (level || 'medium').toLowerCase();
  if (l === 'high' || l === 'critical') {
    return {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      label: '🔴 Critical'
    };
  }
  if (l === 'medium') {
    return {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      label: '🟡 Warning'
    };
  }
  return {
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    label: '🔵 Info'
  };
};

const BugSection = React.memo(({ bugs, onExplain }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
    <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
      <Bug className="w-4 h-4 shrink-0" />
      <span>Bugs &amp; Runtime Exceptions ({bugs.length})</span>
    </div>
    {bugs.length === 0 ? (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2 font-mono">
        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>No bugs detected.</span>
      </div>
    ) : (
      bugs.map((bug, i) => {
        const meta = getSeverityMeta(bug.severity);
        return (
          <div key={i} className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs space-y-2.5 transition-all hover:border-rose-500/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-rose-300 font-mono text-xs break-words flex-1 min-w-0">
                {bug.line || 'Code Scope'}
              </span>
              <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${meta.badge}`}>
                  {meta.label}
                </span>
                <button
                  onClick={() => onExplain(bug)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center space-x-1 shrink-0 transition-all cursor-pointer min-h-[28px]"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Explain</span>
                </button>
              </div>
            </div>
            <p className="text-slate-100 font-medium break-words leading-relaxed text-xs">{bug.issue}</p>
            <p className="text-slate-400 text-xs leading-relaxed break-words">
              <strong className="text-rose-400 font-semibold">Fix:</strong> {bug.recommendation}
            </p>
          </div>
        );
      })
    )}
  </motion.div>
));
BugSection.displayName = 'BugSection';
BugSection.propTypes = {
  bugs: PropTypes.array.isRequired,
  onExplain: PropTypes.func.isRequired
};

const PerformanceSection = React.memo(({ performance, onExplain }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2">
    <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
      <Zap className="w-4 h-4 shrink-0" />
      <span>Performance &amp; Time Complexity ({performance.length})</span>
    </div>
    {performance.length === 0 ? (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
        ⚡ Logic appears computationally optimal.
      </div>
    ) : (
      performance.map((item, i) => {
        const meta = getSeverityMeta(item.impact);
        return (
          <div key={i} className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-2.5 transition-all hover:border-amber-500/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-amber-300 text-xs break-words flex-1 min-w-0">
                {item.title}
              </span>
              <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${meta.badge}`}>
                  {meta.label}
                </span>
                <button
                  onClick={() => onExplain(item)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center space-x-1 shrink-0 transition-all cursor-pointer min-h-[28px]"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Deep Dive</span>
                </button>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed break-words">{item.detail}</p>
          </div>
        );
      })
    )}
  </motion.div>
));
PerformanceSection.displayName = 'PerformanceSection';
PerformanceSection.propTypes = {
  performance: PropTypes.array.isRequired,
  onExplain: PropTypes.func.isRequired
};

const SecuritySection = React.memo(({ security, onExplain }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2">
    <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
      <ShieldAlert className="w-4 h-4 shrink-0" />
      <span>Security Scanning &amp; Injection Vectors ({security.length})</span>
    </div>
    {security.length === 0 ? (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
        🔒 No security vulnerabilities identified.
      </div>
    ) : (
      security.map((sec, i) => {
        const meta = getSeverityMeta(sec.riskLevel);
        return (
          <div key={i} className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-2.5 transition-all hover:border-purple-500/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-purple-300 text-xs break-words flex-1 min-w-0">
                {sec.vulnerability}
              </span>
              <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${meta.badge}`}>
                  {meta.label}
                </span>
                <button
                  onClick={() => onExplain(sec)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center space-x-1 shrink-0 transition-all cursor-pointer min-h-[28px]"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Mitigate</span>
                </button>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed break-words">
              <strong className="text-purple-400 font-semibold">Mitigation:</strong> {sec.fix}
            </p>
          </div>
        );
      })
    )}
  </motion.div>
));
SecuritySection.displayName = 'SecuritySection';
SecuritySection.propTypes = {
  security: PropTypes.array.isRequired,
  onExplain: PropTypes.func.isRequired
};

const SuggestionsSection = React.memo(({ suggestions }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2">
    <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
      <Lightbulb className="w-4 h-4 shrink-0" />
      <span>Best Practice Suggestions ({suggestions.length})</span>
    </div>
    {suggestions.map((s, i) => (
      <div
        key={i}
        className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs space-y-2 transition-all hover:border-cyan-500/40"
      >
        <div className="font-semibold text-cyan-300 font-mono text-xs flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
          <span>[{s.area}]</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed break-words font-sans">
          {s.recommendation}
        </p>
      </div>
    ))}
  </motion.div>
));
SuggestionsSection.displayName = 'SuggestionsSection';
SuggestionsSection.propTypes = {
  suggestions: PropTypes.array.isRequired
};

const RefactoredSection = React.memo(({ refactoredCode, handleCopyCode, codeCopied }) => {
  const cleanCode = normalizeCodeFormatting(refactoredCode);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Code2 className="w-4 h-4" />
          <span>Production-Ready Refactored Code</span>
        </div>
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] text-emerald-400 border border-emerald-500/30 font-mono transition-all cursor-pointer"
        >
          {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
        </button>
      </div>
      <div
        className="bg-slate-950 rounded-xl border border-slate-800 p-3 sm:p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-6 flex-1 shadow-inner w-full max-w-full touch-pan-x touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}
      >
        <pre className="whitespace-pre-wrap break-words font-mono overflow-x-auto w-full max-w-full leading-6"><code className="break-words font-mono">{cleanCode}</code></pre>
      </div>
    </motion.div>
  );
});
RefactoredSection.displayName = 'RefactoredSection';
RefactoredSection.propTypes = {
  refactoredCode: PropTypes.string,
  handleCopyCode: PropTypes.func.isRequired,
  codeCopied: PropTypes.bool.isRequired
};

export default function AnalysisDashboard({
  analysisData,
  executionTimeMs,
  rawCode,
  language = 'JavaScript',
  onClose,
  files = null,
  activeFileIndex = 0,
  onSelectFile = null
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [codeCopied, setCodeCopied] = useState(false);
  const [explainingFinding, setExplainingFinding] = useState(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [projectView, setProjectView] = useState('overview'); // 'overview' | 'file'

  if (!analysisData) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center min-h-[420px] text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-cyan-400 shadow-lg shadow-cyan-500/10">
          <Code2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-1">Autonomous Review Ready</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Paste your code or select a 1-click preset on the left, then click <strong className="text-cyan-400">"Analyze Code"</strong> to run multi-vector inspection.
        </p>
      </div>
    );
  }

  const isMulti = Boolean(analysisData.isMultiFile && Array.isArray(analysisData.files));
  const multiFiles = isMulti ? analysisData.files : [];
  const activeFile = isMulti ? (multiFiles[selectedFileIdx] || multiFiles[0]) : null;

  // Active target data (resolves to selected file in multi-mode, or root analysis in single-file mode)
  const targetData = isMulti && activeFile ? activeFile : analysisData;
  const {
    summary,
    qualityScore = 80,
    bugs = [],
    performance = [],
    security = [],
    suggestions = [],
    refactoredCode = '',
    isIncomplete = false,
    warning = null
  } = targetData;

  const isFallback = Boolean(analysisData.isFallback || targetData.isFallback);

  const currentFileRawCode = useMemo(() => {
    if (isMulti && activeFile) {
      const match = files?.find(f => f.filename === activeFile.filename);
      if (match && match.code) return match.code;
    }
    return rawCode || '';
  }, [isMulti, activeFile, files, rawCode]);

  const formattedRefactoredCode = useMemo(() => {
    return normalizeCodeFormatting(refactoredCode);
  }, [refactoredCode]);

  const formattedRawCode = useMemo(() => {
    return normalizeCodeFormatting(currentFileRawCode);
  }, [currentFileRawCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formattedRefactoredCode || '');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const projectSummary = analysisData.projectSummary || {
    overallScore: qualityScore,
    summary: summary,
    totalBugs: bugs.length,
    totalSecurityIssues: security.length,
    totalPerformanceIssues: performance.length,
    fileCount: multiFiles.length || 1
  };

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-5 border border-slate-800 flex flex-col h-full min-h-0 shadow-2xl relative overflow-hidden w-full max-w-full">
      
      {/* Fallback Demo Mode Banner if Offline */}
      {isFallback && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Demonstration Review Mode (Operating with simulated heuristics).</span>
          </div>
        </div>
      )}

      {/* Large-File Incomplete Review Notice Banner */}
      {isIncomplete && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between shrink-0 font-mono shadow-md">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{warning || '⚠️ Incomplete Review: File chunk threshold reached. Primary sections analyzed.'}</span>
          </div>
        </div>
      )}

      {/* Top Header & Radial Score Ring */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3.5 border-b border-slate-800/80 mb-3.5 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <h2 className="text-base font-bold text-slate-100">
              {isMulti
                ? (projectView === 'overview'
                    ? `Project Audit • ${projectSummary.fileCount} Files`
                    : `File Audit: ${activeFile?.filename || 'File'}`)
                : 'Audit Dashboard'}
            </h2>
            {executionTimeMs && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 shrink-0">
                ⚡ {(executionTimeMs / 1000).toFixed(2)}s
              </span>
            )}
            {isMulti && projectView === 'file' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {activeFile?.language || language}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed break-words">
            {isMulti && projectView === 'overview' ? projectSummary.summary : summary}
          </p>
        </div>

        {/* Animated Radial Score Ring & Optional Drawer Close Button */}
        <div className="shrink-0 flex items-center space-x-2 self-start sm:self-auto">
          <ScoreRing
            score={isMulti && projectView === 'overview' ? (projectSummary.overallScore || 85) : qualityScore}
            size={58}
            strokeWidth={5}
          />
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800 hover:border-slate-700 ml-1 shadow-sm"
              title="Close Results Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Multi-File Navigation Bar (Overview vs Specific Files) */}
      {isMulti && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-800/60 text-xs font-mono shrink-0 scrollbar-thin scrollbar-thumb-slate-800">
          <button
            onClick={() => setProjectView('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              projectView === 'overview'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Project Overview</span>
          </button>

          {multiFiles.map((file, idx) => {
            const isSelected = projectView === 'file' && selectedFileIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedFileIdx(idx);
                  setProjectView('file');
                  if (onSelectFile) onSelectFile(idx);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 font-bold shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{file.filename}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  file.qualityScore >= 85 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {file.qualityScore}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* When inside a specific file OR in single-file mode: Render the 5 Dimensions Tabs */}
      {(!isMulti || projectView === 'file') && (
        <div
          className="flex items-center space-x-1 overflow-x-auto pb-2 mb-3 border-b border-slate-800/60 text-xs font-medium shrink-0 touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Dimensions ({bugs.length + performance.length + security.length + suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('bugs')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'bugs'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Bugs ({bugs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'performance'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Performance ({performance.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Security ({security.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'diff'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-blue-400" />
            <span>Diff Inspection</span>
          </button>
          <button
            onClick={() => setActiveTab('refactored')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'refactored'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Refactored Code</span>
          </button>
        </div>
      )}

      {/* Main Content Area (Scrollable Panel) */}
      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">

        {/* Multi-File Project Overview View */}
        {isMulti && projectView === 'overview' ? (
          <div className="space-y-4">
            {/* Project Metrics Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Files</span>
                <span className="text-lg font-bold text-slate-100 font-mono">{projectSummary.fileCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
                <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-semibold">Total Bugs</span>
                <span className="text-lg font-bold text-rose-300 font-mono">{projectSummary.totalBugs}</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
                <span className="text-[10px] text-purple-400 uppercase tracking-wider block font-semibold">Security Risks</span>
                <span className="text-lg font-bold text-purple-300 font-mono">{projectSummary.totalSecurityIssues}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">Performance</span>
                <span className="text-lg font-bold text-amber-300 font-mono">{projectSummary.totalPerformanceIssues}</span>
              </div>
            </div>

            {/* File-by-File Breakdown Cards */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <span>File-by-File Audit Breakdown ({multiFiles.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {multiFiles.map((file, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedFileIdx(idx);
                      setProjectView('file');
                      if (onSelectFile) onSelectFile(idx);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                          {file.filename}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {file.language}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {file.summary}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] font-mono">
                      <span className="text-slate-400">
                        Score: <strong className={file.qualityScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}>{file.qualityScore}/100</strong>
                      </span>
                      <span className="text-slate-400">
                        {file.bugs?.length || 0} bugs • {file.security?.length || 0} sec
                      </span>
                    </div>

                    {file.isIncomplete && (
                      <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                        ⚠️ Incomplete review (Large file)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 1. BUGS SECTION */}
            {(activeTab === 'all' || activeTab === 'bugs') && (
              <BugSection bugs={bugs} onExplain={setExplainingFinding} />
            )}

            {/* 2. PERFORMANCE SECTION */}
            {(activeTab === 'all' || activeTab === 'performance') && (
              <PerformanceSection performance={performance} onExplain={setExplainingFinding} />
            )}

            {/* 3. SECURITY SECTION */}
            {(activeTab === 'all' || activeTab === 'security') && (
              <SecuritySection security={security} onExplain={setExplainingFinding} />
            )}

            {/* 4. SUGGESTIONS SECTION */}
            {activeTab === 'all' && (
              <SuggestionsSection suggestions={suggestions} />
            )}

            {/* 5. DIFF TAB (Original vs Refactored Code) */}
            {activeTab === 'diff' && (
              <div className="h-[380px] sm:h-[420px] w-full max-w-full overflow-hidden">
                <DiffViewer originalCode={formattedRawCode} refactoredCode={formattedRefactoredCode} />
              </div>
            )}

            {/* 6. REFACTORED CODE */}
            {activeTab === 'refactored' && (
              <RefactoredSection
                refactoredCode={formattedRefactoredCode}
                handleCopyCode={handleCopyCode}
                codeCopied={codeCopied}
              />
            )}
          </>
        )}

      </div>

      {/* Export Panel Footer */}
      <ExportPanel
        analysisData={{ ...targetData, refactoredCode: formattedRefactoredCode }}
        rawCode={formattedRawCode}
      />

      {/* Explain Finding Modal (On-demand Diagnostic) */}
      {explainingFinding && (
        <ExplainModal
          finding={explainingFinding}
          language={isMulti && activeFile ? activeFile.language : language}
          rawCode={formattedRawCode}
          onClose={() => setExplainingFinding(null)}
        />
      )}

    </div>
  );
}

AnalysisDashboard.propTypes = {
  analysisData: PropTypes.object,
  executionTimeMs: PropTypes.number,
  rawCode: PropTypes.string,
  language: PropTypes.string,
  onClose: PropTypes.func,
  files: PropTypes.array,
  activeFileIndex: PropTypes.number,
  onSelectFile: PropTypes.func
};
