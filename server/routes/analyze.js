const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeCode, explainFinding } = require('../services/groqService');

// In-memory cache with TTL (1 hour) for fast repeated analysis requests
const responseCache = new Map();
const explainCache = new Map();
const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

// Sanitize code input (removes non-printable control characters)
const sanitizeCode = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .trim();
};

// POST /api/analyze - Accepts JSON or Multipart File Upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    let rawCode = '';
    let language = 'Auto-detect';

    // Handle file upload
    if (req.file) {
      rawCode = req.file.buffer.toString('utf8');
      const filename = req.file.originalname;
      const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      
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
        '.css': 'CSS'
      };
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

    // Max length check (avoid token limit overflow)
    if (rawCode.length > 25000) {
      return res.status(400).json({
        error: 'Limit Exceeded',
        message: 'Code length exceeds maximum limit of 25,000 characters (~25KB) for instant review.'
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

    // Perform LLM Analysis
    const result = await analyzeCode(code, language);

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
    console.error('API /api/analyze Error:', error.message || error);
    return res.status(500).json({
      error: 'Analysis Error',
      message: error.message || 'An error occurred while analyzing the code snippet.'
    });
  }
});

// POST /api/analyze/explain - On-demand AI diagnostic explanation for a specific finding
router.post('/explain', async (req, res) => {
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

    if (result && result.success) {
      if (explainCache.size >= MAX_CACHE_SIZE) {
        const firstKey = explainCache.keys().next().value;
        explainCache.delete(firstKey);
      }
      explainCache.set(cacheKey, { timestamp: Date.now(), data: result });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('API /api/analyze/explain Error:', error.message || error);
    return res.status(500).json({
      error: 'Diagnostic Error',
      message: error.message || 'Failed to generate diagnostic explanation for this finding.'
    });
  }
});

module.exports = router;

