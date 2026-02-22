# Remediation Plan -- Vibe-Code Audit Findings

All 9 findings from `VIBE_CHECK_AUDIT.md`, ordered by severity then by dependency.

---

## Phase 1: Critical Fixes (C1, C2)

### Step 1 -- C1: Fix database initialization race condition
**File:** `src-tauri/src/lib.rs`

Register the `DbPool` state with `None` *before* spawning the async init task. The current `Arc<Mutex<Option<SqlitePool>>>` structure already supports this -- just call `app_handle.manage(DbPool(Arc::new(Mutex::new(None))))` synchronously in `setup()`, then inside the spawn, lock the mutex and set `Some(pool)` instead of calling `manage()` again.

Changes:
1. In `setup()`, add `app.manage(DbPool(Arc::new(Mutex::new(None))));` before the `spawn`
2. Inside the spawned task, replace `app_handle.manage(DbPool(...))` with:
   - Acquire the existing `DbPool` via `app_handle.state::<DbPool>()`
   - Lock the mutex and set `*guard = Some(pool)`
3. Existing commands already handle the `None` case with `Err("Database not initialized")`, so no changes needed downstream

### Step 2 -- C2: Use constant-time HMAC comparison
**File:** `src-tauri/src/integrity.rs`

Replace the `==` comparison with `hmac::Mac::verify_slice()` which is constant-time.

Changes:
1. Change `verify_hmac` to decode `expected_hex` to bytes
2. Use `mac.verify_slice(&expected_bytes)` instead of comparing hex strings
3. Return `Ok(()) / Err` mapped to `bool`
4. Fix the misleading comment

---

## Phase 2: High-Severity Fixes (H1, H2)

### Step 3 -- H1: Wire error paths to toast notifications
**Files:** `src/lib/services/tauri.ts`, `src/lib/stores/notes.ts`

The toast system (`showToast` in `stores/ui.ts`) exists but no error path uses it.

Changes:
1. **`src/lib/stores/notes.ts`** -- In `addNote`, `updateNote`, `deleteNote`: when the backend call fails and we revert the optimistic update, also call `showToast({ type: 'error', message: '...' })`
2. **`src/lib/services/tauri.ts`** -- In `sendChatMessage`: return structured error info so `ChatPanel.svelte` can show a toast on failure (currently returns `null`)
3. **`src/lib/stores/settings.ts`** -- In `initializeSettings`: when HMAC verification fails, show a warning toast instead of only `console.warn`
4. **`src/lib/stores/weather.ts`** -- In `refreshWeather`: when fetch fails, call `showToast` with the error

Import `showToast` from `../stores/ui` in each modified file.

### Step 4 -- H2: Add comprehensive tests for secret scanner
**New file:** `tests/utils/secretScanner.test.ts`

Test each of the 11 patterns with positive and negative cases:

1. AWS Access Key (AKIA prefix + 16 uppercase alphanum)
2. AWS Secret Key (key=value pattern)
3. SSH Private Key (BEGIN header)
4. PGP Private Key (BEGIN header)
5. Bearer Token
6. Generic API Key (api_key=value pattern)
7. Generic Secret (secret/password/token=value)
8. GitHub Token (ghp_/gho_/ghu_/ghs_/ghr_ prefix)
9. Slack Token (xoxb-/xoxp-/xoxa- prefix)
10. Stripe Key (sk_live_/pk_test_ prefix)
11. Database URL (postgres/mysql/mongodb with credentials)

Also test:
- Content with no secrets returns `{ hasSecrets: false, findings: [] }`
- Multi-line content with secrets on different lines reports correct line numbers
- Redaction format: first 4 + `***` + last 4 chars
- Multiple secrets in one line
- Overlapping pattern matches

---

## Phase 3: Medium-Severity Fixes (M1, M2, M3)

### Step 5 -- M1: Implement audit chain verification command
**Files:** `src-tauri/src/commands.rs`, `src/lib/services/tauri.ts`

