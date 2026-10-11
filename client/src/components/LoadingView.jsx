import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';

const STAGES = [
  { icon: Cpu, label: 'Tokenizing & Analyzing AST Structure...' },
  { icon: ShieldAlert, label: 'Scanning for Vulnerabilities & Injection Risks...' },
  { icon: Zap, label: 'Evaluating Time & Memory Complexity...' },
  { icon: CheckCircle2, label: 'Synthesizing Production-Grade Refactored Code...' }
];

export default function LoadingView() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center min-h-[420px] text-center shadow-2xl relative overflow-hidden">
      
      {/* Background Animated Pulse Glow */}
      <div className="absolute w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>

      {/* Spinner Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20"
      >
        <Zap className="w-8 h-8 text-white" />
      </motion.div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">
        AI Code Intelligence in Progress
      </h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        Autonomous multi-vector analysis evaluating bugs, security, complexity &amp; refactoring.
      </p>

      {/* Progress Steps List */}
      <div className="w-full max-w-md space-y-3">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                isCurrent
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : isDone
                  ? 'bg-slate-900/60 border-slate-800 text-emerald-400'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isCurrent ? 'animate-bounce text-cyan-400' : isDone ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className="flex-1 text-left">{stage.label}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
