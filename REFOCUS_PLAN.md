# HeLpER REFOCUS PLAN

**Goal:** Transform HeLpER from a fragmented multi-product into a focused, best-in-class private journal with local AI.

**Guiding Principle:** Every line of code should serve a person sitting down to write in their journal. If it doesn't, it goes.

**Estimated Net Effect:** Remove ~2,200 lines. Add ~1,500 lines of core improvements. The app gets smaller, simpler, and better at its actual job.

---

## PHASE 1: Strip the Security Theater

**Why first:** This code has zero integration with the actual app. It's dead weight with no dependency chain. Removing it is risk-free and sets the tone for the refocus.

**Scope:** ~450 lines removed, 0 lines added

### Files to DELETE entirely

| File | Lines | What it is |
|------|-------|------------|
| `scripts/security-integration.ps1` | 400 | PowerShell module pretending to talk to Boundary-SIEM and boundary-daemon. All endpoints are fictional (`localhost:8080`, `localhost:9090`). Functions like `Invoke-SecureOperation` and `Protect-NetworkConnection` do nothing real. |
| `security-config.json` | 43 | Config file for the above. References a Unix socket path (`/var/run/boundary-daemon.sock`) and "tripwire rules" for a personal journal. |

### Files to EDIT

| File | Change | Detail |
|------|--------|--------|
| `README.md` | Remove "Security Integration" section | Lines 246-281: Delete the entire Boundary-SIEM and boundary-daemon sections. Remove the `security-config.json` and `scripts/security-integration.ps1` entries from the project structure diagram (lines 175-180). |
| `startup-windows.bat` | Remove security-integration references | Strip any lines that source or call `security-integration.ps1`. |
| `assemble-windows.bat` | Remove security-integration references | Strip any lines referencing `security-config.json` or security module setup. |
| `SECURITY.md` | Simplify | Remove claims about Boundary-SIEM/boundary-daemon integration. Keep the vulnerability reporting policy. |
| `claude.md` | Remove boundary references | Strip mentions of boundary-daemon and Boundary-SIEM from the project context docs. |

### Verification

- `grep -r "boundary\|Boundary\|SIEM\|security-integration\|security-config" src/ src-tauri/` should return nothing
- `npm test` passes (no source code touched)
- `cargo clippy` passes (no Rust code touched)

---

## PHASE 2: Extract NatLangChain into its Own Repo

**Why second:** This is the largest single extraction (~1,650 lines) and touches every layer of the stack. Do it as one coherent phase so the codebase is clean before building new things.

**Scope:** ~1,650 lines removed across frontend, backend, tests, types, constants, and settings

### Step 2A: Delete NatLangChain-dedicated files

| File | Lines | What it is |
|------|-------|------------|
| `src/components/PublishPanel.svelte` | 834 | Full publishing UI: content type selector, story metadata form, article metadata form, monetization controls, AI editing tools, validation display, preview panel. Largest component in the app by 4x. |
| `src/lib/services/natlangchain.ts` | 341 | Frontend service: `validateEntry()`, `publishEntry()`, `getAuthorStats()`, `checkConnection()`, `noteToEntry()`, content type detection heuristics, intent suggestion, chapter extraction. |
| `src-tauri/src/natlangchain.rs` | 437 | Rust API client: 9 structs for API request/response shapes, `validate_entry()`, `publish_entry()`, `get_author_stats()`, `check_connection()`, `create_entry()`, `build_metadata()`. Contains `ChainStats` with 3 fields hardcoded to 0. |
| `tests/services/natlangchain.test.ts` | 356 | Test suite for the above service. |

### Step 2B: Remove NatLangChain types from shared files

**`src/lib/types.ts`** - Delete lines 171-272 (101 lines):
- `MonetizationModel` type (line 172)
- `EntryVisibility` type (line 173)
- `ContentType` type (line 174)
- `StoryMetadata` interface (lines 177-187)
- `ArticleMetadata` interface (lines 190-200)
- `ArticleCategory` type (lines 202-210)
- `NatLangChainEntry` interface (lines 212-236)
- `NatLangChainValidation` interface (lines 238-244)
- `NatLangChainPublishResult` interface (lines 246-252)
- `NatLangChainStats` interface (lines 254-259)
- `NatLangChainSettings` interface (lines 261-272)

