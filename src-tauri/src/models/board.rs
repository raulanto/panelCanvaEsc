use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, Clone)]
#[derive(Debug)]
#[derive(Default)]
pub struct Position {
    pub x: i32,
    pub y: i32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Size {
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Panel {
    pub id: String,
    pub board_id: String,
    pub tipo: String,
    pub titulo: String,
    #[sqlx(skip)]
    pub posicion: Position,
    #[sqlx(skip)]
    #[serde(rename = "tamaño")]
    pub tamano: Size,
    pub z_index: i32,
    pub activo: bool,
    pub dataset_id: Option<String>, // Vinculación al dataset
    #[sqlx(skip)]
    pub config: serde_json::Value, // Configuración específica del panel
    #[sqlx(skip)]
    pub data: Option<serde_json::Value>, // Datos del dataset vinculado
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PanelDb {
    pub id: String,
    pub board_id: String,
    pub tipo: String,
    pub titulo: String,
    pub posicion_x: i32,
    pub posicion_y: i32,
    pub ancho: i32,
    pub alto: i32,
    pub z_index: i32,
    pub activo: i32,
    pub dataset_id: Option<String>,
    pub config: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Board {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub description: String,
    pub icon: String,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
    #[sqlx(skip)]
    pub panels: Vec<Panel>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateBoardDto {
    pub title: String,
    pub description: String,
    pub icon: String,
    pub color: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePanelDto {
    pub board_id: String,
    pub tipo: String,
    pub titulo: String,
    pub posicion: Position,
    pub tamano: Size,
    pub z_index: i32,
    pub dataset_id: Option<String>,
    pub config: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePanelDto {
    pub titulo: Option<String>,
    pub posicion: Option<Position>,
    pub tamano: Option<Size>,
    pub z_index: Option<i32>,
    pub activo: Option<bool>,
    pub dataset_id: Option<String>,
    pub config: Option<serde_json::Value>,
}