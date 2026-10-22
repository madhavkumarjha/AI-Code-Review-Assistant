# ⚙️ Server — AI Code Review Assistant Backend API

The backend is a lightweight REST API built with **Node.js** and **Express**, integrating with **Groq Cloud API** (`groq-sdk`) to provide sub-3-second code analysis.

---

## 🏗️ Architecture & Modules

```
server/
├── server.js               # Entry point: Express configuration, CORS, rate limiter, health check
├── routes/
│   ├── analyze.js          # POST /api/analyze & /api/analyze/multi: multi-file batching, chunking, cache
│   └── execute.js          # POST /api/execute: sandboxed execution runner (Python, C/C++, Node)
├── middleware/
│   └── upload.js           # Multer in-memory parser for source code files (≤ 150 KB per file, max 10 files)
└── services/
    └── groqService.js      # Multi-file aggregation, large-file chunking, Groq model chain, clean status

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
| `POST` | `/api/analyze` | Single-file review & large-file chunking | [API Spec](../docs/api.md#2-full-code-analysis) |
| `POST` | `/api/analyze/multi` | Multi-file repository review (up to 10 files) | [API Spec](../docs/api.md#4-multi-file-repository-review-v3-phase-1) |
| `POST` | `/api/execute` | Sandboxed multi-language code execution | [API Spec](../docs/api.md#4-sandboxed-code-execution-v3-feature) |
| `POST` | `/api/analyze/explain` | On-demand AI diagnostic explanation for findings | [API Spec](../docs/api.md#3-on-demand-finding-explanation) |
| `POST` | `/api/v2/analyze/stream` | *(Planned Release 2.0)* SSE Streaming review | [API Spec](../docs/api.md#2-real-time-streaming-review) |

---

## 🛡️ Security & Safeguards

- **Rate Limiting:** Enforced at **50 requests per 15 minutes per IP** via `express-rate-limit`.
- **Payload Caps:** Max 5 MB JSON payload; max 150 KB (~125,000 characters) per code file.
- **Large-File Chunking:** Files > 25,000 characters are section-analyzed with zero silent truncation.
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
