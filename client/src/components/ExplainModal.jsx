import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Sparkles, Check, Copy, X, AlertCircle } from 'lucide-react';

export default function ExplainModal({ finding, language = 'JavaScript', onClose }) {
  const [copied, setCopied] = useState(false);

  if (!finding) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const title = finding.issue || finding.title || finding.vulnerability || 'Code Issue';
  const recommendation = finding.recommendation || finding.fix || finding.detail || 'Review code logic.';
  const location = finding.line || 'Global Scope';
  const severity = finding.severity || finding.riskLevel || finding.impact || 'Notice';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-2xl space-y-3.5 sm:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 truncate">Deep Diagnostic &amp; Explanation</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">Language: {language} • Scope: {location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Issue Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-300 font-mono">{location}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {severity}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100">{title}</p>
        </div>

        {/* Diagnostic Explanation */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Root Cause &amp; Technical Analysis</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            This pattern represents a potential runtime anomaly or performance degradation in {language}. In production environments, unhandled asynchronous calls or unescaped variables can result in memory leakage or security vectors.
          </p>
        </div>

        {/* Actionable Resolution */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Recommended Remediation
            </span>
            <button
              onClick={() => handleCopy(recommendation)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-mono cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Fix'}</span>
            </button>
          </div>
          <div
            className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono text-emerald-200 whitespace-pre-wrap break-words overflow-x-auto w-full max-w-full touch-pan-y"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {recommendation}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

ExplainModal.propTypes = {
  finding: PropTypes.object,
  language: PropTypes.string,
  onClose: PropTypes.func.isRequired
};
