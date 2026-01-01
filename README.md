# HeLpER

**Helpful Lightweight Personal Everyday Recorder**

A minimalist daily notes app with an integrated AI assistant, weather-aware journal context, and blockchain publishing capabilities.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Core Features

- **Daily Notes** - Organize notes by date with easy calendar navigation
- **AI Assistant** - Local LLM integration via Ollama for note formatting, expansion, and chat
- **Auto-Save** - Notes save automatically as you type
- **System Tray** - Minimize to tray for quick access
- **Search** - Find notes instantly with full-text search
- **Export** - Save notes as Markdown or JSON
- **Privacy First** - All data stays on your device

### Journal Context

- **Weather Integration** - Real-time weather data via WeatherAPI.com
- **Time of Day** - Automatic detection of morning, afternoon, evening, night
- **Moon Phases** - Track lunar cycles for your journal entries
- **Auto-Location** - Detect your location automatically via IP

### NatLangChain Publishing

- **Blockchain Publishing** - Publish your writing to NatLangChain
- **Multiple Content Types** - Support for journal entries, news articles, and serialized fiction
- **Monetization Options** - Free, subscription, pay-per-entry, or tip jar models
- **AI Editing** - Polish, clarify, expand, or summarize content before publishing
- **Intent Detection** - AI-assisted intent suggestions for your entries
- **Validation** - Pre-publish validation with clarity scoring

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
└── docs/                   # Documentation
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

## Contributing

Contributions are welcome! Please open an issue first to discuss changes.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Built with Tauri, Svelte, and Ollama*
