const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeCode } = require('../services/groqService');

// In-memory cache for fast repeated analysis requests
const responseCache = new Map();
const MAX_CACHE_SIZE = 100;

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
        message: 'Code length exceeds max limit of 25,000 characters for instant review.'
      });
    }

    // Sanitize input code
    const code = sanitizeCode(rawCode);

    // Cache lookup
    const cacheKey = `${language}:${code}`;
    if (responseCache.has(cacheKey)) {
      const cachedResponse = responseCache.get(cacheKey);
      return res.status(200).json({
        ...cachedResponse,
        isCached: true
      });
    }

    // Perform LLM Analysis
    const result = await analyzeCode(code, language);

    // Cache result (maintain cache bounds)
    if (responseCache.size >= MAX_CACHE_SIZE) {
      const firstKey = responseCache.keys().next().value;
      responseCache.delete(firstKey);
    }
    responseCache.set(cacheKey, result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('API /api/analyze Error:', error.message || error);
    return res.status(500).json({
      error: 'Analysis Error',
      message: error.message || 'An error occurred while analyzing the code snippet.'
    });
  }
});

module.exports = router;

