/**
 * Robust Code Formatting & Newline Normalizer
 *
 * Converts literal '\n', '\r\n', '\t' escape sequences and escaped JSON quotes
 * into actual multi-line code formatting automatically.
 *
 * @param {string} code - The input code string
 * @returns {string} - Properly formatted multi-line code string
 */
export function normalizeCodeFormatting(code) {
  if (!code || typeof code !== 'string') return '';

  let normalized = code;

  // Unescape literal escaped carriage returns & newlines ("\r\n" or "\n")
  if (normalized.includes('\\n') || normalized.includes('\\r\\n')) {
    normalized = normalized
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n');
  }

  // Unescape literal escaped carriage returns ("\r")
  if (normalized.includes('\\r')) {
    normalized = normalized.replace(/\\r/g, '');
  }

  // Unescape escaped tabs ("\t")
  if (normalized.includes('\\t')) {
    normalized = normalized.replace(/\\t/g, '    ');
  }

  // Unescape escaped JSON quotes ("\"")
  if (normalized.includes('\\"')) {
    normalized = normalized.replace(/\\"/g, '"');
  }

  // Normalize standard Windows CRLF to LF
  normalized = normalized.replace(/\r\n/g, '\n');

  return normalized;
}
