# AGENT.md — Build Instructions for AI Code Review Assistant

This file is written for an AI coding agent (e.g. Claude Code) to build the project described in `prd.md`. Follow it step by step. Do not skip steps or add unrequested features (no auth, no database, no PR integrations — MVP scope only).

## 0. Ground Rules

- Read `prd.md` first for full context before writing any code.
- Keep scope to MVP (P0 + P1 features only). Ignore "Good-to-Have" items unless explicitly asked.
- Target build time: ~2.5 hours total. Prioritize a working end-to-end flow over polish.
- Ask before adding any new dependency not listed in the tech stack below.

## 1. Tech Stack (fixed — do not substitute)

- **Frontend:** React.js + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express
- **LLM Provider:** Groq API, model `llama-3.1-8b-instant`
- **State:** React Hooks only (`useState`, `useEffect`) — no Redux/Zustand
- **File Upload:** Multer (backend), accept `.js`, `.py`, `.java`, `.cpp`
- **Export:** jsPDF for PDF report generation

## 2. Project Structure

```
ai-code-review-assistant/
├── client/                # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeInput.jsx
│   │   │   ├── AnalysisDashboard.jsx
│   │   │   └── ExportPanel.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── server/                 # Node/Express app
│   ├── routes/
│   │   └── analyze.js
│   ├── services/
│   │   └── groqService.js
│   ├── middleware/
│   │   └── upload.js       # Multer config
│   ├── server.js
│   └── package.json
├── .env                    # GROQ_API_KEY (never commit)
└── README.md
```

## 3. Backend Tasks

1. Set up Express server with CORS enabled for the frontend origin.
2. Create `POST /api/analyze` endpoint:
   - Accepts either raw code (JSON body) or an uploaded file (via Multer).
   - Validates input: reject empty code, enforce a max length (chunk or reject if over Groq's token limit).
   - Calls Groq API (`llama-3.1-8b-instant`, temperature `0.3`, max_tokens `1000`) using the system + user prompt templates below.
   - Parses the model's structured response into JSON with keys: `bugs`, `performance`, `security`, `suggestions`, `refactoredCode`.
   - Returns parsed JSON to the client.
3. Add error handling: Groq downtime → fallback message + retry logic (per PRD risk table). Rate limit → basic queueing or a clear "try again" response.
4. Never log or persist submitted code beyond the request lifecycle (sensitive code exposure risk).

### System Prompt (use exactly)
```
You are Senior Code Reviewer with 15+ years of experience in full-stack development.
Your expertise spans multiple languages (JavaScript, Python, Java, C++, TypeScript).
Analyze code for bugs, performance, security, and best practices.
Be precise, actionable, and professional.
```

### User Prompt Template (use exactly, substitute [CODE])
```
Analyze the following code:
[CODE]
Provide structured output in this exact format:
1. BUGS: (list with line numbers if possible)
2. PERFORMANCE: (bottlenecks and optimization suggestions)
3. SECURITY: (vulnerabilities and fixes)
4. SUGGESTIONS: (improvements and best practices)
5. REFACTORED CODE: (improved version with comments)
```

## 4. Frontend Tasks

1. `CodeInput.jsx`: textarea for pasting code + file upload button (`.js/.py/.java/.cpp`). Include a "Clear" button.
2. `AnalysisDashboard.jsx`: renders the 4 structured sections (Bugs, Performance, Security, Suggestions) plus the refactored code block, using icons (🐛 ⚡ 🔒 ✅) as shown in the PRD mockup.
3. Loading state: typing-effect animation while waiting for the API response (Framer Motion) — this is a demo "showoff" feature, keep it lightweight.
4. `ExportPanel.jsx`: "Copy" (clipboard API), "Export PDF" (jsPDF), "Share" (copy link — can be a stub for MVP).
5. Dark mode toggle in the header, Tailwind-based.
6. Auto-detect language client-side (by file extension) or let the backend infer it from a quick heuristic — keep this simple, not a hard requirement.

## 5. Non-Functional Requirements

- Response time target: **< 3 seconds** end to end.
- Support at least 4 languages: JS, Python, Java, C++.
- Add a visible disclaimer near results: AI-generated review, verify before relying on it (mitigates hallucination risk).
- `.env` must hold `GROQ_API_KEY`; never hardcode it or send it to the client.

## 6. Build Order (matches PRD timeline)

1. Project scaffolding + Groq API key setup
2. Backend: Express server + Groq integration + `/api/analyze` route
3. Frontend: React UI + Tailwind styling, wire up to backend
4. Prompt engineering + manual testing on sample buggy code
5. Polish: animations, error handling, PDF export
6. Prepare a short demo run-through (see `prd.md` §13 for the demo script)

## 7. Definition of Done (MVP)

- [ ] User can paste code or upload a supported file
- [ ] Clicking "Analyze" returns structured Bugs/Performance/Security/Suggestions/Refactored Code within ~3s
- [ ] Results can be copied and exported as PDF
- [ ] Basic error/fallback handling for API failures
- [ ] Dark mode works
- [ ] Works for at least JS and Python end-to-end
