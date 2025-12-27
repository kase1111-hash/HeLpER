# HeLpER - Specification Sheet

## Overview

**HeLpER** (Helpful Lightweight Personal Everyday Recorder) is a minimalist daily notes application with integrated AI assistance. It provides a streamlined interface for capturing daily thoughts and notes, with an embedded Ollama-powered chat assistant for note formatting and expansion.

| Property | Value |
|----------|-------|
| **Version** | 1.0.0 |
| **License** | MIT |
| **Category** | Productivity / Note-taking |
| **Status** | In Development |

---

## Core Features

### 1. Daily Notes System
| Feature | Description |
|---------|-------------|
| Daily Organization | Notes automatically organized by date |
| Navigation | Scroll/browse through each day's notes with arrow buttons |
| Note Capacity | Up to 5,000 characters per note (~1 page) |
| Multiple Notes | Multiple notes per day supported |
| Persistence | Auto-saved locally after each keystroke (debounced 500ms) |
| Date Jump | Calendar picker for quick date navigation |

### 2. AI Chat Assistant
| Feature | Description |
|---------|-------------|
| LLM Integration | Ollama local LLM model |
| Chat Window | Collapsible panel (default: collapsed) |
| Note Formatting | AI helps format and structure notes |
| Note Expansion | Extrapolate brief notes into detailed content |
| Context Aware | Automatically includes current note as context |
| Graceful Fallback | Chat disabled with message when Ollama unavailable |

### 3. System Tray Integration
| Feature | Description |
|---------|-------------|
| Minimize Behavior | Close button minimizes to tray (configurable) |
| Tray Icon | Monochrome icon, adapts to system theme |
| Quick Access | Left-click to restore, right-click for menu |
| Tooltip | Shows "HeLpER - [today's date]" on hover |
| Notifications | Optional reminder notifications |

---

## Technical Specifications

### Platform Requirements
| Specification | Details |
|---------------|---------|
| Target OS | Windows 10+, macOS 11+, Linux (X11/Wayland) |
| Architecture | x64, arm64 |
| LLM Backend | Ollama v0.1.0+ (local installation) |
| Node.js | v18+ (build only) |

### Recommended Technology Stack
| Component | Recommended | Alternatives | Rationale |
|-----------|-------------|--------------|-----------|
| Framework | Tauri 2.0 | Electron | Smaller binary (~15MB vs ~150MB) |
| Frontend | Svelte | React, Vue | Minimal bundle, fast rendering |
| Styling | Tailwind CSS | UnoCSS | Utility-first, tree-shaking |
| LLM API | Ollama REST | - | Local-first, privacy focused |
| Storage | SQLite | JSON files | Better query support, ACID |
| State | Svelte stores | - | Built-in reactivity |

### System Requirements
| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Windows 10 / macOS 11 / Ubuntu 20.04 | Latest stable |
| RAM | 4 GB | 8 GB+ (for Ollama) |
| Storage | 50 MB (app) | 4 GB+ (with LLM models) |
| Display | 800x600 | 1920x1080 |
| CPU | Dual-core | Quad-core (for Ollama) |

---

## User Interface Specifications

### Window Properties
| Property | Value |
|----------|-------|
| Default Size | 400w x 600h pixels |
| Minimum Size | 320w x 480h pixels |
| Maximum Size | None (resizable) |
| Remember Position | Yes, per-monitor |
| Remember Size | Yes |
| Always on Top | Optional (toggle in settings) |
| Opacity | Fixed 100% (no transparency) |

