# Product Requirements Document — AI Code Review Assistant

> Single living document. It describes **what the product is and why**. Release timing lives in [docs/ROADMAP.md](docs/ROADMAP.md), active development status in [PROGRESS.md](PROGRESS.md), shipped history in [CHANGELOG.md](CHANGELOG.md), and technical detail in [docs/architecture.md](docs/architecture.md).

| | |
|---|---|
| **Owner** | Madhav |
| **Status** | Active |
| **Last updated** | 2026-10-12 |
| **Platform** | Desktop web (mobile out of scope; handled separately via Expo) |

---

## 1. Summary

A developer tool that uses Groq-hosted LLMs to review code in seconds: it finds bugs, performance bottlenecks and security risks, suggests best practices, scores quality (0–100) and produces a refactored version.

- **Audience:** developers, engineering teams, open-source contributors
- **Value:** cut first-pass review from ~30 minutes to seconds and catch issues before they reach production

## 2. Problem

- Manual review takes 30–60 min per PR and misses subtle bugs and edge cases
- Junior developers lack immediate feedback
- Review bottlenecks delay deployment
- Security issues go unnoticed until late

## 3. Goals and non-goals

| Goals | Non-goals (for now) |
|---|---|
| Instant, structured, actionable review | Auth / user accounts / database |
| Multi-file repository review (up to 10 files) | GitHub Action / automated PR integration |
| In-browser code execution workspace (JS, TS, Python, C, C++) | Dedicated cloud VM provisioning |
| Clean review signals (`No bugs detected.` when bug-free) | Mobile native app (separate project) |
| Large-file chunking without silent truncation | Configurable rate limits |
| Show exactly what changed (diff viewer) | Model picker in UI |
| Free and open-source stack | |
| Honest failure behaviour (never a fake review presented as real) | |

## 4. Personas

| Persona | Use case |
|---|---|
| Solo developer | Quick feedback on code quality & runtime execution |
| Team lead | Reviews multi-file PRs before merging |
| Open-source contributor | Checks code before submitting a PR |
| Hiring manager | Evaluates candidate code |

## 5. Principles

Functionality > colors · Speed > animations · Clarity > complexity · Free/open source > premium libraries · Desktop-first > mobile.

## 6. Functional requirements

Status: ✅ shipped · 🔲 planned · 💤 future. "Release" is the release that delivers it (see [docs/ROADMAP.md](docs/ROADMAP.md)).

### 6.1 Input

| ID | Requirement | Pri | Release | Status |
|---|---|---|---|---|
| FR-01 | Paste code in an editor area | P0 | 1.0 | ✅ |
| FR-02 | Upload a code file (`.js .jsx .ts .tsx .py .java .cpp .c .cs .go .html .css .txt`) | P0 | 1.0 | ✅ |
| FR-03 | One-click sample presets (buggy JS, slow Python, SQL/XSS, C++ leak) | P1 | 1.0 | ✅ |
| FR-04 | Monaco editor: syntax highlighting, line numbers, auto-indent (lazy-loaded) | P0 | 2.5 | ✅ |
| FR-05 | Language auto-detect from content (heuristics for 12+ languages, user override) | P0 | 2.5 | ✅ |
| FR-06 | Analyze on paste (debounced, off by default) | P2 | 2.x | 🔲 (Backlog) |
| FR-07 | Multi-file workspace tabs (add, switch, and delete up to 10 files) | P0 | 3.0 | ✅ |
| FR-08 | Multi-file drag-and-drop & bulk file upload (`multiple` attribute) | P0 | 3.0 | ✅ |

### 6.2 Analysis and results

| ID | Requirement | Pri | Release | Status |
|---|---|---|---|---|
| FR-10 | AI review across four dimensions: bugs, performance, security, suggestions | P0 | 1.0 | ✅ |
| FR-11 | Refactored code output | P0 | 1.0 | ✅ |
| FR-12 | Quality score 0–100 with executive summary | P0 | 1.0 | ✅ |
| FR-13 | Score shown as animated radial ring | P0 | 2.5 | ✅ |
| FR-14 | Severity tags 🔴 Critical / 🟡 Warning / 🔵 Info on every finding | P0 | 2.5 | ✅ |
| FR-15 | Tabs: All, Bugs, Performance, Security, Diff, Refactored | P0 | 1.0 & 2.5 | ✅ |
| FR-16 | Side-by-side diff of original vs refactored | P0 | 2.5 | ✅ |
| FR-17 | Streaming response with graceful handling of dropped/partial streams | P0 | 2.x | 🔲 (Backlog) |
| FR-18 | "Explain more" per finding (real AI diagnostic explanation modal) | P1 | 2.5 | ✅ |
| FR-19 | AI disclaimer shown beside results | P0 | 1.0 | ✅ |
| FR-20 | Demo/fallback reviews are clearly labelled and never exported as real | P0 | 2.5 | ✅ |
| FR-21 | Project-level summary card & file-by-file audit breakdown for multi-file reviews | P0 | 3.0 | ✅ |
| FR-22 | Large-file chunking (>25k chars up to 150KB) with explicit incomplete review notice | P0 | 3.0 | ✅ |
| FR-23 | Clean review status: strictly `No bugs detected.` when zero actionable bugs found | P0 | 3.0 | ✅ |

### 6.3 Code Execution (V3 Workspace)

