const multer = require('multer');

// Store file in memory buffer so no disk writing is required
const storage = multer.memoryStorage();

// Filter supported file extensions
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.html', '.css', '.json', '.php', '.txt'];
  const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
  
  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('text/')) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Supported: JS, PY, Java, C++, TS, Go, HTML, CSS, etc.`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 // 100KB max file size (~25,000 characters) aligned with analyze route
  },
  fileFilter: fileFilter
});

module.exports = upload;
