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

// Enable trust proxy for reverse proxies (Render, Vercel, Nginx, Cloudflare)
const trustProxyVal = process.env.TRUST_PROXY !== undefined 
  ? (isNaN(Number(process.env.TRUST_PROXY)) ? process.env.TRUST_PROXY : Number(process.env.TRUST_PROXY)) 
  : 1;
app.set('trust proxy', trustProxyVal);


// Configurable CORS supporting Vercel Frontend & Local Dev
const allowedOrigins = [
  'https://ai-code-review-assistant-sand.vercel.app',
  process.env.ALLOWED_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server Vercel rewrites or curl)
    if (!origin) return callback(null, true);

    // Allow explicitly defined origins, all vercel preview domains, or local dev
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
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

