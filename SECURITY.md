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

## Security Design Principles

HeLpER is designed with security and privacy as core principles:

### Data Sovereignty

- **Local-first storage**: All user data is stored locally on your device
- **No cloud sync**: Notes and settings remain on your machine
- **SQLite database**: Data stored in a local SQLite database in your app data directory
- **User-controlled exports**: You decide when and how to export your data

### Data Storage Locations

| OS | Location |
|----|----------|
| Windows | `%APPDATA%\HeLpER\` |
| macOS | `~/Library/Application Support/HeLpER/` |
| Linux | `~/.local/share/helper/` |

### Network Security

- **Optional AI**: Ollama integration is optional and runs locally on your machine
- **Optional Weather**: WeatherAPI.com integration is optional and only sends location data
- **Optional Publishing**: NatLangChain publishing is user-initiated only
- **No telemetry**: HeLpER does not send analytics or telemetry data

### API Key Handling

- API keys (WeatherAPI.com, NatLangChain) are stored locally in the app's secure store
- Keys are never transmitted except to their respective services
- Users can remove API keys at any time through Settings

## Secure Development Practices

### Dependencies

- Dependencies are regularly reviewed for known vulnerabilities
- We use `npm audit` and `cargo audit` to check for security issues
- Critical security updates are prioritized

### Code Review

- All changes undergo code review before merging
- Security-sensitive changes receive additional scrutiny

### Testing

- Automated testing via CI/CD pipeline
- Type checking with TypeScript and Rust's type system
- Linting with ESLint and Clippy

## Known Limitations

- **No encryption at rest**: The local SQLite database is not encrypted. Users should rely on OS-level encryption (BitLocker, FileVault, LUKS) for additional protection.
- **Local network access**: Ollama integration communicates over localhost. Ensure your local network is secure.

## Security Updates

Security updates will be released as patch versions. Monitor the [releases page](https://github.com/kase1111-hash/HeLpER/releases) for updates.

## Questions

For security-related questions that are not vulnerabilities, open a discussion on GitHub or contact the maintainers.

---

Thank you for helping keep HeLpER secure.
