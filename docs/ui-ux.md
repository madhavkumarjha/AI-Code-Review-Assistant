# UI / UX Specification

Requirements: [PRD.md](../PRD.md) (FR-04…FR-34, NFR-06…08). "Current" = implemented; "2.0" = planned in [ROADMAP.md](ROADMAP.md).

## 1. Design constraints
- Dark theme only; Slate + Cyan; glass-morphism with plain Tailwind
- No premium UI libraries; minimal Framer Motion
- Desktop-first: ≥ 1024 px two columns, stacked below
- No external font downloads (Tailwind config lists Inter / Fira Code; use system fallbacks unless self-hosted)

## 2. Layout

```
┌──────────────────────── Sticky header (60–70 px) ────────────────────────┐
│ 🚀 AI Code Review Assistant                                               │
├────────────── Left 40% ────────────┬────────────── Right 60% ────────────┤
│ Language [Auto ▾]   [Upload]       │ Score · summary · time               │
│ ┌────────────────────────────────┐ │ Tabs: All | Bugs | Perf | Security | │
│ │ Code editor                    │ │       Refactored (+ Diff in 2.0)     │
│ └────────────────────────────────┘ │ ┌──────────────────────────────────┐ │
│ Presets: [🐛][⚡][🔒][💻]           │ │ Findings (internal scroll)       │ │
│ [Analyze Code]  [Clear]            │ └──────────────────────────────────┘ │
│                                    │ Export · Copy · Share                │
│                                    │ ⚠ AI-generated, verify before use    │
└────────────────────────────────────┴──────────────────────────────────────┘
```
Panels scroll internally; page scroll is a fallback only.

## 3. Components

### Code input
| Element | Current | 2.0 |
|---|---|---|
| Editor | textarea with Prism highlighting, tab size 4 | Monaco (lazy), line numbers, auto-indent; textarea if Monaco fails to load |
| Language | Auto-detect, JS/TS, Python, Java, C++/C, Go, HTML/CSS | Same; shows "Auto (Python)" once detected |
| Upload | `.js .jsx .ts .tsx .py .java .cpp .c .cs .go .html .css .txt` | Same; clear message for oversized files |
| Presets | Buggy Async JS, Slow Python Loop, SQL / XSS Risk, C++ Memory Leak | Same |
| Actions | Analyze, Clear | + Ctrl/Cmd+Enter, optional analyze-on-paste toggle |

### Results
| Element | Current | 2.0 |
|---|---|---|
| Score | Pill with number and shield/warning icon | Animated radial ring; same colour bands |
| Findings | Cards per section | Cards with severity badge and "Explain more" |
| Tabs | All, Bugs, Performance, Security, Refactored | + Diff tab (toggle Diff / Refactored only) |
| Export | Copy Markdown, Copy refactored, PDF, Share | + Markdown and JSON download |
| Meta | `⚡ x.xx s` | + cached / fallback labels |
| Disclaimer | Always shown | Unchanged |

Score bands: ≥ 85 green, 65–84 amber, < 65 red.

## 4. States

| State | Behaviour |
|---|---|
| Empty | Placeholder text; presets visible |
| Analyzing (current) | Four-stage animated loader |
| Analyzing (2.0) | Stage chips from SSE `status`; sections appear as validated; Cancel button |
| Success | Dashboard |
| Error | Dismissible red banner above the workspace; code preserved |
| Rate limited | Banner with retry hint |
| Fallback review (2.0) | Amber banner "Demo review – AI service unavailable"; export disabled or watermarked |
| Crash | ErrorBoundary screen with reload |

## 5. Severity language (2.0)

| Tag | Colour | Use |
|---|---|---|
| 🔴 Critical | rose | Exploitable security issues, crashing bugs |
| 🟡 Warning | amber | Likely bugs, notable inefficiency |
| 🔵 Info | cyan | Style, best practice |

Never rely on colour alone: the badge always includes the emoji and label.

## 6. Diff view (2.0)
Split view, original left / refactored right; line numbers; additions green, removals red; synchronized scroll; collapse unchanged blocks over 10 lines; copy button on the refactored side; word-level highlighting.

## 7. History panel (2.0, opt-in)
Settings toggle "Save history on this device" (default off). Lists the last 10 entries (time, language, score, severity counts); clicking shows the summary only. "Clear history" is always visible. Copy states that code is not stored.

## 8. Accessibility
- Ctrl/Cmd+Enter = Analyze; logical tab order; visible focus ring
- Contrast ≥ 4.5:1 on glass panels
- Icon buttons have labels/titles
- `aria-live="polite"` for status and errors
- `prefers-reduced-motion` disables the ring animation

## 9. Microcopy
- Disclaimer: "AI-generated code review. Verify refactored code before deploying to production."
- Fallback: "This is a demonstration review because the AI service could not be reached. Do not rely on it."
- Rate limit: "Too many requests. Try again in a few minutes."
