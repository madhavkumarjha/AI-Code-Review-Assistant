# AGENTS.md

Guidance for AI coding agents (Claude Code, Copilot, etc.) working in this repository. Humans: see [README.md](README.md) and [docs/development.md](docs/development.md).

## Read first
1. [PRD.md](PRD.md) — what we're building and what is out of scope
2. [docs/ROADMAP.md](docs/ROADMAP.md) — current release and phase
3. [docs/architecture.md](docs/architecture.md) and [docs/api.md](docs/api.md) before touching backend or contracts
4. [docs/ui-ux.md](docs/ui-ux.md) before touching the client

## Project layout
```
client/   React 18 + Vite + Tailwind (src/components/*) — see client/README.md
server/   Express API (routes, services, middleware) — see server/README.md
docs/     roadmap, architecture, api.md, UI/UX, development, testing, demo script
```

## Commands
```bash
cd server && npm install && npm run dev     # API on :5000
cd client && npm install && npm run dev     # UI on :3000 (proxies /api)
cd client && npm run build                  # production build
```

## Rules
- Stack is fixed: React, Vite, Tailwind, Express, Groq SDK. Free/open-source only. **Ask before adding a dependency** not listed in [docs/ROADMAP.md](docs/ROADMAP.md).
- Never log, persist, or cache raw submitted code beyond the request (use hashed cache keys). Never expose `GROQ_API_KEY` to the client or commit `.env`.
- Never present demo/fallback output as a real review.
- Keep the LLM output contract (JSON only) in sync with [docs/api.md](docs/api.md); change the contract doc in the same PR as the code.
- Don't add auth, a database, or PR integrations; they are out of scope (see [PRD.md](PRD.md) §3).
- Don't create versioned copies of the PRD or other docs. Update in place; record releases in [CHANGELOG.md](CHANGELOG.md).
- Keep changes scoped to the current roadmap phase; one phase per PR.

## Definition of done
- Requirement row in [PRD.md](PRD.md) §6 updated; tests in [docs/testing.md](docs/testing.md) pass; CHANGELOG `[Unreleased]` entry added; docs updated if behaviour or contracts changed.
