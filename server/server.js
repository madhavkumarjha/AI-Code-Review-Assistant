const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const analyzeRouter = require('./routes/analyze');

// Load environment variables
dotenv.config();

// Environment Variables Validation
const requiredEnvVars = ['GROQ_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v] || process.env[v].trim() === '');
if (missingVars.length > 0) {
  console.warn(`⚠️ Warning: Missing environment variables: ${missingVars.join(', ')}`);
  console.warn('⚠️ Server will operate in simulated fallback review mode.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Configurable CORS
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.ALLOWED_ORIGIN || 'https://yourdomain.com'] 
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiter for API Protection (50 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Too many code analysis requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Body Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AI Code Review Assistant API',
    groqConfigured: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0)
  });
});

// API Routes with Rate Limiting
app.use('/api/analyze', apiLimiter, analyzeRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 AI Code Review Assistant Backend running on http://localhost:${PORT}`);
  console.log(`🔑 Groq API Key Configured: ${process.env.GROQ_API_KEY ? 'YES' : 'NO (Using fallback mode)'}`);
});

