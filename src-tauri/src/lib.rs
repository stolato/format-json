#![cfg_attr(target_os = "macos", allow(unexpected_cfgs))]

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      #[cfg(target_os = "macos")]
      {
        use tauri::Manager;
        if let Some(window) = app.get_webview_window("main") {
          apply_macos_rounding(&window);
        }
      }

      app.handle().plugin(tauri_plugin_process::init())?;
      app.handle().plugin(tauri_plugin_shell::init())?;
      app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(target_os = "macos")]
fn apply_macos_rounding(window: &tauri::WebviewWindow) {
  use objc::runtime::YES;
  use objc::{msg_send, sel, sel_impl};
  unsafe {
    let ns_window = window.ns_window().unwrap() as *mut objc::runtime::Object;
    let content_view: *mut objc::runtime::Object = msg_send![ns_window, contentView];
    // Garante que a view tenha uma CALayer de backing antes de acessá-la
    let () = msg_send![content_view, setWantsLayer: YES];
    let layer: *mut objc::runtime::Object = msg_send![content_view, layer];
    let () = msg_send![layer, setCornerRadius: 12.0_f64];
    let () = msg_send![layer, setMasksToBounds: YES];
    let () = msg_send![ns_window, invalidateShadow];
  }
}
