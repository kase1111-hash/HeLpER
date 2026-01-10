# HeLpER

**Helpful Lightweight Personal Everyday Recorder**

A privacy-first personal journal application with local AI integration for the authenticity economy. HeLpER combines prose-first note-taking with intent preservation, weather-aware journal context, and natural language blockchain publishing via NatLangChain.

Built for digital sovereignty and human-AI collaboration, HeLpER keeps all your cognitive work on your device while offering optional self-hosted AI assistance through Ollama. Perfect as a family journal app, personal knowledge base, or daily decision documentation tool.

![Version](https://img.shields.io/badge/version-0.1.0--alpha-orange)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Core Features

- **Daily Notes** - Organize notes by date with easy calendar navigation for personal reasoning audit trails
- **AI Assistant** - Local LLM integration via Ollama for note formatting, expansion, and human-AI collaboration in writing
- **Auto-Save** - Notes save automatically as you type, preserving your cognitive work
- **System Tray** - Minimize to tray for quick access
- **Search** - Find notes instantly with full-text search across your private knowledge base
- **Export** - Save notes as Markdown or JSON for data ownership and portability
- **Privacy First** - All data stays on your device with owned AI infrastructure

### Journal Context

- **Weather Integration** - Real-time weather data via WeatherAPI.com
- **Time of Day** - Automatic detection of morning, afternoon, evening, night
- **Moon Phases** - Track lunar cycles for your journal entries
- **Auto-Location** - Detect your location automatically via IP

### NatLangChain Publishing

- **Natural Language Blockchain** - Publish your writing to NatLangChain's prose-first ledger
- **Intent-Native Protocol** - Human-readable smart contracts preserve your authorial intent
- **Multiple Content Types** - Support for journal entries, news articles, and serialized fiction with semantic blockchain storage
- **Monetization Options** - Free, subscription, pay-per-entry, or tip jar models for cognitive work valuation
- **AI Editing** - Polish, clarify, expand, or summarize content before publishing to the intent preservation blockchain
- **Intent Detection** - AI-assisted intent suggestions for your entries using linguistic consensus
- **Validation** - Pre-publish validation with clarity scoring for auditable prose transactions

### First Run Experience

- **Onboarding Wizard** - Guided setup for new users
- **Theme Selection** - Choose light, dark, or system theme
- **AI Setup** - Easy Ollama connection verification
- **Welcome Note** - Helpful tips to get started

## Quick Start

### Prerequisites

- [Ollama](https://ollama.ai) (optional, for AI features)
- [WeatherAPI.com](https://www.weatherapi.com/signup.aspx) API key (optional, for weather context)

### Install Ollama (optional)

```bash
# Install Ollama, then pull a model
ollama pull llama3.2:3b
```

### Run HeLpER

Download the latest release for your platform from the [Releases](https://github.com/kase1111-hash/HeLpER/releases) page.

Or build from source:

```bash
# Clone the repository
git clone https://github.com/kase1111-hash/HeLpER.git
cd HeLpER

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Windows Quick Start

Windows users can use the provided batch scripts:

```batch
:: First-time setup - installs all dependencies
assemble-windows.bat

:: Start the development server
startup-windows.bat

:: Build for production
build-windows.bat
```

These scripts include:
- Prerequisite checks (Node.js, Rust, PowerShell)
- Automatic retry logic for network operations
- Detailed logging to `logs/` directory
- Security integration with Boundary-SIEM and boundary-daemon

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

## Project Structure

```
HeLpER/
├── src/                    # Svelte frontend
│   ├── components/         # UI components
│   │   ├── App.svelte              # Main application
│   │   ├── Calendar.svelte         # Date picker
│   │   ├── ChatPanel.svelte        # AI chat interface
│   │   ├── DateNav.svelte          # Date navigation
│   │   ├── FirstRunWizard.svelte   # Onboarding wizard
│   │   ├── JournalContext.svelte   # Weather/time context display
│   │   ├── NoteEditor.svelte       # Note editing
│   │   ├── NotesList.svelte        # Notes list view
│   │   ├── PublishPanel.svelte     # NatLangChain publishing
│   │   ├── SettingsPanel.svelte    # Settings UI
│   │   ├── StatusBar.svelte        # Connection status
│   │   ├── TitleBar.svelte         # Window title bar
│   │   ├── ToastContainer.svelte   # Notifications
│   │   └── WeatherBadge.svelte     # Weather indicator
│   ├── lib/
│   │   ├── services/       # API services
│   │   │   ├── export.ts           # Export/backup functionality
│   │   │   ├── natlangchain.ts     # NatLangChain integration
│   │   │   ├── stt.ts              # Speech-to-text
│   │   │   ├── tauri.ts            # Tauri IPC commands
│   │   │   └── weather.ts          # Weather utilities
│   │   ├── stores/         # Svelte stores
│   │   │   ├── chat.ts             # AI chat state
│   │   │   ├── notes.ts            # Notes management
│   │   │   ├── settings.ts         # User settings
│   │   │   ├── stt.ts              # Speech-to-text state
│   │   │   ├── ui.ts               # UI state
│   │   │   └── weather.ts          # Weather state
│   │   ├── utils/          # Helper functions
│   │   ├── constants.ts    # App constants
│   │   └── types.ts        # TypeScript types
│   └── App.svelte          # Main app component
├── src-tauri/              # Rust backend
│   └── src/
│       ├── commands.rs     # Tauri commands
│       ├── database.rs     # SQLite operations
│       ├── natlangchain.rs # NatLangChain API client
│       ├── ollama.rs       # Ollama API client
│       ├── tray.rs         # System tray
│       └── weather.rs      # Weather API client
├── tests/                  # Unit tests
├── e2e/                    # End-to-end tests
├── scripts/                # Build and utility scripts
│   └── security-integration.ps1  # Security module
├── docs/                   # Documentation
├── assemble-windows.bat    # Windows setup script
├── startup-windows.bat     # Windows dev server script
├── build-windows.bat       # Windows build script
└── security-config.json    # Security configuration
```

## Documentation

- [User Guide](docs/USER_GUIDE.md) - Complete guide to using HeLpER

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
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Type check
npm run check

# Lint code
npm run lint

# Format code
npm run format

# Development server
npm run tauri dev
```

## Configuration

### Settings Categories

| Category | Description |
|----------|-------------|
| **Appearance** | Theme selection (light, dark, system) |
| **AI Assistant** | Ollama URL and model configuration |
| **Journal Context** | Weather API key, location, temperature unit |
| **Behavior** | Minimize to tray, start minimized, always on top |
| **NatLangChain** | Publishing settings, author info, monetization defaults |
| **Data** | Export and backup options |

## Security Integration

HeLpER includes optional integration with AI security monitoring systems for comprehensive trust enforcement:

### Boundary-SIEM

Reports events to [Boundary-SIEM](https://github.com/kase1111-hash/Boundary-SIEM) for centralized AI security monitoring and security event management:

- Application startup/shutdown events with agent security logs
- Operation success/failure logging for security audit trails
- Error reporting with severity levels and AI threat detection
- CEF-format local logging for SIEM ingestion

### boundary-daemon

Integrates with [boundary-daemon](https://github.com/kase1111-hash/boundary-daemon-) for AI trust enforcement and cognition boundary control:

- Policy checks before sensitive operations via the trust layer for AI
- Connection protection for network requests with cognitive firewall
- Tripwire detection and lockdown mode handling
- Boundary mode awareness (OPEN, RESTRICTED, TRUSTED, AIRGAP, COLDROOM, LOCKDOWN) for agent security policy

### Configuration

Edit `security-config.json` to configure security integration:

```json
{
  "SiemEndpoint": "http://localhost:8080/api/v1/events",
  "DaemonHttpEndpoint": "http://localhost:9090/api/v1",
  "EnableSiem": true,
  "EnableDaemon": true
}
```

Security integration is optional and gracefully degrades when services are unavailable.

## Contributing

Contributions are welcome! Please open an issue first to discuss changes.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Connected Repositories

HeLpER is part of a larger ecosystem of tools for digital sovereignty, human-AI collaboration, and the authenticity economy.

### NatLangChain Ecosystem

- **[NatLangChain](https://github.com/kase1111-hash/NatLangChain)** - Prose-first, intent-native blockchain protocol for recording human intent in natural language
- **[IntentLog](https://github.com/kase1111-hash/IntentLog)** - Git for human reasoning; tracks "why" changes happen via prose commits
- **[RRA-Module](https://github.com/kase1111-hash/RRA-Module)** - Revenant Repo Agent for abandoned repository monetization
- **[mediator-node](https://github.com/kase1111-hash/mediator-node)** - LLM mediation layer for matching, negotiation, and closure proposals
- **[ILR-module](https://github.com/kase1111-hash/ILR-module)** - IP & Licensing Reconciliation for dispute resolution
- **[Finite-Intent-Executor](https://github.com/kase1111-hash/Finite-Intent-Executor)** - Posthumous execution of predefined intent via smart contracts

### Agent-OS Ecosystem

- **[Agent-OS](https://github.com/kase1111-hash/Agent-OS)** - Natural-language native operating system for AI agents
- **[synth-mind](https://github.com/kase1111-hash/synth-mind)** - NLOS-based agent with psychological modules for emergent continuity and empathy
- **[boundary-daemon](https://github.com/kase1111-hash/boundary-daemon-)** - Mandatory trust enforcement layer defining cognition boundaries
- **[memory-vault](https://github.com/kase1111-hash/memory-vault)** - Secure, offline-capable, owner-sovereign storage for cognitive artifacts
- **[value-ledger](https://github.com/kase1111-hash/value-ledger)** - Economic accounting layer for cognitive work
- **[learning-contracts](https://github.com/kase1111-hash/learning-contracts)** - Safety protocols for AI learning and data management

### Security Infrastructure

- **[Boundary-SIEM](https://github.com/kase1111-hash/Boundary-SIEM)** - Security Information and Event Management for AI systems

### Game Development

- **[Shredsquatch](https://github.com/kase1111-hash/Shredsquatch)** - 3D first-person snowboarding infinite runner (SkiFree homage)
- **[Midnight-pulse](https://github.com/kase1111-hash/Midnight-pulse)** - Procedurally generated night drive
- **[Long-Home](https://github.com/kase1111-hash/Long-Home)** - Atmospheric narrative game built with Godot

---

*HeLpER v0.1.0-alpha - Built with Tauri, Svelte, and Ollama for the authenticity economy*