### Main Window Layout
```
+--------------------------------------------+
|  [=] HeLpER                    [_] [□] [X] |
+--------------------------------------------+
|  [<]  December 26, 2025  [calendar] [>]    |
+--------------------------------------------+
|  +--------------------------------------+  |
|  | ○ Note 1 title preview...           |  |
|  | ● Note 2 (selected)                 |  |
|  | ○ Note 3 title preview...           |  |
|  | [+ New Note]                        |  |
|  +--------------------------------------+  |
|  +--------------------------------------+  |
|  |                                      |  |
|  | Meeting notes from standup:          |  |
|  |                                      |  |
|  | - Discussed Q1 roadmap              |  |
|  | - Action items assigned             |  |
|  | - Follow up scheduled for Friday    |  |
|  |                                      |  |
|  |                              500/5000|  |
|  +--------------------------------------+  |
|                                            |
|  [AI Assistant                        ▼]   |
|  +--------------------------------------+  |
|  | You: Expand this note               |  |
|  | AI: Here's an expanded version...   |  |
|  +--------------------------------------+  |
|  [Type a message...]         [⌘↵ Send]    |
+--------------------------------------------+
|  [Ollama: Connected ●]        [⚙ Settings] |
+--------------------------------------------+
```

### System Tray Menu
```
+------------------+
| Open HeLpER      |
|------------------|
| New Note     ⌘N  |
| Today        ⌘T  |
|------------------|
| Settings...      |
|------------------|
| Quit HeLpER  ⌘Q  |
+------------------+
```

### Color Scheme
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | #FFFFFF | #1E1E1E |
| Surface | #F5F5F5 | #2D2D2D |
| Primary | #4A90D9 | #5BA0E9 |
| Text | #1A1A1A | #E5E5E5 |
| Text Secondary | #666666 | #A0A0A0 |
| Border | #E0E0E0 | #404040 |
| Success | #34C759 | #30D158 |
| Warning | #FF9500 | #FFD60A |
| Error | #FF3B30 | #FF453A |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| App Title | System UI | 14px | 600 |
| Date Header | System UI | 16px | 500 |
| Note Title | System UI | 14px | 500 |
| Note Body | System UI | 14px | 400 |
| Chat Message | System UI | 13px | 400 |
| Status Bar | System UI | 12px | 400 |

---

## Keyboard Shortcuts

### Global (when app focused)
| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Note | Ctrl+N | Cmd+N |
| Save Note | Ctrl+S | Cmd+S |
| Delete Note | Ctrl+Backspace | Cmd+Backspace |
| Today | Ctrl+T | Cmd+T |
| Previous Day | Ctrl+← | Cmd+← |
| Next Day | Ctrl+→ | Cmd+→ |
| Toggle AI Panel | Ctrl+/ | Cmd+/ |
| Focus Search | Ctrl+F | Cmd+F |
| Settings | Ctrl+, | Cmd+, |
| Minimize to Tray | Ctrl+M | Cmd+M |
| Quit | Ctrl+Q | Cmd+Q |

### Editor
| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Shift+Z | Cmd+Shift+Z |
| Bold | Ctrl+B | Cmd+B |
| Italic | Ctrl+I | Cmd+I |
| Bullet List | Ctrl+Shift+8 | Cmd+Shift+8 |

### Chat
| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Send Message | Ctrl+Enter | Cmd+Enter |
| Clear Chat | Ctrl+L | Cmd+L |

---

## Settings & Configuration

### Application Settings
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Theme | select | "system" | "light", "dark", "system" |
| Start minimized | boolean | false | Launch to tray |
| Start on login | boolean | false | Auto-start with OS |
| Minimize on close | boolean | true | Close button behavior |
| Always on top | boolean | false | Window stays above others |
| Show in taskbar | boolean | true | Taskbar visibility when open |
| Date format | select | "system" | Date display format |
| Time format | select | "12h" | "12h" or "24h" |
| Spell check | boolean | true | Enable spell checking |
| Auto-save delay | number | 500 | Milliseconds (0 to disable) |

### AI Settings
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Ollama URL | string | "http://localhost:11434" | Ollama API endpoint |
| Model | string | "llama3.2:3b" | LLM model name |
| Temperature | number | 0.7 | Response creativity (0-1) |
| Max tokens | number | 500 | Response length limit |
| System prompt | text | (built-in) | Custom AI personality |
| Include note context | boolean | true | Send current note with messages |
| Save chat history | boolean | false | Persist conversations |

