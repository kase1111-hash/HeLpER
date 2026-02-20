# HeLpER - Claude Code Guide

## Project Overview

HeLpER (Helpful Lightweight Personal Everyday Recorder) is a privacy-first personal journal desktop application built with Tauri (Rust backend) and Svelte (TypeScript frontend). It features local AI assistance via Ollama, weather-aware journal context, optional NatLangChain blockchain publishing, and a security layer including OS keychain storage, HMAC integrity, Ed25519 author signing, and audit logging.

## Tech Stack

- **Frontend**: Svelte 4, TypeScript 5.4, Vite 5.2, Tailwind CSS 3.4
- **Backend**: Tauri 2.0, Rust (2021 edition), SQLite via SQLx
- **Testing**: Vitest (unit), Playwright (e2e)
- **External APIs**: Ollama (local LLM), WeatherAPI.com, NatLangChain
- **Security**: keyring (OS credential storage), ed25519-dalek (author signing), hmac + sha2 (integrity)

## Directory Structure

```
src/                    # Svelte frontend
  components/           # 13 Svelte UI components
  lib/
    services/           # API integration (tauri, weather, natlangchain, export, stt)
    stores/             # Svelte stores (notes, settings, chat, ui, weather, stt)
    utils/              # Helper functions (date, note, secretScanner)
    types.ts            # TypeScript interfaces
    constants.ts        # App constants

src-tauri/              # Rust backend
  src/
    main.rs             # Entry point
    lib.rs              # Tauri setup, module registration
    commands.rs         # IPC command handlers (22 commands)
    database.rs         # SQLite operations + migrations (notes, audit_log tables)
    ollama.rs           # Ollama API client
    natlangchain.rs     # Blockchain publishing API client
    weather.rs          # Weather API client
    integrity.rs        # HMAC-SHA256 settings integrity
    author_identity.rs  # Ed25519 keypair management and content signing
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
- Secrets stored in OS keychain (never in settings JSON)

## Important Files

| File | Purpose |
|------|---------|
| `src/components/App.svelte` | Root app component, main layout |
| `src/components/NoteEditor.svelte` | Note editing interface |
| `src/components/ChatPanel.svelte` | AI chat interface with audit logging |
| `src/components/PublishPanel.svelte` | NatLangChain publishing with secret scanning |
| `src/lib/stores/notes.ts` | Note state management |
| `src/lib/stores/settings.ts` | Settings with keychain + HMAC integrity |
| `src/lib/services/tauri.ts` | Tauri IPC wrappers (all 22 commands) |
| `src/lib/services/natlangchain.ts` | NatLangChain with signing + secret scanning |
| `src/lib/utils/secretScanner.ts` | Regex-based credential detection |
| `src/lib/types.ts` | All TypeScript interfaces |
| `src-tauri/src/commands.rs` | Backend IPC handlers |
| `src-tauri/src/database.rs` | SQLite schema + migrations |
| `src-tauri/src/integrity.rs` | HMAC-SHA256 for settings integrity |
| `src-tauri/src/author_identity.rs` | Ed25519 keypair and content signing |

## Tauri IPC Commands

Backend commands available via `@tauri-apps/api/core`:

**Notes:** `get_notes_for_date`, `create_note`, `update_note`, `delete_note`
**System:** `check_database_health`, `check_ollama_status`
**AI:** `send_chat_message`, `get_journal_context`
**Weather:** `get_weather`, `detect_location`
**NatLangChain:** `nlc_validate_entry`, `nlc_publish_entry`, `nlc_get_stats`, `nlc_check_connection`
**Secrets:** `store_secret`, `get_secret`, `delete_secret`
**Integrity:** `compute_settings_hmac`, `verify_settings_hmac`
**Audit:** `log_audit_event`, `get_audit_log`
**Author:** `nlc_get_author_public_key`, `nlc_sign_entry`

## Database Schema

```sql
-- Core tables
notes (id, date, title, content, created_at, updated_at, deleted_at, ai_provenance)
metadata (key, value)

-- Security tables
audit_log (id, event_type, event_data, timestamp, hash)
```

- Soft delete via `deleted_at` timestamps
- ISO 8601 date/time format
- `ai_provenance` tracks human vs AI-edited content
- `audit_log.hash` provides SHA-256 chain for tamper evidence

## Security Notes

- API keys stored in OS keychain, never in plaintext settings
- Settings file verified via HMAC on load
- All AI prompts use `---BEGIN/END USER CONTENT---` delimiters
- Pre-publish secret scanning with 11 regex patterns
- NatLangChain entries signed with Ed25519 before publish
- All HTTP clients have redirect following disabled
- CSP restricts connections to specific ports only

## Testing Guidelines

- Unit tests in `tests/` directory using Vitest
- Test setup in `tests/setup.ts` mocks Tauri and browser APIs
- E2E tests in `e2e/` using Playwright
- Run `npm test` before committing changes

## Error Handling

- Frontend: `TauriServiceError` class in services
- Backend: Rust Result types with descriptive errors
- Graceful degradation when AI/weather unavailable
- Audit logging failures never block normal operations

## Feature Flags

Key settings in `src/lib/stores/settings.ts`:
- `ai.enabled` - Ollama integration
- `weather.enabled` - Weather context
- `weather.includeInContext` - Add weather to AI prompts
- `natLangChain.enabled` - Blockchain publishing
- `data.autoSave` - Auto-save notes
