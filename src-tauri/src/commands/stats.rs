use crate::models::{
    database::{AppStateHandle, DbError, DbResult},
    stats::{AddDatasetDataDto, CreateDatasetDto, DatasetData, GlobalDataset, GlobalDatasetDb},
};
use chrono::Utc;
use uuid::Uuid;

#[tauri::command]
pub async fn get_global_datasets(state: AppStateHandle<'_>) -> DbResult<Vec<GlobalDataset>> {
    let pool = &state.pool;

    let datasets_db: Vec<GlobalDatasetDb> = sqlx::query_as(
        "SELECT id, nombre, tipo, columnas, created_at, updated_at FROM global_datasets ORDER BY created_at DESC"
    )
        .fetch_all(&**pool)
        .await?;

    let mut datasets = Vec::new();

    for dataset_db in datasets_db {
        let columnas: Vec<String> = serde_json::from_str(&dataset_db.columnas).unwrap_or_default();

        // Obtener datos del dataset
        let datos_raw: Vec<(String,)> = sqlx::query_as(
            "SELECT data FROM dataset_data WHERE dataset_id = ? ORDER BY created_at DESC",
        )
        .bind(&dataset_db.id)
        .fetch_all(&**pool)
        .await?;

        let mut datos = Vec::new();
        for (data_str,) in datos_raw {
            if let Ok(data) = serde_json::from_str::<serde_json::Value>(&data_str) {
                datos.push(data);
            }
        }

        datasets.push(GlobalDataset {
            id: dataset_db.id,
            nombre: dataset_db.nombre,
            tipo: dataset_db.tipo,
            columnas,
            created_at: dataset_db.created_at,
            updated_at: dataset_db.updated_at,
            datos,
        });
    }

    Ok(datasets)
}

#[tauri::command]
pub async fn get_dataset_by_id(
    state: AppStateHandle<'_>,
    dataset_id: String,
) -> DbResult<GlobalDataset> {
    let pool = &state.pool;

    let dataset_db: GlobalDatasetDb = sqlx::query_as(
        "SELECT id, nombre, tipo, columnas, created_at, updated_at FROM global_datasets WHERE id = ?"
    )
        .bind(&dataset_id)
        .fetch_optional(&**pool)
        .await?
        .ok_or(DbError::NotFound)?;

    let columnas: Vec<String> = serde_json::from_str(&dataset_db.columnas).unwrap_or_default();

    // Obtener datos
    let datos_raw: Vec<(String,)> = sqlx::query_as(
        "SELECT data FROM dataset_data WHERE dataset_id = ? ORDER BY created_at DESC",
    )
    .bind(&dataset_id)
    .fetch_all(&**pool)
    .await?;

    let mut datos = Vec::new();
    for (data_str,) in datos_raw {
        if let Ok(data) = serde_json::from_str::<serde_json::Value>(&data_str) {
            datos.push(data);
        }
    }

    Ok(GlobalDataset {
        id: dataset_db.id,
        nombre: dataset_db.nombre,
        tipo: dataset_db.tipo,
        columnas,
        created_at: dataset_db.created_at,
        updated_at: dataset_db.updated_at,
        datos,
    })
}

#[tauri::command]
pub async fn create_dataset(
    state: AppStateHandle<'_>,
    dto: CreateDatasetDto,
) -> DbResult<GlobalDataset> {
    let pool = &state.pool;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let columnas_json =
        serde_json::to_string(&dto.columnas).map_err(|e| DbError::InvalidData(e.to_string()))?;

    sqlx::query(
        r#"
        INSERT INTO global_datasets (id, nombre, tipo, columnas, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&dto.nombre)
    .bind(&dto.tipo)
    .bind(&columnas_json)
    .bind(&now)
    .bind(&now)
    .execute(&**pool)
    .await?;

    Ok(GlobalDataset {
        id,
        nombre: dto.nombre,
        tipo: dto.tipo,
        columnas: dto.columnas,
        created_at: now.clone(),
        updated_at: now,
        datos: vec![],
    })
}

#[tauri::command]
pub async fn add_dataset_data(
    state: AppStateHandle<'_>,
    dto: AddDatasetDataDto,
) -> DbResult<DatasetData> {
    let pool = &state.pool;

    // Verificar que el dataset existe
    let _: (String,) = sqlx::query_as("SELECT id FROM global_datasets WHERE id = ?")
        .bind(&dto.dataset_id)
        .fetch_optional(&**pool)
        .await?
        .ok_or(DbError::NotFound)?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let data_json =
        serde_json::to_string(&dto.data).map_err(|e| DbError::InvalidData(e.to_string()))?;

    sqlx::query(
        r#"
        INSERT INTO dataset_data (id, dataset_id, data, created_at)
        VALUES (?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&dto.dataset_id)
    .bind(&data_json)
    .bind(&now)
    .execute(&**pool)
    .await?;

    // Actualizar timestamp del dataset
    sqlx::query("UPDATE global_datasets SET updated_at = ? WHERE id = ?")
        .bind(&now)
        .bind(&dto.dataset_id)
        .execute(&**pool)
        .await?;

    Ok(DatasetData {
        id,
        dataset_id: dto.dataset_id,
        data: data_json,
        created_at: now,
    })
}

#[tauri::command]
pub async fn delete_dataset(state: AppStateHandle<'_>, dataset_id: String) -> DbResult<()> {
    let pool = &state.pool;

    let result = sqlx::query("DELETE FROM global_datasets WHERE id = ?")
        .bind(&dataset_id)
        .execute(&**pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(DbError::NotFound);
    }

    Ok(())
}
