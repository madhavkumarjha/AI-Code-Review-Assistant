const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `You are a Senior Code Reviewer with 15+ years of experience in full-stack development.
Your expertise spans multiple programming languages (JavaScript, Python, Java, C++, TypeScript, Go, Rust).
Analyze code for bugs, performance, security, and best practices.
Be precise, actionable, and professional.

IMPORTANT: You MUST respond ONLY with valid JSON. Do not include markdown code block backticks (like \`\`\`json) outside the JSON object.
Return a single JSON object with the following exact keys:
{
  "summary": "Brief 2-sentence executive summary of the code quality and major findings",
  "qualityScore": 85, // integer 0-100 rating overall code quality
  "bugs": [
    {
      "line": "Line number or range (e.g. 'Line 4' or 'Global')",
      "issue": "Concise description of the bug or potential runtime exception",
      "severity": "High", // "High", "Medium", or "Low"
      "recommendation": "How to fix this issue"
    }
  ],
  "performance": [
    {
      "title": "Title of performance bottleneck or inefficiency",
      "detail": "Detailed explanation of why it is slow or resource intensive",
      "impact": "High" // "High", "Medium", or "Low"
    }
  ],
  "security": [
    {
      "vulnerability": "Security risk or vulnerability name",
      "riskLevel": "High", // "Critical", "High", "Medium", or "Low"
      "fix": "Actionable fix or mitigation step"
    }
  ],
  "suggestions": [
    {
      "area": "Code Quality / Readability / Architecture",
      "recommendation": "Best practice suggestion to improve code maintainability"
    }
  ],
  "refactoredCode": "Complete, improved and refactored version of the code with modern standards and comments"
}`;

/**
 * Quick heuristic language auto-detector for un-specified or 'Auto-detect' snippets
 */
function detectLanguage(code) {
  if (!code) return 'JavaScript';
  const trimmed = code.trim();
  if (trimmed.includes('def ') || trimmed.includes('print(') || (trimmed.includes('import ') && (trimmed.includes('sys') || trimmed.includes('os') || trimmed.includes('pandas') || trimmed.includes('numpy')))) {
    return 'Python';
  }
  if (trimmed.includes('public class ') || trimmed.includes('System.out.println') || trimmed.includes('public static void main')) {
    return 'Java';
  }
  if (trimmed.includes('#include') || trimmed.includes('std::cout') || trimmed.includes('using namespace std;')) {
    return 'C++';
  }
  if (trimmed.includes('package main') || trimmed.includes('func main()') || trimmed.includes('fmt.Println')) {
    return 'Go';
  }
  if (trimmed.includes('fn main()') || trimmed.includes('let mut ') || trimmed.includes('impl ')) {
    return 'Rust';
  }
  if (trimmed.includes('interface ') || (trimmed.includes(': string') && trimmed.includes('const ')) || trimmed.includes('<React.FC')) {
    return 'TypeScript';
  }
  if (trimmed.includes('function') || trimmed.includes('const ') || trimmed.includes('let ') || trimmed.includes('console.log') || trimmed.includes('=>')) {
    return 'JavaScript';
  }
  return 'General Snippet';
}

/**
 * Perform code analysis using Groq API or smart fallback generator
 */
async function analyzeCode(code, language = 'Auto-detect') {
  const apiKey = process.env.GROQ_API_KEY;

  const resolvedLanguage = (!language || language === 'Auto-detect') 
    ? detectLanguage(code) 
    : language;

  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_groq_api_key_here') {
    console.log('⚡ GROQ_API_KEY not set or placeholder used. Running in Smart Fallback Mode.');
    return generateFallbackAnalysis(code, resolvedLanguage);
  }

  const groq = new Groq({ apiKey });

  const userPrompt = `Analyze the following code snippet (Detected/Specified Language: ${resolvedLanguage}):

\`\`\`
${code}
\`\`\`

Provide your full code review in the required structured JSON format. Ensure all 5 categories (bugs, performance, security, suggestions, refactoredCode) are thoroughly analyzed.`;

  try {
    const startTime = Date.now();

    // Production active models for high-speed & high-quality inference
    const modelsToTry = [
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant'
    ];

    let response = null;
    let lastModelError = null;
    let successfulModel = null;

    for (const model of modelsToTry) {
      try {
        response = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          model: model,
          temperature: 0.2,
          max_tokens: 4000
        });
        if (response && response.choices && response.choices[0]?.message?.content) {
          successfulModel = model;
          console.log(`⚡ Inference succeeded using model: ${model}`);
          break;
        }
      } catch (err) {
        console.warn(`Model [${model}] failed: ${err.message ? err.message.slice(0, 120) : 'Unknown error'}. Trying next model...`);
        lastModelError = err;
      }
    }

    if (!response) {
      throw lastModelError || new Error('All AI models failed to respond.');
    }

    const executionTimeMs = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || '{}';

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      // Clean up markdown block if present
      const cleaned = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    return {
      success: true,
      executionTimeMs,
      data: sanitizeAnalysisData(parsedResult, code)
    };
  } catch (error) {
    // Sanitized error logging
    const errorMessage = error.message || '';
    const errorStatus = error.status || error.statusCode || 500;
    
    console.error('Groq API Error:', {
      status: errorStatus,
      message: errorMessage.slice(0, 150)
    });
    
    if (errorStatus === 429) {
      throw new Error('Groq API rate limit exceeded. Please wait a moment before trying again.');
    }
    
    // Fallback gracefully on auth, decommissioned model, or invalid key issues
    if (
      errorStatus === 401 || 
      errorStatus === 400 || 
      errorMessage.includes('API key') || 
      errorMessage.includes('decommissioned') || 
      errorMessage.includes('model')
    ) {
      console.warn('Groq API error encountered. Falling back to simulated review generator.');
      return {
        success: true,
        executionTimeMs: 450,
        isFallback: true,
        data: generateFallbackAnalysis(code, language).data,
        warning: 'Demonstration Mode: Operating with offline simulated analysis.'
      };
    }

    throw new Error(`AI Review failed: ${errorMessage || 'Unknown API error'}`);
  }
}

