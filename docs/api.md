# 📡 Unified API Specification

This document is the **Single Source of Truth** for all API contracts of the AI Code Review Assistant. It defines both the currently implemented **v1 (Production)** endpoints and the upcoming **v2 (Release 2.0)** specifications.

---

## 🧭 API Versioning Policy

- **Independent Versioning:** The API version reflects backend contract stability and evolves independently of frontend UI releases.
- **v1 (Current / Stable):** Served at both unversioned routes (`/api/analyze`, `/api/health`) and versioned aliases (`/api/v1/*`).
- **v2 (Planned / Additive):** Introduces real-time Server-Sent Events (SSE) streaming and on-demand finding explanations under `/api/v2/*`. It is strictly additive; existing v1 consumers continue to function without breaking changes.
- **Release Timeline:** See [ROADMAP.md](ROADMAP.md) for phased delivery milestones.
- **Configuration & Secrets:** Environment variable specifications live in [server/README.md](../server/README.md#3-environment-configuration).

---

## 🛡️ Shared Policies & Safeguards

| Policy | Rule | Enforcement |
|---|---|---|
| **Rate Limiting** | 50 requests / 15 min / IP | Standard `RateLimit-*` HTTP response headers enabled. |
| **JSON Payload Limit** | Max 5 MB | Express `express.json({ limit: '5mb' })`. |
| **Code Length Cap** | Max 25,000 characters | Enforced on both direct string input and file content. |
| **File Upload Limit** | Max 30 KB per file (~25,000 chars) | In-memory Multer parsing (`.js .jsx .ts .tsx .py .java .cpp .c .cs .go .html .css .json .php .txt`). |
| **CORS Policy** | Production: strict allow-list (`ALLOWED_ORIGIN`, Vercel domains). Development: open. | Configured in `server/server.js`. |
| **Privacy & Zero Storage** | Code is never stored on disk, logged to console, or retained past request cycle. Cache keys are SHA-256 hashes. | Server architecture constraint. |

### Standard Error Envelope
All error responses adhere to the standard JSON structure:
```json
{
  "error": "Validation Error",
  "message": "Code content cannot be empty."
}
```

---

## 🟢 v1 API Specification (Current / Stable)

### 1. Health Check
Checks service uptime and Groq API readiness.

- **Method:** `GET`
- **Path:** `/api/health` (or `/api/v1/health`)
- **Response (200 OK):**
```json
{
  "status": "online",
  "service": "AI Code Review Assistant API",
  "groqConfigured": true
}
```

---

### 2. Full Code Analysis
Performs synchronous 4-dimensional analysis and generates refactored code.

- **Method:** `POST`
- **Path:** `/api/analyze` (or `/api/v1/analyze`)
- **Headers:** `Content-Type: application/json` or `multipart/form-data`

#### Request Body (JSON)
```json
{
  "code": "async function getData() { ... }",
  "language": "Auto-detect"
}
```
*Note: If `multipart/form-data` is used with a `file` field, the programming language is automatically inferred from the file extension.*

#### Request Validation
- **Empty / whitespace-only code:** Returns `400 Bad Request` (`Validation Error`).
- **Code > 25,000 characters:** Returns `400 Bad Request` (`Limit Exceeded`).
- **Control characters:** Silently stripped prior to LLM submission.
- **Rate limit exceeded:** Returns `429 Too Many Requests`.

#### Response (200 OK)
```json
{
  "success": true,
  "executionTimeMs": 1840,
  "data": {
    "summary": "Brief 2-sentence executive summary of overall code quality.",
    "qualityScore": 72,
    "bugs": [
      {
        "line": "Line 4",
        "issue": "Unhandled Promise rejection in async call.",
        "severity": "High",
        "recommendation": "Wrap call inside a try-catch block."
      }
    ],
    "performance": [
      {
        "title": "Unnecessary re-render / O(N^2) loop",
        "detail": "Nested loops iterate across entire collection repeatedly.",
        "impact": "Medium"
      }
    ],
    "security": [
      {
        "vulnerability": "Potential SQL Injection / XSS",
        "riskLevel": "Critical",
        "fix": "Sanitize input parameters using parameterized queries."
      }
    ],
    "suggestions": [
      {
        "area": "Code Cleanliness",
        "recommendation": "Use destructuring assignment for clearer readability."
      }
    ],
    "refactoredCode": "// Production-ready refactored version\nasync function getData() { ... }"
  },
  "isCached": false,
  "isFallback": false
}
```

---

### 3. On-Demand Finding Explanation
Provides deep AI diagnostic analysis and concrete remediation code for a specific finding.

- **Method:** `POST`
- **Path:** `/api/analyze/explain` (or `/api/v2/explain`)
- **Headers:** `Content-Type: application/json`

#### Request Body (JSON)
```json
{
  "finding": {
    "line": "Line 4",
    "issue": "Unhandled Promise rejection in async call.",
    "severity": "High",
    "recommendation": "Wrap call inside a try-catch block."
  },
  "code": "async function getData() { ... }",
  "language": "JavaScript"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "rootCause": "Asynchronous operations lack guaranteed completion handling...",
    "technicalImpact": "Uncaught promise rejections can crash the process...",
    "remediation": "try {\n  const res = await fetch(...);\n} catch (err) {\n  ...\n}",
    "bestPractice": "Encapsulate all asynchronous I/O within structured try/catch blocks."
  }
}
```

---

## 🟡 v2 API Specification (Planned — Release 2.0)

v2 enhances developer feedback with streaming progress, normalized finding models, and inline explanations.

### 1. Normalized Findings Model
v2 unifies findings into a single structured array for streamlined filtering and rendering:

```json
{
  "id": "bug-1",
  "category": "bug",
  "severity": "critical",
  "title": "Uncaught promise rejection",
  "detail": "Async function lacks exception handling.",
  "line": "Line 4",
  "fix": "Wrap in try-catch block."
}
```

#### Severity Normalization Mapping

| v1 Legacy Severity | v2 Normalized Severity | Badge / Emoji |
|---|---|---|
| Bugs `High`, Security `Critical`/`High`, Performance `High` | `critical` | 🔴 Critical |
| Any category `Medium` | `warning` | 🟡 Warning |
| Any category `Low`, all `Suggestions` | `info` | 🔵 Info |

---

### 2. Real-Time Streaming Review
Streams review stages, metadata, and completed sections via Server-Sent Events (SSE).

- **Method:** `POST`
- **Path:** `/api/v2/analyze/stream`
- **Response Header:** `Content-Type: text/event-stream`

#### Event Progression Sequence
```
event: status
data: { "stage": "queued" }

event: meta
data: { "language": "Python", "model": "llama-3.3-70b-versatile" }

event: section
data: { "name": "bugs", "items": [ ... ] }

event: done
data: { "summary": "...", "qualityScore": 88, "findings": [ ... ], "refactoredCode": "..." }
```

#### Failure & Disconnection Handling
The server validates output JSON before emitting completed sections. If a stream drops or produces invalid JSON, the server automatically attempts **one non-streamed retry**. If retry fails, an explicit `event: error` is returned rather than silent fake data.

---

## 🔗 Related Documentation
- Product Requirements: [PRD](../PRD.md)
- Release Timeline & Roadmap: [ROADMAP.md](ROADMAP.md)
- Architecture & Data Flow: [architecture.md](architecture.md)
- Backend Guide: [server/README.md](../server/README.md)
