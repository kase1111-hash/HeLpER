# HeLpER

**Helpful Lightweight Personal Everyday Recorder**

A privacy-first personal journal application with local AI integration. HeLpER combines daily note-taking with weather-aware journal context, local AI assistance through Ollama, and optional NatLangChain blockchain publishing.

All your data stays on your device. AI runs locally. No cloud sync. No telemetry.

![Version](https://img.shields.io/badge/version-0.1.0--alpha-orange)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Core

- **Daily Notes** - Organize notes by date with calendar navigation
- **AI Assistant** - Local LLM integration via Ollama for formatting, expansion, and chat
- **Auto-Save** - Notes save automatically as you type
- **System Tray** - Minimize to tray for quick access
- **Search** - Full-text search across notes
- **Export** - Save notes as Markdown or JSON
- **Privacy First** - All data stays on your device

### Journal Context

- **Weather** - Real-time weather data via WeatherAPI.com
- **Time of Day** - Morning, afternoon, evening, night detection
- **Moon Phases** - Lunar cycle tracking
- **Auto-Location** - IP-based location detection

### NatLangChain Publishing

- **Blockchain Publishing** - Publish writing to NatLangChain
- **Multiple Content Types** - Journal entries, articles, serialized fiction
- **Monetization** - Free, subscription, pay-per-entry, or tip jar
- **AI Editing** - Polish, clarify, expand, or summarize before publishing
- **Author Signing** - Ed25519 cryptographic author authentication

### Security

- **OS Keychain** - API keys stored in macOS Keychain / Windows Credential Manager / Linux Secret Service
- **Settings Integrity** - HMAC-SHA256 tamper detection on settings file
- **Secret Scanning** - Pre-publish scan for accidentally included credentials
- **Prompt Safety** - Delimiter-based data/instruction separation in all AI prompts
- **Content Provenance** - AI-edited content tracked and labeled
- **Audit Trail** - Tamper-evident logging of AI interactions and publishes

## Quick Start

### Prerequisites

- [Ollama](https://ollama.ai) (optional, for AI features)
- [WeatherAPI.com](https://www.weatherapi.com/signup.aspx) API key (optional, for weather)

### Install Ollama (optional)

```bash
ollama pull llama3.2:3b
```

### Run HeLpER

Download from the [Releases](https://github.com/kase1111-hash/HeLpER/releases) page, or build from source:

```bash
git clone https://github.com/kase1111-hash/HeLpER.git
cd HeLpER
npm install
npm run tauri dev      # development
npm run tauri build    # production
```

### Windows Quick Start

```batch
assemble-windows.bat   :: first-time setup
startup-windows.bat    :: start dev server
build-windows.bat      :: build for production
```

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Note | `Ctrl+N` | `Cmd+N` |
| Search | `Ctrl+F` | `Cmd+F` |
| Settings | `Ctrl+,` | `Cmd+,` |
| Close/Clear | `Escape` | `Escape` |

## Tech Stack

- **Framework**: [Tauri 2.0](https://tauri.app) (Rust backend)
- **Frontend**: [Svelte 4](https://svelte.dev) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Database**: SQLite via SQLx
- **AI**: [Ollama](https://ollama.ai) REST API
- **Weather**: [WeatherAPI.com](https://www.weatherapi.com)
- **Publishing**: NatLangChain blockchain integration
- **Security**: keyring, ed25519-dalek, hmac-sha2

## Project Structure

```
HeLpER/
├── src/                    # Svelte frontend
│   ├── components/         # UI components (13 Svelte files)
│   └── lib/
│       ├── services/       # API services (tauri, weather, natlangchain, export, stt)
│       ├── stores/         # Svelte stores (notes, settings, chat, ui, weather, stt)
│       ├── utils/          # Helpers (date, note, secretScanner)
│       ├── constants.ts    # App constants
│       └── types.ts        # TypeScript types
├── src-tauri/              # Rust backend
│   └── src/
│       ├── commands.rs     # Tauri IPC command handlers
│       ├── database.rs     # SQLite operations + migrations
│       ├── ollama.rs       # Ollama API client
│       ├── natlangchain.rs # NatLangChain API client
│       ├── weather.rs      # Weather API client
│       ├── integrity.rs    # HMAC settings integrity
│       ├── author_identity.rs # Ed25519 author signing
│       └── tray.rs         # System tray
├── tests/                  # Unit tests
├── e2e/                    # End-to-end tests
└── docs/                   # Documentation
```

## Documentation

- [User Guide](docs/USER_GUIDE.md) - Complete usage guide
- [Contributing](CONTRIBUTING.md) - Contributor guidelines
- [Changelog](CHANGELOG.md) - Version history
- [Security](SECURITY.md) - Security policy and architecture
- [Audit Report](AUDIT_REPORT.md) - Quality, security, and product assessments
- [Roadmap](ROADMAP.md) - Development plans

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Windows 10 / macOS 11 / Ubuntu 20.04 | Latest stable |
| RAM | 4 GB | 8 GB+ (for Ollama) |
| Storage | 50 MB (app) | 4 GB+ (with LLM models) |

## Data Storage

All data is stored locally:

| OS | Location |
|----|----------|
| Windows | `%APPDATA%\HeLpER\` |
| macOS | `~/Library/Application Support/HeLpER/` |
| Linux | `~/.local/share/helper/` |

## Development

```bash
npm test              # run tests
npm run test:coverage # coverage report
npm run test:e2e      # end-to-end tests
npm run check         # type check
npm run lint          # lint
npm run format        # format
npm run tauri dev     # dev server
```

## Contributing

Contributions welcome! See [Contributing Guide](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE.md).

---

## Connected Repositories

### NatLangChain Ecosystem

- **[NatLangChain](https://github.com/kase1111-hash/NatLangChain)** - Prose-first blockchain protocol
- **[IntentLog](https://github.com/kase1111-hash/IntentLog)** - Git for human reasoning
- **[RRA-Module](https://github.com/kase1111-hash/RRA-Module)** - Abandoned repository monetization
- **[mediator-node](https://github.com/kase1111-hash/mediator-node)** - LLM mediation layer
- **[ILR-module](https://github.com/kase1111-hash/ILR-module)** - IP & Licensing Reconciliation
- **[Finite-Intent-Executor](https://github.com/kase1111-hash/Finite-Intent-Executor)** - Posthumous intent execution

### Agent-OS Ecosystem

- **[Agent-OS](https://github.com/kase1111-hash/Agent-OS)** - Natural-language native OS for AI agents
- **[synth-mind](https://github.com/kase1111-hash/synth-mind)** - Psychological AI agent modules
- **[memory-vault](https://github.com/kase1111-hash/memory-vault)** - Sovereign cognitive artifact storage
- **[value-ledger](https://github.com/kase1111-hash/value-ledger)** - Economic accounting for cognitive work
- **[learning-contracts](https://github.com/kase1111-hash/learning-contracts)** - AI learning safety protocols

### Game Development

- **[Shredsquatch](https://github.com/kase1111-hash/Shredsquatch)** - 3D snowboarding infinite runner
- **[Midnight-pulse](https://github.com/kase1111-hash/Midnight-pulse)** - Procedural night drive
- **[Long-Home](https://github.com/kase1111-hash/Long-Home)** - Atmospheric narrative game

---

*HeLpER v0.1.0-alpha - Built with Tauri, Svelte, and Ollama*
