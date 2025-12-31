# HeLpER User Guide

**HeLpER** (Helpful Lightweight Personal Everyday Recorder) is a minimalist daily notes app with an AI assistant powered by Ollama.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Daily Notes](#daily-notes)
3. [AI Assistant](#ai-assistant)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Settings](#settings)
6. [Export & Backup](#export--backup)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Requirements

- **Operating System**: Windows 10+, macOS 11+, or Linux
- **Ollama** (optional): For AI features, install [Ollama](https://ollama.ai) and pull a model:
  ```bash
  ollama pull llama3.2:3b
  ```

### First Launch

1. Launch HeLpER from your applications menu
2. The app opens to today's date
3. Click **New Note** or press `Ctrl+N` to create your first note
4. Start typing - notes save automatically

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
- Changes save automatically as you type
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

### Behavior

- **Minimize to tray on close**: Keep app running in system tray
- **Start minimized**: Launch directly to system tray
- **Always on top**: Keep window above other applications

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
      "content": "Note content...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

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

Your notes never leave your device unless you explicitly export them.

---

## Getting Help

- **Issues**: Report bugs on [GitHub Issues](https://github.com/kase1111-hash/HeLpER/issues)
- **Discussions**: Ask questions on GitHub Discussions

---

*HeLpER v0.1.0 - Your helpful everyday note companion*
