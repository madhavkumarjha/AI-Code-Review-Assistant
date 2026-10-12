import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles, Code2 } from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { value: 'Auto-detect', label: 'Auto-detect Language', icon: Sparkles, color: 'text-cyan-400', dot: 'bg-cyan-400' },
  { value: 'JavaScript', label: 'JavaScript / Node.js', dot: 'bg-amber-400' },
  { value: 'TypeScript', label: 'TypeScript', dot: 'bg-blue-400' },
  { value: 'Python', label: 'Python', dot: 'bg-emerald-400' },
  { value: 'Go', label: 'Go', dot: 'bg-cyan-300' },
  { value: 'Java', label: 'Java', dot: 'bg-orange-400' },
  { value: 'C++', label: 'C++ / C', dot: 'bg-indigo-400' },
  { value: 'HTML', label: 'HTML / CSS', dot: 'bg-rose-400' }
];

export default function LanguageDropdown({ language, setLanguage, detectedName }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.value === language) || LANGUAGE_OPTIONS[0];

  return (
    <div className="relative min-w-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 text-xs font-mono rounded-xl px-3 py-2 min-h-[40px] focus:outline-none transition-all cursor-pointer shadow-md active:scale-98 group"
      >
        <div className="flex items-center space-x-1.5 truncate">
          {currentOption.icon ? (
            <currentOption.icon className={`w-3.5 h-3.5 ${currentOption.color || 'text-cyan-400'} shrink-0`} />
          ) : (
            <span className={`w-2 h-2 rounded-full ${currentOption.dot} shrink-0`} />
          )}
          <span className="truncate max-w-[130px] sm:max-w-none font-medium text-slate-200 group-hover:text-white">
            {currentOption.label}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {/* Animated Glassmorphic Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-50 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl shadow-cyan-950/60 p-1.5 overflow-hidden ring-1 ring-cyan-500/20"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
              <span>Select Language</span>
              <span className="text-cyan-400 text-[9px] font-mono">Syntax Grammar</span>
            </div>

            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              {LANGUAGE_OPTIONS.map((opt) => {
                const isSelected = language === opt.value;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setLanguage(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {IconComponent ? (
                        <IconComponent className={`w-3.5 h-3.5 ${opt.color || 'text-cyan-400'} shrink-0`} />
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0 ring-2 ring-slate-800`} />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

LanguageDropdown.propTypes = {
  language: PropTypes.string.isRequired,
  setLanguage: PropTypes.func.isRequired,
  detectedName: PropTypes.string
};
