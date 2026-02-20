import type { SecretFinding, SecretScanResult } from '../types';

const SECRET_PATTERNS: { type: string; pattern: RegExp }[] = [
  { type: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
  { type: 'AWS Secret Key', pattern: /(?:aws_secret_access_key|secret_key)\s*[:=]\s*[A-Za-z0-9/+=]{40}/gi },
  { type: 'SSH Private Key', pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)?\s*PRIVATE KEY-----/g },
  { type: 'PGP Private Key', pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/g },
  { type: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g },
  { type: 'Generic API Key', pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[A-Za-z0-9]{20,}['"]?/gi },
  { type: 'Generic Secret', pattern: /(?:secret|password|passwd|token)\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/gi },
  { type: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g },
  { type: 'Slack Token', pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { type: 'Stripe Key', pattern: /(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{20,}/g },
  { type: 'Database URL', pattern: /(?:postgres|mysql|mongodb):\/\/[^\s]+:[^\s]+@/gi },
];

/**
 * Scan content for potential secrets that should not be published.
 */
export function scanForSecrets(content: string): SecretScanResult {
  const findings: SecretFinding[] = [];
  const lines = content.split('\n');

  for (const { type, pattern } of SECRET_PATTERNS) {
    // Reset regex state for global patterns
    pattern.lastIndex = 0;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      let match;
      pattern.lastIndex = 0;

      while ((match = pattern.exec(line)) !== null) {
        const matched = match[0];
        // Redact the middle portion of the matched string
        const redacted =
          matched.length > 8
            ? matched.slice(0, 4) + '***' + matched.slice(-4)
            : '***';

        findings.push({
          type,
          pattern: redacted,
          line: lineNum + 1,
          redacted,
        });
      }
    }
  }

  return {
    hasSecrets: findings.length > 0,
    findings,
  };
}
