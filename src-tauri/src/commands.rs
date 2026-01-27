use serde::{Deserialize, Serialize};
use tauri::State;
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
            SELECT id, date, title, content, created_at, updated_at, deleted_at
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
            INSERT INTO notes (id, date, title, content, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
            note.id,
            note.date,
            note.title,
            note.content,
            note.created_at,
            note.updated_at
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
            SET title = ?, content = ?, updated_at = ?
            WHERE id = ?
            "#,
            note.title,
            note.content,
            note.updated_at,
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
