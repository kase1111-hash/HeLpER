# HeLpER - Specification Sheet

## Overview

**HeLpER** (Helpful Lightweight Personal Everyday Recorder) is a minimalist daily notes application with integrated AI assistance. It provides a streamlined interface for capturing daily thoughts and notes, with an embedded Ollama-powered chat assistant for note formatting and expansion.

---

## Core Features

### 1. Daily Notes System
| Feature | Description |
|---------|-------------|
| Daily Organization | Notes automatically organized by date |
| Navigation | Scroll/browse through each day's notes |
| Note Capacity | Paragraph-length notes per entry |
| Persistence | Notes saved locally for quick access |

### 2. AI Chat Assistant
| Feature | Description |
|---------|-------------|
| LLM Integration | Ollama local LLM model |
| Chat Window | Small, non-intrusive chat interface |
| Note Formatting | AI helps format and structure notes |
| Note Expansion | Extrapolate brief notes into detailed content |

### 3. System Tray Integration
| Feature | Description |
|---------|-------------|
| Minimize Behavior | Minimizes to system tray icon |
| Location | Icon appears next to system clock |
| Quick Access | Click to restore application |

---

## Technical Specifications

### Platform Requirements
| Specification | Details |
|--------------|---------|
| Target OS | Windows / Linux / macOS |
| Architecture | Desktop application |
| LLM Backend | Ollama (local installation required) |

### Recommended Technology Stack
| Component | Recommended Option | Alternatives |
|-----------|-------------------|--------------|
| Framework | Electron | Tauri, Qt |
| Frontend | React / Vue | Vanilla JS, Svelte |
| Styling | Tailwind CSS | CSS Modules, Styled Components |
| LLM API | Ollama REST API | - |
| Storage | SQLite / JSON files | IndexedDB, LevelDB |

### System Requirements
| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| RAM | 4 GB | 8 GB+ (for Ollama) |
| Storage | 100 MB (app) | 500 MB+ (with LLM models) |
| Display | 1280x720 | 1920x1080 |

---

## User Interface Specifications

### Main Window
```
+------------------------------------------+
|  HeLpER                          [_][X]  |
+------------------------------------------+
|  < [Date: Dec 26, 2025]            >     |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  |                                    |  |
|  |     [Note Content Area]            |  |
|  |     Paragraph-length notes         |  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  AI Chat Window                    |  |
|  |  > Format this note...             |  |
|  |  > Expand on this idea...          |  |
|  +------------------------------------+  |
|  [Type message...]              [Send]   |
+------------------------------------------+
```

### System Tray
- Minimizes to icon near system clock
- Single-click: Restore window
- Right-click: Context menu (Open, Settings, Quit)

---

## Data Model

### Note Structure
```json
{
  "id": "uuid",
  "date": "YYYY-MM-DD",
  "content": "string (paragraph text)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Chat History (Optional)
```json
{
  "id": "uuid",
  "note_id": "uuid (reference)",
  "messages": [
    { "role": "user", "content": "string" },
    { "role": "assistant", "content": "string" }
  ],
  "timestamp": "timestamp"
}
```

---

## Ollama Integration

### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /api/generate` | Text generation for note expansion |
| `POST /api/chat` | Conversational assistance |

### Recommended Models
| Model | Size | Use Case |
|-------|------|----------|
| llama3.2:1b | ~1 GB | Fast, lightweight responses |
| llama3.2:3b | ~2 GB | Better quality, still fast |
| mistral | ~4 GB | High quality formatting |

### Sample Prompts
- **Format**: "Format the following note with proper structure: {note}"
- **Expand**: "Expand this brief note into a detailed paragraph: {note}"
- **Summarize**: "Summarize the key points from: {note}"

---

## Feature Roadmap

### Phase 1: MVP
- [ ] Basic note editor with daily navigation
- [ ] Local storage for notes
- [ ] System tray minimize functionality

### Phase 2: AI Integration
- [ ] Ollama connection and health check
- [ ] Chat window UI
- [ ] Note formatting assistance
- [ ] Note expansion feature

### Phase 3: Polish
- [ ] Settings panel (LLM model selection, theme)
- [ ] Search functionality
- [ ] Export notes (PDF, Markdown)
- [ ] Keyboard shortcuts

---

## Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | App launch < 2 seconds |
| Memory | < 150 MB RAM (excluding Ollama) |
| Offline | Full functionality without internet |
| Privacy | All data stored locally |
| Accessibility | Keyboard navigation support |

---

## Security Considerations

- All notes stored locally (no cloud sync by default)
- Ollama runs locally - no data sent to external servers
- Optional: Encrypt note storage at rest

---

## Dependencies

### Required
- Ollama installed and running locally
- Compatible LLM model downloaded

### Optional
- System tray support (varies by OS/desktop environment)

---

*Spec Version: 1.0*
*Last Updated: December 2025*
