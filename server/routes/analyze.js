const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeCode } = require('../services/groqService');

// POST /api/analyze - Accepts JSON or Multipart File Upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    let code = '';
    let language = 'Auto-detect';

    // Handle file upload
    if (req.file) {
      code = req.file.buffer.toString('utf8');
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
      code = req.body.code;
      language = req.body.language || 'Auto-detect';
    }

    // Input Validation
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Code snippet or non-empty file upload is required.'
      });
    }

    // Max length check (avoid token limit overflow)
    if (code.length > 25000) {
      return res.status(400).json({
        error: 'Limit Exceeded',
        message: 'Code length exceeds max limit of 25,000 characters for instant review.'
      });
    }

    // Perform LLM Analysis
    const result = await analyzeCode(code, language);

    return res.status(200).json(result);
  } catch (error) {
    console.error('API /api/analyze Error:', error);
    return res.status(500).json({
      error: 'Analysis Error',
      message: error.message || 'An error occurred while analyzing the code snippet.'
    });
  }
});

module.exports = router;
