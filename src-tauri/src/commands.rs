use serde::{Deserialize, Serialize};
use tauri::State;
use chrono::Utc;
use sha2::{Sha256, Digest};
use crate::database::DbPool;
use crate::natlangchain;
use crate::ollama;
use crate::weather;

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
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
pub async fn get_notes_for_date(
    date: String,
    db: State<'_, DbPool>,
) -> Result<Vec<Note>, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        let notes = sqlx::query_as!(
            Note,
            r#"
            SELECT id, date, title, content, created_at, updated_at, deleted_at, ai_provenance
            FROM notes
            WHERE date = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
            "#,
            date
        )
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
pub async fn create_note(
    note: Note,
    db: State<'_, DbPool>,
) -> Result<Note, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        sqlx::query!(
            r#"
            INSERT INTO notes (id, date, title, content, created_at, updated_at, ai_provenance)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            note.id,
            note.date,
            note.title,
            note.content,
            note.created_at,
            note.updated_at,
            note.ai_provenance
        )
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
pub async fn update_note(
    note: Note,
    db: State<'_, DbPool>,
) -> Result<Note, String> {
    let pool = db.0.lock().await;

    if let Some(pool) = pool.as_ref() {
        sqlx::query!(
            r#"
            UPDATE notes
            SET title = ?, content = ?, updated_at = ?, ai_provenance = ?
            WHERE id = ?
            "#,
            note.title,
            note.content,
            note.updated_at,
            note.ai_provenance,
            note.id
        )
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
        sqlx::query!(
            r#"
            UPDATE notes
            SET deleted_at = ?
            WHERE id = ?
            "#,
            deleted_at,
            id
        )
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
pub async fn check_database_health(
    db: State<'_, DbPool>,
) -> Result<bool, String> {
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
        let prev_hash: Option<String> = sqlx::query_scalar(
            "SELECT hash FROM audit_log ORDER BY id DESC LIMIT 1"
        )
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

        sqlx::query!(
            r#"
            INSERT INTO audit_log (event_type, event_data, timestamp, hash)
            VALUES (?, ?, ?, ?)
            "#,
            event_type,
            event_data,
            timestamp,
            hash
        )
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
            sqlx::query_as!(
                AuditEntry,
                r#"
                SELECT id, event_type, event_data, timestamp, hash
                FROM audit_log
                WHERE event_type = ?
                ORDER BY id DESC
                LIMIT ?
                "#,
                etype,
                limit_val
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?
        } else {
            sqlx::query_as!(
                AuditEntry,
                r#"
                SELECT id, event_type, event_data, timestamp, hash
                FROM audit_log
                ORDER BY id DESC
                LIMIT ?
                "#,
                limit_val
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?
        };

        Ok(entries)
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
    match entry.delete_credential() {
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
    Ok(crate::integrity::compute_hmac(settings_json.as_bytes(), &key))
}

/// Verify HMAC-SHA256 of settings JSON
#[tauri::command]
pub async fn verify_settings_hmac(settings_json: String, hmac_hex: String) -> Result<bool, String> {
    let key = crate::integrity::get_or_create_hmac_key()?;
    Ok(crate::integrity::verify_hmac(settings_json.as_bytes(), &key, &hmac_hex))
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
