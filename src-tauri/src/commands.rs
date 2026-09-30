use crate::database::DbPool;
use crate::natlangchain;
use crate::ollama;
use crate::weather;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: String,
    pub date: String,
    pub title: Option<String>,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
    pub ai_provenance: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct AuditEntry {
    pub id: i64,
    pub event_type: String,
    pub event_data: String,
    pub timestamp: String,
    pub hash: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaStatus {
    pub connected: bool,
    pub model: Option<String>,
    pub error: Option<String>,
}

/// Get all notes for a specific date
#[tauri::command]
pub async fn get_notes_for_date(date: String, db: State<'_, DbPool>) -> Result<Vec<Note>, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        let notes = sqlx::query_as::<_, Note>(
            r#"
            SELECT id, date, title, content, created_at, updated_at, deleted_at, ai_provenance
            FROM notes
            WHERE date = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
            "#,
        )
        .bind(&date)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(notes)
    } else {
        Err("Database not initialized".to_string())
    }
}

/// Create a new note
#[tauri::command]
pub async fn create_note(note: Note, db: State<'_, DbPool>) -> Result<Note, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        sqlx::query(
            r#"
            INSERT INTO notes (id, date, title, content, created_at, updated_at, ai_provenance)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&note.id)
        .bind(&note.date)
        .bind(&note.title)
        .bind(&note.content)
        .bind(&note.created_at)
        .bind(&note.updated_at)
        .bind(&note.ai_provenance)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(note)
    } else {
        Err("Database not initialized".to_string())
    }
}

/// Update an existing note
#[tauri::command]
pub async fn update_note(note: Note, db: State<'_, DbPool>) -> Result<Note, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        sqlx::query(
            r#"
            UPDATE notes
            SET title = ?, content = ?, updated_at = ?, ai_provenance = ?
            WHERE id = ?
            "#,
        )
        .bind(&note.title)
        .bind(&note.content)
        .bind(&note.updated_at)
        .bind(&note.ai_provenance)
        .bind(&note.id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(note)
    } else {
        Err("Database not initialized".to_string())
    }
}

/// Soft delete a note
#[tauri::command]
pub async fn delete_note(
    id: String,
    deleted_at: String,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        sqlx::query(
            r#"
            UPDATE notes
            SET deleted_at = ?
            WHERE id = ?
            "#,
        )
        .bind(&deleted_at)
        .bind(&id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("Database not initialized".to_string())
    }
}

/// Check database health status
#[tauri::command]
pub async fn check_database_health(db: State<'_, DbPool>) -> Result<bool, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        // Run a simple query to verify database is working
        sqlx::query("SELECT 1")
            .execute(pool)
            .await
            .map_err(|e| format!("Database health check failed: {}", e))?;
        Ok(true)
    } else {
        Err("Database not initialized".to_string())
    }
}

/// Check Ollama connection status
#[tauri::command]
pub async fn check_ollama_status(url: String) -> Result<OllamaStatus, String> {
    ollama::check_status(&url).await
}

/// Send a chat message to Ollama
#[tauri::command]
pub async fn send_chat_message(
    url: String,
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
) -> Result<ChatMessage, String> {
    ollama::send_message(&url, &model, messages, temperature, max_tokens).await
}

/// Get current weather data
#[tauri::command]
pub async fn get_weather(
    api_key: String,
    location: String,
) -> Result<weather::WeatherData, String> {
    weather::fetch_weather(&api_key, &location).await
}

/// Auto-detect location from IP
#[tauri::command]
pub async fn detect_location() -> Result<String, String> {
    weather::detect_location().await
}

/// Get full journal context (weather + time info)
#[tauri::command]
pub async fn get_journal_context(
    api_key: String,
    location: String,
) -> Result<weather::JournalContext, String> {
    weather::get_journal_context(&api_key, &location).await
}

// ========== NatLangChain Commands ==========

