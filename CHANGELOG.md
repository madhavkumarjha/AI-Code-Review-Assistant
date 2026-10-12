# Changelog

All notable changes are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/). Planned work is in [docs/ROADMAP.md](docs/ROADMAP.md).

## [Unreleased] — targeting 2.0.0

### Planned
Monaco editor · severity tags · radial score ring · diff view · streaming (SSE) · explain-bug · Markdown/JSON export · opt-in history · content-based language detection. See [docs/ROADMAP.md](docs/ROADMAP.md).

### Planned fixes
Refreshed Groq model list · larger token budget · enforced CORS allow-list · labelled demo reviews · hashed cache keys.
- **PDF Code Export**: Fixed crude substring slicing by implementing natural word-boundary wrapping and comment continuation indentation, preventing comments from breaking mid-word or overflowing horizontally.
- **Review Scope Discipline**: Enforced strict snippet scope boundaries in LLM prompt and sanitized out-of-scope placeholder comments (`// TODO`) and extraneous architecture suggestions.

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

### Known issues (tracked for 2.0)
- CORS callback accepts every origin
- Fallback review is not labelled in the UI
- `max_tokens` of 1500 can truncate long responses
- Some model IDs in the fallback chain may be invalid
- Cache keys contain raw submitted code
- File uploads hit the 25,000-character limit although Multer allows 2 MB
