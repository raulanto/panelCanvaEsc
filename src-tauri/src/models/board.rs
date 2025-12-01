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
#[serde(rename_all = "camelCase")]
pub struct Panel {
    pub id: String,
    pub tipo: String,
    pub titulo: String,
    pub posicion: Position,
    #[serde(rename = "tamaño")]
    pub tamano: Size,
    pub z_index: i32,
    pub activo: bool,
    pub data: serde_json::Value,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Board {
    pub id: String,
    pub title: String,
    pub description: String,
    pub icon: String,
    pub color: String,
    pub created_at: String,
    pub panels: Vec<Panel>,
}