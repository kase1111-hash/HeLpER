# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT open a public issue** for security vulnerabilities
2. Email the maintainers directly or use GitHub's private vulnerability reporting feature
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity
- **Timeline**: We aim to address critical vulnerabilities within 7 days
- **Credit**: With your permission, we will credit you in the release notes

## Security Architecture

### Data Sovereignty

- **Local-first storage**: All user data is stored locally in SQLite
- **No cloud sync**: Notes and settings remain on your machine
- **User-controlled exports**: You decide when and how to export your data
- **No telemetry**: HeLpER sends no analytics or tracking data

### Credential Storage

API keys (WeatherAPI, etc.) are stored in the **OS keychain** rather than plaintext files:
- **macOS**: Keychain
- **Windows**: Credential Manager
- **Linux**: Secret Service (libsecret)

The `keyring` Rust crate provides cross-platform access. Settings files contain redacted placeholders only.

### Settings Integrity

The `settings.json` file is protected by HMAC-SHA256 verification. A device-local key is stored in the OS keychain and used to compute a hash on save and verify on load. Tampered settings trigger a console warning.

### Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self' https://api.weatherapi.com https://ip-api.com
            https://*.natlangchain.com
            http://localhost:11434 http://127.0.0.1:11434
            http://localhost:5000 http://127.0.0.1:5000
```

- `connect-src` restricted to specific ports (Ollama: 11434, NatLangChain: 5000)
- `img-src` restricted to same-origin and data URIs
- HTTP redirect following disabled on all API clients

### AI Security

- **Prompt injection defense**: All user content is wrapped in `---BEGIN/END USER CONTENT---` delimiter tokens, separated from system instructions
- **Content provenance**: AI-edited content is tracked with an `ai_provenance` field (human, ai_edited, ai_generated) through the database and into published metadata
- **Secret scanning**: Before publishing to NatLangChain, content is scanned for 11 patterns (AWS keys, SSH keys, tokens, passwords, etc.) with both a UI gate and service-layer defense-in-depth

### Author Authentication

NatLangChain entries are signed with Ed25519 keypairs:
- Keypairs generated on first use and stored in the OS keychain
- Content signed before publish; signature and public key included in entry metadata
- Public key serves as the verifiable author identity

### Audit Trail

All security-relevant events are logged to an `audit_log` SQLite table:
- AI chat interactions, AI edits, NatLangChain publishes, settings changes
- Each entry includes a SHA-256 hash chain for tamper evidence

### SQL Injection Prevention

All database queries use `sqlx::query!` macros with parameterized queries. No string concatenation in SQL.

### XSS Prevention

Zero `{@html}` usage. All content rendering uses Svelte's default text escaping.

## Data Storage Locations

| OS | Location |
|----|----------|
| Windows | `%APPDATA%\HeLpER\` |
| macOS | `~/Library/Application Support/HeLpER/` |
| Linux | `~/.local/share/helper/` |

## Known Limitations

- **No encryption at rest**: The local SQLite database is not encrypted. Rely on OS-level encryption (BitLocker, FileVault, LUKS).
- **WeatherAPI key in query params**: WeatherAPI.com only supports API key via URL query parameter. HTTPS encrypts the key in transit. The key is stored in the OS keychain.
- **Local network access**: Ollama communicates over localhost. Ensure your local network is secure.

## Secure Development Practices

- Dependencies reviewed with `npm audit` and `cargo audit`
- TypeScript strict mode and Rust's type system provide compile-time safety
- ESLint, Clippy, and CI/CD pipeline enforce code quality
- Security-sensitive changes receive additional scrutiny

## Security Updates

Security updates will be released as patch versions. Monitor the [releases page](https://github.com/kase1111-hash/HeLpER/releases) for updates.

---

Thank you for helping keep HeLpER secure.