### Data Settings
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Data location | path | (app data) | Notes storage folder |
| Backup enabled | boolean | true | Auto-backup notes |
| Backup frequency | select | "daily" | "hourly", "daily", "weekly" |
| Backup retention | number | 7 | Days to keep backups |
| Export format | select | "markdown" | "markdown", "json", "txt" |

### Notification Settings
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Daily reminder | boolean | false | Remind to write notes |
| Reminder time | time | "20:00" | When to show reminder |
| Sound | boolean | true | Play notification sound |

---

## Data Model

### Database Schema (SQLite)
```sql
-- Notes table
CREATE TABLE notes (
    id          TEXT PRIMARY KEY,  -- UUID v4
    date        TEXT NOT NULL,     -- ISO 8601 date (YYYY-MM-DD)
    title       TEXT,              -- Auto-generated or manual
    content     TEXT NOT NULL,     -- Note body (max 5000 chars)
    created_at  TEXT NOT NULL,     -- ISO 8601 timestamp
    updated_at  TEXT NOT NULL,     -- ISO 8601 timestamp
    deleted_at  TEXT               -- Soft delete timestamp
);

CREATE INDEX idx_notes_date ON notes(date);
CREATE INDEX idx_notes_deleted ON notes(deleted_at);

-- Chat history (optional)
CREATE TABLE chat_history (
    id          TEXT PRIMARY KEY,
    note_id     TEXT,              -- Optional reference
    messages    TEXT NOT NULL,     -- JSON array
    created_at  TEXT NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes(id)
);

-- Settings
CREATE TABLE settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- App metadata
CREATE TABLE metadata (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);
```

### Note Object
```typescript
interface Note {
  id: string;           // UUID v4
  date: string;         // "YYYY-MM-DD"
  title: string | null; // First 50 chars of content or custom
  content: string;      // Max 5000 characters
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
  deletedAt?: string;   // Soft delete
}
```

### Chat Message Object
```typescript
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface ChatHistory {
  id: string;
  noteId?: string;
  messages: ChatMessage[];
  createdAt: string;
}
```

---

## File Locations

### Default Paths
| OS | Config | Data | Logs | Backups |
|----|--------|------|------|---------|
| Windows | `%APPDATA%\HeLpER\config` | `%APPDATA%\HeLpER\data` | `%APPDATA%\HeLpER\logs` | `%APPDATA%\HeLpER\backups` |
| macOS | `~/Library/Application Support/HeLpER` | Same | Same | Same |
| Linux | `~/.config/helper` | `~/.local/share/helper` | `~/.local/share/helper/logs` | `~/.local/share/helper/backups` |

### File Structure
```
HeLpER/
├── config.json          # User settings
├── data/
│   └── helper.db        # SQLite database
├── logs/
│   └── helper.log       # Rolling log file (max 5MB)
└── backups/
    ├── 2025-12-26.db    # Daily backup
    └── ...
```

---

## Ollama Integration

### Connection Handling
| State | Behavior |
|-------|----------|
| Connected | Green status indicator, chat enabled |
| Connecting | Yellow indicator, "Connecting..." message |
| Disconnected | Gray indicator, chat input disabled |
| Error | Red indicator, error message shown |

### Health Check
- Ping `/api/tags` endpoint on startup
- Retry connection every 30 seconds if failed
- Background check every 5 minutes when connected

### API Endpoints Used
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tags` | GET | List available models, health check |
| `/api/chat` | POST | Conversational AI responses |
| `/api/generate` | POST | Single-shot generation |

### Request Configuration
```typescript
interface OllamaRequest {
  model: string;
  messages: ChatMessage[];
  stream: false;          // No streaming for simplicity
  options: {
    temperature: number;  // 0.7 default
    num_predict: number;  // Max tokens (500)
  };
}
```

### System Prompt
```
You are HeLpER, a friendly assistant embedded in a note-taking app.
Your role is to help users:
- Format and structure their notes
- Expand brief notes into detailed content
- Summarize long notes
- Suggest improvements

