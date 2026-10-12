# 🗺️ Roadmap & Release Milestones

Product scope and core principles are defined in the root blueprint [PRD.md](../PRD.md); this document schedules features into delivery releases and outlines the API evolution plan. Historical shipped notes live in [CHANGELOG.md](../CHANGELOG.md).

---

## 🧭 API Versioning Plan

The backend API follows an additive versioning strategy documented in [api.md](api.md):

| Version | Status | Release Milestone | Key Capabilities |
|---|---|---|---|
| **API v1** | ✅ Shipped | Release 1.0 & 2.5 | `/api/analyze`, `/api/analyze/explain`, `/api/health`, synchronous JSON response, model fallback chain, IP rate limiting. |
| **API v2** | 🔲 Planned | Release 2.x Backlog | `/api/v2/analyze/stream` (SSE), normalized `findings[]` severity model, one non-stream retry. |
| **API v3** | 💤 Candidate | Release 3.0 | Multi-file payload, chunking for large files (> 25k chars), user-selected model picker. |

---

## 📦 Release 1.0 — Shipped

Delivered the core end-to-end code analysis experience:
- Paste or file upload (`.js`, `.py`, `.java`, `.cpp`, `.ts`, etc.)
- 4-dimensional analysis: Bugs, Performance, Security, Best Practice Suggestions
- Refactored code generation with inline comments
- 0–100 code quality score with executive summary
- Four instant portfolio demo presets
- Exporting to Markdown, Clipboard, and PDF via jsPDF
- Fallback mock mode for offline demonstration without a Groq key

---

## 🚀 Release 2.5 — Shipped (Professional DX & Visual Inspection)

**Theme:** Professional developer experience, visual clarity, and actionable real-time insight.

### Phase 0 — Fixes & Resilience (✅ Shipped)

| # | Task | Status | Description |
|---|---|---|---|
| 0.1 | Model catalog verification | ✅ Shipped | Refresh active Groq model list (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, etc.) |
| 0.2 | Token limit adjustment | ✅ Shipped | Increase `max_tokens` (to 4000) to prevent response truncation |
| 0.3 | Strict CORS enforcement | ✅ Shipped | Restrict origins in production to configured frontend domain |
| 0.4 | Explicit fallback disclosure | ✅ Shipped | Return `isFallback` flag; display clear demo banner in UI |
| 0.5 | Prompt hygiene | ✅ Shipped | Strip trailing semicolons after markdown fences |
| 0.6 | Secure cache keys | ✅ Shipped | Key cache entries by SHA-256 hash of code + language |
| 0.7 | Consistent size limits | ✅ Shipped | Align file upload limits and 25k char limit messaging to 100 KB |
| 0.8 | Centralized JSON error middleware | ✅ Shipped | Global Express error handler returning JSON for Multer/upload errors |

### Phase 1 — Foundation (✅ Shipped)

| Task | Scope | Requirement | Status |
|---|---|---|---|
| Severity Normalizer | Tag findings with unified 🔴 Critical / 🟡 Warning / 🔵 Info | FR-14 | ✅ Shipped |
| Animated Score Ring | Radial progress SVG representing 0–100 score | FR-13 | ✅ Shipped |
| Monaco Editor Integration | Lazy-loaded Monaco editor with dark theme & syntax modes | FR-04 | ✅ Shipped |
| Language Auto-Detection | Client heuristic auto-detection (12+ languages) | FR-05 | ✅ Shipped |
| Animated Language Dropdown | Glassmorphic dropdown with Framer Motion transitions | UI | ✅ Shipped |

### Phase 2 — Differentiators

| Task | Scope | Requirement | Status |
|---|---|---|---|
| Split Diff Viewer | Side-by-side & unified comparison of original vs refactored code | FR-16 | ✅ Shipped |
| Real-time SSE Streaming | Server-Sent Events endpoint with chunked section delivery | FR-17 | 🔲 Planned (Backlog) |

### Phase 3 — Polish & Ecosystem

| Task | Scope | Requirement | Status |
|---|---|---|---|
| Explain Finding | On-demand AI diagnostic modal per finding (`/api/analyze/explain`) | FR-18 | ✅ Shipped |
| PDF Export Metrics & Sanitization | Strict font metrics wrapping & WinAnsi ASCII sanitization | FR-33 | ✅ Shipped |
| Multi-Format Export | Download raw JSON alongside Markdown and PDF | FR-33 | 🔲 Backlog |
| Privacy-Preserving History | Local metadata-only session history (opt-in, max 10 entries) | FR-34 | 🔲 Backlog |
| Analyze on Paste | Debounced automatic review trigger | FR-06 | 🔲 Backlog |

---

## 🔮 Release 3.0 — Future Candidates

- Multi-file / full directory repository review
- GitHub Action & Pull Request comment integration
- Intelligent chunking for large repositories
- User model choice & custom rules engine
