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
  html: 'HTML',
  rust: 'Rust',
  sql: 'SQL',
  json: 'JSON',
  plaintext: 'Plain Text'
};

export function detectCodeLanguage(code) {
  if (!code || typeof code !== 'string') return { monacoLang: 'javascript', displayName: 'JavaScript' };
  const trimmed = code.trim();
  if (!trimmed) return { monacoLang: 'javascript', displayName: 'JavaScript' };

  // 1. Go (Strict matching for Go keywords, packages, and funcs)
  if (
    trimmed.includes('package main') ||
    /\bpackage\s+[a-zA-Z0-9_]+/.test(trimmed) ||
    /\bfunc\s+([a-zA-Z0-9_]+|\([a-zA-Z0-9_ *]+\)\s*[a-zA-Z0-9_]+)\s*\(/.test(trimmed) ||
    /\b(fmt\.Print|fmt\.Fprint|fmt\.Sprint|net\/http|sync\/atomic|make\(chan\b)/.test(trimmed) ||
    /\bchan\s+[a-zA-Z0-9_]+/.test(trimmed)
  ) {
    return { monacoLang: 'go', displayName: 'Go' };
  }

  // 2. Python (def, class:, elif, imports, dunder methods)
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

  // 3. C++ / C (Preprocessors, namespaces, std stream io)
  if (
    trimmed.includes('#include <') ||
    trimmed.includes('#include "') ||
    trimmed.includes('std::cout') ||
    trimmed.includes('std::cin') ||
    trimmed.includes('std::vector') ||
    trimmed.includes('std::string') ||
    trimmed.includes('using namespace std;')
  ) {
    return { monacoLang: 'cpp', displayName: 'C++' };
  }

  // 4. Java (Class declarations, System.out, main signatures)
  if (
    /\bpublic\s+class\s+[a-zA-Z0-9_]+/.test(trimmed) ||
    trimmed.includes('public static void main') ||
    trimmed.includes('System.out.println') ||
    trimmed.includes('System.out.print') ||
    /\b(private|protected|public)\s+[a-zA-Z0-9_<>[\]]+\s+[a-zA-Z0-9_]+\s*\(/.test(trimmed)
  ) {
    return { monacoLang: 'java', displayName: 'Java' };
  }

  // 5. HTML (Doctypes, opening/closing markup)
  if (
    trimmed.toLowerCase().startsWith('<!doctype html>') ||
    trimmed.includes('<html') ||
    trimmed.includes('<body') ||
    (trimmed.includes('</div>') && trimmed.includes('<div'))
  ) {
    return { monacoLang: 'html', displayName: 'HTML' };
  }

  // 6. TypeScript (Interfaces, types, React.FC, explicit type annotations)
  if (
    /\binterface\s+[A-Z][a-zA-Z0-9_]*\s*\{/.test(trimmed) ||
    /\btype\s+[A-Z][a-zA-Z0-9_]*\s*=/.test(trimmed) ||
    trimmed.includes(': React.FC') ||
    trimmed.includes(': Promise<') ||
    /\b(as\s+const|satisfies\b)/.test(trimmed) ||
    /\b(const|let|var)\s+[a-zA-Z0-9_]+\s*:\s*(string|number|boolean|any|unknown)\b/.test(trimmed)
  ) {
    return { monacoLang: 'typescript', displayName: 'TypeScript' };
  }

  // 7. Rust (fn main, let mut, impl)
  if (
    trimmed.includes('fn main()') ||
    /\bfn\s+[a-zA-Z0-9_]+\s*\(/.test(trimmed) ||
    trimmed.includes('let mut ') ||
    trimmed.includes('impl ') ||
    trimmed.includes('println!')
  ) {
    return { monacoLang: 'rust', displayName: 'Rust' };
  }

  // 8. SQL
  if (
    /\b(SELECT\s+.*FROM|INSERT\s+INTO|UPDATE\s+.*SET|DELETE\s+FROM|CREATE\s+TABLE)\b/i.test(trimmed)
  ) {
    return { monacoLang: 'sql', displayName: 'SQL' };
  }

  // 9. JavaScript (Default for script expressions)
  return { monacoLang: 'javascript', displayName: 'JavaScript' };
}
