import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CodeInput from './components/CodeInput';
import LoadingView from './components/LoadingView';
import AnalysisDashboard from './components/AnalysisDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Auto-detect');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Enforce dark mode class permanently
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

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

      setAnalysisData(resData.data);
      setExecutionTimeMs(resData.executionTimeMs || (Date.now() - startTime));
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

      setAnalysisData(resData.data);
      setExecutionTimeMs(resData.executionTimeMs || (Date.now() - startTime));
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
        
        {/* Sticky Header (64px) */}
        <Header isAnalyzing={isAnalyzing} />

        {/* Main 2-Column Workspace (No page scroll on desktop) */}
        <main className="flex-1 min-h-0 lg:h-[calc(100vh-64px)] p-3 sm:p-4 lg:p-5 max-w-[1600px] w-full mx-auto overflow-y-auto lg:overflow-hidden overflow-x-hidden flex flex-col">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-3 sm:mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center justify-between text-xs font-mono shadow-lg shrink-0">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* 2-Column Split Workspace (Left 40% | Right 60%) */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 flex-1 min-h-0 items-stretch w-full max-w-full">
            
            {/* Left Column: Code Input & Controls (40%) */}
            <div className="w-full lg:w-[40%] flex flex-col min-h-[380px] lg:h-full lg:min-h-0 shrink-0">
              <CodeInput
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                onFileUpload={handleFileUpload}
              />
            </div>

            {/* Right Column: Loading or Analysis Results (60%) */}
            <div className="w-full lg:w-[60%] flex flex-col min-h-[420px] lg:h-full lg:min-h-0 shrink-0 mt-2 lg:mt-0">
              {isAnalyzing ? (
                <LoadingView />
              ) : (
                <AnalysisDashboard
                  analysisData={analysisData}
                  executionTimeMs={executionTimeMs}
                  rawCode={code}
                />
              )}
            </div>

          </div>

        </main>

      </div>
    </ErrorBoundary>
  );
}

