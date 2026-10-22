import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import CodeInput from './components/CodeInput';
import AnalysisDashboard from './components/AnalysisDashboard';
import ProgressToast from './components/ProgressToast';
import ErrorBoundary from './components/ErrorBoundary';
import { AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import { normalizeCodeFormatting } from './utils/codeFormatter';

export default function App() {
  const [files, setFiles] = useState([
    { id: '1', filename: 'main.js', code: '', language: 'Auto-detect' }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Active file helpers
  const activeFile = files[activeFileIndex] || files[0] || { id: '1', filename: 'main.js', code: '', language: 'Auto-detect' };
  const code = activeFile.code;
  const language = activeFile.language;

  // Enforce dark mode class permanently
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Update active file code with newline escape normalization
  const handleSetCode = (input) => {
    const formatted = (typeof input === 'string' && (input.includes('\\n') || input.includes('\\r\\n')))
      ? normalizeCodeFormatting(input)
      : input;

    setFiles((prev) => {
      const next = [...prev];
      if (next[activeFileIndex]) {
        next[activeFileIndex] = { ...next[activeFileIndex], code: formatted };
      }
      return next;
    });
  };

  // Update active file language
  const handleSetLanguage = (newLang) => {
    setFiles((prev) => {
      const next = [...prev];
      if (next[activeFileIndex]) {
        next[activeFileIndex] = { ...next[activeFileIndex], language: newLang };
      }
      return next;
    });
  };

  // Add a new file to the workspace
  const handleAddFile = () => {
    if (files.length >= 10) return;
    const nextIdx = files.length + 1;
    const newFile = {
      id: String(Date.now()),
      filename: `file_${nextIdx}.js`,
      code: '',
      language: 'Auto-detect'
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileIndex(files.length);
  };

  // Remove a file from the workspace
  const handleRemoveFile = (indexToRemove) => {
    if (files.length <= 1) {
      setFiles([{ id: '1', filename: 'main.js', code: '', language: 'Auto-detect' }]);
      setActiveFileIndex(0);
      return;
    }
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeFileIndex >= indexToRemove && activeFileIndex > 0) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };

  // Handle Code Analysis Request (Single-file or Multi-file)
  const handleAnalyze = async () => {
    const nonEmptyFiles = files.filter(f => f.code.trim().length > 0);
    if (nonEmptyFiles.length === 0) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    const startTime = Date.now();

    try {
      if (files.length === 1) {
        // Classic Single-File Mode (Zero Regression)
        const singleFile = files[0];
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: singleFile.code,
            language: singleFile.language
          })
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || 'Failed to complete code review analysis.');
        }

        setAnalysisData({
          ...resData.data,
          refactoredCode: normalizeCodeFormatting(resData.data?.refactoredCode),
          isFallback: Boolean(resData.isFallback),
          isMultiFile: false
        });
      } else {
        // Multi-File Project Review Mode
        const response = await fetch('/api/analyze/multi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            files: files.map(f => ({
              filename: f.filename,
              code: f.code,
              language: f.language
            }))
          })
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || 'Failed to complete multi-file review.');
        }

        const formattedFiles = (resData.files || []).map(f => ({
          ...f,
          refactoredCode: normalizeCodeFormatting(f.refactoredCode)
        }));

        setAnalysisData({
          ...resData,
          files: formattedFiles,
          isMultiFile: true,
          qualityScore: resData.projectSummary?.overallScore || 85
        });
      }

      setExecutionTimeMs(Date.now() - startTime);
      setIsDrawerOpen(true);
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('results-drawer-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } catch (err) {
      console.error('Analysis request error:', err);
      setErrorMessage(err.message || 'An error occurred while connecting to backend service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle File Upload (Single file or multiple files via file dialog or drag-and-drop)
  const handleFileUpload = async (filesList) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    const startTime = Date.now();

    try {
      const fileArray = Array.from(filesList instanceof FileList ? filesList : [filesList]).slice(0, 10);
      if (fileArray.length === 0) return;

      const extMap = {
        '.js': 'JavaScript',
        '.jsx': 'React JS',
        '.ts': 'TypeScript',
        '.tsx': 'React TS',
        '.py': 'Python',
        '.java': 'Java',
        '.cpp': 'C++',
        '.c': 'C',
        '.cs': 'C#',
        '.go': 'Go',
        '.php': 'PHP',
        '.html': 'HTML',
        '.css': 'CSS',
        '.json': 'JSON',
        '.rs': 'Rust'
      };

      const readFilesPromises = fileArray.map(async (file, idx) => {
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return {
          id: String(Date.now() + idx),
          filename: file.name,
          code: text,
          language: extMap[ext] || 'Auto-detect'
        };
      });

      const loadedFiles = await Promise.all(readFilesPromises);
      setFiles(loadedFiles);
      setActiveFileIndex(0);

      // Trigger instant review
      if (loadedFiles.length === 1) {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: loadedFiles[0].code,
            language: loadedFiles[0].language
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Failed to analyze uploaded file.');
        }

        setAnalysisData({
          ...resData.data,
          refactoredCode: normalizeCodeFormatting(resData.data?.refactoredCode),
          isFallback: Boolean(resData.isFallback),
          isMultiFile: false
        });
      } else {
        const response = await fetch('/api/analyze/multi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: loadedFiles.map(f => ({
              filename: f.filename,
              code: f.code,
              language: f.language
            }))
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Failed to analyze uploaded files.');
        }

        const formattedFiles = (resData.files || []).map(f => ({
          ...f,
          refactoredCode: normalizeCodeFormatting(f.refactoredCode)
        }));

        setAnalysisData({
          ...resData,
          files: formattedFiles,
          isMultiFile: true,
          qualityScore: resData.projectSummary?.overallScore || 85
        });
      }

      setExecutionTimeMs(Date.now() - startTime);
      setIsDrawerOpen(true);
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('results-drawer-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMessage(err.message || 'Failed to analyze uploaded file(s).');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white w-full max-w-[100vw]">
        
        {/* Floating Real-Time Progress Toast */}
        <ProgressToast isVisible={isAnalyzing} />

        {/* Sticky Header (64px) */}
        <Header isAnalyzing={isAnalyzing} />

        {/* Main Workspace (Strictly overflow-x-hidden) */}
        <main className="flex-1 min-h-0 lg:h-[calc(100vh-64px)] p-3 sm:p-4 lg:p-5 max-w-[1700px] w-full mx-auto overflow-y-auto lg:overflow-hidden overflow-x-hidden flex flex-col">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-3 sm:mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center justify-between text-xs font-mono shadow-lg shrink-0">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white font-bold ml-4 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Dynamic Adaptive Workspace: Clean Focus Initial State -> Smooth Split Drawer Reveal */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 flex-1 min-h-0 items-stretch w-full max-w-full relative overflow-x-hidden">
            
            {/* Code Input Container: Expands cleanly in initial state, smoothly resizes when drawer opens */}
            <div
              className={`flex flex-col min-h-[380px] lg:h-full lg:min-h-0 transition-all duration-300 ease-in-out ${
                isDrawerOpen && analysisData
                  ? 'w-full lg:w-[42%] xl:w-[40%] shrink-0'
                  : 'w-full max-w-5xl mx-auto flex-1'
              }`}
            >
              <CodeInput
                code={code}
                setCode={handleSetCode}
                language={language}
                setLanguage={handleSetLanguage}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                onFileUpload={handleFileUpload}
                files={files}
                activeFileIndex={activeFileIndex}
                onSelectFile={setActiveFileIndex}
                onAddFile={handleAddFile}
                onRemoveFile={handleRemoveFile}
              />
            </div>

            {/* Results Drawer Panel: Animated Slide-In from Right */}
            <AnimatePresence>
              {isDrawerOpen && analysisData && (
                <motion.div
                  id="results-drawer-container"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full lg:flex-1 flex flex-col min-h-[440px] lg:h-full lg:min-h-0 shrink-0 transition-all duration-300 ease-in-out"
                >
                  <AnalysisDashboard
                    analysisData={analysisData}
                    executionTimeMs={executionTimeMs}
                    rawCode={code}
                    language={language}
                    files={files}
                    activeFileIndex={activeFileIndex}
                    onSelectFile={setActiveFileIndex}
                    onClose={() => setIsDrawerOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Quick-Reopen Floating Pill (When drawer is minimized but results exist) */}
          <AnimatePresence>
            {!isDrawerOpen && analysisData && (
              <motion.button
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                onClick={() => setIsDrawerOpen(true)}
                className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-xl shadow-cyan-500/25 flex items-center space-x-2 cursor-pointer transition-all duration-200 active:scale-95 border border-cyan-400/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>View Results Drawer ({analysisData.qualityScore}/100)</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </motion.button>
            )}
          </AnimatePresence>

        </main>

      </div>
    </ErrorBoundary>
  );
}

