use crate::models::GlobalDataset;
use serde_json::json;

#[tauri::command]
pub fn get_global_datasets() -> Vec<GlobalDataset> {
    // Simulamos datos financieros (similar a tu archivo dataGlobal.ts)
    let finance_data = GlobalDataset {
        id: "global-finance-2024".to_string(),
        nombre: "Ingresos vs Egresos 2024".to_string(),
        tipo: "grafico".to_string(),
        columnas: vec!["date".to_string(), "Ingresos".to_string(), "Egresos".to_string(), "Beneficio".to_string()],
        datos: vec![
            json!({ "date": "2024-01-01", "Ingresos": 45000, "Egresos": 32000, "Beneficio": 13000 }),
            json!({ "date": "2024-02-01", "Ingresos": 48000, "Egresos": 34000, "Beneficio": 14000 }),
            json!({ "date": "2024-03-01", "Ingresos": 51000, "Egresos": 31000, "Beneficio": 20000 }),
            json!({ "date": "2024-04-01", "Ingresos": 49000, "Egresos": 35000, "Beneficio": 14000 }),
        ],
    };

    // Simulamos métricas de sistema
    let system_data = GlobalDataset {
        id: "global-system-performance".to_string(),
        nombre: "Métricas de Sistema (Server Rust)".to_string(),
        tipo: "tabla".to_string(),
        columnas: vec!["timestamp".to_string(), "CPU".to_string(), "RAM".to_string(), "Estado".to_string()],
        datos: vec![
            json!({ "timestamp": "10:00", "CPU": 12, "RAM": 45, "Estado": "OK" }),
            json!({ "timestamp": "10:05", "CPU": 15, "RAM": 46, "Estado": "OK" }),
            json!({ "timestamp": "10:10", "CPU": 45, "RAM": 60, "Estado": "WARN" }),
            json!({ "timestamp": "10:15", "CPU": 10, "RAM": 44, "Estado": "OK" }),
        ],
    };

    vec![finance_data, system_data]

}