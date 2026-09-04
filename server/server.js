const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const analyzeRouter = require('./routes/analyze');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
app.use(cors({
  origin: '*', // Allow all origins for dev / flexible local access
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// API Routes
app.use('/api/analyze', analyzeRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 AI Code Review Assistant Backend running on http://localhost:${PORT}`);
  console.log(`🔑 Groq API Key Configured: ${process.env.GROQ_API_KEY ? 'YES' : 'NO (Using fallback mode)'}`);
});
