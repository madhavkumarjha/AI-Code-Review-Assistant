import React, { useState } from 'react';
import { Copy, Download, Share2, Check, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ExportPanel({ analysisData, rawCode }) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shared, setShared] = useState(false);

  if (!analysisData) return null;

  // Copy full analysis report formatted as Markdown
  const handleCopyMarkdown = () => {
    const markdown = `# AI Code Review Report
Overall Quality Score: ${analysisData.qualityScore}/100

## Executive Summary
${analysisData.summary}

## 🐛 Bugs Detected
${analysisData.bugs?.map(b => `- [${b.severity || 'Medium'}] ${b.line}: ${b.issue} (Fix: ${b.recommendation})`).join('\n') || 'None'}

## ⚡ Performance Optimization
${analysisData.performance?.map(p => `- ${p.title}: ${p.detail}`).join('\n') || 'None'}

## 🔒 Security Vulnerabilities
${analysisData.security?.map(s => `- [${s.riskLevel || 'Medium'}] ${s.vulnerability}: ${s.fix}`).join('\n') || 'None'}

## 💡 Best Practices
${analysisData.suggestions?.map(s => `- ${s.area}: ${s.recommendation}`).join('\n') || 'None'}

## 🛠️ Refactored Code
\`\`\`
${analysisData.refactoredCode}
\`\`\`
`;
    navigator.clipboard.writeText(markdown);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Copy Refactored Code only
  const handleCopyRefactored = () => {
    navigator.clipboard.writeText(analysisData.refactoredCode || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate Professional PDF Executive Report using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Styling constants
    const margin = 15;
    let yPos = 20;

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('AI Code Review Assistant Report', margin, 15);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on ${new Date().toLocaleDateString()} via Groq AI Engine`, margin, 22);

    yPos = 40;

    // Summary Box
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, 180, 22, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Overall Code Quality Score: ${analysisData.qualityScore}/100`, margin + 5, yPos + 8);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(analysisData.summary || '', 170);
    doc.text(summaryLines, margin + 5, yPos + 15);

    yPos += 30;

    // Helper for Section
    const addSection = (title, items, formatter) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(title, margin, yPos);
      yPos += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      if (!items || items.length === 0) {
        doc.text('• No major issues detected.', margin + 4, yPos);
        yPos += 6;
        return;
      }

      items.forEach((item) => {
        const text = formatter(item);
        const lines = doc.splitTextToSize(`• ${text}`, 172);
        if (yPos + (lines.length * 4) > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(lines, margin + 4, yPos);
        yPos += lines.length * 4 + 2;
      });
      yPos += 4;
    };

    // Bugs
    addSection('1. Bugs & Syntax Errors', analysisData.bugs, (b) => `[${b.severity || 'Issue'}] ${b.line || ''}: ${b.issue} -> Recommendation: ${b.recommendation}`);
    
    // Performance
    addSection('2. Performance & Optimization', analysisData.performance, (p) => `${p.title}: ${p.detail}`);

    // Security
    addSection('3. Security Scanning', analysisData.security, (s) => `[${s.riskLevel || 'Risk'}] ${s.vulnerability} -> Fix: ${s.fix}`);

    // Suggestions
    addSection('4. Best Practices', analysisData.suggestions, (sg) => `${sg.area}: ${sg.recommendation}`);

    // Refactored Code on new page if needed
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 5;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('5. Refactored Code', margin, yPos);
    yPos += 6;

    doc.setFont('Courier', 'normal');
    doc.setFontSize(8);
    const codeLines = doc.splitTextToSize(analysisData.refactoredCode || rawCode, 175);
    
    // Draw code background box
    const codeHeight = Math.min(codeLines.length * 3.5 + 6, 120);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPos, 180, codeHeight, 'F');
    doc.setTextColor(30, 41, 59);
    doc.text(codeLines.slice(0, 30), margin + 4, yPos + 6);

    doc.save(`Code_Review_Report_${Date.now()}.pdf`);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80 mt-6">
      
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <FileText className="w-4 h-4 text-cyan-400" />
        <span>Export Options:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        
        {/* Copy All */}
        <button
          onClick={handleCopyMarkdown}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedAll ? 'Report Copied!' : 'Copy Markdown'}</span>
        </button>

        {/* Copy Refactored Code */}
        <button
          onClick={handleCopyRefactored}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
        >
          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{copiedCode ? 'Code Copied!' : 'Copy Refactored Code'}</span>
        </button>

        {/* PDF Download */}
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PDF Report</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          title="Share Review Link"
        >
          {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>

      </div>

    </div>
  );
}
