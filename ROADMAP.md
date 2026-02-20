# HeLpER Roadmap

**Last Updated:** 2026-02-20

This document consolidates the security remediation plan and the product refocus plan into a single development roadmap.

---

## Completed: Security Remediation

All 11 findings from the agentic security audit have been implemented. See `AUDIT_REPORT.md` Section 3 for full details.

**Summary of changes (commit `7b7716c`):**

| Area | What was done |
|------|--------------|
| **OS Keychain** | API keys stored in OS keychain via `keyring` crate instead of plaintext JSON |
| **Settings Integrity** | HMAC-SHA256 verification with device-local key (`integrity.rs`) |
| **Author Signing** | Ed25519 keypair generation and entry signing (`author_identity.rs`) |
| **Secret Scanning** | Pre-publish regex scanner with 11 patterns (`secretScanner.ts`) |
| **Prompt Safety** | `---BEGIN/END USER CONTENT---` delimiters in all AI prompts |
| **Content Provenance** | `ai_provenance` field tracks human vs AI-edited content |
| **Audit Trail** | `audit_log` table with hash chain for tamper evidence |
| **CSP Hardening** | Restricted `connect-src` to specific ports; removed `https:` from `img-src` |
| **Redirect Policy** | Disabled HTTP redirect following on all reqwest clients |

**New Rust modules:** `integrity.rs`, `author_identity.rs`
**New frontend module:** `secretScanner.ts`
**New Cargo dependencies:** `keyring`, `hmac`, `sha2`, `hex`, `ed25519-dalek`, `rand`, `base64`

---

## Proposed: Product Refocus

The product evaluation identified that ~40% of the codebase serves NatLangChain publishing, which is the most complex feature and the least validated. The core journaling + local AI experience is well-built but underinvested.

### Phase 1: Strip Security Theater

**Status:** Not started
**Risk:** None - dead code with no dependencies
**Scope:** ~450 lines removed

Remove fictional security integrations that have no real backend:
- Delete `scripts/security-integration.ps1` (400 lines of calls to nonexistent services)
- Delete `security-config.json` (references fictional endpoints)
- Remove Boundary-SIEM/boundary-daemon references from README, batch scripts, SECURITY.md, claude.md

### Phase 2: Extract NatLangChain

**Status:** Not started
**Risk:** Medium - touches every layer
**Scope:** ~1,650 lines removed

Move NatLangChain into a dedicated repo. Delete from HeLpER:
- `PublishPanel.svelte` (834 lines), `natlangchain.ts` (341 lines), `natlangchain.rs` (437 lines)
- All NatLangChain types, constants, settings, and test files
- Remove from `NoteEditor.svelte`, `SettingsPanel.svelte`, `commands.rs`, `lib.rs`

**Note:** The security remediation work (author signing, secret scanning, provenance) was designed to be modular and would transfer cleanly to a standalone NatLangChain publishing app.

### Phase 3: Strengthen Core Editor

**Status:** Not started
**Risk:** Low - additive
**Scope:** ~700 lines added

- **Markdown support** - Write/preview toggle with basic rendering
- **Note tagging** - Tags column in DB, tag input UI, tag-based filtering
- **Global search** - Search across all dates, highlighted results

### Phase 4: Deepen AI Integration

**Status:** Not started
**Risk:** Low - additive
**Scope:** ~450 lines added

- **Weekly summary** - Send last 7 days of notes to Ollama for thematic summary
- **Mood detection** - Lightweight prompt to detect mood from entries
- **Contextual prompts** - Use weather/time/day to suggest writing prompts

### Phase 5: Polish and Ship

**Status:** Not started
**Scope:** ~200 lines changed

- Rewrite README for focused product
- Update onboarding wizard (remove NatLangChain step)
- Version bump to 0.2.0
- Verify multi-platform builds

---

## Summary

| Phase | Lines Removed | Lines Added | Status |
|-------|--------------|-------------|--------|
| Security Remediation | 44 | 712 | **Done** |
| 1. Strip security theater | ~450 | 0 | Proposed |
| 2. Extract NatLangChain | ~1,650 | 0 | Proposed |
| 3. Strengthen editor | 0 | ~700 | Proposed |
| 4. Deepen AI | 0 | ~450 | Proposed |
| 5. Polish and ship | ~100 | ~200 | Proposed |

---

*This document consolidates the Security Remediation Plan (2026-02-20) and the Refocus Plan (2026-02-20).*
