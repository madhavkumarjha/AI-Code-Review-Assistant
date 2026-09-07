# AI Code Review Assistant — V2 PRD (Product Requirements Document)

**Version:** 2.0
**Status:** Draft
**Target Release:** V2 (Desktop Web)
**Mobile:** Out of scope (handled separately via Expo)

---

## 1. Overview

### 1.1 Purpose
V2 upgrades the AI Code Review Assistant from a functional prototype to a **polished, professional-grade desktop web tool**. The focus is on **developer experience, visual clarity, and actionable insights** — not on colors or visual gimmicks.

### 1.2 Guiding Principles
- **Functionality > Colors**
- **Speed > Animations**
- **Clarity > Complexity**
- **Free & Open Source > Premium Libraries**
- **Desktop-First > Mobile**

---

## 2. User Personas

| Persona | Use Case |
|---------|----------|
| **Solo Developer** | Wants quick feedback on code quality |
| **Team Lead** | Reviews PRs before merging |
| **Open Source Contributor** | Checks code before submitting PR |
| **Hiring Manager** | Evaluates candidate code |

---

## 3. Feature Requirements

### 3.1 Core Analysis Upgrades

| # | Feature | Description | Priority | Effort |
|---|---------|-------------|----------|--------|
| 1 | **Monaco Editor** | Replace plain textarea with Monaco/CodeMirror — syntax highlighting, line numbers, auto-indent | P0 | Med |
| 2 | **Severity Tags** | Tag bugs as 🔴 Critical / 🟡 Warning / 🔵 Info | P0 | Low |
| 3 | **Quality Score Ring** | 0–100 score with animated radial progress bar | P0 | Low |
| 4 | **Diff View** | Side-by-side highlight of original vs refactored code | P0 | Med |
| 5 | **Auto-detect Language** | Detect language from code content, not file extension | P0 | **Med** (see note below — needs a heuristic/library, not trivial) |
| 6 | **Streaming Response** | Groq streaming API for real typing effect | P0 | Med |

### 3.2 UX & Workflow Upgrades

| # | Feature | Description | Priority | Effort |
|---|---------|-------------|----------|--------|
| 7 | **Explain Bug** | "Explain more" button per bug → follow-up AI explanation | P1 | Low |
| 8 | **Multi-format Export** | Export as Markdown, PDF, and JSON | P1 | Low |
| 9 | **History / Sessions** | Save last 10 analyses in localStorage — **opt-in only, and must not persist full raw code** (see Open Issues) | P1 | Low |
| 10 | **Analyze on Paste** | Auto-trigger on paste (debounced) | P2 | Low |

### 3.3 Future (Out of Scope for V2)

| Feature | Notes |
|---------|-------|
| Multi-file upload | P2 — V3 |
| GitHub integration | P2 — V3 |
| Chunking for long files | P2 — V3 |
| Advanced/configurable rate limiting | P2 — V3 (basic IP rate limiting from V1 stays active in V2, see Open Issues) |
| Model choice | P2 — V3 |

---

## 4. Technical Requirements