Add a `verify_audit_chain` Tauri command that:
1. Fetches all audit_log entries ordered by `id ASC`
2. Iterates through entries recomputing `SHA-256(prev_hash + event_type + event_data + timestamp)` using "genesis" as the initial prev_hash
3. Compares each computed hash to the stored hash
4. Returns a result struct: `{ valid: bool, total_entries: u64, first_broken_entry: Option<i64> }`

Also:
- Register the new command in `lib.rs` invoke_handler
- Add a TypeScript wrapper in `services/tauri.ts`

### Step 6 -- M2: Remove phantom NatLangChainStats fields
**Files:** `src/lib/types.ts`, `src-tauri/src/natlangchain.rs`

Changes:
1. In Rust `ChainStats`: remove `total_earnings`, `subscribers`, `views` fields. Keep only `total_entries`.
2. In TypeScript `NatLangChainStats`: remove `totalEarnings`, `subscribers`, `views`. Keep only `totalEntries`.
3. Update any UI references to these removed fields (search for `totalEarnings`, `subscribers`, `views` in `.svelte` files)
4. Update `get_author_stats` in `natlangchain.rs` to return the simplified struct

### Step 7 -- M3: Fix tray listener cleanup race condition
**File:** `src/lib/services/tauri.ts`

Change `setupTrayListeners` to return a cleanup function that awaits all listener registrations.

Changes:
1. Collect `listen()` promises into an array
2. Return an async cleanup function that `await Promise.all(promises)` first, then calls each unlisten
3. Update `App.svelte` to handle the async cleanup in `onDestroy` (store the promise, call it on destroy)

Alternative simpler approach: use Tauri's synchronous event API if available, or accept the race since it only matters during very early app teardown.

---

## Phase 4: Low-Severity Fixes (L1, L2)

### Step 8 -- L1: Simplify health check interval
**File:** `src/App.svelte`

Replace the recursive `updateInterval` pattern with a single `setInterval` that checks connection status inside the callback:

1. Use a single interval at the shorter retry rate (30s)
2. Inside the callback, check `get(ollamaStatus).connected`
3. If connected, skip the check unless the interval count is a multiple of the ratio (300000/30000 = 10), effectively checking every 10th tick when connected
4. Remove the `updateInterval` function entirely

### Step 9 -- L2: Add settings input validation
**File:** `src/lib/stores/settings.ts`

Add a `validateSettings` function called by `updateSettings` before persisting:

Validations:
- `ai.ollamaUrl`: must be a valid URL (use `URL` constructor, catch on failure)
- `ai.temperature`: must be 0.0-2.0
- `ai.maxTokens`: must be 1-10000
- `app.autoSaveDelay`: must be 100-10000
- `weather.apiKey`: no whitespace, reasonable length
- `natLangChain.apiUrl`: must be a valid URL
- `natLangChain.defaultPrice`: must be >= 0

If validation fails, reject the update and show a toast with the validation error. Do not persist invalid settings.

---

## Execution Order Summary

| Step | Finding | Severity | Files Modified | New Files |
|------|---------|----------|----------------|-----------|
| 1 | C1 | Critical | `src-tauri/src/lib.rs` | -- |
| 2 | C2 | Critical | `src-tauri/src/integrity.rs` | -- |
| 3 | H1 | High | `stores/notes.ts`, `stores/settings.ts`, `stores/weather.ts`, `services/tauri.ts` | -- |
| 4 | H2 | High | -- | `tests/utils/secretScanner.test.ts` |
| 5 | M1 | Medium | `commands.rs`, `lib.rs`, `services/tauri.ts` | -- |
| 6 | M2 | Medium | `types.ts`, `natlangchain.rs`, possibly `.svelte` files | -- |
| 7 | M3 | Medium | `services/tauri.ts`, `App.svelte` | -- |
| 8 | L1 | Low | `App.svelte` | -- |
| 9 | L2 | Low | `stores/settings.ts` | -- |

All changes should be followed by running `npm test` and `npm run check` to verify nothing breaks.
