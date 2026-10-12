# Architecture

Requirements: [PRD.md](../PRD.md). API details: [api.md](api.md).

## 1. Overview

```mermaid
graph TD
    U([Developer]) --> UI[React + Vite client]
    UI -->|POST /api/analyze JSON or multipart| API[Express API]
    API --> RL[Rate limiter 50/15min/IP]
    RL --> V[Validate + sanitize]
    V --> C{Cache hit?}
    C -- yes --> UI
    C -- no --> S[groqService]
    S --> G[Groq chat.completions<br/>model fallback chain]
    G --> S
    S -->|parse + shape-enforce JSON| API
    S -. no key / API error .-> F[Fallback generator]
    API --> UI
```

## 2. Deployment

| Piece | Host | Notes |
|---|---|---|
| Client | Vercel | Static build `client/dist`; `vercel.json` rewrites `/api/*` to the Render API and all else to `index.html` |
| API | Render | `node server.js`; `trust proxy` (default 1) so rate limiting sees real client IPs |
| Local dev | localhost | Vite :3000 proxies `/api` → :5000 |

## 3. Backend

| File | Responsibility |
|---|---|
| `server/server.js` | env check, CORS, rate limiter, body parsers (5 MB), `/api/health`, mounts router |
| `server/routes/analyze.js` | accept JSON or file, resolve language, validate, sanitize control chars, cache, call service |
| `server/middleware/upload.js` | Multer memory storage, 30 KB (~25k chars), extension / `text/*` allow-list |
| `server/services/groqService.js` | prompt, language heuristic, model chain, JSON parse, shape enforcement, fallback review |

**Request lifecycle:** rate limit → Multer (if file) → validate (non-empty, ≤ 25,000 chars) → sanitize → cache lookup → resolve language → Groq call (chain, temperature 0.2, `max_tokens` 1500) → parse (strip ```json fences) → enforce shape → cache (non-fallback only) → respond with `executionTimeMs`.

**Model chain:** tried in order until one returns content. 429 → rate-limit error. Auth / 400 / model errors → fallback review. The list is configuration and must be verified against Groq's current catalog before each release.

## 4. Frontend

| Component | Role |
|---|---|
| `App.jsx` | state (code, language, analysis, timing, error), calls `/api/analyze`, file upload, 40/60 layout |
| `Header` | sticky title bar |
| `CodeInput` | editor, language select, upload, presets, Analyze / Clear |
| `LoadingView` | four-stage animated loader |
| `AnalysisDashboard` | summary, score, tabs, sections, disclaimer |
| `ExportPanel` | copy Markdown, copy refactored code, PDF (jsPDF), share |
| `ErrorBoundary` | crash isolation |
| `SamplePresets.js` | four demo snippets |

State is local React hooks; no global store.

## 5. LLM integration

- **Provider:** Groq (`groq-sdk`), chat completions, temperature 0.2.
- **System prompt:** senior-reviewer persona; must respond **only** with one JSON object with keys `summary, qualityScore, bugs, performance, security, suggestions, refactoredCode` (shapes in [api.md](api.md#response-200-ok)).
- **User prompt:** language + the code in a fenced block, asking for all five categories.
- **Parsing:** tolerate fenced JSON; fill missing keys with defaults; `qualityScore` defaults to 75 when non-numeric.
- **Fallback mode:** when the key is missing/placeholder or Groq returns auth/400/model errors, a canned review is generated and flagged `isFallback: true`. It is never cached.

## 6. Target architecture for release 2.0

```mermaid
graph TD
    UI[React client] -->|SSE POST /api/v2/analyze/stream| API
    UI -->|POST /api/v2/explain| API
    UI --- ED[Monaco lazy chunk]
    UI --- DF[Diff viewer]
    UI --- HS[(localStorage history: opt-in, metadata only)]
    API --> RL[Shared rate limiter]
    API --> SV[groqService]
    SV --> BUF[Buffer + validate JSON]
    BUF -->|invalid / dropped| RT[One non-stream retry]
    BUF --> NRM[Severity normalizer]
    NRM --> API
    SV --> G[Groq: verified model list]
```

| Layer | Change |
|---|---|
| Client | Monaco, score ring, severity badges, diff tab, SSE reader, explain buttons, history panel, MD/PDF/JSON export |
| API | v2 stream and explain routes, severity normalizer, `detectLanguage` module, enforced CORS, labelled fallback |
| Config | Model list and token budget in config, not inline |

**Client storage (opt-in history):** key `acra.history.v1`, max 10 records, FIFO, fields `id, ts, language, score, counts{critical,warning,info}, summary`. No raw or refactored code unless the user explicitly opts in.

## 7. Cross-cutting concerns

| Concern | Approach |
|---|---|
| Security | Key server-side only; CORS allow-list enforced; rate limit; input size caps; no code in logs |
| Privacy | No DB, no disk writes; cache is RAM only and keyed by hash |
| Reliability | Model chain; one retry on bad/dropped stream; explicit errors rather than silent fake results |
| Performance | Cache (1 h / 100 entries), lazy Monaco, memoized result sections |
| Observability | Log status and truncated message only; add request id and model used (never code) |

## 8. Known issues

| Issue | Planned in |
|---|---|
| CORS callback accepts every origin | Roadmap 2.0 Phase 0 |
| Cache keys hold raw code | 2.0 Phase 0 |
| 400/auth errors masked as a successful fake review | 2.0 Phase 0 |
| Upload path capped at 25,000 chars despite 2 MB Multer limit | Resolved in 2.5 (harmonized to 30 KB) |
| Rate limiter is in-memory per instance (resets on restart, not shared) | Backlog |