**`src/lib/types.ts`** - Edit `Settings` interface (line 94-101):
- Remove `natLangChain: NatLangChainSettings` from the `Settings` interface

### Step 2C: Remove NatLangChain constants and defaults

**`src/lib/constants.ts`** - Delete `DEFAULT_NATLANGCHAIN_SETTINGS` (lines 66-77):
```
export const DEFAULT_NATLANGCHAIN_SETTINGS: NatLangChainSettings = {
  enabled: false,
  apiUrl: 'http://localhost:5000',
  ...
};
```
- Remove the `NatLangChainSettings` import at the top of the file

### Step 2D: Remove NatLangChain from settings store

**`src/lib/stores/settings.ts`** - Edits:
- Remove `DEFAULT_NATLANGCHAIN_SETTINGS` from import
- Remove `natLangChain: DEFAULT_NATLANGCHAIN_SETTINGS` from the default settings object
- Remove any NatLangChain-specific update logic

### Step 2E: Remove NatLangChain from components

**`src/components/NoteEditor.svelte`**:
- Remove `PublishPanel` import (line 17)
- Remove `publishPanelOpen` state variable (line 20)
- Remove the "Publish" button block (lines 128-144)
- Remove the `<PublishPanel>` component at bottom (lines 184-191)
- Remove the `settings` import if only used for NatLangChain check

**`src/components/SettingsPanel.svelte`**:
- Remove `checkConnection` import from natlangchain service (line 9)
- Remove `checkingNlc` and `nlcConnected` state variables (lines 13-14)
- Remove `handleCheckNlcConnection()` function (lines 23-41)
- Remove `handleNlcMonetizationChange()` function (lines 16-21)
- Remove the entire "NatLangChain Publishing" settings section (lines 426-565, ~140 lines)
- Remove `MonetizationModel` from type imports (line 8)

### Step 2F: Remove NatLangChain from Rust backend

**`src-tauri/src/commands.rs`**:
- Remove `use crate::natlangchain;` import (line 4)
- Delete the 4 NatLangChain command handlers (lines 214-247):
  - `nlc_validate_entry`
  - `nlc_publish_entry`
  - `nlc_get_stats`
  - `nlc_check_connection`

**`src-tauri/src/lib.rs`**:
- Remove `mod natlangchain;` declaration (line 3)
- Remove 4 command registrations from `invoke_handler` (lines 47-50):
  - `commands::nlc_validate_entry`
  - `commands::nlc_publish_entry`
  - `commands::nlc_get_stats`
  - `commands::nlc_check_connection`

### Step 2G: Remove NatLangChain from test files that import its types

**`tests/constants.test.ts`** - Remove any tests validating `DEFAULT_NATLANGCHAIN_SETTINGS`.

**`tests/types.test.ts`** - Remove any tests for NatLangChain types (`MonetizationModel`, `ContentType`, `StoryMetadata`, etc.).

**`tests/stores/settings.test.ts`** - Remove NatLangChain-related settings tests.

### Step 2H: Clean up documentation

**`README.md`**:
- Remove the "NatLangChain Publishing" feature section (lines 34-42)
- Remove NatLangChain from the tech stack table (line 124)
- Remove `PublishPanel.svelte`, `natlangchain.ts`, `natlangchain.rs` from project structure
- Remove NatLangChain from Settings Categories table (line 243)
- Simplify the tagline (line 5) - remove "natural language blockchain publishing via NatLangChain"

**`docs/USER_GUIDE.md`** - Remove NatLangChain sections.

**`CHANGELOG.md`** - No changes needed (historical record is fine).

**`CONTRIBUTING.md`** - Remove NatLangChain-specific contributing context if present.

### Verification

```bash
# No NatLangChain references in source code
grep -r "natLangChain\|NatLangChain\|natlangchain\|nlc_\|blockchain\|ContentType\|MonetizationModel\|EntryVisibility\|StoryMetadata\|ArticleMetadata" src/ src-tauri/src/ tests/

# TypeScript compiles
npm run check

# All tests pass
npm test

# Rust compiles and lints clean
cd src-tauri && cargo clippy -- -D warnings && cargo fmt --check
```

