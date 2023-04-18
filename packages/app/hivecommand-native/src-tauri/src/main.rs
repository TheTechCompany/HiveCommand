#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}
use tauri::{CustomMenuItem,  Menu, Submenu};

fn main() {
  let configure = CustomMenuItem::new("configure".to_string(), "Configure");
  let submenu = Submenu::new("Tools", Menu::new().add_item(configure));
  
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");
  let close = CustomMenuItem::new("close".to_string(), "Close");
  let filemenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));

  let menu = Menu::new()
    .add_item(CustomMenuItem::new("hide", "Hide"))
    .add_submenu(filemenu)
    .add_submenu(submenu);

  tauri::Builder::default()
    .menu(menu)
    .on_menu_event(|event| {
      match event.menu_item_id() {
        "quit" => {
          std::process::exit(0);
        }
        "close" => {
          event.window().close().unwrap();
        }
        "configure" => {
          event.window().emit("configure", Payload { message: "Menu reconfigure".into() }).unwrap();
        }
        _ => {}
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
