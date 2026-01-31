# HeLpER - Claude Code Guide

## Project Overview

HeLpER (Helpful Lightweight Personal Everyday Recorder) is a privacy-first personal journal desktop application built with Tauri (Rust backend) and Svelte (TypeScript frontend). It emphasizes local-first architecture, AI-powered assistance via Ollama, and blockchain publishing through NatLangChain.

## Tech Stack

- **Frontend**: Svelte 4, TypeScript 5.4, Vite 5.2, Tailwind CSS 3.4
- **Backend**: Tauri 2.0, Rust (2021 edition), SQLite via SQLx
- **Testing**: Vitest (unit), Playwright (e2e)
- **External APIs**: Ollama (local LLM), WeatherAPI.com, NatLangChain

## Directory Structure

```
src/                    # Svelte frontend
  components/           # 13 Svelte UI components
  lib/
    services/           # API integration (tauri, weather, natlangchain, export, stt)
    stores/             # Svelte stores (notes, settings, chat, ui, weather, stt)
    utils/              # Helper functions (date, note)
    types.ts            # TypeScript interfaces
    constants.ts        # App constants

src-tauri/              # Rust backend
  src/
    main.rs             # Entry point
    lib.rs              # Tauri setup
    commands.rs         # IPC command handlers (13 commands)
    database.rs         # SQLite operations
    ollama.rs           # Ollama API client
    natlangchain.rs     # Blockchain publishing
    weather.rs          # Weather API client
    tray.rs             # System tray functionality

tests/                  # Unit tests
e2e/                    # End-to-end tests
docs/                   # Documentation
scripts/                # Build automation
```

## Key Commands

```bash
# Development
npm run dev             # Vite dev server (port 1420)
npm run tauri dev       # Full Tauri app with hot reload

# Build
npm run build           # Production frontend build
npm run tauri build     # Create desktop binary

# Testing
npm test                # Run unit tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:e2e        # Playwright e2e tests

# Code Quality
npm run check           # TypeScript type checking
npm run lint            # ESLint analysis
npm run lint:fix        # Auto-fix lint issues
npm run format          # Prettier formatting
```

## Code Conventions

### TypeScript/Svelte
- Strict TypeScript mode enabled
- 2 spaces indentation, single quotes, trailing commas
- 100 character line width
- Component-scoped styles in Svelte files

### Rust
- Standard Rust formatting (cargo fmt)
- Async functions use Tokio runtime
- SQLx for type-safe database queries

### State Management
- Svelte writable stores for mutable state
- Derived stores for computed values
- Optimistic updates with rollback on error
- Settings persisted via Tauri store plugin

## Important Files

| File | Purpose |
|------|---------|
| `src/components/App.svelte` | Root app component, main layout |
| `src/components/NoteEditor.svelte` | Note editing interface |
| `src/components/ChatPanel.svelte` | AI chat interface |
| `src/lib/stores/notes.ts` | Note state management |
| `src/lib/stores/settings.ts` | User preferences |
| `src/lib/services/tauri.ts` | Tauri IPC wrappers |
| `src/lib/types.ts` | All TypeScript interfaces |
| `src-tauri/src/commands.rs` | Backend IPC handlers |
| `src-tauri/src/database.rs` | SQLite operations |
| `src-tauri/src/ollama.rs` | Ollama integration |

## Tauri IPC Commands

Backend commands available via `@tauri-apps/api/core`:
- `get_notes_for_date`, `create_note`, `update_note`, `delete_note`
- `check_database_health`, `check_ollama_status`
- `send_chat_message`, `get_journal_context`
- `get_weather`, `detect_location`
- `nlc_validate_entry`, `nlc_publish_entry`, `nlc_get_stats`

## Testing Guidelines

- Unit tests in `tests/` directory using Vitest
- Test setup in `tests/setup.ts` mocks Tauri and browser APIs
- E2E tests in `e2e/` using Playwright
- Run `npm test` before committing changes

## Database

- SQLite database: `helper.db`
- Soft delete via `deleted_at` timestamps
- ISO 8601 date/time format
- Schema managed in `src-tauri/src/database.rs`

## Error Handling

- Frontend: `TauriServiceError` class in services
- Backend: Rust Result types with descriptive errors
- Graceful degradation when AI/weather unavailable

## Security Notes

- Local-first: all data stays on device
- Optional Boundary-SIEM integration (see `security-config.json`)
- CSP configured in `src-tauri/tauri.conf.json`
- Never log sensitive user content

## Feature Flags

Key settings in `src/lib/stores/settings.ts`:
- `ai.enabled` - Ollama integration
- `weather.enabled` - Weather context
- `weather.includeInContext` - Add weather to AI prompts
- `data.autoSave` - Auto-save notes
