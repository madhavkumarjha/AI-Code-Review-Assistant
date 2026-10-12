import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ShieldAlert, Zap, Sparkles } from 'lucide-react';

const ANALYSIS_STAGES = [
  { icon: Cpu, label: 'Parsing AST & Code Semantics...', color: 'text-cyan-400' },
  { icon: ShieldAlert, label: 'Scanning Security & Injection Vectors...', color: 'text-emerald-400' },
  { icon: Zap, label: 'Evaluating Time & Memory Complexity...', color: 'text-amber-400' },
  { icon: Sparkles, label: 'Synthesizing Production Refactored Code...', color: 'text-indigo-400' }
];

export default function ProgressToast({ isVisible }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 850);

    return () => clearInterval(interval);
  }, [isVisible]);

  const CurrentIcon = ANALYSIS_STAGES[stageIndex].icon;
  const currentLabel = ANALYSIS_STAGES[stageIndex].label;
  const currentColor = ANALYSIS_STAGES[stageIndex].color;
  const progressPercent = Math.min(95, ((stageIndex + 1) / ANALYSIS_STAGES.length) * 100);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-[76px] sm:top-20 left-0 right-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-4">
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="w-full max-w-md pointer-events-auto shadow-2xl drop-shadow-2xl"
          >
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 p-3 sm:px-4 sm:py-3.5 flex flex-col gap-2">
            
            {/* Top row: Icon, Step label, and Status pill */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="relative w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <CurrentIcon className={`w-4 h-4 ${currentColor} animate-pulse`} />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <span>Neural Analysis</span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono">Step {stageIndex + 1}/4</span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 truncate">
                    {currentLabel}
                  </div>
                </div>
              </div>

              {/* Pulsing Live badge */}
              <div className="shrink-0 flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live</span>
              </div>
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-slate-800/80 rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full"
                initial={{ width: '15%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </div>

          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

ProgressToast.propTypes = {
  isVisible: PropTypes.bool.isRequired
};
