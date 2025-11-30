mod models;
use models::{Board, Panel, Position, Size};
use serde_json::json;

#[tauri::command]
fn get_my_boards() -> Result<Vec<Board>, String> {
    let boards = vec![Board {
        id: "board-executive".to_string(),
        title: "Resumen Ejecutivo".to_string(),
        description: "KPIs principales, rendimiento financiero y métricas.".to_string(),
        icon: "i-heroicons-presentation-chart-line".to_string(),
        color: "blue".to_string(),
        created_at: "2024-11-28".to_string(),
        panels: vec![Panel {
            id: "p-exec-1".to_string(),
            tipo: "estadistica".to_string(),
            titulo: "Ingresos Totales".to_string(),
            posicion: Position { x: 50, y: 50 },
            tamano: Size {
                width: 280,
                height: 180,
            },
            z_index: 1,
            activo: false,
            data: json!({
                "valor": "$1.2M",
                "subtitulo": "Vs mes anterior (+12%)",
                "tendencia": "up"
            }),
        }],
    }];

    Ok(boards)
}

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
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_my_boards])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}