import React, { useRef, useState, useMemo, useEffect, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Play, Upload, Trash2, Code2, Sparkles, Loader2 } from 'lucide-react';
import { SAMPLE_PRESETS } from './SamplePresets';
import { detectCodeLanguage } from '../utils/languageDetector';
import LanguageDropdown from './LanguageDropdown';

// Lazy-load Monaco Editor for optimal bundle performance
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const LANGUAGE_TO_MONACO = {
  'Auto-detect': 'javascript',
  'JavaScript': 'javascript',
  'React JS': 'javascript',
  'TypeScript': 'typescript',
  'React TS': 'typescript',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'C': 'c',
  'C#': 'csharp',
  'PHP': 'php',
  'Go': 'go',
  'Rust': 'rust',
  'HTML': 'html',
  'CSS': 'css',
  'SQL': 'sql'
};

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 ||
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
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
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [useMonaco, setUseMonaco] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = sessionStorage.getItem('preferred_editor_mode');
      if (saved !== null) return saved === 'monaco';
    } catch (_) {}
    return !isMobileDevice();
  });

  const toggleEditorMode = () => {
    setUseMonaco((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem('preferred_editor_mode', next ? 'monaco' : 'simple');
      } catch (_) {}
      return next;
    });
  };

  // Line count calculation
  const codeLines = useMemo(() => (code ? code.split('\n') : ['']), [code]);
  const lineCount = useMemo(() => (code ? codeLines.length : 0), [code, codeLines]);

  // Responsive mobile view detection for adaptive layout bounds
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Naturally adapt vertical editor height for mobile based on line count (short code hugs naturally)
  const mobileEditorHeight = useMemo(() => {
    // 20px per line (leading-5) + 24px vertical padding (py-3) + 8px buffer
    const contentHeight = Math.max(codeLines.length, 1) * 20 + 32;
    return Math.min(Math.max(contentHeight, 130), 380);
  }, [codeLines.length]);

  // Real-time language detection for code snippets
  const detectedInfo = useMemo(() => {
    return detectCodeLanguage(code);
  }, [code]);

  const monacoLanguage = useMemo(() => {
    if (language && language !== 'Auto-detect') {
      return LANGUAGE_TO_MONACO[language] || 'javascript';
    }
    return detectedInfo.monacoLang;
  }, [language, detectedInfo]);

  // Synchronize textarea scrolling with line number gutter
  const handleTextareaScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Enable Tab indentation in textarea
  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      setCode(newVal);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  // Disable intrusive false-positive syntax error squiggles for snippets
  const handleEditorBeforeMount = (monaco) => {
    if (monaco?.languages?.typescript) {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true
      });
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true
      });
    }
  };

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
    <div className="glass-panel rounded-2xl p-3.5 sm:p-5 border border-slate-800 flex flex-col h-auto lg:h-full min-h-0 shadow-2xl relative overflow-hidden w-full max-w-full">
      
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mb-3 shrink-0 w-full">
        
        {/* Modern Animated Language Selector */}
        <div className="flex items-center space-x-2 min-w-0">
          <LanguageDropdown
            language={language}
            setLanguage={setLanguage}
            detectedName={detectedInfo?.displayName}
          />
          {language === 'Auto-detect' && code.trim() && (
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 shrink-0 shadow-sm animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Detected: {detectedInfo.displayName}</span>
            </span>
          )}
        </div>

        {/* Action Buttons: Mode Toggle, Upload & Clear */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={toggleEditorMode}
            type="button"
            className={`inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 sm:px-3 py-2 min-h-[40px] rounded-lg border transition-all shadow-sm shrink-0 cursor-pointer ${
              useMonaco
                ? 'bg-cyan-950/50 text-cyan-300 border-cyan-700/80 hover:bg-cyan-900/60'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={useMonaco ? 'Switch to Fast Mobile Editor' : 'Switch to Monaco IDE'}
          >
            {useMonaco ? (
              <>
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px]">IDE</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Fast</span>
              </>
            )}
          </button>

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
            className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 sm:px-3 py-2 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-sm shrink-0 cursor-pointer"
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
              className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 sm:px-3 py-2 min-h-[40px] rounded-lg bg-slate-800 hover:bg-rose-950/50 active:scale-95 disabled:opacity-50 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all shrink-0 cursor-pointer"
              title="Clear Editor"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

      </div>

      {/* 1-Click Sample Presets */}
      <div className="mb-3 shrink-0 w-full">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-cyan-400" /> 1-Click Presets:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              disabled={isAnalyzing}
              className="text-left px-2 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 hover:border-cyan-500/50 transition-all group cursor-pointer"
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

      {/* Editor Container (Monaco IDE with Fast Native Editor Fallback) */}
      <div
        className="relative flex-none lg:flex-1 w-full max-w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex flex-col transition-[height] duration-200 ease-out touch-pan-y lg:h-full lg:min-h-0"
        style={{
          height: isMobileView ? `${mobileEditorHeight}px` : undefined,
          minHeight: isMobileView ? '130px' : undefined,
          maxHeight: isMobileView ? '380px' : undefined,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {useMonaco ? (
          <Suspense
            fallback={
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-500 font-mono space-y-2 p-4">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <span>Loading Monaco IDE Engine...</span>
                <button
                  type="button"
                  onClick={() => setUseMonaco(false)}
                  className="text-[11px] text-cyan-400 underline hover:text-cyan-300 mt-1 cursor-pointer"
                >
                  Switch to Fast Editor
                </button>
              </div>
            }
          >
            <MonacoEditor
              height="100%"
              language={monacoLanguage}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              beforeMount={handleEditorBeforeMount}
              onMount={(editor) => {
                setTimeout(() => {
                  try {
                    editor.layout();
                  } catch (_) {}
                }, 100);
              }}
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
                contextmenu: true,
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
                overviewRulerLanes: 0,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  alwaysConsumeMouseWheel: false,
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8
                }
              }}
            />
          </Suspense>
        ) : (
          <div className="flex-1 flex w-full h-full min-h-0 bg-slate-950 overflow-hidden">
            {/* Synchronized Line Numbers Gutter */}
            <div
              ref={lineNumbersRef}
              className="select-none py-3 pl-3 pr-2 text-right font-mono text-xs text-slate-600 bg-slate-950 border-r border-slate-800/80 overflow-y-hidden overflow-x-hidden shrink-0 pointer-events-none"
              style={{ minWidth: '2.75rem' }}
              aria-hidden="true"
            >
              {codeLines.map((_, i) => (
                <div key={i + 1} className="h-5 leading-5 text-[11px] text-slate-500 font-mono">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Native Code Textarea with High-Performance Mobile Responsiveness */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleTextareaScroll}
              onKeyDown={handleTextareaKeyDown}
              placeholder="// Paste code here or select a sample preset above..."
              className="flex-1 h-full py-3 px-3 bg-transparent text-slate-100 placeholder-slate-600 font-mono text-xs leading-5 resize-none focus:outline-none overflow-x-auto overflow-y-auto whitespace-pre touch-pan-y"
              style={{
                WebkitOverflowScrolling: 'touch',
                tabSize: 2,
                overscrollBehaviorY: 'contain'
              }}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
            />
          </div>
        )}
      </div>

      {/* Footer Info & Analyze CTA */}
      <div className="mt-3 sm:mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0 w-full">
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
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 active:scale-95 cursor-pointer'
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
