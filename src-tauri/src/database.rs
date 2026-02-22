use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tokio::sync::Mutex;

// For now, we'll use a simple approach without sqlx compile-time checks
// In production, you'd want to set up proper SQLx with migrations

pub struct DbPool(pub Arc<Mutex<Option<SqlitePool>>>);

pub type SqlitePool = sqlx::SqlitePool;

/// Initialize the database and fill the pre-registered `DbPool` state.
///
/// `DbPool` must already be managed (with `None` inside) before this is called.
/// This avoids the race where commands execute before `manage()` registers the state.
pub async fn initialize_into(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&app_dir)?;

    let db_path = app_dir.join("helper.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

    // Connect to database
    let pool = sqlx::sqlite::SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    // Run migrations / create tables
    create_tables(&pool).await?;

    // Fill the pre-registered DbPool with the live connection
    let db_state = app_handle.state::<DbPool>();
    let mut guard = db_state.0.lock().await;
    *guard = Some(pool);

    Ok(())
}

/// Create database tables if they don't exist
async fn create_tables(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    // Notes table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS notes (
            id          TEXT PRIMARY KEY,
            date        TEXT NOT NULL,
            title       TEXT,
            content     TEXT NOT NULL,
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL,
            deleted_at  TEXT
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Index on date for quick lookups
    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(date)
        "#,
    )
    .execute(pool)
    .await?;

    // Index on deleted_at for filtering
    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_notes_deleted ON notes(deleted_at)
        "#,
    )
    .execute(pool)
    .await?;

    // Settings table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS settings (
            key         TEXT PRIMARY KEY,
            value       TEXT NOT NULL,
            updated_at  TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Metadata table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS metadata (
            key         TEXT PRIMARY KEY,
            value       TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Audit log table for tracking AI interactions, publishes, and settings changes
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS audit_log (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type  TEXT NOT NULL,
            event_data  TEXT NOT NULL,
            timestamp   TEXT NOT NULL,
            hash        TEXT
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_audit_log_type ON audit_log(event_type)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp)
        "#,
    )
    .execute(pool)
    .await?;

    // Migration: add ai_provenance column to notes table if not present
    let columns: Vec<(String,)> = sqlx::query_as(
        "SELECT name FROM pragma_table_info('notes') WHERE name = 'ai_provenance'"
    )
    .fetch_all(pool)
    .await?;

    if columns.is_empty() {
        sqlx::query("ALTER TABLE notes ADD COLUMN ai_provenance TEXT DEFAULT 'human'")
            .execute(pool)
            .await?;
    }

    Ok(())
}