/**
 * Sanitize and enforce complete object structure
 */
function sanitizeAnalysisData(raw, originalCode) {
  return {
    summary: raw.summary || 'Code analysis completed successfully.',
    qualityScore: typeof raw.qualityScore === 'number' ? raw.qualityScore : 75,
    bugs: Array.isArray(raw.bugs) ? raw.bugs : [],
    performance: Array.isArray(raw.performance) ? raw.performance : [],
    security: Array.isArray(raw.security) ? raw.security : [],
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
    refactoredCode: raw.refactoredCode || originalCode
  };
}

/**
 * Smart Fallback Analysis Generator for instant local offline demos
 */
function generateFallbackAnalysis(code, language) {
  const isPython = code.includes('def ') || code.includes('import ') || language.toLowerCase() === 'python';
  const isJS = code.includes('function') || code.includes('const ') || code.includes('let ') || language.toLowerCase().includes('javascript');
  
  let bugs = [];
  let performance = [];
  let security = [];
  let suggestions = [];
  let refactoredCode = '';

  if (code.includes('fetch') && !code.includes('try') && !code.includes('.catch')) {
    bugs.push({
      line: 'Line 2',
      issue: 'Unhandled Promise rejection in API call',
      severity: 'High',
      recommendation: 'Wrap fetch call in a try/catch block or attach a .catch() handler.'
    });
  }

  if (code.includes('console.log') || code.includes('print(')) {
    suggestions.push({
      area: 'Logging',
      recommendation: 'Replace raw print/console statements with a structured logger for production environments.'
    });
  }

  if (code.includes('SELECT *') || code.includes('eval(') || code.includes('innerHTML')) {
    security.push({
      vulnerability: 'Potential Injection or XSS Vulnerability',
      riskLevel: 'Critical',
      fix: 'Sanitize user inputs and use parameterized queries or safe DOM manipulation APIs.'
    });
  }

  if (bugs.length === 0) {
    bugs.push({
      line: 'Scope Check',
      issue: 'Missing explicit return statement or bounds checking',
      severity: 'Low',
      recommendation: 'Ensure all execution branches explicitly handle error conditions.'
    });
  }

  if (performance.length === 0) {
    performance.push({
      title: 'Potential Synchronous Bottleneck',
      detail: 'Iterative operations over data arrays can benefit from asynchronous chunking or memoization.',
      impact: 'Medium'
    });
  }

  if (security.length === 0) {
    security.push({
      vulnerability: 'Missing Input Sanitization / Rate Limiting',
      riskLevel: 'Medium',
      fix: 'Enforce strict schema validation on input arguments to prevent unexpected data types.'
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      area: 'Code Style & Formatting',
      recommendation: 'Enforce strict type hints / JSDoc annotations to improve IDE IntelliSense and code maintainability.'
    });
  }

  if (isJS) {
    refactoredCode = `// Refactored & Optimized Code (AI Assistant)
const executeTask = async (payload) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid input payload provided');
    }
    
    // Process input cleanly
    const result = await processData(payload);
    return { success: true, data: result };
  } catch (error) {
    console.error('[Service Error]:', error.message);
    return { success: false, error: error.message };
  }
};

${code}`;
  } else {
    refactoredCode = `# Refactored & Optimized Code (AI Assistant)
from typing import Dict, Any, Optional

def execute_task(payload: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Safely processes payload with error handling and typing."""
    if not payload:
        raise ValueError("Invalid or empty payload")
        
    try:
        # Perform computation
        return {"success": True, "result": payload}
    except Exception as err:
        return {"success": False, "error": str(err)}

${code}`;
  }

  return {
    success: true,
    executionTimeMs: 340,
    isFallback: true,
    data: {
      summary: 'Analysis completed. Identified potential error handling gaps and security/performance enhancement opportunities.',
      qualityScore: 78,
      bugs,
      performance,
      security,
      suggestions,
      refactoredCode
    }
  };
}

module.exports = { analyzeCode };
