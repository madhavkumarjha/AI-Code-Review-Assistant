# ⚙️ Server — AI Code Review Assistant Backend API

The backend is a lightweight REST API built with **Node.js** and **Express**, integrating with **Groq Cloud API** (`groq-sdk`) to provide sub-3-second code analysis.

---

## 🏗️ Architecture & Modules

```
server/
├── server.js               # Entry point: Express configuration, CORS, rate limiter, health check
├── routes/
│   └── analyze.js          # POST /api/analyze: request validation, sanitization, cache, response formatting
├── middleware/
│   └── upload.js           # Multer in-memory stream parser for uploaded source code files (≤ 2 MB)
└── services/
    └── groqService.js      # Prompt formatting, Groq model fallback chain, JSON extraction, fallback mock
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ and **npm**
- **Groq API Key** (optional: server runs in *Smart Fallback Mode* without a key)

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | Optional | — | Your Groq Cloud API key. If absent, fallback mode activates. |
| `PORT` | Optional | `5000` | Port for the Express HTTP server. |
| `ALLOWED_ORIGIN` | Production | — | Explicit client origin allowed by CORS. |
| `TRUST_PROXY` | Optional | `1` | Express `trust proxy` level for accurate IP rate limiting. |
| `NODE_ENV` | Optional | `development` | Setting to `production` enables strict CORS checks. |

### 4. Running the Server

- **Development (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```
The API will be available at **`http://localhost:5000`**.

---

## 📡 API Endpoints Overview

| Method | Path | Description | Spec |
|---|---|---|---|
| `GET` | `/api/health` | Health check and Groq API status | [API Spec](../docs/api.md#1-health-check) |
| `POST` | `/api/analyze` | Code review endpoint (JSON or file upload) | [API Spec](../docs/api.md#2-full-code-analysis) |
| `POST` | `/api/v2/analyze/stream` | *(Planned Release 2.0)* SSE Streaming review | [API Spec](../docs/api.md#2-real-time-streaming-review) |
| `POST` | `/api/v2/explain` | *(Planned Release 2.0)* AI bug explanation | [API Spec](../docs/api.md#3-on-demand-finding-explanation) |

---

## 🛡️ Security & Safeguards

- **Rate Limiting:** Enforced at **50 requests per 15 minutes per IP** via `express-rate-limit`.
- **Payload Caps:** Max 5 MB JSON payload; max 25,000 characters of raw code.
- **Privacy:** Submitted code is never written to disk, persisted to a database, or logged to server stdout.
- **In-Memory Caching:** Duplicate code hashes return cached results (1-hour TTL, max 100 entries).

---

## 📚 Related Documentation

- Project Overview: [Project README](../README.md)
- Product Requirements: [PRD](../PRD.md)
- Live Progress Tracker: [PROGRESS](../PROGRESS.md)
- Frontend Guide: [Client README](../client/README.md)
- Unified API Contracts: [API Spec](../docs/api.md)
- Architecture Design: [Architecture](../docs/architecture.md)
