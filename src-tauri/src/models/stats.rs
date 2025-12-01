use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GlobalDataset {
    pub id: String,
    pub nombre: String,
    pub tipo: String,
    pub columnas: Vec<String>,
    pub datos: Vec<serde_json::Value>,
}