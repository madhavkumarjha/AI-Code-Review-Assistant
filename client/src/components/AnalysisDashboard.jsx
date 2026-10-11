import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import ExportPanel from './ExportPanel';
import ScoreRing from './ScoreRing';
import DiffViewer from './DiffViewer';
import ExplainModal from './ExplainModal';

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
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
    <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
      <Bug className="w-4 h-4" />
      <span>Bugs &amp; Runtime Exceptions ({bugs.length})</span>
    </div>
    {bugs.length === 0 ? (
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
        <span>✅ No syntax errors or critical bugs detected.</span>
      </div>
    ) : (
      bugs.map((bug, i) => {
        const meta = getSeverityMeta(bug.severity);
        return (
          <div key={i} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs space-y-2 transition-all hover:border-rose-500/40">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-300 font-mono">{bug.line || 'Code Scope'}</span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badge}`}>
                  {meta.label}
                </span>
                <button
                  onClick={() => onExplain(bug)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center space-x-1 transition-all"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Explain</span>
                </button>
              </div>
            </div>
            <p className="text-slate-100 font-medium">{bug.issue}</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-rose-400">Fix:</strong> {bug.recommendation}
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
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
    <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
      <Zap className="w-4 h-4" />
      <span>Performance &amp; Time Complexity ({performance.length})</span>
    </div>
    {performance.length === 0 ? (
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
        ⚡ Logic appears computationally optimal.
      </div>
    ) : (
      performance.map((item, i) => {
        const meta = getSeverityMeta(item.impact);
        return (
          <div key={i} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-1.5 transition-all hover:border-amber-500/40">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300">{item.title}</span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badge}`}>
                  {meta.label}
                </span>
                <button
                  onClick={() => onExplain(item)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Deep Dive</span>
                </button>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{item.detail}</p>
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
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
    <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
      <ShieldAlert className="w-4 h-4" />
      <span>Security Scanning &amp; Injection Vectors ({security.length})</span>
    </div>
    {security.length === 0 ? (
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
        🔒 No security vulnerabilities identified.
      </div>
    ) : (
      security.map((sec, i) => {
        const meta = getSeverityMeta(sec.riskLevel);
        return (
          <div key={i} className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-1.5 transition-all hover:border-purple-500/40">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-300">{sec.vulnerability}</span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badge}`}>
                  {meta.label}
                </span>
                <button
                  onClick={() => onExplain(sec)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Mitigate</span>
                </button>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong className="text-purple-400">Mitigation:</strong> {sec.fix}
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
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
    <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
      <Lightbulb className="w-4 h-4" />
      <span>Best Practice Suggestions ({suggestions.length})</span>
    </div>
    {suggestions.map((s, i) => (
      <div key={i} className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex space-x-2 items-start">
        <span className="font-semibold text-cyan-300 shrink-0 font-mono">[{s.area}]:</span>
        <span className="text-slate-300 text-[11px] leading-relaxed">{s.recommendation}</span>
      </div>
    ))}
  </motion.div>
));
SuggestionsSection.displayName = 'SuggestionsSection';
SuggestionsSection.propTypes = {
  suggestions: PropTypes.array.isRequired
};

const RefactoredSection = React.memo(({ refactoredCode, handleCopyCode, codeCopied }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2 h-full flex flex-col">
    <div className="flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
        <Code2 className="w-4 h-4" />
        <span>Production-Ready Refactored Code</span>
      </div>
      <button
        onClick={handleCopyCode}
        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] text-emerald-400 border border-emerald-500/30 font-mono transition-all"
      >
        {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
      </button>
    </div>
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-auto leading-6 flex-1 shadow-inner">
      <pre><code>{refactoredCode}</code></pre>
    </div>
  </motion.div>
));
RefactoredSection.displayName = 'RefactoredSection';
RefactoredSection.propTypes = {
  refactoredCode: PropTypes.string,
  handleCopyCode: PropTypes.func.isRequired,
  codeCopied: PropTypes.bool.isRequired
};

export default function AnalysisDashboard({ analysisData, executionTimeMs, rawCode }) {
  const [activeTab, setActiveTab] = useState('all');
  const [codeCopied, setCodeCopied] = useState(false);
  const [explainingFinding, setExplainingFinding] = useState(null);

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

  const {
    summary,
    qualityScore = 80,
    bugs = [],
    performance = [],
    security = [],
    suggestions = [],
    refactoredCode,
    isFallback = false
  } = analysisData;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refactoredCode || '');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col h-full min-h-0 shadow-2xl relative overflow-hidden">
      
      {/* Fallback Demo Mode Banner if Offline */}
      {isFallback && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Demonstration Review Mode (Backend operating with offline heuristics).</span>
          </div>
        </div>
      )}

      {/* Top Header & Radial Score Ring */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800/80 mb-3 shrink-0">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-100">Audit Dashboard</h2>
            {executionTimeMs && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                ⚡ {(executionTimeMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{summary}</p>
        </div>

        {/* Animated Radial Score Ring (v2 Feature) */}
        <ScoreRing score={qualityScore} size={64} strokeWidth={6} />
      </div>

      {/* Tabs Bar (Includes Diff Tab) */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-3 border-b border-slate-800/60 text-xs font-medium shrink-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Dimensions ({bugs.length + performance.length + security.length + suggestions.length})
        </button>
        <button
          onClick={() => setActiveTab('bugs')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
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
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
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
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
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
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
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
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'refactored'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Refactored Code</span>
        </button>
      </div>

      {/* Main Content Area (Scrollable Panel) */}
      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">

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

        {/* 5. DIFF TAB (V2 Killer Feature) */}
        {activeTab === 'diff' && (
          <div className="h-[420px]">
            <DiffViewer originalCode={rawCode} refactoredCode={refactoredCode} />
          </div>
        )}

        {/* 6. REFACTORED CODE */}
        {activeTab === 'refactored' && (
          <RefactoredSection
            refactoredCode={refactoredCode}
            handleCopyCode={handleCopyCode}
            codeCopied={codeCopied}
          />
        )}

      </div>

      {/* Export Panel Footer */}
      <ExportPanel analysisData={analysisData} rawCode={rawCode} />

      {/* AI Disclaimer */}
      <div className="text-[10px] text-slate-500 text-center mt-3 font-mono">
        ⚠️ Autonomous code review. Verify refactored code before deploying to production.
      </div>

      {/* Explain Finding Modal (On-demand Diagnostic) */}
      {explainingFinding && (
        <ExplainModal
          finding={explainingFinding}
          language="Code"
          onClose={() => setExplainingFinding(null)}
        />
      )}

    </div>
  );
}

AnalysisDashboard.propTypes = {
  analysisData: PropTypes.shape({
    summary: PropTypes.string,
    qualityScore: PropTypes.number,
    bugs: PropTypes.array,
    performance: PropTypes.array,
    security: PropTypes.array,
    suggestions: PropTypes.array,
    refactoredCode: PropTypes.string,
    isFallback: PropTypes.bool
  }),
  executionTimeMs: PropTypes.number,
  rawCode: PropTypes.string
};
