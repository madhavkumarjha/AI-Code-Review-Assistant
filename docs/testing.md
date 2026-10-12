# Test Plan

Scope follows [PRD.md](../PRD.md); schedule follows [ROADMAP.md](ROADMAP.md). "Current" cases are regression tests; "2.0" cases accompany the 2.0 work.

## 1. Strategy

| Level | Tooling (free) | Scope |
|---|---|---|
| Unit | Vitest (client), Node test runner or Jest (server) | normalizer, language detection, response sanitizer, cache, history hook |
| API | supertest / curl scripts | `/api/analyze`, v2 stream and explain, `/api/health`, limits |
| E2E | Playwright | paste → analyze → results → export; presets; diff; history |
| Manual | checklist below | cross-browser, accessibility, visual |

## 2. Test cases

### Backend — current
| ID | Case | Expected |
|---|---|---|
| B1 | POST empty code | 400 Validation Error |
| B2 | 25,001 characters | 400 Limit Exceeded |
| B3 | Valid JS snippet | 200; all 7 data keys; numeric `qualityScore` |
| B4 | Control characters in input | Stripped; succeeds |
| B5 | Upload `.py` | Language Python |
| B6 | Upload `.exe` | Rejected with a clear message |
| B7 | 51st request in 15 min | 429 Rate Limit Exceeded |
| B8 | Same code twice | Second has `isCached: true` |
| B9 | No API key | Fallback review, `isFallback: true`, not cached |
| B10 | Model returns fenced JSON | Parsed |
| B11 | Model returns invalid JSON | Clear error (2.0: one retry first) |
| B12 | `/api/health` | `groqConfigured` matches env |

### Backend — 2.0
| ID | Case | Expected |
|---|---|---|
| B20 | Severity normalizer | High/Critical → critical, Medium → warning, Low → info |
| B21 | Auto-detect on 10 labelled snippets (JS, TS, Python, Java, C++, Go, Rust, SQL, HTML, CSS) | ≥ 8/10 correct; low confidence → "General Snippet" |
| B22 | Stream happy path | `status → meta → section* → done` |
| B23 | Stream dropped mid-way | One retry; else `error` with `retryable: true`; no fake review |
| B24 | Invalid JSON from model | Retry, then `INVALID_JSON` |
| B25 | `/api/analyze/explain` valid input | Deep diagnostic returned (`rootCause`, `remediation`, etc.) |
| B26 | Explain shares the rate limiter | Counts toward 50 / 15 min |
| B27 | Disallowed origin in production | Blocked by CORS |
| B28 | Fallback response | Labelled; never cached |
| B29 | ~300-line refactor | Not truncated; valid JSON |
| B30 | Log inspection | No submitted code in logs |

### Frontend — current
| ID | Case | Expected |
|---|---|---|
| F1 | Each of the 4 presets | Loads code and language; analyze works |
| F2 | Tabs | Filter sections correctly |
| F3 | Copy Markdown / Copy refactored | Clipboard has expected content |
| F4 | PDF export | File downloads with score and sections |
| F5 | API error | Banner shown; code preserved |
| F6 | Disclaimer | Visible with results |

### Frontend — 2.0
| ID | Case | Expected |
|---|---|---|
| F20 | Monaco | Lazy-loaded (not in initial bundle); textarea fallback on failure |
| F21 | Score ring | Value matches score; bands 85 / 65 |
| F22 | Severity badges | Text + colour on every finding |
| F23 | Diff tab | Additions/removals correct for a known sample |
| F24 | Streaming UI | Sections appear progressively; cancel works |
| F25 | Explain more | Expands inline; errors handled |
| F26 | Export Markdown / JSON / PDF | Valid files; JSON parses |
| F27 | History default | Nothing in localStorage until enabled |
| F28 | History enabled | ≤ 10 items, metadata only, no code strings; Clear removes all |
| F29 | Fallback banner | Shown for demo reviews; export blocked or watermarked |
| F30 | Reduced motion | Ring does not animate |
| F31 | Ctrl/Cmd+Enter | Triggers Analyze |

### Non-functional
| ID | Check | Target |
|---|---|---|
| N1 | Paste → first result (50-line snippet) | < 5 s median |
| N2 | Initial JS bundle | Monaco in a separate chunk |
| N3 | Lighthouse accessibility | ≥ 90 |
| N4 | Browsers | Latest Chrome, Edge, Firefox, Safari |
| N5 | Secrets scan | No key in repo or client bundle |

## 3. Manual checklist
Presets analyze · upload each supported type · error banner and recovery · keyboard-only run · export files open correctly · behaviour behind the production proxy (rate limiting per user).

## 4. Quality gates

| Phase | Gate |
|---|---|
| 0 — Fixes | B1–B12 pass; B27, B28, B29, B24 pass; model list verified |
| 1 — Foundation | B20, B21, F20–F22 pass; current regression green |
| 2 — Differentiators | B22–B24, F23, F24 pass; N1 met |
| 3 — Polish | B25, B26, F25–F31 pass; N3–N5 pass |
| Release | All P0 requirements ✅ in PRD §6; README and CHANGELOG updated |