### Preserve for future

Before deleting, consider copying the NatLangChain code to a separate repo (`HeLpER-NatLangChain-Publisher` or similar) so the work isn't lost. This can become a standalone Tauri app if the NatLangChain ecosystem matures.

---

## PHASE 3: Strengthen the Core Editor

**Why third:** With distractions removed, the codebase is clean and focused. Now invest in the actual product. `NoteEditor.svelte` is only 191 lines - the thing users interact with most is the thinnest part of the app.

**Scope:** ~600-800 lines added across frontend and backend

### 3A: Markdown Support

**What:** Add basic Markdown rendering with a write/preview toggle.

**Files:**
- `src/components/NoteEditor.svelte` - Add preview toggle button and markdown render view
- `src/lib/utils/markdown.ts` (new) - Lightweight markdown-to-HTML converter (use a small library like `marked` or `snarkdown`, or roll a minimal one for headers, bold, italic, lists, links, code blocks)
- `package.json` - Add markdown dependency if using external library

**Why this matters:** Every competing journal app (Obsidian, Logseq, Joplin) supports Markdown. Users expect it. This is table stakes.

### 3B: Note Tagging

**What:** Let users add tags to notes for organization beyond date-based navigation.

**Files:**
- `src/lib/types.ts` - Add `tags: string[]` to `Note` interface
- `src-tauri/src/database.rs` - Add `tags` column to notes table (TEXT, comma-separated or JSON), add migration logic
- `src-tauri/src/commands.rs` - Update note CRUD to handle tags
- `src/components/NoteEditor.svelte` - Add tag input UI below the editor
- `src/components/NotesList.svelte` - Show tags on note cards, add tag filter
- `src/lib/stores/notes.ts` - Add tag-based filtering to derived stores

**Schema change:**
```sql
ALTER TABLE notes ADD COLUMN tags TEXT DEFAULT '';
CREATE INDEX idx_notes_tags ON notes(tags);
```

**Why this matters:** Date-only organization breaks down after a few weeks of use. Tags are the minimum viable organization system.

### 3C: Improved Search

**What:** Upgrade search from basic text matching to include tag search and highlighted results.

**Files:**
- `src/components/NotesList.svelte` - Add search result highlighting, show matching context snippets
- `src/lib/stores/ui.ts` - Add search mode state (content vs. tags vs. all)
- `src-tauri/src/commands.rs` - Add a `search_notes` command that searches across all dates

**Backend command:**
```rust
#[tauri::command]
pub async fn search_notes(
    query: String,
    db: State<'_, DbPool>,
) -> Result<Vec<Note>, String> {
    // Full-text search across all non-deleted notes
}
```

**Why this matters:** Currently search only works within the current date's notes. A journal needs global search to be useful as a knowledge base.

### Verification

- Manual testing: create notes with Markdown, add tags, search across dates
- `npm test` passes with new test coverage for tags and search
- `npm run check` passes

---

## PHASE 4: Deepen AI Integration

**Why fourth:** The Ollama integration is HeLpER's primary differentiator vs. Obsidian/Joplin. With the editor strengthened, expand what the AI can do within the journal context.

**Scope:** ~400-500 lines added

### 4A: Weekly Summary Generation

**What:** Add a "Week in Review" button that sends the last 7 days of notes to Ollama and generates a summary.

**Files:**
- `src/components/ChatPanel.svelte` - Add "Summarize This Week" quick action
- `src/lib/stores/notes.ts` - Add `getNotesForDateRange()` function
- `src-tauri/src/commands.rs` - Add `get_notes_for_range` command

**Prompt template:**
```
Here are my journal entries from the past week. Please provide a brief summary
of key themes, decisions made, and emotional patterns:

{notes}
```

**Why this matters:** This is the kind of AI feature that justifies having a local LLM. It turns a pile of daily notes into actionable self-reflection. No cloud-based competitor can do this without shipping your diary to a server.

### 4B: Mood Detection from Entries

**What:** After saving a note, optionally run a lightweight Ollama prompt to detect mood and display it in the journal context bar.

