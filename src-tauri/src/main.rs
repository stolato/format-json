// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
  // Opcional: Força X11 se o Wayland continuar instável, mas o flag acima costuma bastar
  // std::env::set_var("GDK_BACKEND", "x11"); 
  
  app_lib::run();
}
