const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  analyzeCode,
  explainFinding,
  analyzeLargeFile,
  analyzeMultiFileProject
} = require('../services/groqService');

// Dedicated Rate Limiter for primary Code Analysis (50 requests per 15 minutes)
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Too many code analysis requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter Dedicated Rate Limiter for On-Demand Diagnostic Explanations (25 requests per 15 minutes)
const explainLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Too many diagnostic explanation requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// In-memory cache with TTL (1 hour) for fast repeated analysis requests
const responseCache = new Map();
const explainCache = new Map();
const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

const extMap = {
  '.js': 'JavaScript',
  '.jsx': 'React JS',
  '.ts': 'TypeScript',
  '.tsx': 'React TS',
  '.py': 'Python',
  '.java': 'Java',
  '.cpp': 'C++',
  '.c': 'C',
  '.cs': 'C#',
  '.go': 'Go',
  '.php': 'PHP',
  '.html': 'HTML',
  '.css': 'CSS',
  '.json': 'JSON',
  '.rs': 'Rust'
};

// Sanitize code input (removes non-printable control characters)
const sanitizeCode = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .trim();
};

// POST /api/analyze - Accepts JSON or Multipart Single File Upload (backward compatible + large file support)
router.post('/', analyzeLimiter, upload.single('file'), async (req, res) => {
  try {
    // If request contains multiple files in JSON, seamlessly delegate to multi-file analysis
    if (req.body && Array.isArray(req.body.files)) {
      const files = req.body.files.map((f, idx) => ({
        filename: f.filename || `file_${idx + 1}`,
        code: sanitizeCode(f.code || ''),
        language: f.language || 'Auto-detect'
      }));
      const multiResult = await analyzeMultiFileProject(files);
      return res.status(200).json(multiResult);
    }

    let rawCode = '';
    let language = 'Auto-detect';
    let filename = 'snippet';

    // Handle file upload
    if (req.file) {
      rawCode = req.file.buffer.toString('utf8');
      filename = req.file.originalname;
      const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      language = extMap[ext] || 'Auto-detect';
    } else if (req.body && req.body.code) {
      rawCode = req.body.code;
      language = req.body.language || 'Auto-detect';
    }

    // Input Validation
    if (!rawCode || typeof rawCode !== 'string' || rawCode.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Code snippet or non-empty file upload is required.'
      });
    }

    // Upper safety limit (125,000 characters ~ 150KB) to prevent resource starvation
    if (rawCode.length > 125000) {
      return res.status(400).json({
        error: 'Limit Exceeded',
        message: 'Code length exceeds maximum upper limit of 125,000 characters (~150KB).'
      });
    }

    // Sanitize input code
    const code = sanitizeCode(rawCode);

    // Cache lookup with TTL check (SHA-256 hashed key for privacy)
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const cacheKey = `${language}:${codeHash}`;
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.status(200).json({
          ...cached.data,
          isCached: true
        });
      } else {
        responseCache.delete(cacheKey); // Evict expired entry
      }
    }

    // Perform LLM Analysis (uses large-file chunking if > 25,000 chars, else direct)
    let result;
    if (code.length > 25000) {
      result = await analyzeLargeFile(code, language, filename);
    } else {
      result = await analyzeCode(code, language);
    }

    // Cache result with timestamp (only cache genuine LLM responses, never fallback mode)
    if (result && !result.isFallback) {
      if (responseCache.size >= MAX_CACHE_SIZE) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
      }
      responseCache.set(cacheKey, { timestamp: Date.now(), data: result });
    }

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.status || error.statusCode || 500;
    console.error('API /api/analyze Error:', error.message || error);
    return res.status(statusCode).json({
      error: statusCode === 429 ? 'Rate Limit Exceeded' : (statusCode === 401 ? 'Authentication Error' : 'Analysis Error'),
      message: error.message || 'An error occurred while analyzing the code snippet.'
    });
  }
});