/// Validate an entry before publishing to NatLangChain
#[tauri::command]
pub async fn nlc_validate_entry(
    api_url: String,
    entry: natlangchain::NatLangChainEntry,
) -> Result<natlangchain::ValidationResult, String> {
    natlangchain::validate_entry(&api_url, &entry).await
}

/// Publish an entry to NatLangChain
#[tauri::command]
pub async fn nlc_publish_entry(
    api_url: String,
    entry: natlangchain::NatLangChainEntry,
) -> Result<natlangchain::PublishResult, String> {
    natlangchain::publish_entry(&api_url, &entry).await
}

/// Get author stats from NatLangChain
#[tauri::command]
pub async fn nlc_get_stats(
    api_url: String,
    author_id: String,
) -> Result<natlangchain::ChainStats, String> {
    natlangchain::get_author_stats(&api_url, &author_id).await
}

/// Check NatLangChain API connection
#[tauri::command]
pub async fn nlc_check_connection(api_url: String) -> Result<bool, String> {
    natlangchain::check_connection(&api_url).await
}

// ========== Audit Log Commands ==========

/// Log an audit event with hash chain for tamper evidence
#[tauri::command]
pub async fn log_audit_event(
    event_type: String,
    event_data: String,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        let timestamp = Utc::now().to_rfc3339();

        // Get the hash of the previous entry for chain integrity
        let prev_hash: Option<String> =
            sqlx::query_scalar("SELECT hash FROM audit_log ORDER BY id DESC LIMIT 1")
                .fetch_optional(pool)
                .await
                .map_err(|e| e.to_string())?
                .flatten();

        // Compute hash: SHA-256(prev_hash + event_type + event_data + timestamp)
        let mut hasher = Sha256::new();
        hasher.update(prev_hash.as_deref().unwrap_or("genesis"));
        hasher.update(&event_type);
        hasher.update(&event_data);
        hasher.update(&timestamp);
        let hash = format!("{:x}", hasher.finalize());

        sqlx::query(
            r#"
            INSERT INTO audit_log (event_type, event_data, timestamp, hash)
            VALUES (?, ?, ?, ?)
            "#,
        )
        .bind(&event_type)
        .bind(&event_data)
        .bind(&timestamp)
        .bind(&hash)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("Database not initialized".to_string())
    }
}

/// Retrieve audit log entries
#[tauri::command]
pub async fn get_audit_log(
    event_type: Option<String>,
    limit: Option<u32>,
    db: State<'_, DbPool>,
) -> Result<Vec<AuditEntry>, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        let limit_val = limit.unwrap_or(100) as i64;

        let entries = if let Some(ref etype) = event_type {
            sqlx::query_as::<_, AuditEntry>(
                r#"
                SELECT id, event_type, event_data, timestamp, hash
                FROM audit_log
                WHERE event_type = ?
                ORDER BY id DESC
                LIMIT ?
                "#,
            )
            .bind(etype)
            .bind(limit_val)
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?
        } else {
            sqlx::query_as::<_, AuditEntry>(
                r#"
                SELECT id, event_type, event_data, timestamp, hash
                FROM audit_log
                ORDER BY id DESC
                LIMIT ?
                "#,
            )
            .bind(limit_val)
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?
        };

        Ok(entries)
    } else {
        Err("Database not initialized".to_string())
    }
}

/// Verify the integrity of the audit hash chain.
/// Returns { valid, totalEntries, firstBrokenEntry }.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditChainVerification {
    pub valid: bool,
    pub total_entries: u64,
    pub first_broken_entry: Option<i64>,
}

