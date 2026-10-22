# Changelog

All notable changes are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/). Planned work is in [docs/ROADMAP.md](docs/ROADMAP.md).

## [Unreleased]

### Added (V3 Phase 1 - Multi-File Review & Large File Chunking)
- **Multi-File Workspace**: Support for uploading and editing up to 10 files simultaneously via file picker, drag-and-drop, and dynamic `+ Add File` tabs.
- **`POST /api/analyze/multi`**: Dedicated multi-file batch review endpoint returning project-level aggregate metrics (`overallScore`, `totalBugs`, `totalSecurityIssues`, `totalPerformanceIssues`) and file-by-file structured reviews.
- **Project-Level Overview Dashboard**: Executive summary card, global metrics grid, and file-by-file breakdown cards with direct drill-down into file-specific findings.
- **Large-File Chunking Engine**: Overlapping section review for files exceeding 25,000 characters without silent truncation, with transparent `isIncomplete` disclosure when exceeding limits.
- **Clean Review Status**: Strictly displays `No bugs detected.` when no actionable bugs exist.
- **Multer Multi-Upload Middleware**: Upgraded file upload capacity from 30KB to 150KB per file with batch processing up to 10 files.

## [2.5.0]

### Added
- **Monaco Code Editor**: Integrated lazy-loaded Monaco Editor (`@monaco-editor/react`) with syntax highlighting, line numbers, automatic wrapping, and non-intrusive lint diagnostics.
- **Radial Score Ring**: Interactive animated SVG radial quality meter (0–100 scale) with color thresholds (Emerald, Amber, Rose).
- **Split & Unified Git Diff Viewer**: Full visual diff inspection comparing original submitted code directly against AI-refactored code.
- **Deep AI Diagnostic Explanation**: On-demand `/api/analyze/explain` endpoint providing root cause analysis, runtime exploit/failure modes, verified remediation code, and prevention best practices.
- **Animated Language Dropdown**: Custom glassmorphic language selector with Framer Motion transitions replacing native select elements.
- **Expanded Language Support**: Added syntax modes and auto-detection heuristics for C, C#, PHP, React JSX, React TSX, Go, Python, Java, C++, Rust, HTML, CSS, and SQL.
- **Centralized JSON Error Handling**: Global Express error handler converting Multer upload and validation exceptions into clean JSON error envelopes instead of default HTML crash pages.
- **Harmonized Size Limits**: Standardized upload and string limits to 30 KB (~25,000 characters) across `upload.js`, `analyze.js`, and `server.js` with clear user messaging.
- **Resilient PDF Report Generator**: Strict jsPDF font metrics (`splitTextToSize`) and WinAnsi ASCII sanitization eliminating letter-spacing artifacts, clipping, and page overflows.
- **Floating Progress Indicator**: Non-intrusive floating progress toast positioned under header tracking analysis lifecycle stages.
- **Privacy Hashed Cache**: Cache entries keyed by SHA-256 hash of code and language rather than raw snippets.
- **Refreshed Groq Model Chain**: Updated model failover sequence with active high-performance models (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`).

### Deferred to Backlog (Post-2.5)
- **Real-Time SSE Streaming**: Chunked section-by-section streaming review (`/api/v2/analyze/stream`).
- **Analyze on Paste**: Automatic debounced review trigger on clipboard paste.

---

## [1.0.0]

### Added
- Paste or upload code (`.js .jsx .ts .tsx .py .java .cpp .c .cs .go .html .css .txt`)
- Groq-powered review: bugs, performance, security, suggestions, refactored code (JSON output)
- Quality score (0–100) and executive summary
- Tabbed results: All / Bugs / Performance / Security / Refactored
- Four one-click sample presets
- Export: copy as Markdown, copy refactored code, PDF report (jsPDF), share
- Staged loading animation and AI-generated-content disclaimer
- Language auto-detect (substring heuristic)
- Two-column layout (40/60), sticky header, dark theme
- `GET /api/health`
- IP rate limiting (50 requests / 15 min), in-memory response cache (1 h TTL, 100 entries)
- Model fallback chain and simulated fallback review mode when Groq is unavailable or unconfigured
- Deployment config for Vercel (client) and Render (API)