**Files:**
- `src/lib/types.ts` - Add `mood?: string` to `Note` interface or `JournalContext`
- `src/components/JournalContext.svelte` - Display detected mood
- `src/lib/stores/notes.ts` - Trigger mood detection after save (if AI connected)

**Why this matters:** Mood tracking is a top requested feature in journaling apps. Doing it automatically via local AI is a unique selling point.

### 4C: Smart Prompts Based on Context

**What:** Use the journal context (time of day, weather, day of week) to offer contextual writing prompts.

**Files:**
- `src/components/NoteEditor.svelte` - Show a contextual prompt in the placeholder text
- `src/lib/utils/prompts.ts` (new) - Logic to generate prompts based on context

**Examples:**
- Monday morning + rain: "It's a rainy Monday. What's on your mind for the week ahead?"
- Friday evening + clear: "The week is wrapping up. What went well?"
- Sunday night: "Tomorrow starts a new week. Any intentions to set?"

**Why this matters:** A blank page is intimidating. Contextual prompts reduce friction and make the journal feel alive.

### Verification

- Manual testing with Ollama running locally
- Verify graceful degradation when Ollama is not available
- `npm test` passes

---

## PHASE 5: Polish and Ship

**Why last:** Features are complete. Now make it release-ready.

**Scope:** ~200-300 lines of changes

### 5A: Update Documentation

**Files:**
- `README.md` - Rewrite to reflect the focused product. Lead with privacy + local AI. Remove all blockchain/security/multi-format language. Keep it under 150 lines.
- `docs/USER_GUIDE.md` - Update to match new feature set (tags, markdown, AI features)
- `CHANGELOG.md` - Add v0.2.0 entry documenting the refocus

**New README tagline:**
> A privacy-first desktop journal with local AI. All your thoughts stay on your device.

### 5B: Update Onboarding

**Files:**
- `src/components/FirstRunWizard.svelte` - Remove NatLangChain setup step if present. Add a step showing the Markdown preview toggle. Simplify to: Theme > Ollama > Weather > Done.

### 5C: CI/CD Cleanup

**Files:**
- `.github/workflows/ci.yml` - No structural changes needed (already clean)
- Verify multi-platform builds still succeed after all removals

### 5D: Version Bump

**Files:**
- `package.json` - Bump to `0.2.0`
- `src-tauri/tauri.conf.json` - Bump version
- `src-tauri/Cargo.toml` - Bump version
- `CHANGELOG.md` - Document v0.2.0 as the "refocus release"

### Verification

```bash
npm run check        # TypeScript clean
npm test             # All tests pass
npm run lint         # No lint errors
npm run build        # Production build succeeds
cd src-tauri && cargo clippy -- -D warnings  # Rust clean
```

---

## Summary

| Phase | Action | Lines Removed | Lines Added | Risk |
|-------|--------|---------------|-------------|------|
| 1 | Strip security theater | ~450 | 0 | None - dead code |
| 2 | Extract NatLangChain | ~1,650 | 0 | Medium - touches every layer |
| 3 | Strengthen editor | 0 | ~700 | Low - additive |
| 4 | Deepen AI | 0 | ~450 | Low - additive |
| 5 | Polish and ship | ~100 | ~200 | Low - docs and config |
| **Total** | | **~2,200** | **~1,350** | |

**Net result:** The app shrinks by ~850 lines while gaining Markdown support, tagging, global search, weekly AI summaries, mood detection, and contextual writing prompts. Every remaining line serves the core user: someone sitting down to write in their private journal.

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Cut NatLangChain entirely (not just hide it) | Code that exists gets maintained. Hidden features still create bugs. If NatLangChain matures, build a dedicated client. |
| Cut security integrations | The services don't exist. The code is fictional. Keeping it misleads contributors and users. |
| Keep weather/moon phase | It's small (~350 lines), genuinely charming, and adds journal context that users enjoy. It doesn't distract from the core. |
| Keep STT | Voice input is an accessibility feature. The implementation is clean (~250 lines) and uses browser-native APIs with no extra dependencies. |
| Markdown before tags | Markdown is expected by every user on day 1. Tags become important after a few weeks. Ship what matters first. |
| Weekly summary before mood detection | Summarization is a proven LLM use case. Mood detection needs more UX thought (where to display, how to handle inaccuracy). |
