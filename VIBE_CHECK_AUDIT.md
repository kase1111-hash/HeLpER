# Vibe-Code Detection Audit v2.0 -- HeLpER

**Auditor:** Claude (Opus 4.6)
**Date:** 2026-02-22
**Codebase:** HeLpER v0.1.0-alpha (Tauri 2.0 / Svelte 4 / Rust)
**Total LOC reviewed:** ~3,700 source + ~500 test

> "The goal is NOT to shame AI-assisted development -- it's to find where AI-generated code lacks meaningful human review."

---

## Executive Summary

HeLpER is a privacy-first desktop journal application with local AI (Ollama), weather context, and optional blockchain publishing (NatLangChain). The entire commit history is authored by "Claude" with merges by a human maintainer. Despite AI-only authorship, the codebase demonstrates coherent architecture, real security implementations, and functional end-to-end call chains. Key deficiencies cluster around **shallow error surfacing**, a **database initialization race condition**, a **non-constant-time HMAC comparison** (labeled as constant-time), and **untested critical security paths**.

**Final Vibe-Code Confidence: 27.1% -- AI-Assisted, Human-Guided**

---

## Domain 1: Surface Provenance (20% weight)

| # | Criterion | Score | Evidence |
|---|-----------|-------|----------|
| 1.1 | Commit Patterns | 1/3 | 100% of code commits authored by "Claude". All branches follow `claude/*` pattern. Human (Kase Branham) only performs merge commits. No iterative human commit-test-fix cycles observed. `git log --format='%an' \| sort \| uniq -c`: Claude dominates entirely. |
| 1.2 | Comments & Documentation Style | 1/3 | Comments are sparse-but-formulaic JSDoc (`/** Validate an entry before publishing */`). Defensive inline comment at `src-tauri/src/weather.rs:146-148` explaining WeatherAPI query parameter limitation is a classic AI explanatory pattern. `claude.md` explicitly documents this as a Claude Code project. |
| 1.3 | Test Quality | 2/3 | 13 test files exist covering stores, services, and utils. All use `vi.mock()` to mock Tauri IPC -- tests verify mocked return values rather than real behavior. No edge case tests (malformed dates, Unicode, concurrent writes). **Critical gap:** No tests for `secretScanner.ts` or the `publishEntry` secret-scanning gate -- both are security-critical paths. No integration tests that exercise Rust backend. |
| 1.4 | Import Organization | 3/3 | Clean, grouped imports. Barrel files (`index.ts`) for services, stores, utils. No unused imports. Consistent across all files. |
| 1.5 | Naming Conventions | 3/3 | Consistent camelCase (TypeScript) / snake_case (Rust). `#[serde(rename_all = "camelCase")]` correctly bridges the boundary. Descriptive function names throughout. `TauriServiceError` class is well-named. |
| 1.6 | Documentation Volume | 1/3 | 9 documentation files (README, SECURITY, CONTRIBUTING, ROADMAP, CHANGELOG, KEYWORDS, AUDIT_REPORT, USER_GUIDE, claude.md) for a 0.1.0-alpha with ~3,700 LOC. This 2.4:1 doc-to-code ratio is characteristic of AI-generated projects that front-load documentation before the code justifies it. |
| 1.7 | Dependency Selection | 3/3 | Well-chosen stack: Tauri 2.0, SQLx (type-safe SQL), ed25519-dalek, keyring, chrono. No unnecessary dependencies. `Cargo.toml` release profile properly configured (LTO, strip, panic=abort). |

**Domain Average: 2.0/3.0 (14/21)**

---

## Domain 2: Behavioral Integrity (50% weight)

### 2.1 Error Handling -- Score: 2/3

**Pattern observed:** Every frontend service function wraps `invoke()` in try/catch and returns a fallback value.

```typescript
// src/lib/services/tauri.ts:23-31
export async function fetchNotesForDate(date: string): Promise<Note[]> {
  try {
    return await invoke<Note[]>('get_notes_for_date', { date });
  } catch (error) {
    const tauriError = new TauriServiceError(`Failed to fetch notes for date ${date}`, error);
    console.error(tauriError.message, { date, originalError: error });
    return []; // Silent fallback
  }
}
```

