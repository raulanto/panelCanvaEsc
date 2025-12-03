use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct GlobalDataset {
    pub id: String,
    pub nombre: String,
    pub tipo: String,
    #[sqlx(skip)]
    pub columnas: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
    #[sqlx(skip)]
    pub datos: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalDatasetDb {
    pub id: String,
    pub nombre: String,
    pub tipo: String,
    pub columnas: String, // JSON string
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DatasetData {
    pub id: String,
    pub dataset_id: String,
    pub data: String, // JSON string
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDatasetDto {
    pub nombre: String,
    pub tipo: String,
    pub columnas: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddDatasetDataDto {
    pub dataset_id: String,
    pub data: serde_json::Value,
}