Keep responses concise and practical. Match the user's tone.
When given a note for context, reference it naturally.
```

### Quick Actions
| Action | Prompt Template |
|--------|-----------------|
| Format | "Format this note with clear structure and bullet points:\n\n{note}" |
| Expand | "Expand this brief note into 2-3 detailed paragraphs:\n\n{note}" |
| Summarize | "Summarize this note in 2-3 bullet points:\n\n{note}" |
| Fix Grammar | "Fix any grammar or spelling errors in this note:\n\n{note}" |
| Make Professional | "Rewrite this note in a professional tone:\n\n{note}" |

---

## First Run Experience

### Setup Wizard Steps
1. **Welcome Screen**
   - App introduction
   - Privacy notice (all data local)

2. **Theme Selection**
   - Light / Dark / System
   - Preview of each theme

3. **Ollama Setup** (optional)
   - Check if Ollama installed
   - Instructions if not found
   - Model selection if available
   - "Skip for now" option

4. **Quick Tour**
   - Highlight key UI elements
   - Show keyboard shortcuts
   - "Start Writing" button

### Default First Note
```markdown
Welcome to HeLpER!

This is your first note. Here are some tips:

- Each day gets its own notes
- Use the arrows to navigate between days
- Click the AI panel below to get writing help
- Press Ctrl/Cmd + N for a new note

