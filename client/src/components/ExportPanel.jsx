import React, { useState } from 'react';
import PropTypes from 'prop-types';
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

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2); // 182mm
    const maxY = 268; // Leave margin for footer

    // Text Sanitizer: remove abnormal spacing and normalized characters
    const cleanStr = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/[ \t]+/g, ' ')
        .replace(/ - /g, ' – ')
        .trim();
    };

    let yPos = 0;

    // Helper: draw page header bar for page 1
    const drawCoverHeader = () => {
      // Top accent strip
      doc.setFillColor(6, 182, 212); // cyan-500
      doc.rect(0, 0, pageWidth, 3, 'F');

      // Navy primary header block
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 3, pageWidth, 32, 'F');

      // Decorative badge
      doc.setFillColor(30, 41, 59); // slate-800
      doc.roundedRect(margin, 9, 62, 5.5, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(6, 182, 212); // cyan
      doc.text('CODE INTELLIGENCE AUDIT REPORT', margin + 3, 12.8);

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('AI Code Review Executive Report', margin, 22);

      // Subtitle & Metadata
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      const now = new Date();
      const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      doc.text(`Generated: ${dateStr} at ${timeStr}  •  Multi-Pass Automated Static & Logic Analysis`, margin, 29);

      // Top right badge
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(pageWidth - margin - 38, 10, 38, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.text('● VERIFIED AUDIT', pageWidth - margin - 35, 14.2);

      yPos = 42;
    };

    // Helper: check page break
    const ensureSpace = (neededHeight, continueTitle = '') => {
      if (yPos + neededHeight > maxY) {
        doc.addPage();
        // Subtle top continuation line
        doc.setFillColor(6, 182, 212);
        doc.rect(0, 0, pageWidth, 2, 'F');
        yPos = 16;
        if (continueTitle) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(`${continueTitle} (Continued)`, margin, yPos);
          yPos += 7;
        }
      }
    };

    // Draw main header
    drawCoverHeader();

    // -------------------------------------------------------------
    // KPI METRICS DASHBOARD
    // -------------------------------------------------------------
    const score = Number(analysisData.qualityScore) || 0;
    const bugCount = analysisData.bugs?.length || 0;
    const secCount = analysisData.security?.length || 0;
    const perfCount = analysisData.performance?.length || 0;
    const suggCount = analysisData.suggestions?.length || 0;

    // Score status colors
    let scoreBg = [236, 253, 245]; // emerald-50
    let scoreBorder = [167, 243, 208]; // emerald-200
    let scoreText = [5, 150, 105]; // emerald-600
    let scoreLabel = 'PRODUCTION READY';

    if (score < 65) {
      scoreBg = [254, 242, 242]; // red-50
      scoreBorder = [254, 202, 202]; // red-200
      scoreText = [220, 38, 38]; // red-600
      scoreLabel = 'CRITICAL ATTENTION';
    } else if (score < 85) {
      scoreBg = [255, 251, 235]; // amber-50
      scoreBorder = [253, 230, 138]; // amber-200
      scoreText = [217, 119, 6]; // amber-600
      scoreLabel = 'NEEDS REFACTORING';
    }

    const cardHeight = 25;
    const col1W = 54;
    const subColW = (contentWidth - col1W - 6) / 3; // ~40.6mm each

    // Card 1: Score KPI
    doc.setFillColor(...scoreBg);
    doc.roundedRect(margin, yPos, col1W, cardHeight, 2, 2, 'F');
    doc.setDrawColor(...scoreBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, yPos, col1W, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('OVERALL QUALITY SCORE', margin + 4, yPos + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...scoreText);
    doc.text(`${score}`, margin + 4, yPos + 15);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('/ 100', margin + 17 + (score >= 100 ? 5 : 0), yPos + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...scoreText);
    doc.text(`● ${scoreLabel}`, margin + 4, yPos + 21);

    // Card 2: Bugs Count
    const c2X = margin + col1W + 2;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(c2X, yPos, subColW, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(c2X, yPos, subColW, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('BUGS & LOGIC', c2X + 4, yPos + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(bugCount > 0 ? 220 : 5, bugCount > 0 ? 38 : 150, bugCount > 0 ? 38 : 105);
    doc.text(`${bugCount}`, c2X + 4, yPos + 14.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(bugCount === 0 ? '✓ Zero Detected' : 'Issues Found', c2X + 4, yPos + 21);

    // Card 3: Security Count
    const c3X = c2X + subColW + 2;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(c3X, yPos, subColW, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(c3X, yPos, subColW, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('SECURITY RISKS', c3X + 4, yPos + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(secCount > 0 ? 220 : 5, secCount > 0 ? 38 : 150, secCount > 0 ? 38 : 105);
    doc.text(`${secCount}`, c3X + 4, yPos + 14.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(secCount === 0 ? '✓ Scope Secure' : 'Vulnerabilities', c3X + 4, yPos + 21);

    // Card 4: Performance & Suggestions Count
    const c4X = c3X + subColW + 2;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(c4X, yPos, subColW, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(c4X, yPos, subColW, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('OPTIMIZATIONS', c4X + 4, yPos + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text(`${perfCount + suggCount}`, c4X + 4, yPos + 14.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Suggestions Made', c4X + 4, yPos + 21);

    yPos += cardHeight + 5;

    // -------------------------------------------------------------
    // EXECUTIVE SUMMARY
    // -------------------------------------------------------------
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const summaryClean = cleanStr(analysisData.summary) || 'Comprehensive code analysis completed. Review the detailed sections below.';
    const sumLines = doc.splitTextToSize(summaryClean, contentWidth - 10);
    const sumBoxHeight = Math.max(16, (sumLines.length * 4.2) + 9);

    ensureSpace(sumBoxHeight + 6);

    // Background box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, contentWidth, sumBoxHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPos, contentWidth, sumBoxHeight, 2, 2, 'S');

    // Left cyan accent border
    doc.setFillColor(6, 182, 212);
    doc.rect(margin, yPos, 2.5, sumBoxHeight, 'F');

    // Title inside summary box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('EXECUTIVE SUMMARY', margin + 6, yPos + 6);

    // Summary lines
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(sumLines, margin + 6, yPos + 11.5);

    yPos += sumBoxHeight + 7;

    // -------------------------------------------------------------
    // SECTION BUILDER HELPER
    // -------------------------------------------------------------
    const renderAuditSection = ({ sectionNumber, title, count, items, renderCard, emptyMessage }) => {
      ensureSpace(18);

      // Section Header with pill badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${sectionNumber}. ${title}`, margin, yPos);

      // Count badge
      const countLabel = count === 0 ? 'CLEAN' : `${count} IDENTIFIED`;
      const badgeWidth = count === 0 ? 16 : 24;
      const countX = margin + doc.getTextWidth(`${sectionNumber}. ${title}`) + 3;
      
      doc.setFillColor(count === 0 ? 236 : 254, count === 0 ? 253 : 242, count === 0 ? 245 : 242);
      doc.roundedRect(countX, yPos - 3.8, badgeWidth, 4.8, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(count === 0 ? 5 : 220, count === 0 ? 150 : 38, count === 0 ? 105 : 38);
      doc.text(countLabel, countX + 2, yPos - 0.5);

      yPos += 5.5;

      // Empty State
      if (!items || items.length === 0) {
        doc.setFillColor(240, 253, 244); // emerald-50
        doc.roundedRect(margin, yPos, contentWidth, 8, 1.5, 1.5, 'F');
        doc.setDrawColor(187, 247, 208);
        doc.roundedRect(margin, yPos, contentWidth, 8, 1.5, 1.5, 'S');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(21, 128, 61);
        doc.text(`✓ ${emptyMessage}`, margin + 4, yPos + 5.2);

        yPos += 12;
        return;
      }

      // Items loop
      items.forEach((item, idx) => {
        renderCard(item, idx);
      });
      yPos += 3;
    };

    // 1. Bugs Section
    renderAuditSection({
      sectionNumber: '1',
      title: 'Bugs & Logic Exceptions',
      count: bugCount,
      items: analysisData.bugs,
      emptyMessage: 'No logic exceptions, edge-case crashes, or syntax bugs identified in this code.',
      renderCard: (bug) => {
        const sev = cleanStr(bug.severity) || 'Medium';
        const line = cleanStr(bug.line) || 'General';
        const issue = cleanStr(bug.issue);
        const fix = cleanStr(bug.recommendation);

        const issueLines = doc.splitTextToSize(issue, contentWidth - 36);
        const fixLines = doc.splitTextToSize(`Fix: ${fix}`, contentWidth - 36);
        const cardH = Math.max(15, (issueLines.length + fixLines.length) * 4 + 7);

        ensureSpace(cardH + 2, 'Bugs & Logic Exceptions');

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPos, contentWidth, cardH, 1.5, 1.5, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(margin, yPos, contentWidth, cardH, 1.5, 1.5, 'S');

        // Severity tag
        const isHigh = sev.toLowerCase().includes('high') || sev.toLowerCase().includes('crit');
        doc.setFillColor(isHigh ? 254 : 255, isHigh ? 242 : 251, isHigh ? 242 : 235);
        doc.roundedRect(margin + 3, yPos + 3, 16, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(isHigh ? 220 : 217, isHigh ? 38 : 119, isHigh ? 38 : 6);
        doc.text(sev.toUpperCase(), margin + 4.5, yPos + 6.5);

        // Line location
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(line, margin + 21, yPos + 6.5);

        // Issue description
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(issueLines, margin + 21, yPos + 11.5);

        // Fix
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(fixLines, margin + 21, yPos + 11.5 + (issueLines.length * 4));

        yPos += cardH + 2.5;
      }
    });

    // 2. Performance Section
    renderAuditSection({
      sectionNumber: '2',
      title: 'Performance & Resource Bottlenecks',
      count: perfCount,
      items: analysisData.performance,
      emptyMessage: 'Algorithms, memory usage, and execution loops operate within healthy bounds.',
      renderCard: (perf) => {
        const impact = cleanStr(perf.impact) || 'Medium';
        const title = cleanStr(perf.title);
        const detail = cleanStr(perf.detail);

        const detailLines = doc.splitTextToSize(detail, contentWidth - 36);
        const cardH = Math.max(14, (detailLines.length * 4) + 10);

        ensureSpace(cardH + 2, 'Performance Bottlenecks');

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPos, contentWidth, cardH, 1.5, 1.5, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(margin, yPos, contentWidth, cardH, 1.5, 1.5, 'S');

        // Impact tag
        doc.setFillColor(240, 249, 255);
        doc.roundedRect(margin + 3, yPos + 3, 16, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(2, 132, 199);
        doc.text(impact.toUpperCase(), margin + 4.5, yPos + 6.5);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin + 21, yPos + 6.5);

        // Detail
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(detailLines, margin + 21, yPos + 11.5);

        yPos += cardH + 2.5;
      }
    });

    // 3. Security Section
    renderAuditSection({
      sectionNumber: '3',
      title: 'Security Vulnerabilities',
      count: secCount,
      items: analysisData.security,
      emptyMessage: 'No injection risks, broken auth patterns, or credential leaks detected.',
      renderCard: (sec) => {
        const risk = cleanStr(sec.riskLevel) || 'Medium';
        const vuln = cleanStr(sec.vulnerability);
        const fix = cleanStr(sec.fix);

        const vulnLines = doc.splitTextToSize(vuln, contentWidth - 36);
        const fixLines = doc.splitTextToSize(`Mitigation: ${fix}`, contentWidth - 36);
        const cardH = Math.max(15, (vulnLines.length + fixLines.length) * 4 + 7);

        ensureSpace(cardH + 2, 'Security Vulnerabilities');

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPos, contentWidth, cardH, 1.5, 1.5, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(margin, yPos, contentWidth, cardH, 1.5, 1.5, 'S');

        // Risk tag
        const isCrit = risk.toLowerCase().includes('crit') || risk.toLowerCase().includes('high');
        doc.setFillColor(isCrit ? 254 : 255, isCrit ? 242 : 251, isCrit ? 242 : 235);
        doc.roundedRect(margin + 3, yPos + 3, 16, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(isCrit ? 220 : 217, isCrit ? 38 : 119, isCrit ? 38 : 6);
        doc.text(risk.toUpperCase(), margin + 4.5, yPos + 6.5);

        // Vulnerability
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(vulnLines, margin + 21, yPos + 6.8);

        // Fix
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(fixLines, margin + 21, yPos + 7.5 + (vulnLines.length * 4));

        yPos += cardH + 2.5;
      }
    });

    // 4. Best Practices Section
    renderAuditSection({
      sectionNumber: '4',
      title: 'Architectural & Best Practice Suggestions',
      count: suggCount,
      items: analysisData.suggestions,
      emptyMessage: 'Adheres cleanly to established design patterns and maintainability principles.',
      renderCard: (sug) => {
        const area = cleanStr(sug.area) || 'Best Practice';
        const rec = cleanStr(sug.recommendation);

        const recLines = doc.splitTextToSize(rec, contentWidth - 36);
        const cardH = Math.max(13, (recLines.length * 4) + 9);

        ensureSpace(cardH + 2, 'Best Practice Suggestions');

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPos, contentWidth, cardH, 1.5, 1.5, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(margin, yPos, contentWidth, cardH, 1.5, 1.5, 'S');

        // Area tag
        const areaWidth = Math.min(30, Math.max(22, area.length * 1.8 + 4));
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin + 3, yPos + 3, areaWidth, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(71, 85, 105);
        const areaDisplay = area.length > 15 ? `${area.substring(0, 14)}…` : area;
        doc.text(areaDisplay, margin + 4.5, yPos + 6.5);

        // Recommendation
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        const recLinesFit = doc.splitTextToSize(rec, contentWidth - areaWidth - 10);
        doc.text(recLinesFit, margin + areaWidth + 5, yPos + 6.8);

        yPos += cardH + 2.5;
      }
    });

    // -------------------------------------------------------------
    // 5. AI REFACTORED CODE (PAGINATED MONOSPACE CONTAINER)
    // -------------------------------------------------------------
    ensureSpace(35);

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('5. AI Refactored Code (Production Implementation)', margin, yPos);
    yPos += 5.5;

    const refactoredRaw = (analysisData.refactoredCode || rawCode || '// No refactored code available').trim();
    const rawLines = refactoredRaw.split(/\r?\n/);

    // Natural code line wrapping helper so lines wrap gracefully at word boundaries and never overflow or break words
    const wrapCodeLineNaturally = (line, maxLen = 72) => {
      // Normalize tabs to 2 spaces for consistent formatting
      const expandedLine = line.replace(/\t/g, '  ');
      if (expandedLine.length <= maxLen) {
        return [expandedLine];
      }

      const isComment = /^\s*(\/\/|\/\*|\*)/.test(expandedLine);
      const leadingWsMatch = expandedLine.match(/^(\s*)/);
      const leadingWs = leadingWsMatch ? leadingWsMatch[1] : '';

      // Continuation line prefix
      let continuationPrefix = '';
      if (/^\s*\/\//.test(expandedLine)) {
        continuationPrefix = `${leadingWs}//   `;
      } else if (/^\s*\*/.test(expandedLine)) {
        continuationPrefix = `${leadingWs}* `;
      } else {
        continuationPrefix = `${leadingWs}    `;
      }

      const result = [];
      let current = expandedLine;

      while (current.length > maxLen) {
        const slice = current.substring(0, maxLen);
        let breakAt = -1;

        if (isComment) {
          // Break at the last space before maxLen so comment words are never severed
          breakAt = slice.lastIndexOf(' ');
        } else {
          // Find natural code token split points: assignments, colons, logical operators, commas, open brackets, spaces
          const splitTokens = [' = ', ': ', '|| ', '&& ', ', ', '; ', ' => ', ' {', '( ', ') '];
          for (const tok of splitTokens) {
            const idx = slice.lastIndexOf(tok);
            if (idx > maxLen * 0.25 && idx + tok.length <= maxLen) {
              if (idx + tok.length > breakAt) {
                breakAt = idx + tok.length;
              }
            }
          }
          if (breakAt === -1) {
            const spaceIdx = slice.lastIndexOf(' ');
            if (spaceIdx > maxLen * 0.2) {
              breakAt = spaceIdx + 1;
            }
          }
        }

        // Fallback: if no clean breakpoint found, break at any space before maxLen, or maxLen
        if (breakAt <= 0) {
          const anySpace = slice.lastIndexOf(' ');
          breakAt = anySpace > 0 ? anySpace + 1 : maxLen;
        }

        const head = current.substring(0, breakAt).trimEnd();
        result.push(head);

        const tail = current.substring(breakAt).trimStart();
        if (!tail) break;

        current = (result.length > 0 && isComment)
          ? (tail.startsWith('//') ? `${leadingWs}${tail}` : `${continuationPrefix}${tail}`)
          : `${continuationPrefix}${tail}`;
      }

      if (current.trim().length > 0) {
        result.push(current);
      }

      return result.length > 0 ? result : [expandedLine];
    };

    const maxCharsPerLine = 72;
    const formattedCodeLines = [];
    rawLines.forEach((ln, idx) => {
      const wrappedChunks = wrapCodeLineNaturally(ln, maxCharsPerLine);
      wrappedChunks.forEach((chunk, cIdx) => {
        formattedCodeLines.push({
          num: cIdx === 0 ? idx + 1 : '',
          text: chunk,
          isContinuation: cIdx > 0
        });
      });
    });

    const codeLineHeight = 4.2;
    const gutterWidth = 11;
    const codeAreaWidth = contentWidth;

    // Helper: draw IDE header bar
    const drawIdeHeader = (isContinuation = false) => {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.roundedRect(margin, yPos, codeAreaWidth, 7, 1.5, 1.5, 'F');

      // Mac terminal style traffic light dots
      doc.setFillColor(239, 68, 68); // Red
      doc.circle(margin + 4, yPos + 3.5, 1.1, 'F');
      doc.setFillColor(245, 158, 11); // Yellow
      doc.circle(margin + 7.5, yPos + 3.5, 1.1, 'F');
      doc.setFillColor(16, 185, 129); // Green
      doc.circle(margin + 11, yPos + 3.5, 1.1, 'F');

      // File tab label
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        isContinuation ? 'source_refactored.js (Continued)' : 'source_refactored.js',
        margin + 16,
        yPos + 4.6
      );

      // Status chip on right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(6, 182, 212);
      doc.text('AI OPTIMIZED', margin + codeAreaWidth - 24, yPos + 4.6);

      yPos += 7;
    };

    drawIdeHeader(false);

    // Render code line by line with automatic pagination
    formattedCodeLines.forEach((item) => {
      if (yPos + codeLineHeight + 4 > maxY) {
        // Draw page break and continuation IDE box
        doc.addPage();
        doc.setFillColor(6, 182, 212);
        doc.rect(0, 0, pageWidth, 2, 'F');
        yPos = 16;
        drawIdeHeader(true);
      }

      // Gutter background
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos, gutterWidth, codeLineHeight, 'F');

      // Line number
      if (item.num) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(148, 163, 184); // slate-400
        const numStr = String(item.num).padStart(2, '0');
        doc.text(numStr, margin + 2.5, yPos + 2.8);
      }

      // Code line background
      doc.setFillColor(255, 255, 255);
      doc.rect(margin + gutterWidth, yPos, codeAreaWidth - gutterWidth, codeLineHeight, 'F');

      // Code text
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.2);
      
      // Syntax-like color heuristics
      const trimmed = item.text.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        doc.setTextColor(100, 116, 139); // comments in slate-500
      } else if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ') || trimmed.startsWith('function ') || trimmed.startsWith('return ') || trimmed.startsWith('import ') || trimmed.startsWith('export ')) {
        doc.setTextColor(2, 132, 199); // declarations in sky-600
      } else {
        doc.setTextColor(15, 23, 42); // slate-900 standard
      }

      doc.text(item.text, margin + gutterWidth + 2.5, yPos + 2.8);

      yPos += codeLineHeight;
    });

    // Bottom border of IDE box
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, margin + codeAreaWidth, yPos);
    yPos += 8;

    // -------------------------------------------------------------
    // UNIVERSAL FOOTER ON ALL PAGES
    // -------------------------------------------------------------
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);

      // Footer divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, 286, pageWidth - margin, 286);

      // Left title
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('AI Code Review Assistant  •  Enterprise Audit Report', margin, 290.5);

      // Center confidentiality
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text('CONFIDENTIAL & PROPRIETARY', (pageWidth / 2) - 18, 290.5);

      // Right pagination
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 15, 290.5);
    }

    doc.save(`Code_Review_Report_${Date.now()}.pdf`);
  };

  const handleShare = async () => {
    const shareText = `AI Code Review Report (Score: ${analysisData.qualityScore}/100)\n${analysisData.summary}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Code Review Report',
          text: shareText,
          url: shareUrl
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User cancelled share dialog
      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (e) {
      console.error('Failed to copy share link:', e);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 sm:pt-4 border-t border-slate-800/80 mt-4 sm:mt-6 w-full">
      
      <div className="flex items-center space-x-2 text-xs text-slate-400 shrink-0">
        <FileText className="w-4 h-4 text-cyan-400" />
        <span>Export Options:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        
        {/* Copy All */}
        <button
          onClick={handleCopyMarkdown}
          className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all shrink-0"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedAll ? 'Report Copied!' : 'Copy Markdown'}</span>
        </button>

        {/* Copy Refactored Code */}
        <button
          onClick={handleCopyRefactored}
          className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all shrink-0"
        >
          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{copiedCode ? 'Code Copied!' : 'Copy Refactored Code'}</span>
        </button>

        {/* PDF Download */}
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PDF Report</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all shrink-0"
          title="Share Review Link or Summary"
        >
          {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{shared ? 'Link Copied!' : 'Share'}</span>
        </button>

      </div>

    </div>
  );
}

ExportPanel.propTypes = {
  analysisData: PropTypes.shape({
    summary: PropTypes.string,
    qualityScore: PropTypes.number,
    bugs: PropTypes.array,
    performance: PropTypes.array,
    security: PropTypes.array,
    suggestions: PropTypes.array,
    refactoredCode: PropTypes.string
  }),
  rawCode: PropTypes.string
};