| ID | Requirement | Pri | Release | Status |
|---|---|---|---|---|
| FR-25 | In-browser code runner: JS, TS, Python, C, C++ | P0 | 3.0 | ✅ |
| FR-26 | Terminal workspace panels: STDOUT, STDERR, and Execution Status (Exit code) | P0 | 3.0 | ✅ |
| FR-27 | Strict architectural separation: Execution success ≠ Bug-free; 0 bugs ≠ Crash-free | P0 | 3.0 | ✅ |

### 6.4 Export and workflow

| ID | Requirement | Pri | Release | Status |
|---|---|---|---|---|
| FR-30 | Copy report as Markdown; copy refactored code | P1 | 1.0 | ✅ |
| FR-31 | Export PDF report | P1 | 1.0 | ✅ |
| FR-32 | Share (native share or copy link) | P2 | 1.0 | ✅ |
| FR-33 | Download Markdown and JSON | P1 | 2.0 | 🔲 |
| FR-34 | History: last 10 analyses, **opt-in, metadata only** (no raw code by default) | P1 | 2.0 | 🔲 |

## 7. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Latency, paste → first visible result | < 5 s (1.0 shipped targeting < 3 s; the relaxation for 2.0 is an intentional trade-off for streaming + heavier UI, not a regression) |
| NFR-02 | Languages | ≥ 4 (JS, Python, Java, C++); currently also TS, Go, C, C#, HTML/CSS, PHP |
| NFR-03 | Privacy | Submitted code is never written to disk or a database and never logged; any in-memory cache must not retain raw code beyond its TTL |
| NFR-04 | Secrets | API key server-side only |
| NFR-05 | Abuse protection | IP rate limit (50 req / 15 min) stays active |
| NFR-06 | Layout | Two columns (40% input / 60% results), sticky 60–70 px header, minimal scrolling: prefer internal panel scroll, page scroll allowed as fallback |
| NFR-07 | Design | Dark theme, Slate + Cyan, Tailwind only, no external fonts |
| NFR-08 | Accessibility | Keyboard operable, contrast ≥ 4.5:1, reduced-motion respected |

## 8. User flow

1. Open app → paste code, upload a file, or load a preset
2. (Optional) choose language, otherwise auto-detect
3. Click **Analyze** (or Ctrl/Cmd+Enter)
4. See progress → results: score, summary, severity-tagged findings, refactored code, diff
5. Copy, export (Markdown / PDF / JSON) or share

## 9. Acceptance criteria

Per-release gates and test cases are in [docs/testing.md](docs/testing.md). A requirement is done when its row above is ✅, its tests pass, and its behaviour matches [docs/ui-ux.md](docs/ui-ux.md) and the [API contracts](docs/api.md).

## 10. Success metrics

| Metric | Target |
|---|---|
| Time from paste to visible result | < 5 s |
| Bug-detection accuracy on test code | ≥ 90% (manual validation on presets) |
| User satisfaction | > 4.5 / 5 |
| Export usage | > 30% of sessions |
| Diff view usage | > 50% of sessions |

## 11. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Groq rate limits | Availability | IP limiter, model fallback chain, clear errors |
| Groq model deprecation / invalid model IDs | Outage | Verify model list against Groq docs before each release |
| LLM hallucination | Trust | Disclaimer, JSON validation, "verify before use" copy |
| Truncated or invalid model JSON | Failure | Adequate token budget, validate, one retry, explicit error |
| Fallback review mistaken for a real one | Trust | Label it; never cache or export as real |
| Sensitive code exposure | Privacy | No persistence; opt-in metadata-only history; hashed cache keys |
| Monaco bundle size | Load time | Lazy load, code-split |
| Streaming complexity | Delay | Buffer, validate, then emit; one non-stream retry |
| Code longer than token limit | Functionality | Hard limit now, chunking in 3.0 |

## 12. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Editor | Monaco via `@monaco-editor/react` | Industry-standard editing experience |
| Diff | `diff` + `react-diff-viewer-continued` | Avoid custom diff rendering |
| Streaming transport | Server-Sent Events | One-way, simpler than WebSocket |
| Language detection | `highlight.js` auto-detect + heuristic fallback | Free, known limits documented |
| History | Opt-in, metadata only | Consistent with NFR-03 |
| Versioning | Product releases via SemVer ([CHANGELOG.md](CHANGELOG.md)); API versioned separately ([docs/api.md](docs/api.md)); PRD is not versioned | Industry practice |

## 13. Open questions

1. Which Groq models are currently enabled for the production account? (finalizes the model chain)
2. Should demo/fallback mode exist in production, or only in local development?
3. Should history offer an explicit "store full content" option?
4. Is the 5 s target measured to first section or to full completion?

## 14. Related documents

| Document | Purpose |
|---|---|
| [docs/ROADMAP.md](docs/ROADMAP.md) | Release plan & API evolution strategy |
| [PROGRESS.md](PROGRESS.md) | Live progress & active task checklist |
| [CHANGELOG.md](CHANGELOG.md) | What shipped, per release |
| [docs/architecture.md](docs/architecture.md) | System design & data flow |
| [docs/api.md](docs/api.md) | Unified API contracts (v1 & v2) |
| [docs/ui-ux.md](docs/ui-ux.md) | UI/UX specification |
| [docs/development.md](docs/development.md) | Setup, run, deploy |
| [docs/testing.md](docs/testing.md) | Test plan and quality gates |
| [docs/demo-script.md](docs/demo-script.md) | Demo walkthrough |
| [AGENTS.md](AGENTS.md) | Guidance for AI coding agents |

## 15. Document history

| Date | Change |
|---|---|
| 2026-10-11 | Consolidated former `prd.md` and `prdv2.md` into this single document; release scoping moved to ROADMAP.md |
