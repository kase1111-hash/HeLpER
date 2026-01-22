# Changelog

All notable changes to HeLpER will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

- **Security Integration**
  - Optional Boundary-SIEM event reporting
  - Optional boundary-daemon policy checks
  - CEF-format local logging
  - Graceful degradation when services unavailable
  - Configurable via `security-config.json`

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
