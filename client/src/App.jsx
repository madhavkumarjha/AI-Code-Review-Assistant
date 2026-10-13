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
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Auto-detect');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Enforce dark mode class permanently
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Automatically format code if input contains literal \n or \r\n escape sequences
  const handleSetCode = (input) => {
    if (typeof input === 'string' && (input.includes('\\n') || input.includes('\\r\\n'))) {
      setCode(normalizeCodeFormatting(input));
    } else {
      setCode(input);
    }
  };

  // Handle Code Analysis Request
  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          language
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to complete code review analysis.');
      }

      setAnalysisData({
        ...resData.data,
        refactoredCode: normalizeCodeFormatting(resData.data?.refactoredCode),
        isFallback: Boolean(resData.isFallback)
      });
      setExecutionTimeMs(resData.executionTimeMs || (Date.now() - startTime));
      setIsDrawerOpen(true); // Automatically reveal drawer on arrival
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

  // Handle File Upload directly via API with Promise resolution to eliminate race condition
  const handleFileUpload = async (file) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Read file content first before sending to API
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
      });

      setCode(fileContent);

      const formData = new FormData();
      formData.append('file', file);

      const startTime = Date.now();

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to analyze uploaded file.');
      }

      setAnalysisData({
        ...resData.data,
        refactoredCode: normalizeCodeFormatting(resData.data?.refactoredCode),
        isFallback: Boolean(resData.isFallback)
      });
      setExecutionTimeMs(resData.executionTimeMs || (Date.now() - startTime));
      setIsDrawerOpen(true);
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('results-drawer-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMessage(err.message || 'Failed to analyze uploaded file.');
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
                setLanguage={setLanguage}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                onFileUpload={handleFileUpload}
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

