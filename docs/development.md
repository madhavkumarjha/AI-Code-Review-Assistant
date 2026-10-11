# Development Guide

This guide describes fullstack development, end-to-end setup, deployment, and contribution workflows. Component-specific instructions live in their respective package guides.

---

## 📦 Package Documentation (Single Source of Truth)

For detailed installation, configuration, scripts, and component breakdowns, refer directly to each service's guide:

- **Frontend Client:** [client/README.md](../client/README.md) — React 18, Vite proxy, Tailwind, component hierarchy.
- **Backend API:** [server/README.md](../server/README.md) — Express server, Groq integration, environment variables, rate limits.

---

## 🚀 Running the Full Stack Locally

1. **Start the API:**
   Follow setup in [server/README.md](../server/README.md). Runs on `http://localhost:5000`.
   Verify health:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Start the Client (in a separate terminal):**
   Follow setup in [client/README.md](../client/README.md). Runs on `http://localhost:3000` (automatically proxies `/api` calls to `:5000`).

---

## 🌐 Deployment

| Target | Service | Details |
|---|---|---|
| **API (Render)** | `server` | Set root directory to `server`, start command `node server.js`. Configure `GROQ_API_KEY`, `ALLOWED_ORIGIN` (client URL), and `TRUST_PROXY=1`. See [server/README.md](../server/README.md#3-environment-configuration). |
| **Client (Vercel)** | `client` | Uses root `vercel.json` (build command `cd client && npm install && npm run build`, output `client/dist`). If the API domain changes, update the rewrite destination in both `vercel.json` and `client/vercel.json`. |

---

## 🛠️ Contribution Workflow

1. Pick an assigned task from [ROADMAP.md](ROADMAP.md); scope changes to one phase per PR.
2. Update the corresponding requirement row in [PRD.md](../PRD.md), active tasks in [PROGRESS.md](../PROGRESS.md), and record notes in [../CHANGELOG.md](../CHANGELOG.md) `[Unreleased]` within the same PR.
3. Run the quality gate test cases listed in [testing.md](testing.md).
4. Use free and open-source dependencies only; seek approval before adding new packages.

---

## 🔍 Troubleshooting

| Symptom | Likely Cause / Solution |
|---|---|
| Always returns a fallback review | Missing or placeholder `GROQ_API_KEY`, or upstream Groq error. Check server logs and [server/README.md](../server/README.md). |
| "Unexpected end of JSON" | Model response truncated by token budget. Check `max_tokens` settings in `groqService.js`. |
| Rate limit triggers immediately | Proxy IP misconfiguration. Ensure `TRUST_PROXY=1` is set on reverse proxies. |
| CORS error in production | `ALLOWED_ORIGIN` does not match the client URL. Update backend environment variables. |
| Monaco blank / loading error (v2) | Lazy-loaded chunk or worker issue. Inspect network tab and Suspense fallback. |
