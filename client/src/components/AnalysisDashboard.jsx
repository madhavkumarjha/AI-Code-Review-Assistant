import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Zap, ShieldAlert, Lightbulb, Code2, Check, Copy, AlertTriangle, ShieldCheck } from 'lucide-react';
import ExportPanel from './ExportPanel';

export default function AnalysisDashboard({ analysisData, executionTimeMs, rawCode }) {
  const [activeTab, setActiveTab] = useState('all');
  const [codeCopied, setCodeCopied] = useState(false);

  if (!analysisData) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center min-h-[420px] text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
          <Code2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-1">No Analysis Output Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Paste your code snippet or select a sample preset on the left, then click <strong className="text-cyan-400">"Analyze Code"</strong> to generate real-time AI feedback.
        </p>
      </div>
    );
  }

  const { summary, qualityScore = 80, bugs = [], performance = [], security = [], suggestions = [], refactoredCode } = analysisData;

  const totalIssues = bugs.length + security.length;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30';
    if (score >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/30';
  };

  const getSeverityBadge = (level) => {
    const l = (level || 'medium').toLowerCase();
    if (l === 'high' || l === 'critical') return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (l === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refactoredCode || '');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col h-full shadow-2xl relative">
      
      {/* Top Header & Quality Score KPI */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-100">Analysis Results</h2>
            {executionTimeMs && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                ⚡ { (executionTimeMs / 1000).toFixed(2) }s
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{summary}</p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center space-x-2 ${getScoreColor(qualityScore)}`}>
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold tracking-wider opacity-80">Quality Score</div>
              <div className="text-xl font-extrabold font-mono leading-none">{qualityScore}<span className="text-xs font-normal opacity-70">/100</span></div>
            </div>
            {qualityScore >= 80 ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-amber-400" />}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-4 border-b border-slate-800/60 text-xs font-medium">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${activeTab === 'all' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
        >
          All Dimensions ({bugs.length + performance.length + security.length + suggestions.length})
        </button>
        <button
          onClick={() => setActiveTab('bugs')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${activeTab === 'bugs' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Bugs ({bugs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${activeTab === 'performance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Performance ({performance.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${activeTab === 'security' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Security ({security.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('refactored')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${activeTab === 'refactored' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Refactored Code</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-1">

        {/* 1. BUGS SECTION */}
        {(activeTab === 'all' || activeTab === 'bugs') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <Bug className="w-4 h-4" />
              <span>Bugs & Potential Exceptions ({bugs.length})</span>
            </div>
            {bugs.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                ✅ No critical bugs detected.
              </div>
            ) : (
              bugs.map((bug, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-300 font-mono">{bug.line || 'Code Scope'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityBadge(bug.severity)}`}>
                      {bug.severity || 'High'}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium">{bug.issue}</p>
                  <p className="text-slate-400 text-[11px]"><strong className="text-rose-400">Fix:</strong> {bug.recommendation}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* 2. PERFORMANCE SECTION */}
        {(activeTab === 'all' || activeTab === 'performance') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Performance & Optimization ({performance.length})</span>
            </div>
            {performance.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                ⚡ Code logic appears runtime efficient.
              </div>
            ) : (
              performance.map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300">{item.title}</span>
                    <span className="text-[10px] text-amber-400/80 font-mono">Impact: {item.impact || 'Medium'}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{item.detail}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* 3. SECURITY SECTION */}
        {(activeTab === 'all' || activeTab === 'security') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Security Scanning & Vulnerabilities ({security.length})</span>
            </div>
            {security.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                🔒 No security vulnerabilities detected.
              </div>
            ) : (
              security.map((sec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300">{sec.vulnerability}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityBadge(sec.riskLevel)}`}>
                      {sec.riskLevel || 'Medium'} Risk
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]"><strong className="text-purple-400">Mitigation:</strong> {sec.fix}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* 4. SUGGESTIONS / BEST PRACTICES SECTION */}
        {(activeTab === 'all') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Best Practice Suggestions ({suggestions.length})</span>
            </div>
            {suggestions.map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex space-x-2 items-start">
                <span className="font-semibold text-cyan-300 shrink-0">{s.area}:</span>
                <span className="text-slate-300 text-[11px]">{s.recommendation}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* 5. REFACTORED CODE BLOCK */}
        {(activeTab === 'all' || activeTab === 'refactored') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Code2 className="w-4 h-4" />
                <span>AI Refactored Code</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono"
              >
                {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-6">
              <pre><code>{refactoredCode}</code></pre>
            </div>
          </motion.div>
        )}

      </div>

      {/* Export Panel Footer */}
      <ExportPanel analysisData={analysisData} rawCode={rawCode} />

      {/* AI Disclaimer */}
      <div className="text-[10px] text-slate-500 text-center mt-3 font-mono">
        ⚠️ AI-generated code review. Verify refactored code before deploying to production.
      </div>

    </div>
  );
}
