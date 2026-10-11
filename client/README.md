# 🖥️ Client — AI Code Review Assistant Frontend

The frontend client is a single-page developer dashboard built with **React 18**, **Vite**, **Tailwind CSS**, and **Framer Motion**. It provides a 2-column interface (40% code input / 60% review results) with sub-3-second feedback.

---

## 🏗️ Architecture & Component Hierarchy

```
client/src/
├── App.jsx                     # Top-level state (code, language, results, loading, errors)
├── main.jsx                    # Application entry point
├── index.css                   # Global styles & Tailwind imports
└── components/
    ├── Header.jsx              # Sticky header with branding and latency badge
    ├── CodeInput.jsx           # Code textarea, language selector, file uploader, presets
    ├── AnalysisDashboard.jsx   # Results view: score pill, tabs, 4D finding cards, refactored code
    ├── ExportPanel.jsx         # Export options: Copy Markdown, Copy Refactored, jsPDF Export, Share
    ├── LoadingView.jsx         # 4-stage animated progress view
    ├── ErrorBoundary.jsx       # Component crash isolation
    └── SamplePresets.js        # 1-click test code samples (JS, Python, SQL/XSS, C++)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ and **npm**

### 2. Installation
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```
Starts the local dev server on **`http://localhost:3000`**.

### 4. Production Build
```bash
npm run build
```
Generates optimized static assets in `client/dist/`. To preview locally:
```bash
npm run preview
```

---

## 🔌 API Proxy Configuration

In local development, API requests starting with `/api` are automatically proxied to the backend at `http://localhost:5000` via `vite.config.js`:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

In production on Vercel, requests to `/api/*` are routed through rewrites defined in `vercel.json`.

---

## 📚 Related Documentation

- Project Overview: [Project README](../README.md)
- Product Requirements: [PRD](../PRD.md)
- Live Progress Tracker: [PROGRESS](../PROGRESS.md)
- Backend Guide: [Server README](../server/README.md)
- UI/UX Design Specifications: [UI/UX Spec](../docs/ui-ux.md)
- Unified API Contracts: [API Spec](../docs/api.md)