#[tauri::command]
pub async fn verify_audit_chain(db: State<'_, DbPool>) -> Result<AuditChainVerification, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        let entries = sqlx::query_as::<_, AuditEntry>(
            r#"
            SELECT id, event_type, event_data, timestamp, hash
            FROM audit_log
            ORDER BY id ASC
            "#,
        )
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

        let total_entries = entries.len() as u64;
        let mut prev_hash = "genesis".to_string();

        for entry in &entries {
            let mut hasher = Sha256::new();
            hasher.update(&prev_hash);
            hasher.update(&entry.event_type);
            hasher.update(&entry.event_data);
            hasher.update(&entry.timestamp);
            let computed = format!("{:x}", hasher.finalize());

            let stored = entry.hash.as_deref().unwrap_or("");
            if computed != stored {
                return Ok(AuditChainVerification {
                    valid: false,
                    total_entries,
                    first_broken_entry: Some(entry.id),
                });
            }
            prev_hash = computed;
        }

        Ok(AuditChainVerification {
            valid: true,
            total_entries,
            first_broken_entry: None,
        })
    } else {
        Err("Database not initialized".to_string())
    }
}

// ========== Secret Storage Commands ==========

/// Store a secret in the OS keychain
#[tauri::command]
pub async fn store_secret(service: String, key: String, value: String) -> Result<(), String> {
    let entry = keyring::Entry::new(&service, &key).map_err(|e| e.to_string())?;
    entry.set_password(&value).map_err(|e| e.to_string())
}

