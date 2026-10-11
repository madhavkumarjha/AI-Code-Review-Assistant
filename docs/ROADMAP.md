# 🗺️ Roadmap & Release Milestones

Product scope and core principles are defined in the root blueprint [PRD.md](../PRD.md); this document schedules features into delivery releases and outlines the API evolution plan. Historical shipped notes live in [CHANGELOG.md](../CHANGELOG.md).

---

## 🧭 API Versioning Plan

The backend API follows an additive versioning strategy documented in [api.md](api.md):

| Version | Status | Release Milestone | Key Capabilities |
|---|---|---|---|
| **API v1** | ✅ Shipped | Release 1.0 | `/api/analyze`, `/api/health`, synchronous JSON response, model fallback chain, IP rate limiting. |
| **API v2** | 🔲 Planned | Release 2.0 | `/api/v2/analyze/stream` (SSE), `/api/v2/explain`, normalized `findings[]` severity model, one non-stream retry. |
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

## 🚀 Release 2.0 — In Planning (≈ 6 Weeks + 3 Days)

**Theme:** Professional developer experience, visual clarity, and actionable real-time insight.

### Phase 0 — Fixes & Resilience (≈ 3 days)

| # | Task | Description |
|---|---|---|
| 0.1 | Model catalog verification | Refresh active Groq model list in config; log successful inference model |
| 0.2 | Token limit adjustment | Increase `max_tokens` (to 4000) to prevent response truncation |
| 0.3 | Strict CORS enforcement | Restrict origins in production to configured frontend domain |
| 0.4 | Explicit fallback disclosure | Return `isFallback` flag; display clear demo banner in UI |
| 0.5 | Prompt hygiene | Strip trailing semicolons after markdown fences |
| 0.6 | Secure cache keys | Key cache entries by SHA-256 hash of code + language |
| 0.7 | Consistent size limits | Align file upload limits and 25k char limit messaging |

### Phase 1 — Foundation (Weeks 1–2)

| Task | Scope | Requirement |
|---|---|---|
| Severity Normalizer | Tag findings with unified 🔴 Critical / 🟡 Warning / 🔵 Info | FR-14 |
| Animated Score Ring | Radial progress SVG representing 0–100 score | FR-13 |
| Monaco Editor Integration | Replace basic textarea with syntax-highlighted Monaco editor | FR-04 |
| Language Auto-Detection | Content-based language detection via `highlight.js` | FR-05 |

### Phase 2 — Differentiators (Weeks 3–4)

| Task | Scope | Requirement |
|---|---|---|
| Split Diff Viewer | Side-by-side comparison of original vs refactored code | FR-16 |
| Real-time SSE Streaming | Server-Sent Events endpoint with chunked section delivery | FR-17 |

### Phase 3 — Polish & Ecosystem (Weeks 5–6)

| Task | Scope | Requirement |
|---|---|---|
| Explain Finding | On-demand AI explanation button per finding (`/api/v2/explain`) | FR-18 |
| Multi-Format Export | Download raw JSON, Markdown files alongside PDF | FR-33 |
| Privacy-Preserving History | Local metadata-only session history (opt-in, max 10 entries) | FR-34 |
| Analyze on Paste | Debounced automatic review trigger | FR-06 |
| QA & Release Gate | Final end-to-end regression validation and v2.0.0 tag | All |

### Exit Gates
Phase acceptance criteria and test IDs are defined in [testing.md](testing.md#4-quality-gates).

### Implementation References
- Unified API Contract: [api.md](api.md)
- UI/UX Specifications: [ui-ux.md](ui-ux.md)
- System Architecture: [architecture.md](architecture.md)

---

## 🔮 Release 3.0 — Future Candidates

- Multi-file / full directory repository review
- GitHub Action & Pull Request comment integration
- Intelligent chunking for large repositories
- User model choice & custom rules engine
