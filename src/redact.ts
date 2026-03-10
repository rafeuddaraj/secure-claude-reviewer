const secretPatterns = [
  /(api[_-]?key\s*[:=]\s*["'][^"']+["'])/gi,
  /(token\s*[:=]\s*["'][^"']+["'])/gi,
  /(secret\s*[:=]\s*["'][^"']+["'])/gi,
  /(password\s*[:=]\s*["'][^"']+["'])/gi,
];

export function redactSecrets(input: string): string {
  let output = input;

  for (const pattern of secretPatterns) {
    output = output.replace(pattern, "[REDACTED_SECRET]");
  }

  return output;
}
