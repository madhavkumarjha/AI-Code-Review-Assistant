import React from 'react';
import { ShieldCheck, Zap, Cpu } from 'lucide-react';

export default function Header({ isAnalyzing }) {
  return (
    <header className="h-[64px] shrink-0 glass-panel border-b border-slate-800/80 px-4 lg:px-8 flex items-center z-50">
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between">
        
        {/* Logo & Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AI Code Review Assistant
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="w-3 h-3 mr-1" /> Groq Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Instant 4-Dimensional Code Review & Refactoring in &lt; 3 Seconds
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            <span className="text-slate-300">
              {isAnalyzing ? 'Analyzing...' : 'System Ready'}
            </span>
          </div>

          {/* Model Info */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>groq-compound</span>
          </div>
        </div>

      </div>
    </header>
  );
}