**Strength:** Consistent error wrapping with `TauriServiceError` class, structured console logging with context.

**Weakness:** Errors are caught but never surfaced to the user. The toast notification system (`src/lib/stores/ui.ts:23`) exists but is not used in any error path in the service layer. The user sees empty state instead of an error message when things fail.

**Backend:** All Rust commands use `.map_err(|e| e.to_string())?` -- no structured error types. Every error becomes a generic string.

### 2.2 Configuration -- Score: 2/3

**Strength:** Well-typed settings interfaces (`src/lib/types.ts:57-102`). Defaults in `constants.ts` are reasonable. Settings merge with defaults on load handles schema evolution. HMAC integrity on save/load is real protection. Secrets stored in OS keychain.

**Weakness:** No input validation on user-configurable values. The Ollama URL (`settings.ai.ollamaUrl`) accepts any string with no URL validation. Temperature has no range constraint. These are settings the user controls, but the lack of validation means malformed values could cause confusing downstream errors.

### 2.3 Call Chain Integrity -- Score: 2/3

**Traced complete call chains:**

**Note Save (end-to-end -- WORKS):**
`NoteEditor.svelte` -> debounce -> `updateNote()` (`stores/notes.ts:77`) -> optimistic update to `notesMap` -> `updateNoteInDb()` (`services/tauri.ts:43`) -> `invoke('update_note')` -> `commands.rs:110` -> `sqlx::query!` UPDATE -> returns `Note` -> on failure: rollback optimistic update

**Publish (end-to-end -- WORKS):**
`publishEntry()` (`services/natlangchain.ts:40`) -> `scanForSecrets()` gate -> `signEntry()` IPC -> `nlc_sign_entry` -> `author_identity.rs:44` Ed25519 sign -> `getAuthorPublicKey()` IPC -> `invoke('nlc_publish_entry')` -> `natlangchain.rs:292` HTTP POST -> audit log on success

**Database Init (RACE CONDITION):**
`lib.rs:30` spawns async task -> `database::initialize()` -> creates tables -> `app_handle.manage(DbPool(...))` registers state. But commands access `db: State<'_, DbPool>` which requires the state to be registered. If any IPC command fires before the spawn completes, Tauri's `State` extraction will panic because `DbPool` hasn't been managed yet. This is a startup race condition at `src-tauri/src/lib.rs:30-34`.

### 2.4 Async Correctness -- Score: 2/3