Happy writing!
```

---

## Error Handling

### User-Facing Errors
| Error Type | Message | Action |
|------------|---------|--------|
| Save Failed | "Couldn't save note. Retrying..." | Auto-retry 3x, then prompt |
| Ollama Unavailable | "AI assistant offline" | Show reconnect button |
| Model Not Found | "Model '{name}' not installed" | Link to Ollama docs |
| Storage Full | "Storage full. Free up space." | Show data folder path |
| Corrupt Data | "Note data corrupted" | Offer backup restore |

### Recovery Strategies
| Scenario | Strategy |
|----------|----------|
| App crash | Restore window state on next launch |
| Unsaved changes | Auto-recover from last auto-save |
| Database corruption | Restore from most recent backup |
| Settings corruption | Reset to defaults |

---

## Logging

### Log Levels
| Level | Usage |
|-------|-------|
| ERROR | Failures requiring attention |
| WARN | Unexpected but handled situations |
| INFO | Key application events |
| DEBUG | Detailed troubleshooting (dev only) |

### Log Format
```
[2025-12-26T14:30:00.000Z] [INFO] App started (v1.0.0)
[2025-12-26T14:30:01.123Z] [INFO] Database loaded (1,234 notes)
[2025-12-26T14:30:02.456Z] [INFO] Ollama connected (llama3.2:3b)
[2025-12-26T14:35:15.789Z] [WARN] Ollama connection lost, retrying...
```

### Log Rotation
- Maximum file size: 5 MB
- Keep last 3 rotated files
- Auto-cleanup on startup

---

## Backup & Restore

### Automatic Backups
- Full SQLite database copy
- Compressed with gzip
- Naming: `YYYY-MM-DD_HHmmss.db.gz`
- Default retention: 7 days

### Manual Export
| Format | Contents |
|--------|----------|
| Markdown | One `.md` file per day |
| JSON | Full database export |
| Plain Text | Simple `.txt` files |

### Import
- Support importing from JSON export
- Merge with existing notes (skip duplicates)
- Preview changes before applying

---

## Accessibility

### Screen Reader Support
- All UI elements have ARIA labels
- Focus management for modals
- Announce state changes

### Keyboard Navigation
- Full keyboard accessibility
- Visible focus indicators
- Logical tab order

### Visual
- Minimum contrast ratio: 4.5:1
- Respects system font size
- No reliance on color alone

### Motion
- Respects `prefers-reduced-motion`
- Minimal animations by default

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Cold start | < 1.5 seconds |
| Hot start (from tray) | < 200ms |
| Note switch | < 50ms |
| Auto-save | < 100ms |
| AI response start | < 500ms (after Ollama) |
| Memory usage | < 100 MB (idle) |
| Binary size | < 20 MB |
| Database (10k notes) | < 50 MB |

---

## Build & Distribution

### Package Formats
| OS | Format | Installer |
|----|--------|-----------|
| Windows | `.msi`, `.exe` | NSIS / WiX |
| macOS | `.dmg`, `.app` | Native bundle |
| Linux | `.deb`, `.rpm`, `.AppImage` | Standard packages |

### Code Signing
| OS | Method |
|----|--------|
| Windows | EV Code Signing Certificate |
| macOS | Apple Developer ID |
| Linux | GPG signature |

### Auto-Update
- Check for updates on startup (daily)
- Download in background
- Apply on next restart
- Optional: disable auto-update

---

## Testing Strategy

### Unit Tests
- Core logic (date handling, storage)
- Utility functions
- Target: 80% coverage

### Integration Tests
- Database operations
- Ollama API mocking
- Settings persistence

### E2E Tests
- Critical user flows
- Cross-platform smoke tests

### Manual QA Checklist
- [ ] Fresh install on each OS
- [ ] Upgrade from previous version
- [ ] System tray behavior
- [ ] Keyboard shortcuts
- [ ] Theme switching
- [ ] Ollama connection states

---

## Feature Roadmap

### Phase 1: MVP (v0.1)
- [x] Project setup (Tauri + Svelte)
- [ ] Basic note editor
- [ ] Daily navigation
- [ ] Local SQLite storage
- [ ] System tray integration
- [ ] Light/dark theme

### Phase 2: AI Integration (v0.5)
- [ ] Ollama connection manager
- [ ] Chat panel UI
- [ ] Quick actions (format, expand)
- [ ] Graceful offline mode
- [ ] Settings panel

### Phase 3: Polish (v1.0)
- [ ] Keyboard shortcuts
- [ ] Search across notes
- [ ] Backup/restore
- [ ] Export (Markdown, JSON)
- [ ] First-run wizard
- [ ] Auto-update

### Future Considerations
- Cloud sync (optional, privacy-focused)
- Mobile companion app
- Plugin system
- Markdown preview
- Tags/categories
- Calendar view

---

## Security Considerations

### Data Protection
| Aspect | Implementation |
|--------|----------------|
| Storage | Local only, no cloud by default |
| Encryption | Optional SQLCipher encryption |
| Credentials | None stored (Ollama is local) |
| Permissions | Minimal OS permissions |

### Network
- Only outbound connection: local Ollama
- No telemetry or analytics
- No external API calls
- Update checks use HTTPS

### Privacy
- No data collection
- No usage tracking
- Notes never leave device
- Open source for audit

---

## Command Line Arguments

| Argument | Description |
|----------|-------------|
| `--minimized` | Start minimized to tray |
| `--new-note` | Open with new note focused |
| `--date YYYY-MM-DD` | Open to specific date |
| `--reset-settings` | Reset to default settings |
| `--portable` | Use current directory for data |
| `--version` | Print version and exit |
| `--help` | Show help and exit |

---

## Internationalization

### Supported Locales (v1.0)
- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)

### Implementation
- ICU message format
- System locale detection
- Manual override in settings
- RTL support planned for v1.1

---

## Support & Feedback

| Resource | Location |
|----------|----------|
| Documentation | `/docs` in repository |
| Issue Tracker | GitHub Issues |
| Discussions | GitHub Discussions |
| Email | helper@example.com |

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | TBD | Initial public release |
| 0.5.0 | TBD | AI integration beta |
| 0.1.0 | TBD | MVP with core features |

---

*Spec Version: 2.0*
*Last Updated: December 2025*
*Status: Draft*
