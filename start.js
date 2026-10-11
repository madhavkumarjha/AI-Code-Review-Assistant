#!/usr/bin/env node

/**
 * Global Multi-Process Runner for Autonomous Code Intelligence Platform
 * Runs both Express Backend (:5000) and React/Vite Frontend (:3000) concurrently.
 * Cross-platform compatible (Windows, macOS, Linux) with zero external dependencies.
 */

const { spawn } = require('child_process');
const path = require('path');

const isDev = process.argv.includes('dev') || !process.argv.includes('prod');

// ANSI Color codes for clean developer console output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function logBanner() {
  console.log(`\n${colors.cyan}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  🚀 Autonomous Code Intelligence Platform — Unified Runner     ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}================================================================${colors.reset}`);
  console.log(`  ${colors.bold}Mode:${colors.reset}       ${isDev ? colors.green + 'Development (Live Reload)' : colors.yellow + 'Production'} ${colors.reset}`);
  console.log(`  ${colors.bold}Backend API:${colors.reset} ${colors.cyan}http://localhost:5000${colors.reset}`);
  console.log(`  ${colors.bold}Frontend UI:${colors.reset} ${colors.green}http://localhost:3000${colors.reset}`);
  console.log(`  ${colors.gray}Press Ctrl+C to terminate both services safely.${colors.reset}`);
  console.log(`${colors.cyan}----------------------------------------------------------------${colors.reset}\n`);
}

function prefixOutput(prefix, color, data) {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim().length > 0) {
      console.log(`${color}${prefix}${colors.reset} ${line}`);
    }
  });
}

const processes = [];

function startProcess(name, color, command, args, cwd) {
  const isWindows = process.platform === 'win32';
  const proc = spawn(command, args, {
    cwd: path.resolve(__dirname, cwd),
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  proc.stdout.on('data', (data) => prefixOutput(`[${name}]`, color, data));
  proc.stderr.on('data', (data) => prefixOutput(`[${name}]`, color, data));

  proc.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${color}[${name}] exited with code ${code}${colors.reset}`);
    }
  });

  proc.on('error', (err) => {
    console.error(`${color}[${name}] Failed to start: ${err.message}${colors.reset}`);
  });

  processes.push({ name, proc });
  return proc;
}

function cleanup() {
  console.log(`\n${colors.yellow}Shutting down all services...${colors.reset}`);
  processes.forEach(({ name, proc }) => {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', proc.pid, '/f', '/t']);
      } else {
        proc.kill('SIGINT');
      }
    } catch {
      // Ignore errors during termination
    }
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

logBanner();

// 1. Start Express Backend
const serverCmd = isDev ? 'npm run dev' : 'npm start';
startProcess('API :5000', colors.cyan, serverCmd, [], 'server');

// 2. Start Vite Frontend
startProcess('UI :3000', colors.green, 'npm run dev', [], 'client');