// POST /api/analyze/multi - Accepts Multi-file Array via JSON or Multipart Upload
router.post('/multi', analyzeLimiter, upload.array('files', 10), async (req, res) => {
  try {
    let files = [];

    // 1. Multipart file uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      files = req.files.map(file => {
        const raw = file.buffer.toString('utf8');
        const filename = file.originalname;
        const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        const language = extMap[ext] || 'Auto-detect';
        return {
          filename,
          code: sanitizeCode(raw),
          language
        };
      });
    } else if (req.body && Array.isArray(req.body.files)) {
      files = req.body.files.map((f, idx) => ({
        filename: f.filename || `file_${idx + 1}`,
        code: sanitizeCode(f.code || ''),
        language: f.language || 'Auto-detect'
      }));
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'At least one code file is required for multi-file review.'
      });
    }

    if (files.length > 10) {
      return res.status(400).json({
        error: 'Limit Exceeded',
        message: 'A maximum of 10 files can be reviewed in a single batch.'
      });
    }

    // Check individual file lengths
    for (const f of files) {
      if (f.code.length > 125000) {
        return res.status(400).json({
          error: 'File Too Large',
          message: `File "${f.filename}" exceeds the maximum limit of 125,000 characters (~150KB).`
        });
      }
    }

    // Hash batch for cache lookup
    const batchKeyPayload = files.map(f => `${f.filename}:${f.language}:${f.code.length}:${crypto.createHash('sha256').update(f.code).digest('hex').slice(0, 16)}`).join('|');
    const batchHash = crypto.createHash('sha256').update(batchKeyPayload).digest('hex');
    const cacheKey = `multi:${batchHash}`;

    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.status(200).json({
          ...cached.data,
          isCached: true
        });
      } else {
        responseCache.delete(cacheKey);
      }
    }

    const result = await analyzeMultiFileProject(files);

    if (result && !result.isFallback) {
      if (responseCache.size >= MAX_CACHE_SIZE) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
      }
      responseCache.set(cacheKey, { timestamp: Date.now(), data: result });
    }

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.status || error.statusCode || 500;
    console.error('API /api/analyze/multi Error:', error.message || error);
    return res.status(statusCode).json({
      error: statusCode === 429 ? 'Rate Limit Exceeded' : (statusCode === 401 ? 'Authentication Error' : 'Multi-File Analysis Error'),
      message: error.message || 'An error occurred during multi-file repository review.'
    });
  }
});

// POST /api/analyze/explain - On-demand AI diagnostic explanation for a specific finding
router.post('/explain', explainLimiter, async (req, res) => {
  try {
    const { finding, code = '', language = 'JavaScript' } = req.body || {};

    if (!finding || typeof finding !== 'object') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'A valid finding object is required for diagnostic explanation.'
      });
    }

    const codeHash = crypto.createHash('sha256').update(code || '').digest('hex').slice(0, 16);
    const findingId = `${codeHash}:${finding.line || ''}:${finding.issue || finding.vulnerability || finding.title || ''}:${language}`;
    const cacheKey = crypto.createHash('sha256').update(findingId).digest('hex');

    if (explainCache.has(cacheKey)) {
      const cached = explainCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.status(200).json(cached.data);
      }
      explainCache.delete(cacheKey);
    }

    const result = await explainFinding(finding, code, language);

    if (result && result.success && !result.isFallback) {
      if (explainCache.size >= MAX_CACHE_SIZE) {
        const firstKey = explainCache.keys().next().value;
        explainCache.delete(firstKey);
      }
      explainCache.set(cacheKey, { timestamp: Date.now(), data: result });
    }

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.status || error.statusCode || 500;
    console.error('API /api/analyze/explain Error:', error.message || error);
    return res.status(statusCode).json({
      error: statusCode === 429 ? 'Rate Limit Exceeded' : (statusCode === 401 ? 'Authentication Error' : 'Diagnostic Error'),
      message: error.message || 'Failed to generate diagnostic explanation for this finding.'
    });
  }
});

module.exports = router;

