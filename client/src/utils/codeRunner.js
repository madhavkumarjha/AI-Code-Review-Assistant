/**
 * CodeRunner: Unified multi-language execution engine
 * Supports JavaScript, TypeScript, Python, C, and C++
 * Uses in-browser Web Workers for JS/TS, native sandboxed child process for Python,
 * and compiler/simulator for C/C++.
 */

/**
 * Execute JavaScript in an isolated Web Worker with strict timeout and output interception
 */
function executeJavaScriptInWorker(code, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let isSettled = false;

    // Worker script with console redirection and safety wrappers
    const workerScript = `
      self.onmessage = async function(e) {
        const code = e.data.code;
        const logs = [];
        const errors = [];

        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        function formatArg(arg) {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg, null, 2); } catch (_) { return String(arg); }
          }
          return String(arg);
        }

        console.log = function(...args) {
          logs.push(args.map(formatArg).join(' '));
        };
        console.info = console.log;
        console.warn = function(...args) {
          logs.push('[WARN] ' + args.map(formatArg).join(' '));
        };
        console.error = function(...args) {
          errors.push(args.map(formatArg).join(' '));
        };

        try {
          // Wrap in async function to support top-level await
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const fn = new AsyncFunction(code);
          const result = await fn();
          
          if (result !== undefined && logs.length === 0) {
            logs.push(formatArg(result));
          }

          self.postMessage({
            success: errors.length === 0,
            stdout: logs.join('\\n'),
            stderr: errors.join('\\n'),
            exitCode: errors.length === 0 ? 0 : 1
          });
        } catch (err) {
          self.postMessage({
            success: false,
            stdout: logs.join('\\n'),
            stderr: (err && err.stack) ? err.stack : (err && err.message ? err.message : String(err)),
            exitCode: 1
          });
        }
      };
    `;

    let worker = null;
    let timer = null;

    try {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);

      timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          if (worker) worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({
            success: false,
            status: 'Timed Out',
            stdout: '',
            stderr: `Execution Timed Out: Program exceeded ${timeoutMs / 1000}s execution limit (possible infinite loop).`,
            exitCode: 124,
            executionTimeMs: timeoutMs,
            runtime: 'Browser V8 Worker Sandbox'
          });
        }
      }, timeoutMs);

      worker.onmessage = function(e) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          const data = e.data || {};
          resolve({
            success: Boolean(data.success),
            status: data.exitCode === 0 ? 'Completed' : 'Error',
            stdout: data.stdout || '',
            stderr: data.stderr || '',
            exitCode: data.exitCode !== undefined ? data.exitCode : 0,
            executionTimeMs: Date.now() - startTime,
            runtime: 'Browser V8 Worker Sandbox'
          });
        }
      };

      worker.onerror = function(err) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({
            success: false,
            status: 'Error',
            stdout: '',
            stderr: err.message || 'Worker runtime error occurred during execution.',
            exitCode: 1,
            executionTimeMs: Date.now() - startTime,
            runtime: 'Browser V8 Worker Sandbox'
          });
        }
      };

      worker.postMessage({ code });
    } catch (err) {
      if (!isSettled) {
        isSettled = true;
        if (timer) clearTimeout(timer);
        resolve({
          success: false,
          status: 'Error',
          stdout: '',
          stderr: err.message || 'Failed to initialize worker sandbox.',
          exitCode: 1,
          executionTimeMs: Date.now() - startTime,
          runtime: 'Browser V8 Sandbox'
        });
      }
    }
  });
}

/**
 * Strips basic TypeScript type annotations
 */
function stripTypeScript(tsCode) {
  return tsCode
    .replace(/import\s+type\s+[^;]+;/g, '')
    .replace(/type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/g, '')
    .replace(/interface\s+[A-Za-z0-9_]+(\s+extends\s+[^{]+)?\s*\{[^}]*\}/g, '')
    .replace(/:\s*(string|number|boolean|any|void|unknown|never|object|[A-Z][A-Za-z0-9_]*(\[\])?)\b/g, '')
    .replace(/\s+as\s+[A-Za-z0-9_<>]+/g, '')
    .replace(/<[A-Za-z0-9_,\s]+>(?=\s*\()/g, '');
}

/**
 * Execute via backend sandbox API (/api/execute)
 */
async function executeViaBackendApi(code, language) {
  const startTime = Date.now();
  const response = await fetch('/api/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code, language })
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || 'Code execution service failed.');
  }

  return {
    success: Boolean(resData.success),
    status: resData.status || (resData.exitCode === 0 ? 'Completed' : 'Error'),
    stdout: resData.stdout || '',
    stderr: resData.stderr || '',
    exitCode: resData.exitCode !== undefined ? resData.exitCode : 0,
    executionTimeMs: resData.executionTimeMs || (Date.now() - startTime),
    runtime: resData.runtime || `${language} Execution Service`,
    language
  };
}

/**
 * Primary Unified Execution Dispatcher
 */
export async function executeCode(code, language = 'JavaScript') {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return {
      success: false,
      status: 'Error',
      stdout: '',
      stderr: 'No code provided to execute.',
      exitCode: 1,
      executionTimeMs: 0,
      runtime: 'None',
      language
    };
  }

  const normalized = (language || 'JavaScript').toLowerCase();

  // 1. JavaScript Execution (In-browser isolated worker sandbox)
  if (normalized === 'javascript' || normalized === 'react js' || normalized === 'js') {
    try {
      const workerRes = await executeJavaScriptInWorker(code);
      return { ...workerRes, language: 'JavaScript' };
    } catch (_) {
      return executeViaBackendApi(code, 'JavaScript');
    }
  }

  // 2. TypeScript Execution (Type-stripped in worker, fallback to backend)
  if (normalized === 'typescript' || normalized === 'react ts' || normalized === 'ts') {
    try {
      const stripped = stripTypeScript(code);
      const workerRes = await executeJavaScriptInWorker(stripped);
      return {
        ...workerRes,
        runtime: 'TypeScript (Transpiled Browser Sandbox)',
        language: 'TypeScript'
      };
    } catch (_) {
      return executeViaBackendApi(code, 'TypeScript');
    }
  }

  // 3. Python, C, C++ and other languages: Execute via secure backend sandbox
  return executeViaBackendApi(code, language);
}
