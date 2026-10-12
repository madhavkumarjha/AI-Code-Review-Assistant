/**
 * Client-Side Heuristic Language Detector for Code Snippets
 * Maps pasted or loaded code to appropriate Monaco Editor language modes & display names.
 */

export const LANGUAGE_DISPLAY_NAMES = {
  go: 'Go',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  php: 'PHP',
  html: 'HTML',
  css: 'CSS',
  rust: 'Rust',
  sql: 'SQL',
  json: 'JSON',
  plaintext: 'Plain Text'
};

export function detectCodeLanguage(code) {
  if (!code || typeof code !== 'string') return { monacoLang: 'javascript', displayName: 'JavaScript' };
  const trimmed = code.trim();
  if (!trimmed) return { monacoLang: 'javascript', displayName: 'JavaScript' };

  // 1. PHP (Opening tags, superglobals, dollar variables, object operator)
  if (
    trimmed.startsWith('<?php') ||
    trimmed.startsWith('<?=') ||
    /\b(<\?php|\$_GET|\$_POST|\$_SESSION|\$_SERVER)\b/.test(trimmed) ||
    (/\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\s*->/.test(trimmed) && trimmed.includes(';')) ||
    (/\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\s*=/.test(trimmed) && trimmed.includes('echo '))
  ) {
    return { monacoLang: 'php', displayName: 'PHP' };
  }

  // 2. Go (Strict matching for Go keywords, packages, and funcs)
  if (
    trimmed.includes('package main') ||
    /\bpackage\s+[a-zA-Z0-9_]+/.test(trimmed) ||
    /\bfunc\s+([a-zA-Z0-9_]+|\([a-zA-Z0-9_ *]+\)\s*[a-zA-Z0-9_]+)\s*\(/.test(trimmed) ||
    /\b(fmt\.Print|fmt\.Fprint|fmt\.Sprint|net\/http|sync\/atomic|make\(chan\b)/.test(trimmed) ||
    /\bchan\s+[a-zA-Z0-9_]+/.test(trimmed)
  ) {
    return { monacoLang: 'go', displayName: 'Go' };
  }

  // 3. Python (def, class:, elif, imports, dunder methods)
  if (
    /\bdef\s+[a-zA-Z0-9_]+\s*\(/.test(trimmed) ||
    /\bclass\s+[a-zA-Z0-9_]+(\([a-zA-Z0-9_.]+\))?:/.test(trimmed) ||
    /\belif\s+/.test(trimmed) ||
    /\bprint\s*\(/.test(trimmed) ||
    /\bimport\s+(os|sys|json|math|random|pandas|numpy|datetime|re|time)\b/.test(trimmed) ||
    /\bfrom\s+[a-zA-Z0-9_.]+\s+import\b/.test(trimmed) ||
    trimmed.includes('__init__') ||
    trimmed.includes('self.')
  ) {
    return { monacoLang: 'python', displayName: 'Python' };
  }

  // 4. C# (.NET namespaces, async Task, Console.WriteLine)
  if (
    trimmed.includes('using System;') ||
    /\bnamespace\s+[A-Z][a-zA-Z0-9_.]+/.test(trimmed) ||
    trimmed.includes('Console.WriteLine') ||
    trimmed.includes('Console.ReadLine') ||
    /\b(public|private|internal|protected)\s+(async\s+)?(Task|Task<[a-zA-Z0-9_]+>|void|string|int)\s+[A-Z][a-zA-Z0-9_]*\s*\(/.test(trimmed)
  ) {
    return { monacoLang: 'csharp', displayName: 'C#' };
  }

  // 5. C++ (std namespace, streams, vector, templates)
  if (
    trimmed.includes('std::cout') ||
    trimmed.includes('std::cin') ||
    trimmed.includes('std::vector') ||
    trimmed.includes('std::string') ||
    trimmed.includes('using namespace std;') ||
    trimmed.includes('#include <iostream>') ||
    trimmed.includes('#include <vector>')
  ) {
    return { monacoLang: 'cpp', displayName: 'C++' };
  }

  // 6. C (ISO C headers like stdio.h, stdlib.h, printf, malloc without C++ markers)
  if (
    trimmed.includes('#include <stdio.h>') ||
    trimmed.includes('#include <stdlib.h>') ||
    trimmed.includes('#include <string.h>') ||
    (/\b(int|void)\s+main\s*\(\s*(int\s+argc|void)?\s*\)/.test(trimmed) && trimmed.includes('printf('))
  ) {
    return { monacoLang: 'c', displayName: 'C' };
  }

  // 7. Java (Class declarations, System.out, main signatures)
  if (
    /\bpublic\s+class\s+[a-zA-Z0-9_]+/.test(trimmed) ||
    trimmed.includes('public static void main') ||
    trimmed.includes('System.out.println') ||
    trimmed.includes('System.out.print') ||
    /\b(private|protected|public)\s+[a-zA-Z0-9_<>[\]]+\s+[a-zA-Z0-9_]+\s*\(/.test(trimmed)
  ) {
    return { monacoLang: 'java', displayName: 'Java' };
  }

  // 8. Rust (fn main, let mut, impl)
  if (
    trimmed.includes('fn main()') ||
    /\bfn\s+[a-zA-Z0-9_]+\s*\(/.test(trimmed) ||
    trimmed.includes('let mut ') ||
    trimmed.includes('impl ') ||
    trimmed.includes('println!')
  ) {
    return { monacoLang: 'rust', displayName: 'Rust' };
  }

  // 9. SQL (Queries, schema DDL)
  if (
    /\b(SELECT\s+.*FROM|INSERT\s+INTO|UPDATE\s+.*SET|DELETE\s+FROM|CREATE\s+TABLE)\b/i.test(trimmed)
  ) {
    return { monacoLang: 'sql', displayName: 'SQL' };
  }

  // 10. CSS
  if (
    trimmed.includes('box-sizing:') ||
    /\b(margin|padding|border-radius|background-color|display\s*:\s*(flex|grid|none))\s*:/i.test(trimmed)
  ) {
    return { monacoLang: 'css', displayName: 'CSS' };
  }

  // 11. HTML (Doctypes, opening/closing markup)
  if (
    trimmed.toLowerCase().startsWith('<!doctype html>') ||
    trimmed.includes('<html') ||
    trimmed.includes('<body') ||
    (trimmed.includes('</div>') && trimmed.includes('<div'))
  ) {
    return { monacoLang: 'html', displayName: 'HTML' };
  }

  // 12. TypeScript & React TSX
  const isTS = (
    /\binterface\s+[A-Z][a-zA-Z0-9_]*\s*\{/.test(trimmed) ||
    /\btype\s+[A-Z][a-zA-Z0-9_]*\s*=/.test(trimmed) ||
    trimmed.includes(': React.FC') ||
    trimmed.includes(': Promise<') ||
    /\b(as\s+const|satisfies\b)/.test(trimmed) ||
    /\b(const|let|var)\s+[a-zA-Z0-9_]+\s*:\s*(string|number|boolean|any|unknown)\b/.test(trimmed)
  );

  const hasJSX = (
    trimmed.includes('className=') ||
    trimmed.includes('onClick={') ||
    /<\/[a-zA-Z][a-zA-Z0-9]*>/.test(trimmed) ||
    /return\s*\(\s*<[a-zA-Z]/.test(trimmed)
  );

  if (isTS && hasJSX) {
    return { monacoLang: 'typescript', displayName: 'React TS' };
  }
  if (isTS) {
    return { monacoLang: 'typescript', displayName: 'TypeScript' };
  }
  if (hasJSX) {
    return { monacoLang: 'javascript', displayName: 'React JS' };
  }

  // 13. JavaScript (Default for scripts)
  return { monacoLang: 'javascript', displayName: 'JavaScript' };
}
