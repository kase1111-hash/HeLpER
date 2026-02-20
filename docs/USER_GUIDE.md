# HeLpER User Guide

**HeLpER** (Helpful Lightweight Personal Everyday Recorder) is a privacy-first daily notes app with local AI assistance, weather-aware journal context, and optional blockchain publishing.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Daily Notes](#daily-notes)
3. [AI Assistant](#ai-assistant)
4. [Journal Context](#journal-context)
5. [NatLangChain Publishing](#natlangchain-publishing)
6. [Security Features](#security-features)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Settings](#settings)
9. [Export & Backup](#export--backup)
10. [Windows Scripts](#windows-scripts)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Requirements

- **Operating System**: Windows 10+, macOS 11+, or Linux
- **Ollama** (optional): For AI features, install [Ollama](https://ollama.ai) and pull a model:
  ```bash
  ollama pull llama3.2:3b
  ```
- **WeatherAPI Key** (optional): For weather context, get a free key at [weatherapi.com](https://www.weatherapi.com/signup.aspx)

### First Launch

When you first launch HeLpER, the onboarding wizard guides you through:

1. **Welcome Screen** - Introduction to key features
2. **Theme Selection** - Light, Dark, or System theme
3. **AI Setup** - Connect to Ollama (optional)
4. **Ready** - Keyboard shortcuts and a welcome note

After onboarding, the app opens to today's date with a welcome note. Start typing immediately - notes save automatically.

---

## Daily Notes

### Creating Notes

- Click **+ New Note** at the bottom of the notes list
- Or press `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

### Navigating Dates

- Use **< >** arrows in the date bar to move between days
- Click the **calendar icon** to jump to a specific date

### Editing Notes

- Click any note to select it
- Changes save automatically as you type
- Character count displays in the corner (max 5,000)

### Searching Notes

- Use the search box at the top of the notes list
- Press `Ctrl+F` to focus the search box
- Press `Escape` to clear

### Deleting Notes

- Hover over a note to reveal the delete button
- Deleted notes are soft-deleted and can be recovered from backups

---

## AI Assistant

The AI assistant helps format, expand, and improve your notes using a local Ollama model.

### Setup

1. Install [Ollama](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2:3b`
3. Start Ollama (runs in background)

### Using the Chat

1. The chat panel is at the bottom of the app
2. Type a message and press `Enter`
3. The AI can see your current note as context (with delimiter-based safety separation)

### Quick Actions

| Action | What it does |
|--------|-------------|
| Format | Structure with bullet points |
| Expand | Develop into detailed paragraphs |
| Summarize | Condense to key points |
| Fix Grammar | Correct spelling and grammar |
| Make Professional | Rewrite in professional tone |

### Connection Status

| Status | Meaning |
|--------|---------|
| Green dot + model name | Connected and ready |
| Yellow dot + "Connecting..." | Attempting to connect |
| Gray dot + "Disconnected" | Ollama not running |

---

## Journal Context

### Enabling Weather

1. Open Settings (`Ctrl+,`)
2. Find **Journal Context**
3. Toggle **Show weather & context**
4. Enter your WeatherAPI.com API key (stored securely in OS keychain)
5. Enter location or click **Detect**

### Weather Information

Temperature, feels like, condition, humidity, wind, UV index, and location.

### Time Context

- **Time of Day** - Morning, Afternoon, Evening, Night
- **Day of Week** - Current day
- **Moon Phase** - Current lunar phase

---

## NatLangChain Publishing

### Enabling

1. Open Settings (`Ctrl+,`)
2. Find **NatLangChain Publishing**
3. Toggle **Enable blockchain publishing**
4. Enter API URL, Author Name, and Author ID

### Content Types

| Type | Description |
|------|-------------|
| **Journal Entry** | Personal entries and reflections |
| **News Article** | Journalism, reviews, tutorials |
| **Story Chapter** | Serialized fiction |

### Publishing Flow

1. Select a note to publish
2. **Edit & Prepare** - Choose content type, add title, edit content, use AI editing tools
3. **Publish on Chain** - Set monetization, visibility, validate, and publish

Content is automatically scanned for secrets before publishing and signed with your Ed25519 author key.

### AI Editing Tools

| Tool | Description |
|------|-------------|
| **Polish** | Improve prose for publication |
| **Clarify** | Make intent clear |
| **Expand** | Add detail and context |
| **Summarize** | Create concise version |

AI-edited content is marked with an "AI-Assisted" provenance badge.

---

## Security Features

HeLpER includes several security measures to protect your data:

### Credential Storage
Your API keys are stored in your operating system's secure keychain (macOS Keychain, Windows Credential Manager, or Linux Secret Service) rather than in plaintext files.

### Secret Scanning
Before publishing to NatLangChain, your content is automatically scanned for accidentally included secrets like API keys, passwords, SSH keys, and tokens. If secrets are detected, publishing is blocked with a warning.

### Settings Integrity
Your settings file is protected with HMAC-SHA256 verification. If the settings file is tampered with outside the app, you'll be warned on next launch.

### Author Signing
NatLangChain entries are cryptographically signed with an Ed25519 keypair stored in your OS keychain, providing verifiable author identity.

### Audit Trail
All AI interactions, publishes, and settings changes are logged to a tamper-evident audit trail with hash chaining.

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Note | `Ctrl+N` | `Cmd+N` |
| Search Notes | `Ctrl+F` | `Cmd+F` |
| Open Settings | `Ctrl+,` | `Cmd+,` |
| Close Panel | `Escape` | `Escape` |
| Send Chat | `Enter` | `Enter` |

---

## Settings

Open Settings with `Ctrl+,` or click the gear icon.

| Category | Options |
|----------|---------|
| **Appearance** | Theme (Light, Dark, System) |
| **AI Assistant** | Ollama URL, model selection |
| **Journal Context** | Weather API key (stored in keychain), location, temperature unit |
| **Behavior** | Minimize to tray, start minimized, always on top |
| **NatLangChain** | Enable publishing, API URL, author info, monetization defaults |
| **Data** | Export and backup options |

---

## Export & Backup

### Exporting Notes

1. Open Settings (`Ctrl+,`)
2. Scroll to **Data**
3. Choose format: **Markdown** (human-readable) or **JSON** (structured)

### Creating Backups

1. Open Settings
2. Click **Create Backup**
3. Choose save location

---

## Windows Scripts

| Script | Purpose |
|--------|---------|
| `assemble-windows.bat` | Install all dependencies |
| `startup-windows.bat` | Start development server |
| `build-windows.bat` | Build for production |

Scripts include prerequisite checks, retry logic, and logging to `logs/`.

---

## Troubleshooting

### AI Won't Connect
1. Check Ollama is running: `ollama list`
2. Verify model installed: `ollama pull llama3.2:3b`
3. Check URL in Settings (default: `http://localhost:11434`)
4. Click Retry in status bar

### Weather Not Loading
1. Check API key in Settings (stored in OS keychain)
2. Verify location is set
3. Click Refresh in Journal Context panel

### NatLangChain Issues
1. Use "Test" button in Settings
2. Verify API URL is correct
3. Check network access

### Notes Not Saving
Notes auto-save after you stop typing. If not persisting, check disk space and restart the app.

### App Won't Start
Reset settings by deleting the config file:
- **Windows**: `%APPDATA%\HeLpER\settings.json`
- **macOS**: `~/Library/Application Support/HeLpER/settings.json`
- **Linux**: `~/.local/share/helper/settings.json`

---

## Data Storage

All data is stored locally:

| OS | Location |
|----|----------|
| Windows | `%APPDATA%\HeLpER\` |
| macOS | `~/Library/Application Support/HeLpER/` |
| Linux | `~/.local/share/helper/` |

Your notes never leave your device unless you explicitly export or publish them.

---

*HeLpER v0.1.0-alpha*
