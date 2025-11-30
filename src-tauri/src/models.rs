// src-tauri/src/models.rs
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Position {
    pub x: i32,
    pub y: i32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Size {
    pub width: i32,
    pub height: i32,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")] // Para que coincida con JS (zIndex, createdAt)
pub struct Panel {
    pub id: String,
    pub tipo: String, // 'estadistica' | 'grafico' | 'tabla'
    pub titulo: String,
    pub posicion: Position,
    #[serde(rename = "tamaño")] // Mapeamos 'tamaño' de Rust a 'tamaño' JSON
    pub tamano: Size,
    pub z_index: i32,
    pub activo: bool,
    pub data: serde_json::Value, // Flexible para aceptar cualquier objeto
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Board {
    pub id: String,
    pub title: String,
    pub description: String,
    pub icon: String,
    pub color: String,
    pub created_at: String, // Usaremos String ISO8601 por simplicidad
    pub panels: Vec<Panel>,
}
