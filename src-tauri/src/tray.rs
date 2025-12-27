use tauri::{
    tray::{TrayIcon, TrayIconBuilder, MouseButton, MouseButtonState},
    menu::{Menu, MenuItem},
    AppHandle, Manager,
};

/// Create and configure the system tray
pub fn create_tray(app: &AppHandle) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    // Create menu items
    let open = MenuItem::with_id(app, "open", "Open HeLpER", true, None::<&str>)?;
    let new_note = MenuItem::with_id(app, "new_note", "New Note", true, Some("CmdOrCtrl+N"))?;
    let today = MenuItem::with_id(app, "today", "Today", true, Some("CmdOrCtrl+T"))?;
    let settings = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit HeLpER", true, Some("CmdOrCtrl+Q"))?;

    // Build menu
    let menu = Menu::with_items(
        app,
        &[
            &open,
            &MenuItem::new(app, "-", false, None::<&str>)?, // Separator
            &new_note,
            &today,
            &MenuItem::new(app, "-", false, None::<&str>)?, // Separator
            &settings,
            &MenuItem::new(app, "-", false, None::<&str>)?, // Separator
            &quit,
        ],
    )?;

    // Build tray icon
    let tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("HeLpER")
        .menu(&menu)
        .menu_on_left_click(false)
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "open" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "new_note" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        // Emit event to create new note
                        let _ = window.emit("new-note", ());
                    }
                }
                "today" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        // Emit event to go to today
                        let _ = window.emit("go-to-today", ());
                    }
                }
                "settings" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        // Emit event to open settings
                        let _ = window.emit("open-settings", ());
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(tray)
}
