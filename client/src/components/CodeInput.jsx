import React, { useRef, useState, useMemo, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Play, Upload, Trash2, Code2, Sparkles, Loader2 } from 'lucide-react';
import { SAMPLE_PRESETS } from './SamplePresets';

// Lazy-load Monaco Editor for optimal bundle performance
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const LANGUAGE_TO_MONACO = {
  'Auto-detect': 'javascript',
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'Go': 'go',
  'HTML': 'html'
};

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
  const [useMonaco, setUseMonaco] = useState(true);

  // Line count calculation
  const lineCount = useMemo(() => (code ? code.split('\n').length : 0), [code]);

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

  const monacoLanguage = LANGUAGE_TO_MONACO[language] || 'javascript';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col h-full min-h-0 shadow-2xl relative overflow-hidden">
      
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
        
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

        {/* Action Buttons: Upload & Clear */}
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
            className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-sm"
            title="Upload code file (.js, .py, .java, .cpp)"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
          </button>

          {code && (
            <button
              onClick={() => setCode('')}
              disabled={isAnalyzing}
              className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 disabled:opacity-50 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all"
              title="Clear Editor"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

      </div>

      {/* 1-Click Sample Presets */}
      <div className="mb-3 shrink-0">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-cyan-400" /> 1-Click Presets:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              disabled={isAnalyzing}
              className="text-left px-2 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 hover:border-cyan-500/50 transition-all group"
            >
              <div className="text-[11px] font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                {preset.name}
              </div>
              <div className="text-[9px] text-slate-500 truncate font-mono">
                {preset.language}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Container (Monaco with Textarea Fallback) */}
      <div className="relative flex-1 min-h-0 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex flex-col">
        {useMonaco ? (
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-mono">
                Loading Monaco Engine...
              </div>
            }
          >
            <MonacoEditor
              height="100%"
              language={monacoLanguage}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Fira Code', Menlo, Monaco, monospace",
                fontLigatures: true,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'all',
                contextmenu: true
              }}
            />
          </Suspense>
        ) : (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste code here or select a sample preset..."
            className="w-full h-full p-3 bg-transparent text-slate-100 placeholder-slate-600 font-mono text-xs resize-none focus:outline-none"
            spellCheck="false"
          />
        )}
      </div>

      {/* Footer Info & Analyze CTA */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-slate-500 font-mono flex items-center space-x-2">
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{code.length} chars</span>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || isUploading || !code.trim()}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all duration-200 shadow-md ${
            isAnalyzing || isUploading || !code.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 active:scale-95'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Code...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
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
