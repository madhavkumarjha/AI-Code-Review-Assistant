import React, { useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Play, Upload, Trash2, Code2, Sparkles, Loader2 } from 'lucide-react';
import { SAMPLE_PRESETS } from './SamplePresets';

export default function CodeInput({
  code,
  setCode,
  language,
  setLanguage,
  onAnalyze,
  isAnalyzing,
  onFileUpload
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Memoize line numbers calculation to prevent expensive recalculations on every render
  const lines = useMemo(() => (code ? code.split('\n') : ['']), [code]);
  const lineCount = lines.length;

  const handlePresetSelect = (preset) => {
    setCode(preset.code);
    setLanguage(preset.language);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        await onFileUpload(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col h-full min-h-[600px] shadow-2xl relative">
      
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        
        {/* Language Selector */}
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="Auto-detect">✨ Auto-detect Language</option>
            <option value="JavaScript">JavaScript / Node.js</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++ / C</option>
            <option value="Go">Go</option>
            <option value="HTML">HTML / CSS</option>
          </select>
        </div>

        {/* Action Buttons: Clear & Upload */}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.html,.css,.txt"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isAnalyzing}
            className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Upload code file (.js, .py, .java, .cpp)"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
          </button>

          {code && (
            <button
              onClick={() => setCode('')}
              disabled={isAnalyzing}
              className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/50 disabled:opacity-50 text-slate-400 hover:text-red-400 border border-slate-700 transition-all"
              title="Clear Editor"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

      </div>

      {/* Sample Presets Quick Loader */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-cyan-400" /> 1-Click Portfolio Demo Samples:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              disabled={isAnalyzing}
              className="text-left px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 hover:border-cyan-500/50 transition-all group"
            >
              <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {preset.language}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="relative flex-1 min-h-[480px] max-h-[520px] bg-slate-950 rounded-xl border border-slate-800 overflow-y-auto flex flex-row items-stretch font-mono text-sm">
        
        {/* Line Numbers Column */}
        <div
          className="w-12 py-3 bg-slate-900/80 text-slate-500 text-right pr-3 select-none border-r border-slate-800/80 shrink-0 pointer-events-none"
          style={{
            fontFamily: "'Fira Code', Consolas, Monaco, monospace",
            fontSize: '14px',
            lineHeight: '24px',
            minHeight: '100%'
          }}
        >
          {lines.map((_, i) => (
            <div key={i + 1} style={{ height: '24px', lineHeight: '24px' }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Input */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste your code here or select a 1-click sample preset above...&#10;&#10;function calculateTotal(items) {&#10;  return items.reduce((acc, item) => acc + item.price, 0);&#10;}"
          className="flex-1 w-full py-3 px-4 bg-transparent text-slate-100 placeholder-slate-600 resize-none focus:outline-none overflow-hidden whitespace-pre border-none outline-none block"
          style={{
            fontFamily: "'Fira Code', Consolas, Monaco, monospace",
            fontSize: '14px',
            lineHeight: '24px',
            tabSize: 4,
            height: `${Math.max(lineCount * 24 + 24, 480)}px`,
            minHeight: '100%',
            boxSizing: 'border-box'
          }}
          spellCheck="false"
        />
      </div>

      {/* Footer Info & Analyze CTA */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-mono flex items-center space-x-3">
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{code.length} chars</span>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || isUploading || !code.trim()}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 ${
            isAnalyzing || isUploading || !code.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Analyze Code</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

CodeInput.propTypes = {
  code: PropTypes.string.isRequired,
  setCode: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  setLanguage: PropTypes.func.isRequired,
  onAnalyze: PropTypes.func.isRequired,
  isAnalyzing: PropTypes.bool.isRequired,
  onFileUpload: PropTypes.func.isRequired
};

