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
    const err = new Error(`Unsupported file type: ${ext}. Supported: JS, PY, Java, C++, TS, Go, HTML, CSS, etc.`);
    err.name = 'Unsupported File Type';
    err.status = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 150 * 1024, // 150KB max file size (~125,000 characters) to support large-file analysis
    files: 10 // Max 10 files in a multi-file batch
  },
  fileFilter: fileFilter
});

module.exports = upload;
