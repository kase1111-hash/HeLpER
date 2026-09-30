# Changelog

All notable changes to HeLpER will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **OS Keychain Storage** - API keys now stored in macOS Keychain / Windows Credential Manager / Linux Secret Service via `keyring` crate instead of plaintext settings JSON
- **Settings Integrity** - HMAC-SHA256 verification detects tampering of settings file; device-local key stored in OS keychain
- **Author Signing** - NatLangChain entries signed with Ed25519 keypair before publish; public key included in entry metadata
- **Secret Scanning** - Pre-publish regex scanner with 11 patterns (AWS keys, SSH keys, tokens, passwords, etc.) blocks accidental credential exposure
- **Prompt Safety** - All AI prompts use `---BEGIN/END USER CONTENT---` delimiter tokens for data/instruction separation
- **Content Provenance** - `ai_provenance` field tracks whether content is human-authored or AI-edited through database and publish metadata
- **Audit Trail** - New `audit_log` table with SHA-256 hash chain logs AI interactions, publishes, and settings changes
- **CSP Hardening** - Restricted `connect-src` from `localhost:*` to specific ports (11434, 5000); removed `https:` from `img-src`
- **Redirect Policy** - Disabled HTTP redirect following on all API clients

### Added

- New Rust modules: `integrity.rs` (HMAC), `author_identity.rs` (Ed25519 signing)
- New frontend module: `secretScanner.ts` (credential detection)
- New Tauri commands: `store_secret`, `get_secret`, `delete_secret`, `compute_settings_hmac`, `verify_settings_hmac`, `log_audit_event`, `get_audit_log`, `nlc_get_author_public_key`, `nlc_sign_entry`
- AI-Assisted provenance badge in publish preview
- Secret scan warning UI in publish panel

### Changed

- Documentation consolidated: audit reports merged into `AUDIT_REPORT.md`, plans merged into `ROADMAP.md`
- Weather API requests use `.query()` builder instead of URL string formatting
- Notes database schema includes `ai_provenance` column

### Fixed

- **Note editor discarded typing** - the textarea used `bind:value` on a variable that is also assigned in a `$:` sync block, so Svelte reset it to the saved note text on every keystroke; it now uses one-way `value` with the existing `on:input` handler
- **Rust backend did not compile**
  - `sqlx::query!`/`query_as!` macros needed a build-time `DATABASE_URL`; replaced with runtime `query`/`query_as` (SQL unchanged)
  - `tray.rs` was missing `use tauri::Emitter`; `delete_secret` called `delete_credential`, which does not exist in `keyring` 2 (`delete_password`)
  - `src-tauri/icons/` was empty, which fails `tauri::generate_context!`; added placeholder icons (replace with real artwork via `npm run tauri icon <source.png>`)
  - Committed `Cargo.lock` was missing the crypto crates added in the security remediation
- **CI never ran** - the workflow referenced a non-existent action (`dtolnay/rust-action`); now `dtolnay/rust-toolchain`. CI also runs `cargo test` and clippy on test targets
- `suggestIntent` returned the generic daily-entry intent for almost every journal note because that check ran before the specific ones (learning, gratitude, goals, challenges)
- `TitleBar` and tray listeners no longer throw when the Tauri runtime is absent, so the UI can render in a plain browser
- Rust `cargo fmt` / `clippy -D warnings` violations
- **Overlapping cards at small window sizes** - with the AI panel open, or at the 320x480 minimum window, the editor card was crushed and overlapped its neighbours; the main area now scrolls and the editor keeps a minimum height
- **New notes did not take focus** - after "New Note" the editor is focused, so typing works immediately (previously a space re-pressed the button and created extra notes)

### Tests

- Added Rust unit tests: note CRUD and soft delete, SQL parameter binding, audit hash chain and tamper detection, schema migration, HMAC (RFC 4231 vector), Ed25519 signing
- Fixed stale `publishEntry` tests and added coverage for signing, audit logging and secret blocking
- Repaired the Playwright e2e suite (onboarding wizard handling, ambiguous locators) and added a typing/auto-save regression test

## [0.1.0-alpha] - 2026-01-22

### Added

- **Core Application**
  - Daily notes with auto-save functionality
  - Calendar date picker for note navigation
  - Full-text search across all notes
  - System tray support with minimize option
  - Light, dark, and system theme options
  - First-run onboarding wizard

- **AI Assistant Integration**
  - Local LLM support via Ollama REST API
  - Note formatting, expansion, and summarization
  - Chat interface for AI assistance
  - Configurable Ollama URL and model selection

- **Journal Context**
  - Weather integration via WeatherAPI.com
  - Moon phase tracking
  - Time-of-day detection (morning, afternoon, evening, night)
  - Auto-location via IP geolocation

- **NatLangChain Publishing**
  - Blockchain publishing integration
  - Multiple content types (journal entries, news articles, serialized fiction)
  - Monetization options (free, subscription, pay-per-entry, tip jar)
  - AI-assisted editing before publishing
  - Intent detection and validation
  - Clarity scoring for entries

- **Export & Backup**
  - Export notes as Markdown
  - Export notes as JSON
  - Single note or bulk export options

- **Windows Support**
  - `assemble-windows.bat` for first-time setup
  - `startup-windows.bat` for development server
  - `build-windows.bat` for production builds
  - Automatic prerequisite checks
  - Detailed logging to `logs/` directory

- **Developer Experience**
  - Comprehensive unit test suite with Vitest
  - End-to-end tests with Playwright
  - ESLint and Prettier configuration
  - TypeScript throughout frontend
  - CI/CD pipeline with GitHub Actions
  - Multi-platform builds (Windows, macOS, Linux)

- **Documentation**
  - Comprehensive README with quick start guide
  - Detailed User Guide in `docs/USER_GUIDE.md`
  - Keyboard shortcuts reference
  - System requirements documentation
  - Connected repositories ecosystem overview

### Technical Stack

- **Frontend**: Svelte 4 + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri 2.0
- **Database**: SQLite via SQLx
- **Testing**: Vitest + Playwright
- **Build**: Vite

---

[Unreleased]: https://github.com/kase1111-hash/HeLpER/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/kase1111-hash/HeLpER/releases/tag/v0.1.0-alpha