**Generally correct.** Async/await used properly throughout. No deadlock risk in DB pool mutex (lock is held only during query, not across awaits... actually the lock IS held across awaits: `let pool = db.0.lock().await;` then `sqlx::query!(...).execute(pool).await` -- the MutexGuard is held across the SQL await. This is safe with Tokio's Mutex but would deadlock with `std::sync::Mutex`).

**Tray listener setup issue at `src/lib/services/tauri.ts:208-228`:** The `listen()` calls are async and push to `unlisteners` via `.then()`. If the returned cleanup function is called before all `.then()` callbacks fire, some listeners won't be unregistered. Low risk in practice (cleanup only runs on component destroy) but indicates the code wasn't manually stress-tested.

**Health check recursion at `src/App.svelte:92-109`:** The `updateInterval()` function calls itself inside the setInterval callback. This works but creates unnecessary interval churn -- every health check destroys and recreates the interval. A simpler approach would use a single interval with conditional logic.

### 2.5 State Management -- Score: 3/3

**Genuine engineering depth:**
- Svelte stores with writable + derived correctly separated
- Optimistic updates with rollback in `notes.ts` (lines 52-75, 77-104, 106-133) -- all three mutation operations store previous state and revert on backend failure
- Weather cache with TTL (`stores/weather.ts:14-16`, 10-minute expiry keyed by `${apiKey}:${location}`)
- Panel state properly isolated in `stores/ui.ts`
- Settings persistence cycle: load -> merge defaults -> verify HMAC -> subscribe -> save with HMAC

This is the strongest signal of coherent design in the codebase.

### 2.6 Security Implementation -- Score: 2/3

**Real implementations:**
- OS keychain via `keyring` crate for API keys and HMAC key storage (`integrity.rs:12`, `author_identity.rs:12-15`)
- Ed25519 signing using `ed25519-dalek` with `OsRng` (`author_identity.rs:25`)
- Secret scanner with 11 regex patterns (`utils/secretScanner.ts:3-15`)
- CSP properly restricts `connect-src` (`tauri.conf.json:32`)
- HTTP redirect following disabled on all clients (`reqwest::redirect::Policy::none()`)
- Prompt injection defense via `---BEGIN/END USER CONTENT---` delimiters (`constants.ts:84`)

**CRITICAL FINDING -- Non-constant-time HMAC comparison:**
```rust
// src-tauri/src/integrity.rs:41-44
pub fn verify_hmac(data: &[u8], key: &[u8], expected_hex: &str) -> bool {
    let computed = compute_hmac(data, key);
    // Constant-time comparison   <-- COMMENT IS WRONG
    computed == expected_hex       // <-- This is NOT constant-time
}
```
The comment claims constant-time comparison but the code uses Rust's `==` operator on strings, which short-circuits. For settings HMAC this is low-severity (local attacker model), but the misleading comment suggests this wasn't manually reviewed.

**Audit hash chain never verified:** `commands.rs:267-313` builds a SHA-256 hash chain with `genesis` seed but `get_audit_log` (`commands.rs:316-363`) only retrieves entries -- there is no `verify_audit_chain` command anywhere in the codebase. The chain provides tamper evidence on paper but is never actually checked.

### 2.7 Resource Management -- Score: 3/3

- HTTP clients created per-request (acceptable for infrequent calls in a journal app)
- SQLite pool capped at 5 connections (`database.rs:26`)
- `App.svelte:139-149` properly cleans up: tray listeners, date subscription, health check interval
- No detectable memory leaks from store subscriptions

**Domain Average: 2.29/3.0 (16/21)**

---

## Domain 3: Interface Authenticity (30% weight)

### 3.1 API Consistency -- Score: 2/3

Tauri IPC commands use consistent `#[serde(rename_all = "camelCase")]` across all struct definitions. Frontend services uniformly wrap `invoke()` with try/catch. Return conventions are consistent: `null` for single failures, `[]` for collection failures, `false` for boolean failures.

**Placeholder leakage:** `NatLangChainStats` includes `totalEarnings`, `subscribers`, and `views` fields that are always 0 because NatLangChain doesn't track them (`natlangchain.rs:403-408`). The Rust code has honest comments ("Not tracked by NatLangChain") but the TypeScript type (`types.ts:258-263`) presents them as real fields. This suggests the interface was designed aspirationally before confirming what the API actually provides.

### 3.2 UI Component Depth -- Score: 3/3

13 Svelte components with clear responsibility separation. Custom title bar (decorations disabled). System tray with full menu (`tray.rs`). Toast notification system. First-run wizard. Calendar picker. Keyboard shortcuts (Ctrl+N, Ctrl+F, Ctrl+,, Escape). Custom Tailwind theme with earth-tone palette. This represents genuine UI implementation work, not boilerplate.

### 3.3 Frontend State Management -- Score: 3/3

See 2.5 above. The store architecture (writable sources, derived projections, optimistic mutations with rollback) is well-designed and consistent. Loading states tracked for notes, chat, and weather. Weather display derived store handles unit conversion.

### 3.4 Security Infrastructure -- Score: 2/3

Defense-in-depth approach: UI-layer secret scanning -> service-layer scanning gate -> backend validation -> CSP network restrictions. OS keychain integration is real. Ed25519 signing is real. However, the HMAC comparison vulnerability (2.6) and unverified audit chain undermine the security narrative. The security is implemented but not fully verified.

### 3.5 Real-time / Streaming -- Score: 2/3

Ollama integration uses `stream: false` (`ollama.rs:115`) -- synchronous request/response only. For a chat interface, streaming responses would provide better UX. Health check uses polling at 5min/30sec intervals (`constants.ts:122-123`), which is functional but unsophisticated. No WebSocket usage anywhere.

### 3.6 Error UX -- Score: 1/3

**The weakest area.** The toast system exists (`stores/ui.ts`) but is rarely used for errors:
- Note save failure: silently reverts optimistic update, no user notification (`stores/notes.ts:67-74`)
- Settings integrity failure: `console.warn` only (`stores/settings.ts:54`)
- Weather failures: stored in `weatherError` store, rendered only if the weather panel is visible
- Chat failures: `console.error` only
- Database health failure: returns `false`, no user feedback

The user experience on failure is: **things silently don't work**. This is a common AI-generated code pattern -- all error paths exist but none reach the user.

### 3.7 Observability -- Score: 2/3

Audit log table with hash chain exists and events are logged for: AI chat, publishes, settings changes. However:
- Hash chain integrity is never verified (no verification command)
- No structured logging (Rust uses `eprintln!`, frontend uses `console.error`)
- No metrics collection (appropriate for privacy-first app)
- Audit events are fire-and-forget (`logAuditEvent` uses `console.warn` on failure)

**Domain Average: 2.14/3.0 (15/21)**

---

## Vibe-Code Confidence Calculation

| Domain | Weight | Average | Contribution |
|--------|--------|---------|--------------|
| Surface Provenance | 20% | 2.00/3.0 | (1 - 0.667) * 20 = 6.67% |
| Behavioral Integrity | 50% | 2.29/3.0 | (1 - 0.762) * 50 = 11.90% |
| Interface Authenticity | 30% | 2.14/3.0 | (1 - 0.714) * 30 = 8.57% |
| **Total** | | | **27.1%** |

### Classification Scale

| Range | Classification | This Codebase |
|-------|---------------|---------------|
| 0-15% | Human-Authored | |
| 16-35% | **AI-Assisted, Human-Guided** | **<-- 27.1%** |
| 36-55% | Significantly AI-Generated | |
| 56-75% | Predominantly AI-Generated | |
| 76-85% | Heavily AI-Generated | |
| 86-100% | Almost Certainly AI-Generated | |

---

## Findings by Severity

### Critical (must fix)

**C1. Database initialization race condition**
- **File:** `src-tauri/src/lib.rs:30-34`
- **Issue:** Database pool is registered via `app_handle.manage()` inside an async `spawn`. If any Tauri command is invoked before the spawn completes, `State<'_, DbPool>` extraction will panic because the state hasn't been registered.
- **Fix:** Initialize the database synchronously in `setup()` using `tauri::async_runtime::block_on()`, or register a `DbPool` with `None` before the spawn and populate it after initialization completes (which the current Arc<Mutex<Option>> structure already supports -- just call `manage()` before the spawn).

**C2. Non-constant-time HMAC comparison with misleading comment**
- **File:** `src-tauri/src/integrity.rs:41-44`
- **Issue:** Comment says "Constant-time comparison" but code uses `==` which short-circuits. This is a timing side-channel. Low severity in the local attacker model but the misleading comment indicates the code was generated without manual verification.
- **Fix:** Use `hmac::Mac::verify_slice()` which provides constant-time comparison, or implement using `subtle::ConstantTimeEq`.

### High (should fix)

**H1. Errors never surface to users**
- **Files:** `src/lib/services/tauri.ts` (all functions), `src/lib/stores/notes.ts:67-74`
- **Issue:** All error paths log to console and return fallback values. The toast system exists but is unused in error paths. Users see silent failures (empty states, reverted edits) with no explanation.
- **Fix:** Call `showToast({ type: 'error', message })` in service functions when operations fail. At minimum: note save/update/delete failures, chat failures, and weather errors should produce user-visible notifications.

**H2. Secret scanner has zero test coverage**
- **File:** `src/lib/utils/secretScanner.ts`
- **Issue:** The secret scanner is a security-critical gate for publishing. All 11 regex patterns are untested. A regex regression could allow secrets to leak to the blockchain.
- **Fix:** Add unit tests for each pattern with positive and negative cases. Test boundary conditions (partial matches, multi-line content, overlapping patterns).

### Medium (should address)

**M1. Audit hash chain is write-only**
- **Files:** `src-tauri/src/commands.rs:267-313` (write), `src-tauri/src/commands.rs:316-363` (read)
- **Issue:** The audit log computes SHA-256 chain hashes on every insert but provides no verification command. The `get_audit_log` command reads entries but never validates chain integrity. The tamper-evidence promise is undelivered.
- **Fix:** Add a `verify_audit_chain` command that reads all entries and recomputes hashes, flagging any breaks.

**M2. NatLangChainStats exposes phantom fields**
- **Files:** `src/lib/types.ts:258-263`, `src-tauri/src/natlangchain.rs:88-95`
- **Issue:** `totalEarnings`, `subscribers`, and `views` are always 0 because NatLangChain doesn't track them. The UI may display these zeros misleadingly.
- **Fix:** Remove fields not supported by the API, or clearly mark them in the UI as "coming soon" / unavailable.

**M3. Tray listener cleanup race**
- **File:** `src/lib/services/tauri.ts:208-228`
- **Issue:** `listen()` is async but cleanup captures the array synchronously. If cleanup runs before all `.then()` callbacks fire, some listeners leak.
- **Fix:** Use `Promise.all()` pattern or register listeners synchronously.

### Low (consider fixing)

**L1. Health check interval churn**
- **File:** `src/App.svelte:85-110`
- **Issue:** `updateInterval()` recreates the interval on every health check tick. Functional but wasteful.
- **Fix:** Use a single interval with conditional check inside the callback.

**L2. No input validation on settings values**
- **File:** `src/lib/stores/settings.ts:148-163`
- **Issue:** `updateSettings()` accepts any partial settings object without validation. Invalid Ollama URLs, negative temperatures, etc. could cause confusing downstream errors.
- **Fix:** Add validation in `updateSettings()` before persisting.

---

## Legitimate Engineering Acknowledgments

The following demonstrate genuine architectural understanding beyond typical AI boilerplate:

1. **Optimistic updates with rollback** (`stores/notes.ts:52-133`) -- All three mutation operations (add, update, delete) store previous state and revert on backend failure. This is a deliberate UX pattern, not scaffolding.

2. **Weather cache with composite key** (`stores/weather.ts:14-16, 64-68`) -- Cache keyed by `${apiKey}:${location}` with 10-minute TTL. Correctly invalidated on settings change.

3. **Defense-in-depth secret scanning** (`services/natlangchain.ts:44-51`) -- UI-layer scanning gates the publish flow before any network call. This is a genuine security layer, not decoration.

4. **Serde boundary bridging** -- Consistent `#[serde(rename_all = "camelCase")]` on all Rust structs interfacing with TypeScript. This reflects understanding of the cross-language serialization challenge.

5. **Ed25519 signing pipeline** -- Key generation with `OsRng`, storage in OS keychain, content signing before publish, public key attachment. The cryptographic choices are correct (not just present).

6. **Prompt injection delimiters** (`constants.ts:84`) -- `---BEGIN/END USER CONTENT---` delimiters separate instructions from user data in AI prompts. Not bulletproof against sophisticated attacks, but a meaningful defense for a local journal app.

---

## Remediation Checklist

- [ ] **C1:** Fix database initialization race condition in `lib.rs`
- [ ] **C2:** Replace `==` with constant-time comparison in `integrity.rs:44`
- [ ] **H1:** Wire error paths to toast notification system
- [ ] **H2:** Add comprehensive tests for `secretScanner.ts`
- [ ] **M1:** Implement `verify_audit_chain` command
- [ ] **M2:** Remove or clearly mark unsupported NatLangChainStats fields
- [ ] **M3:** Fix tray listener cleanup race condition
- [ ] **L1:** Simplify health check interval logic
- [ ] **L2:** Add input validation to `updateSettings()`

---

## Methodology Notes

This audit was conducted by reading every source file in the repository (65 files, ~3,700 LOC + ~500 test LOC), tracing three complete end-to-end call chains, examining all 30 git commits, and scoring against the Vibe-Code Detection Audit v2.0 framework's 21 sub-criteria across three weighted domains. All findings include file paths and line numbers for verification.
