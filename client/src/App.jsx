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
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
        
        {/* Header */}
        <Header isAnalyzing={isAnalyzing} />

        {/* Main Container */}
        <main className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center justify-between text-xs font-mono shadow-lg">
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

          {/* 2-Column Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: Code Input & Controls */}
            <div>
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

            {/* Right Column: Loading Animation or Results Dashboard */}
            <div>
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

