# HeLpER

**Helpful Lightweight Personal Everyday Recorder**

A minimalist daily notes app with an integrated AI assistant powered by [Ollama](https://ollama.ai).

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **Daily Notes** - Organize notes by date with easy navigation
- **AI Assistant** - Local LLM integration via Ollama for note formatting and expansion
- **System Tray** - Minimize to tray for quick access
- **Search** - Find notes instantly with full-text search
- **Export** - Save notes as Markdown or JSON
- **Privacy First** - All data stays on your device

## Quick Start

### Prerequisites

- [Ollama](https://ollama.ai) (optional, for AI features)

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
- **Database**: SQLite via [tauri-plugin-sql](https://github.com/tauri-apps/plugins-workspace)
- **AI**: [Ollama](https://ollama.ai) REST API

## Project Structure

```
HeLpER/
├── src/                    # Svelte frontend
│   ├── components/         # UI components
│   ├── lib/
│   │   ├── services/       # API services
│   │   ├── stores/         # Svelte stores
│   │   ├── utils/          # Helper functions
│   │   └── types.ts        # TypeScript types
│   └── App.svelte          # Main app component
├── src-tauri/              # Rust backend
│   └── src/
│       ├── commands.rs     # Tauri commands
│       ├── database.rs     # SQLite operations
│       └── ollama.rs       # Ollama API client
├── tests/                  # Unit tests
└── docs/                   # Documentation
```

## Documentation

- [User Guide](docs/USER_GUIDE.md) - How to use HeLpER

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

# Type check
npm run check

# Development server
npm run tauri dev
```

## Contributing

Contributions are welcome! Please open an issue first to discuss changes.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Built with Tauri, Svelte, and Ollama*