### 4.1 Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS only (no paid libs)
- **Editor:** Monaco Editor (or CodeMirror)
- **Animations:** Framer Motion (minimal)
- **State:** React hooks + context
- **Diff rendering:** requires a diff library (e.g. `diff` + `react-diff-viewer-continued`, or CodeMirror's merge addon) — see Dependencies

### 4.2 Backend
- **Runtime:** Node.js + Express
- **AI:** Groq SDK — model(s) to be confirmed against Groq's *current* supported model list before build starts (do not assume Mixtral is still available)
- **Streaming:** Server-Sent Events (SSE) or WebSocket
- **Caching:** In-memory (optional)

### 4.3 Infrastructure
- **Deployment:** Render / Fly.io / Vercel (frontend)
- **Env Variables:** `GROQ_API_KEY`, `PORT`

---

## 5. UI/UX Requirements

### 5.1 Layout
- **2-Column Fixed Layout**
  - Left: Code Input (40%)
  - Right: Analysis Results (60%)
- **Minimize page scrolling** — prefer internal panel scrolling, but allow page-level scroll as fallback for large result sets (diff + refactored code + many issues can exceed panel height — see Open Issues)
- **Sticky Header** (60-70px)

### 5.2 Components

#### 5.2.1 Code Input Panel
| Element | Description |
|---------|-------------|
| Monaco Editor | Syntax highlighting, line numbers, auto-indent |
| Language Selector | Dropdown with auto-detect option |
| Sample Presets | 1-click demo samples |
| Upload Button | File upload |
| Analyze Button | Primary CTA |

#### 5.2.2 Results Panel
| Element | Description |
|---------|-------------|
| Score Ring | Animated radial progress (0-100) |
| Tabs | All \| Bugs \| Performance \| Security \| Refactored |
| Issues List | Severity-tagged (🔴/🟡/🔵) |
| Diff View | Side-by-side original vs refactored |
| Export Actions | Markdown \| PDF \| JSON \| Copy |

### 5.3 Design Constraints
- **Color Scheme:** Slate + Cyan (same as MVP)
- **No premium libraries** — Tailwind only
- **Dark theme** only
- **Glass-morphism** (free approach)
- **No external fonts**

---

## 6. Acceptance Criteria

### 6.1 Must Have (P0)
- [ ] Monaco Editor integrated with syntax highlighting
- [ ] Quality Score displayed as radial ring
- [ ] Severity tags (🔴/🟡/🔵) on bugs
- [ ] Diff view working (with chosen library integrated)
- [ ] Auto-detect language
- [ ] Streaming response (with graceful handling of dropped/partial streams)
- [ ] Export: Markdown + PDF
- [ ] Copy refactored code
- [ ] 2-column layout with minimal scrolling
- [ ] Existing V1 rate limiting continues to function

### 6.2 Should Have (P1)
- [ ] Explain bug feature
- [ ] History (last 10 analyses, opt-in, metadata-safe)
- [ ] Export: JSON

### 6.3 Nice to Have (P2)
- [ ] Analyze on paste
- [ ] Chunking for long files
- [ ] Multi-file upload
- [ ] GitHub integration
- [ ] Configurable rate limiting
- [ ] Model choice

---

## 7. Release Plan

### Phase 1: Foundation (Week 1-2)
| Task | Owner | Status |
|------|-------|--------|
| Monaco Editor integration | FE | 🔲 |
| Severity tags implementation | FE | 🔲 |
| Quality Score ring | FE | 🔲 |
| Auto-detect language | FE+BE | 🔲 |

### Phase 2: WOW Features (Week 3-4)
| Task | Owner | Status |
|------|-------|--------|
| Diff view | FE | 🔲 |
| Streaming response | BE+FE | 🔲 |

### Phase 3: Polish (Week 5-6)
| Task | Owner | Status |
|------|-------|--------|
| Explain bug | BE+FE | 🔲 |
| Multi-format export | FE | 🔲 |
| History | FE | 🔲 |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Time from code paste to analysis | < 5s (relaxed from V1's <3s to account for streaming + heavier UI — intentional trade-off, not a regression) |
| User satisfaction (feedback) | > 4.5/5 |
| Export usage | > 30% of sessions |
| Diff view usage | > 50% of sessions |

---

## 9. Dependencies

| Dependency | Version | Notes |
|------------|---------|-------|
| React | 18.x | |
| Vite | 5.x | |
| Tailwind CSS | 3.x | |
| Monaco Editor | latest | |
| Framer Motion | 10.x | |
| Groq SDK | latest | verify current model IDs before implementation |
| Express | 4.x | |
| jsPDF | latest | |
| Diff library (e.g. `diff` + `react-diff-viewer-continued`) | latest | required for Diff View (#4) — was missing from V1 draft |

---

## 10. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Monaco Editor heavy | Performance | Lazy load |
| Streaming complex | Delay | Start simple, iterate; handle partial/dropped stream gracefully |
| Diff view tricky | Complexity | Use library (see Dependencies) |
| API rate limits | Functionality | Keep V1 fallback messages; retain existing rate limiter |
| localStorage history exposes sensitive code | Privacy | Make history opt-in; store only metadata/summary, not full raw code |
| Groq model deprecation | Functionality | Verify model list against Groq docs before build, not just carried over from V1 |

---

## 11. Open Issues / Notes from V1 Review

These points were flagged during review and should be resolved before Phase 1 sign-off:

1. **Diff View dependency gap** — P0 feature had no listed library in the original draft. Added to Dependencies above; team should pick one (native `diff` + custom render vs a ready component) before Phase 2.
2. **History vs. privacy policy conflict** — V1's `agent.md` explicitly states code must never be persisted beyond the request lifecycle. Saving full analyses (including raw code) to `localStorage` contradicts this. Resolution: history must be **opt-in**, and should store only summary/metadata (score, timestamp, language) rather than the full code + refactored code, unless the user explicitly agrees to persist full content.
3. **"No page scrolling" is too rigid** — Diff view + refactored code + a full issues list can easily exceed a single viewport for real-world files. Recommend relaxing this to "minimize scrolling, prefer internal panel scroll" rather than a hard P0 constraint.
4. **Mixtral model reference may be stale** — Groq has changed its supported model catalog since V1 was built (V1's `groqService.js` already had some invalid model IDs). Confirm current models via Groq's docs/console before locking tech stack.
5. **Success metric regression vs. V1** — V1 targeted <3s; V2 targets <5s. This is a reasonable trade-off given streaming/Monaco/diff overhead, but should be called out explicitly as intentional so it doesn't read as a quality drop.
6. **Rate limiting mislabeled as "out of scope"** — V1 already ships `express-rate-limit` (50 req/15 min). V2's "Out of Scope" table should clarify that *existing* rate limiting stays active; only *advanced/configurable* rate limiting is deferred to V3.
7. **Auto-detect language effort underestimated** — Detecting language from code content (not extension) needs a heuristic or library (e.g. highlight.js's auto-detect, `linguist-js`) and has real accuracy limits. Effort should be "Med," not "Low," and the chosen approach should be named in Dependencies.
8. **Streaming error handling undefined** — If an SSE/WebSocket stream drops mid-response, the backend currently expects a complete JSON payload to parse. Need an explicit strategy (e.g. buffer + validate before parse, or fallback to non-streaming retry) for partial/broken streams.