/// Get a secret from the OS keychain
#[tauri::command]
pub async fn get_secret(service: String, key: String) -> Result<Option<String>, String> {
    let entry = keyring::Entry::new(&service, &key).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

/// Delete a secret from the OS keychain
#[tauri::command]
pub async fn delete_secret(service: String, key: String) -> Result<(), String> {
    let entry = keyring::Entry::new(&service, &key).map_err(|e| e.to_string())?;
    match entry.delete_password() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

// ========== Integrity Commands ==========

/// Compute HMAC-SHA256 of settings JSON using a device-local key stored in keychain
#[tauri::command]
pub async fn compute_settings_hmac(settings_json: String) -> Result<String, String> {
    let key = crate::integrity::get_or_create_hmac_key()?;
    Ok(crate::integrity::compute_hmac(
        settings_json.as_bytes(),
        &key,
    ))
}

/// Verify HMAC-SHA256 of settings JSON
#[tauri::command]
pub async fn verify_settings_hmac(settings_json: String, hmac_hex: String) -> Result<bool, String> {
    let key = crate::integrity::get_or_create_hmac_key()?;
    Ok(crate::integrity::verify_hmac(
        settings_json.as_bytes(),
        &key,
        &hmac_hex,
    ))
}

// ========== Author Identity Commands ==========

/// Get or create author public key for NatLangChain signing
#[tauri::command]
pub async fn nlc_get_author_public_key() -> Result<String, String> {
    let (public_key, _) = crate::author_identity::get_or_create_keypair("com.helper.author")?;
    Ok(public_key)
}

/// Sign entry content with the author's private key
#[tauri::command]
pub async fn nlc_sign_entry(content: String) -> Result<String, String> {
    let (_, private_key) = crate::author_identity::get_or_create_keypair("com.helper.author")?;
    crate::author_identity::sign_content(&content, &private_key)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::{self, SqlitePool};
    use std::sync::Arc;
    use tauri::test::{mock_app, MockRuntime};
    use tauri::{App, Manager};
    use tokio::sync::Mutex;

    async fn memory_pool() -> SqlitePool {
        // A single connection: every new connection to `sqlite::memory:` is a separate database.
        sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap()
    }

    async fn app_with_db() -> App<MockRuntime> {
        let pool = memory_pool().await;
        database::create_tables(&pool).await.unwrap();
        let app = mock_app();
        app.manage(database::DbPool(Arc::new(Mutex::new(Some(pool)))));
        app
    }

    async fn pool_of(app: &App<MockRuntime>) -> SqlitePool {
        app.state::<database::DbPool>()
            .0
            .lock()
            .await
            .as_ref()
            .unwrap()
            .clone()
    }

    fn note(id: &str, date: &str, content: &str, created_at: &str) -> Note {
        Note {
            id: id.to_string(),
            date: date.to_string(),
            title: Some(format!("title {id}")),
            content: content.to_string(),
            created_at: created_at.to_string(),
            updated_at: created_at.to_string(),
            deleted_at: None,
            ai_provenance: Some("human".to_string()),
        }
    }

    #[tokio::test]
    async fn note_create_read_update_delete_round_trip() {
        let app = app_with_db().await;
        let db = || app.state::<database::DbPool>();

        let created = create_note(
            note("n1", "2026-01-01", "first", "2026-01-01T08:00:00Z"),
            db(),
        )
        .await
        .unwrap();
        assert_eq!(created.id, "n1");

        let notes = get_notes_for_date("2026-01-01".into(), db()).await.unwrap();
        assert_eq!(notes.len(), 1);
        assert_eq!(notes[0].content, "first");
        assert_eq!(notes[0].title.as_deref(), Some("title n1"));
        assert_eq!(notes[0].ai_provenance.as_deref(), Some("human"));
        assert_eq!(notes[0].deleted_at, None);

        let mut edited = notes[0].clone();
        edited.title = None;
        edited.content = "edited".into();
        edited.updated_at = "2026-01-01T09:00:00Z".into();
        edited.ai_provenance = Some("ai_assisted".into());
        update_note(edited, db()).await.unwrap();

        let notes = get_notes_for_date("2026-01-01".into(), db()).await.unwrap();
        assert_eq!(notes[0].content, "edited");
        assert_eq!(notes[0].title, None);
        assert_eq!(notes[0].updated_at, "2026-01-01T09:00:00Z");
        assert_eq!(notes[0].ai_provenance.as_deref(), Some("ai_assisted"));
        // created_at is not touched by an update
        assert_eq!(notes[0].created_at, "2026-01-01T08:00:00Z");

        delete_note("n1".into(), "2026-01-01T10:00:00Z".into(), db())
            .await
            .unwrap();
        assert!(get_notes_for_date("2026-01-01".into(), db())
            .await
            .unwrap()
            .is_empty());

        // Soft delete: the row is kept, with its deletion timestamp
        let pool = pool_of(&app).await;
        let deleted_at: Option<String> =
            sqlx::query_scalar("SELECT deleted_at FROM notes WHERE id = 'n1'")
                .fetch_one(&pool)
                .await
                .unwrap();
        assert_eq!(deleted_at.as_deref(), Some("2026-01-01T10:00:00Z"));
    }

    #[tokio::test]
    async fn notes_are_filtered_by_date_and_newest_first() {
        let app = app_with_db().await;
        let db = || app.state::<database::DbPool>();

        for (id, date, created) in [
            ("a", "2026-01-01", "2026-01-01T08:00:00Z"),
            ("b", "2026-01-01", "2026-01-01T20:00:00Z"),
            ("c", "2026-01-02", "2026-01-02T08:00:00Z"),
        ] {
            create_note(note(id, date, id, created), db())
                .await
                .unwrap();
        }

        let day1 = get_notes_for_date("2026-01-01".into(), db()).await.unwrap();
        let ids: Vec<_> = day1.iter().map(|n| n.id.as_str()).collect();
        assert_eq!(ids, ["b", "a"]);

        let day2 = get_notes_for_date("2026-01-02".into(), db()).await.unwrap();
        assert_eq!(day2.len(), 1);
        assert!(get_notes_for_date("2026-01-03".into(), db())
            .await
            .unwrap()
            .is_empty());
    }

    #[tokio::test]
    async fn hostile_input_is_bound_as_data_not_executed() {
        let app = app_with_db().await;
        let db = || app.state::<database::DbPool>();

        let nasty = "x'); DROP TABLE notes; --";
        create_note(
            note("n1", "2026-01-01", nasty, "2026-01-01T08:00:00Z"),
            db(),
        )
        .await
        .unwrap();

        let notes = get_notes_for_date("2026-01-01".into(), db()).await.unwrap();
        assert_eq!(notes[0].content, nasty);

        // Hostile date filter matches nothing and leaves the table intact
        let none = get_notes_for_date("' OR '1'='1".into(), db())
            .await
            .unwrap();
        assert!(none.is_empty());
        assert_eq!(
            get_notes_for_date("2026-01-01".into(), db())
                .await
                .unwrap()
                .len(),
            1
        );
    }

    #[tokio::test]
    async fn audit_chain_verifies_and_detects_tampering() {
        let app = app_with_db().await;
        let db = || app.state::<database::DbPool>();

        // Empty chain is valid
        let empty = verify_audit_chain(db()).await.unwrap();
        assert!(empty.valid);
        assert_eq!(empty.total_entries, 0);

        for (kind, data) in [
            ("ai_chat", "{\"n\":1}"),
            ("nlc_publish", "{\"n\":2}"),
            ("ai_chat", "{\"n\":3}"),
        ] {
            log_audit_event(kind.into(), data.into(), db())
                .await
                .unwrap();
        }

        let ok = verify_audit_chain(db()).await.unwrap();
        assert!(ok.valid);
        assert_eq!(ok.total_entries, 3);
        assert_eq!(ok.first_broken_entry, None);

        // Newest first, with optional filter and limit
        let all = get_audit_log(None, None, db()).await.unwrap();
        assert_eq!(all.len(), 3);
        assert!(all[0].id > all[2].id);
        let chats = get_audit_log(Some("ai_chat".into()), None, db())
            .await
            .unwrap();
        assert_eq!(chats.len(), 2);
        assert!(chats.iter().all(|e| e.event_type == "ai_chat"));
        let limited = get_audit_log(None, Some(1), db()).await.unwrap();
        assert_eq!(limited.len(), 1);
        assert_eq!(limited[0].id, all[0].id);

        // Tamper with the middle entry: the chain must report exactly that entry
        let pool = pool_of(&app).await;
        let target = all[1].id;
        sqlx::query("UPDATE audit_log SET event_data = '{\"n\":999}' WHERE id = ?")
            .bind(target)
            .execute(&pool)
            .await
            .unwrap();

        let broken = verify_audit_chain(db()).await.unwrap();
        assert!(!broken.valid);
        assert_eq!(broken.total_entries, 3);
        assert_eq!(broken.first_broken_entry, Some(target));
    }

    #[tokio::test]
    async fn create_tables_is_idempotent_and_migrates_legacy_notes_table() {
        let pool = memory_pool().await;

        // Schema from before the ai_provenance column existed, with a row in it
        sqlx::query(
            "CREATE TABLE notes (id TEXT PRIMARY KEY, date TEXT NOT NULL, title TEXT, \
             content TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, \
             deleted_at TEXT)",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query(
            "INSERT INTO notes (id, date, content, created_at, updated_at) \
             VALUES ('old', '2025-12-31', 'legacy', 't', 't')",
        )
        .execute(&pool)
        .await
        .unwrap();

        database::create_tables(&pool).await.unwrap();
        database::create_tables(&pool).await.unwrap(); // idempotent

        let row = sqlx::query_as::<_, Note>("SELECT * FROM notes WHERE id = 'old'")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(row.content, "legacy");
        assert_eq!(row.ai_provenance.as_deref(), Some("human"));
    }

    #[tokio::test]
    async fn commands_report_an_uninitialized_database() {
        let app = mock_app();
        app.manage(database::DbPool(Arc::new(Mutex::new(None))));
        let db = || app.state::<database::DbPool>();

        let err = get_notes_for_date("2026-01-01".into(), db())
            .await
            .unwrap_err();
        assert_eq!(err, "Database not initialized");
        assert!(check_database_health(db()).await.is_err());
        assert!(verify_audit_chain(db()).await.is_err());
    }

    #[tokio::test]
    async fn database_health_check_succeeds_on_a_live_pool() {
        let app = app_with_db().await;
        assert!(check_database_health(app.state::<database::DbPool>())
            .await
            .unwrap());
    }
}
