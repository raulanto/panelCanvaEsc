pub mod commands;
pub mod models;

use models::database::AppState;
use std::path::PathBuf;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Configurar la base de datos
            let app_handle = app.handle();

            // Obtener la ruta de la base de datos en el directorio de datos de la app
            let app_dir = app_handle
                .path()
                .app_data_dir()
                .expect("No se pudo obtener el directorio de datos de la app");

            std::fs::create_dir_all(&app_dir)
                .expect("No se pudo crear el directorio de datos");

            let db_path = app_dir.join("app.db");
            let db_url = format!("sqlite:{}", db_path.to_string_lossy());

            // Inicializar la base de datos de forma asíncrona
            tauri::async_runtime::block_on(async move {
                let state = AppState::new(&db_url)
                    .await
                    .expect("No se pudo inicializar la base de datos");

                app_handle.manage(state);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Comandos de autenticación
            commands::auth::register_user,
            commands::auth::login_user,
            commands::auth::get_user_by_id,
            // Comandos de boards
            commands::board::get_my_boards,
            commands::board::get_board_by_id,
            commands::board::create_board,
            commands::board::create_panel,

            commands::stats::get_global_datasets,
            commands::stats::get_dataset_by_id,
            commands::stats::create_dataset,
            commands::stats::add_dataset_data,
            commands::stats::delete_dataset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}