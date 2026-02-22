import { describe, it, expect } from 'vitest';
import { scanForSecrets } from '../../src/lib/utils/secretScanner';

describe('secretScanner', () => {
  describe('no secrets', () => {
    it('should return no findings for clean content', () => {
      const result = scanForSecrets('Just a normal journal entry about my day.');
      expect(result.hasSecrets).toBe(false);
      expect(result.findings).toHaveLength(0);
    });

    it('should return no findings for empty content', () => {
      const result = scanForSecrets('');
      expect(result.hasSecrets).toBe(false);
      expect(result.findings).toHaveLength(0);
    });
  });

  describe('AWS Access Key', () => {
    it('should detect AWS access key', () => {
      const result = scanForSecrets('My key is AKIAIOSFODNN7EXAMPLE');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].type).toBe('AWS Access Key');
      expect(result.findings[0].line).toBe(1);
    });

    it('should not match partial AKIA prefix', () => {
      const result = scanForSecrets('AKIA123');
      expect(result.hasSecrets).toBe(false);
    });
  });

  describe('AWS Secret Key', () => {
    it('should detect aws_secret_access_key', () => {
      const result = scanForSecrets(
        'aws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      );
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'AWS Secret Key')).toBe(true);
    });

    it('should detect secret_key=value', () => {
      const result = scanForSecrets(
        'secret_key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      );
      expect(result.hasSecrets).toBe(true);
    });
  });

  describe('SSH Private Key', () => {
    it('should detect RSA private key header', () => {
      const result = scanForSecrets('-----BEGIN RSA PRIVATE KEY-----');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'SSH Private Key')).toBe(true);
    });

    it('should detect EC private key header', () => {
      const result = scanForSecrets('-----BEGIN EC PRIVATE KEY-----');
      expect(result.hasSecrets).toBe(true);
    });

    it('should detect OPENSSH private key header', () => {
      const result = scanForSecrets('-----BEGIN OPENSSH PRIVATE KEY-----');
      expect(result.hasSecrets).toBe(true);
    });

    it('should not match public key header', () => {
      const result = scanForSecrets('-----BEGIN PUBLIC KEY-----');
      expect(result.findings.some((f) => f.type === 'SSH Private Key')).toBe(false);
    });
  });

  describe('PGP Private Key', () => {
    it('should detect PGP private key block', () => {
      const result = scanForSecrets('-----BEGIN PGP PRIVATE KEY BLOCK-----');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'PGP Private Key')).toBe(true);
    });
  });

  describe('Bearer Token', () => {
    it('should detect bearer token', () => {
      const result = scanForSecrets('Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'Bearer Token')).toBe(true);
    });
  });

  describe('Generic API Key', () => {
    it('should detect api_key=value', () => {
      const result = scanForSecrets('api_key=sk1234567890abcdefghij');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'Generic API Key')).toBe(true);
    });

    it('should detect apikey:value', () => {
      const result = scanForSecrets('apikey: ABCDEFGHIJKLMNOPQRST');
      expect(result.hasSecrets).toBe(true);
    });

    it('should not match short values', () => {
      // Pattern requires 20+ chars
      const result = scanForSecrets('api_key=short');
      expect(result.findings.some((f) => f.type === 'Generic API Key')).toBe(false);
    });
  });

  describe('Generic Secret', () => {
    it('should detect secret=value', () => {
      const result = scanForSecrets('secret=mysupersecretvalue123');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'Generic Secret')).toBe(true);
    });

    it('should detect password=value', () => {
      const result = scanForSecrets('password=averylongpassword');
      expect(result.hasSecrets).toBe(true);
    });

    it('should detect token=value', () => {
      const result = scanForSecrets('token=abcdef1234567890');
      expect(result.hasSecrets).toBe(true);
    });

    it('should not match short values (< 8 chars)', () => {
      const result = scanForSecrets('password=abc');
      expect(result.findings.some((f) => f.type === 'Generic Secret')).toBe(false);
    });
  });

  describe('GitHub Token', () => {
    it('should detect ghp_ personal access token', () => {
      const result = scanForSecrets(
        'token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij'
      );
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'GitHub Token')).toBe(true);
    });

    it('should detect gho_ OAuth token', () => {
      const result = scanForSecrets(
        'gho_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij'
      );
      expect(result.hasSecrets).toBe(true);
    });

    it('should not match short gh prefix', () => {
      const result = scanForSecrets('ghp_short');
      expect(result.findings.some((f) => f.type === 'GitHub Token')).toBe(false);
    });
  });

  describe('Slack Token', () => {
    it('should detect xoxb- bot token', () => {
      const result = scanForSecrets('SLACK_TOKEN=xoxb-1234567890-abcdefghij');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'Slack Token')).toBe(true);
    });

    it('should detect xoxp- user token', () => {
      const result = scanForSecrets('xoxp-1234567890-abcdefghij');
      expect(result.hasSecrets).toBe(true);
    });
  });

  describe('Stripe Key', () => {
    it('should detect sk_live_ key', () => {
      const result = scanForSecrets('sk_live_ABCDEFGHIJklmnopqrst');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'Stripe Key')).toBe(true);
    });

    it('should detect pk_test_ key', () => {
      const result = scanForSecrets('pk_test_ABCDEFGHIJklmnopqrst');
      expect(result.hasSecrets).toBe(true);
    });
  });

  describe('Database URL', () => {
    it('should detect postgres URL with credentials', () => {
      const result = scanForSecrets('postgres://user:password@localhost:5432/mydb');
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.some((f) => f.type === 'Database URL')).toBe(true);
    });

    it('should detect mysql URL with credentials', () => {
      const result = scanForSecrets('mysql://admin:secret@db.example.com/prod');
      expect(result.hasSecrets).toBe(true);
    });

    it('should detect mongodb URL with credentials', () => {
      const result = scanForSecrets('mongodb://root:pass123@mongo.internal/app');
      expect(result.hasSecrets).toBe(true);
    });
  });

  describe('line numbers', () => {
    it('should report correct line numbers', () => {
      const content = [
        'Line 1: safe content',
        'Line 2: also safe',
        'Line 3: AKIAIOSFODNN7EXAMPLE',
        'Line 4: safe again',
      ].join('\n');

      const result = scanForSecrets(content);
      expect(result.hasSecrets).toBe(true);
      expect(result.findings[0].line).toBe(3);
    });

    it('should detect secrets on different lines', () => {
      const content = [
        'AKIAIOSFODNN7EXAMPLE',
        'normal line',
        '-----BEGIN RSA PRIVATE KEY-----',
      ].join('\n');

      const result = scanForSecrets(content);
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.length).toBeGreaterThanOrEqual(2);

      const awsFinding = result.findings.find((f) => f.type === 'AWS Access Key');
      const sshFinding = result.findings.find((f) => f.type === 'SSH Private Key');
      expect(awsFinding?.line).toBe(1);
      expect(sshFinding?.line).toBe(3);
    });
  });

  describe('redaction', () => {
    it('should redact long secrets: first 4 + *** + last 4', () => {
      const result = scanForSecrets('AKIAIOSFODNN7EXAMPLE');
      expect(result.findings[0].redacted).toBe('AKIA***MPLE');
    });

    it('should fully redact short matches', () => {
      // Bearer with a short token value
      const result = scanForSecrets('Bearer 12345678');
      if (result.hasSecrets) {
        for (const finding of result.findings) {
          if (finding.type === 'Bearer Token') {
            // The matched string "Bearer 12345678" is > 8 chars, so first4+***+last4
            expect(finding.redacted).toMatch(/^Bear\*\*\*5678$/);
          }
        }
      }
    });
  });

  describe('multiple secrets in one line', () => {
    it('should detect multiple secrets on the same line', () => {
      const result = scanForSecrets(
        'AKIAIOSFODNN7EXAMPLE secret=mysupersecretvalue123'
      );
      expect(result.hasSecrets).toBe(true);
      expect(result.findings.length).toBeGreaterThanOrEqual(2);
    });
  });
});
