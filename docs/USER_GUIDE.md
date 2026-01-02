# HeLpER User Guide

**HeLpER** (Helpful Lightweight Personal Everyday Recorder) is a minimalist daily notes app with an AI assistant, weather-aware journal context, and blockchain publishing capabilities.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Daily Notes](#daily-notes)
3. [AI Assistant](#ai-assistant)
4. [Journal Context](#journal-context)
5. [NatLangChain Publishing](#natlangchain-publishing)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Settings](#settings)
8. [Export & Backup](#export--backup)
9. [Windows Scripts](#windows-scripts)
10. [Security Integration](#security-integration)
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

When you first launch HeLpER, the onboarding wizard will guide you through:

1. **Welcome Screen** - Introduction to HeLpER's key features
2. **Theme Selection** - Choose between Light, Dark, or System theme
3. **AI Setup** - Connect to Ollama for AI-powered features (optional)
4. **Ready** - Keyboard shortcuts reference and a welcome note

After onboarding:
- The app opens to today's date
- A welcome note is created with helpful tips
- Start typing immediately - notes save automatically

---

## Daily Notes

### Creating Notes

- Click the **+ New Note** button at the bottom of the notes list
- Or press `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

### Navigating Dates

- Use the **< >** arrows in the date bar to move between days
- Click the **calendar icon** to jump to a specific date
- Notes are organized by date automatically

### Editing Notes

- Click any note in the list to select it
- The editor shows your note content
- Changes save automatically as you type (auto-save delay configurable)
- Character count displays in the corner (max 5,000)

### Searching Notes

- Use the search box at the top of the notes list
- Press `Ctrl+F` to focus the search box
- Search filters notes for the current day
- Press `Escape` to clear the search

### Deleting Notes

- Hover over a note to reveal the delete button (trash icon)
- Click and confirm to delete
- Deleted notes are soft-deleted and can be recovered from backups

---

## AI Assistant

The AI assistant helps you format, expand, and improve your notes using a local Ollama model.

### Requirements

1. Install [Ollama](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2:3b`
3. Start Ollama (it runs in the background)

### Using the Chat

1. The chat panel is at the bottom of the app
2. Type a message and press `Enter` or click Send
3. The AI can see your current note as context

### Example Prompts

| Task | Example Prompt |
|------|----------------|
| Format notes | "Format this into bullet points" |
| Expand content | "Expand this into a detailed paragraph" |
| Summarize | "Summarize this note in 3 points" |
| Fix grammar | "Fix any grammar errors" |
| Professional tone | "Rewrite this more professionally" |

### Connection Status

The status bar at the bottom shows Ollama's connection state:

| Status | Meaning |
|--------|---------|
| Green dot + model name | Connected and ready |
| Yellow dot + "Connecting..." | Attempting to connect |
| Gray dot + "Disconnected" | Ollama not running |

Click **Retry** to reconnect if disconnected.

---

## Journal Context

HeLpER can display contextual information for your journal entries, including weather, time of day, and moon phases.

### Enabling Weather

1. Open Settings (`Ctrl+,`)
2. Find the **Journal Context** section
3. Toggle **Show weather & context in journal**
4. Enter your WeatherAPI.com API key (get a free key [here](https://www.weatherapi.com/signup.aspx))
5. Enter your location or click **Detect** for auto-detection

### Weather Information

When enabled, the Journal Context panel shows:

| Field | Description |
|-------|-------------|
| **Temperature** | Current temperature in your preferred unit |
| **Feels Like** | Apparent temperature |
| **Condition** | Weather description (Clear, Cloudy, Rain, etc.) |
| **Humidity** | Current humidity percentage |
| **Wind** | Wind speed and direction |
| **UV Index** | Current UV radiation level |
| **Location** | Your configured or detected location |

### Time Context

The Journal Context also displays:

- **Time of Day** - Morning, Afternoon, Evening, or Night
- **Day of Week** - Current day name
- **Moon Phase** - Current lunar phase (New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent)

### Weather Icons

| Icon | Condition |
|------|-----------|
| ☀️ | Clear (day) |
| 🌙 | Clear (night) |
| ⛅ | Partly Cloudy |
| ☁️ | Cloudy/Overcast |
| 🌧️ | Rain |
| 🌦️ | Drizzle |
| ❄️ | Snow |
| ⛈️ | Thunderstorm |
| 🌫️ | Fog/Mist |

---

## NatLangChain Publishing

HeLpER integrates with NatLangChain, a blockchain-based publishing platform for monetizing your writing.

### Enabling NatLangChain

1. Open Settings (`Ctrl+,`)
2. Find the **NatLangChain Publishing** section
3. Toggle **Enable blockchain publishing**
4. Enter the NatLangChain API URL
5. Set your Author Name and Author ID
6. Configure default monetization and visibility settings

### Content Types

NatLangChain supports three content types:

| Type | Icon | Description |
|------|------|-------------|
| **Journal Entry** | 📝 | Personal journal entries and reflections |
| **News Article** | 📰 | Journalism, news, reviews, and tutorials |
| **Story Chapter** | 📖 | Serialized fiction and story chapters |

### Publishing a Note

1. Select a note you want to publish
2. Open the Publish Panel
3. Choose **Edit & Prepare** tab to refine your content:
   - Select content type (Journal, Article, or Story)
   - Add a title
   - Edit the content
   - Use AI editing tools (Polish, Clarify, Expand, Summarize)
   - Set intent and tags
   - For stories: Add series title, chapter number, genre
   - For articles: Add headline, category, byline, sources
4. Switch to **Publish on Chain** tab:
   - Set monetization model
   - Choose visibility
   - Preview your entry
   - Click **Validate** to check for issues
   - Click **Publish** to submit to the blockchain

### Monetization Models

| Model | Description |
|-------|-------------|
| **Free** | Anyone can read |
| **Subscription** | Only your subscribers can read |
| **Pay Per Entry** | Readers pay a set price to access |
| **Tip Jar** | Free to read with optional tips |

### Visibility Options

| Option | Description |
|--------|-------------|
| **Public** | Visible to everyone |
| **Subscribers Only** | Only visible to your subscribers |
| **Private (Draft)** | Hidden, saved as draft |

### AI Editing Tools

Before publishing, use AI to improve your content:

| Tool | Description |
|------|-------------|
| **Polish** | Improve prose and make content publication-ready |
| **Clarify** | Improve clarity and make intent clear |
| **Expand** | Add more detail and context |
| **Summarize** | Create a concise version |

Each tool adapts its behavior based on the selected content type (journal, article, or story).

### Story Chapters

For serialized fiction:

- **Series Title** - Name of your story series
- **Genre** - Fiction, Fantasy, Sci-Fi, Mystery, Romance, etc.
- **Chapter Number** - Automatically detected from content
- **Total Chapters** - Set if known, or mark as "Ongoing"
- **Synopsis** - Brief story description (for first chapter only)

### News Articles

For journalism and articles:

- **Category** - News, Opinion, Analysis, Feature, Review, Tutorial, Interview
- **Subcategory** - More specific topic area
- **Byline** - Additional author information
- **Dateline** - Location where news occurred
- **Sources** - Attribution sources (comma-separated)
- **Flags** - Breaking News, Opinion Piece, Analysis

---

## Keyboard Shortcuts

### Global Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Note | `Ctrl+N` | `Cmd+N` |
| Search Notes | `Ctrl+F` | `Cmd+F` |
| Open Settings | `Ctrl+,` | `Cmd+,` |
| Close Panel/Clear | `Escape` | `Escape` |

### Chat Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Send Message | `Enter` | `Enter` |

---

## Settings

Open Settings with `Ctrl+,` or click the gear icon in the status bar.

### Appearance

- **Theme**: Choose Light, Dark, or System (follows OS preference)

### AI Assistant

- **Ollama URL**: API endpoint (default: `http://localhost:11434`)
- **Model**: Which Ollama model to use (default: `llama3.2:3b`)

### Journal Context

- **Enable Weather**: Toggle weather and context display
- **Weather API Key**: Your WeatherAPI.com API key
- **Location**: City name, coordinates, or auto-detected
- **Temperature Unit**: Celsius or Fahrenheit

### Behavior

- **Minimize to tray on close**: Keep app running in system tray when closing
- **Start minimized**: Launch directly to system tray
- **Always on top**: Keep window above other applications

### NatLangChain Publishing

- **Enable blockchain publishing**: Toggle NatLangChain integration
- **API URL**: NatLangChain API endpoint
- **Author Name**: Your display name
- **Author ID**: Unique identifier for earnings
- **Default Monetization**: Free, Subscription, Pay Per Entry, or Tip Jar
- **Validate before publishing**: Auto-validate entries before publishing

### Data

- **Export Notes**: Save notes as Markdown or JSON files
- **Create Backup**: Export all data with metadata

---

## Export & Backup

### Exporting Notes

1. Open Settings (`Ctrl+,`)
2. Scroll to the **Data** section
3. Choose export format:
   - **Markdown**: Human-readable, one file with all notes
   - **JSON**: Structured data, good for importing elsewhere

### Creating Backups

1. Open Settings
2. Click **Create Backup**
3. Choose a location to save the backup file
4. The backup includes all notes with timestamps

### Backup File Format

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-31T10:00:00.000Z",
  "notes": [
    {
      "id": "...",
      "date": "2025-12-31",
      "title": "My Note Title",
      "content": "Note content...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

## Windows Scripts

HeLpER provides batch scripts for Windows users to simplify development setup and execution.

### Available Scripts

| Script | Purpose |
|--------|---------|
| `assemble-windows.bat` | Install all dependencies (npm, Tauri CLI, Rust crates) |
| `startup-windows.bat` | Start the development server |
| `build-windows.bat` | Build the application for production |

### Using the Scripts

**First-time setup:**
```batch
:: Run from the HeLpER directory
assemble-windows.bat
```

This script will:
1. Check for prerequisites (Node.js, Rust, PowerShell)
2. Install npm dependencies
3. Install Tauri CLI
4. Fetch Rust dependencies

**Starting development:**
```batch
startup-windows.bat
```

This script will:
1. Verify prerequisites
2. Auto-run assembly if dependencies are missing
3. Start the Tauri development server
4. Report events to security systems (if configured)

**Building for production:**
```batch
build-windows.bat
```

### Script Features

- **Error Codes**: Structured error codes (10-99) for different failure scenarios
- **Retry Logic**: Automatic retries (up to 3 attempts) for network operations
- **Logging**: Timestamped logs saved to `logs/` directory
- **Security Integration**: Reports to Boundary-SIEM and boundary-daemon

### Logs

Scripts create detailed logs in the `logs/` directory:
- `assembly-YYYYMMDD_HHMMSS.log` - Assembly script logs
- `startup-YYYYMMDD_HHMMSS.log` - Startup script logs
- `security-YYYY-MM-DD.log` - CEF-format security events

---

## Security Integration

HeLpER optionally integrates with security monitoring systems for enterprise environments.

### Boundary-SIEM Integration

[Boundary-SIEM](https://github.com/kase1111-hash/Boundary-SIEM) is a Security Information and Event Management platform. HeLpER can report events to it via REST API.

**Events reported:**
- Application startup and shutdown
- Operation success/failure
- Errors with severity levels
- Dependency installation progress

### boundary-daemon Integration

[boundary-daemon](https://github.com/kase1111-hash/boundary-daemon-) provides policy enforcement for AI agent environments. HeLpER checks policies before sensitive operations.

**Features:**
- Policy checks before package installation
- Connection protection for network requests
- Tripwire detection (automatic lockdown on security violations)
- Boundary mode awareness

**Boundary Modes:**
| Mode | Description |
|------|-------------|
| OPEN | No restrictions |
| RESTRICTED | Limited access to sensitive resources |
| TRUSTED | Operations allowed within trust boundaries |
| AIRGAP | No external network access |
| COLDROOM | Minimal operations allowed |
| LOCKDOWN | All operations blocked (tripwire triggered) |

### Configuration

Edit `security-config.json` in the project root:

```json
{
  "SiemEndpoint": "http://localhost:8080/api/v1/events",
  "SiemApiKey": "",
  "DaemonHttpEndpoint": "http://localhost:9090/api/v1",
  "EnableSiem": true,
  "EnableDaemon": true,
  "LogPath": "./logs"
}
```

| Setting | Description |
|---------|-------------|
| `SiemEndpoint` | Boundary-SIEM API URL |
| `SiemApiKey` | API key for authentication (optional) |
| `DaemonHttpEndpoint` | boundary-daemon API URL |
| `EnableSiem` | Enable/disable SIEM reporting |
| `EnableDaemon` | Enable/disable policy checks |
| `LogPath` | Directory for local security logs |

### Graceful Degradation

Security integration is optional. When security services are unavailable:
- Scripts continue to function normally
- Warnings are logged but operations proceed
- Local CEF-format logs are still created

---

## Troubleshooting

### AI Assistant Won't Connect

1. **Check Ollama is running**:
   ```bash
   ollama list
   ```
   If this fails, Ollama isn't running. Start it or install from [ollama.ai](https://ollama.ai).

2. **Check the model is installed**:
   ```bash
   ollama pull llama3.2:3b
   ```

3. **Verify the URL in Settings**:
   Default is `http://localhost:11434`. Change if you're running Ollama elsewhere.

4. **Click Retry** in the status bar to reconnect.

### "Model not found" Error

The configured model isn't installed. Run:
```bash
ollama pull <model-name>
```

Replace `<model-name>` with the model shown in Settings (e.g., `llama3.2:3b`).

### Weather Not Loading

1. **Check API Key**: Ensure you have a valid WeatherAPI.com API key in Settings
2. **Verify Location**: Make sure your location is set correctly
3. **Click Refresh**: Use the refresh button in the Journal Context panel
4. **Try Auto-Detect**: Click "Detect" to automatically find your location

### NatLangChain Connection Issues

1. **Test Connection**: Use the "Test" button in Settings to verify connectivity
2. **Check API URL**: Ensure the NatLangChain API URL is correct
3. **Verify Network**: Make sure you have internet access

### Notes Not Saving

Notes auto-save after you stop typing. If notes aren't persisting:

1. Check disk space
2. Restart the app
3. Check the app's data folder for corruption

### App Won't Start

1. Try resetting settings by deleting the config file:
   - **Windows**: `%APPDATA%\HeLpER\settings.json`
   - **macOS**: `~/Library/Application Support/HeLpER/settings.json`
   - **Linux**: `~/.config/helper/settings.json`

2. Reinstall the application

### System Tray Icon Missing

On Linux, ensure your desktop environment supports system tray icons. Some require extensions:
- **GNOME**: Install "AppIndicator" extension
- **KDE**: Works out of the box

---

## Data Storage

HeLpER stores all data locally on your device:

| OS | Location |
|----|----------|
| Windows | `%APPDATA%\HeLpER\` |
| macOS | `~/Library/Application Support/HeLpER/` |
| Linux | `~/.local/share/helper/` |

Your notes never leave your device unless you explicitly export them or publish to NatLangChain.

---

## Getting Help

- **Issues**: Report bugs on [GitHub Issues](https://github.com/kase1111-hash/HeLpER/issues)
- **Discussions**: Ask questions on GitHub Discussions

---

*HeLpER v0.1.0-alpha - Your helpful everyday note companion*
