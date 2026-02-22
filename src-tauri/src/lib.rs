mod author_identity;
mod commands;
mod database;
mod integrity;
mod natlangchain;
mod ollama;
mod tray;
mod weather;

use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Initialize system tray
            tray::create_tray(app.handle())?;

            // Register DbPool state synchronously so commands never see missing state.
            // The pool starts as None and is populated once the async init completes.
            app.manage(database::DbPool(Arc::new(Mutex::new(None))));

            // Initialize database asynchronously — fills the pool registered above
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = database::initialize_into(&app_handle).await {
                    eprintln!("Failed to initialize database: {}", e);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_notes_for_date,
            commands::create_note,
            commands::update_note,
            commands::delete_note,
            commands::check_database_health,
            commands::check_ollama_status,
            commands::send_chat_message,
            commands::get_weather,
            commands::detect_location,
            commands::get_journal_context,
            commands::nlc_validate_entry,
            commands::nlc_publish_entry,
            commands::nlc_get_stats,
            commands::nlc_check_connection,
            commands::log_audit_event,
            commands::get_audit_log,
            commands::verify_audit_chain,
            commands::store_secret,
            commands::get_secret,
            commands::delete_secret,
            commands::compute_settings_hmac,
            commands::verify_settings_hmac,
            commands::nlc_get_author_public_key,
            commands::nlc_sign_entry,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
