import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Sparkles, Check, Copy, X, AlertCircle, ShieldAlert, Zap, Loader2, BookOpen } from 'lucide-react';

export default function ExplainModal({ finding, language = 'JavaScript', rawCode = '', onClose }) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [diagnostic, setDiagnostic] = useState(null);

  const title = finding?.issue || finding?.title || finding?.vulnerability || 'Code Finding';
  const location = finding?.line || 'Global Scope';
  const severity = finding?.severity || finding?.riskLevel || finding?.impact || 'Notice';
  const initialRecommendation = finding?.recommendation || finding?.fix || finding?.detail || 'Review and refactor code logic.';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function fetchExplanation() {
      try {
        const response = await fetch('/api/analyze/explain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            finding,
            code: rawCode,
            language
          })
        });

        const resData = await response.json();
        if (isMounted) {
          if (response.ok && resData?.data) {
            setDiagnostic(resData.data);
          } else {
            // Local fallback if API fails
            setDiagnostic({
              rootCause: `Underlying implementation anomaly in ${language}: "${title}". Execution branches at ${location} require explicit error handling and bounds verification.`,
              technicalImpact: `Can cause unexpected runtime termination, unhandled exceptions, or state inconsistencies under concurrent execution.`,
              remediation: initialRecommendation,
              bestPractice: `Enforce defensive parameter validation, automated regression test coverage, and strict linting constraints.`
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch explanation:', err);
        if (isMounted) {
          setDiagnostic({
            rootCause: `Underlying implementation anomaly in ${language}: "${title}". Execution branches at ${location} require explicit verification.`,
            technicalImpact: `Can lead to unexpected exceptions or degraded reliability under load.`,
            remediation: initialRecommendation,
            bestPractice: `Enforce defensive parameter validation and error boundary checks.`
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (finding) {
      fetchExplanation();
    }

    return () => {
      isMounted = false;
    };
  }, [finding, rawCode, language]);

  if (!finding) return null;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentRemediation = diagnostic?.remediation || initialRecommendation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-2xl space-y-3.5 sm:space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm shadow-cyan-500/10">
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

        {/* Diagnostic State */}
        {isLoading ? (
          <div className="py-8 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">Synthesizing AI Diagnostic...</p>
              <p className="text-[11px] text-slate-500 font-mono">Analyzing root cause, failure scenarios &amp; safe remediations</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 animate-fadeIn">
            
            {/* 1. Root Cause Analysis */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Root Cause &amp; Technical Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                {diagnostic?.rootCause}
              </p>
            </div>

            {/* 2. Runtime Impact */}
            {diagnostic?.technicalImpact && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Runtime Impact &amp; Failure Modes</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
                  {diagnostic.technicalImpact}
                </p>
              </div>
            )}

            {/* 3. Actionable Remediation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Recommended Remediation</span>
                </div>
                <button
                  onClick={() => handleCopy(currentRemediation)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-mono cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Fix'}</span>
                </button>
              </div>
              <div
                className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono text-emerald-200 whitespace-pre-wrap break-words overflow-x-auto w-full max-w-full touch-pan-x touch-pan-y"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {currentRemediation}
              </div>
            </div>

            {/* 4. Best Practice Prevention */}
            {diagnostic?.bestPractice && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Best Practice &amp; Prevention Pattern</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/20">
                  {diagnostic.bestPractice}
                </p>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
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
  rawCode: PropTypes.string,
  onClose: PropTypes.func.isRequired
};
