use crate::models::{
    board::{Board, CreateBoardDto, CreatePanelDto, Panel, PanelDb, Position, Size},
    database::{AppStateHandle, DbError, DbResult},
};
use chrono::Utc;
use uuid::Uuid;

#[tauri::command]
pub async fn get_my_boards(state: AppStateHandle<'_>, user_id: String) -> DbResult<Vec<Board>> {
    let pool = &state.pool;

    // Obtener todos los boards del usuario
    let boards: Vec<Board> = sqlx::query_as(
        r#"
        SELECT id, user_id, title, description, icon, color, created_at, updated_at
        FROM boards
        WHERE user_id = ?
        ORDER BY created_at DESC
        "#,
    )
    .bind(&user_id)
    .fetch_all(&**pool)
    .await?;

    let mut result_boards = Vec::new();

    for mut board in boards {
        // Obtener paneles del board
        let panels = get_panels_for_board(state.clone(), &board.id).await?;
        board.panels = panels;
        result_boards.push(board);
    }

    Ok(result_boards)
}

#[tauri::command]
pub async fn get_board_by_id(
    state: AppStateHandle<'_>,
    board_id: String,
    user_id: String,
) -> DbResult<Board> {
    let pool = &state.pool;

    // Obtener board verificando que pertenece al usuario
    let mut board: Board = sqlx::query_as(
        r#"
        SELECT id, user_id, title, description, icon, color, created_at, updated_at
        FROM boards
        WHERE id = ? AND user_id = ?
        "#,
    )
    .bind(&board_id)
    .bind(&user_id)
    .fetch_optional(&**pool)
    .await?
    .ok_or(DbError::NotFound)?;

    // Obtener paneles con sus datos
    board.panels = get_panels_for_board(state, &board_id).await?;

    Ok(board)
}

#[tauri::command]
pub async fn create_board(
    state: AppStateHandle<'_>,
    user_id: String,
    dto: CreateBoardDto,
) -> DbResult<Board> {
    let pool = &state.pool;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        r#"
        INSERT INTO boards (id, user_id, title, description, icon, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&user_id)
    .bind(&dto.title)
    .bind(&dto.description)
    .bind(&dto.icon)
    .bind(&dto.color)
    .bind(&now)
    .bind(&now)
    .execute(&**pool)
    .await?;

    get_board_by_id(state, id, user_id).await
}

#[tauri::command]
pub async fn create_panel(
    state: AppStateHandle<'_>,
    user_id: String,
    dto: CreatePanelDto,
) -> DbResult<Panel> {
    let pool = &state.pool;

    // Verificar que el board pertenece al usuario
    let _board: Board = sqlx::query_as(
        "SELECT id, user_id, title, description, icon, color, created_at, updated_at FROM boards WHERE id = ? AND user_id = ?"
    )
        .bind(&dto.board_id)
        .bind(&user_id)
        .fetch_optional(&**pool)
        .await?
        .ok_or(DbError::Unauthorized)?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let config = dto.config.unwrap_or(serde_json::json!({}));

    sqlx::query(
        r#"
        INSERT INTO panels
        (id, board_id, tipo, titulo, posicion_x, posicion_y, ancho, alto, z_index, activo, dataset_id, config, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
        .bind(&id)
        .bind(&dto.board_id)
        .bind(&dto.tipo)
        .bind(&dto.titulo)
        .bind(dto.posicion.x)
        .bind(dto.posicion.y)
        .bind(dto.tamano.width)
        .bind(dto.tamano.height)
        .bind(dto.z_index)
        .bind(0)
        .bind(&dto.dataset_id)
        .bind(config.to_string())
        .bind(&now)
        .bind(&now)
        .execute(&**pool)
        .await?;

    get_panel_with_data(state, &id).await
}

// Función helper para obtener paneles de un board con sus datos


async fn get_panels_for_board(state: AppStateHandle<'_>, board_id: &str) -> DbResult<Vec<Panel>> {
    let pool = &state.pool;

    let rows = sqlx::query(
        r#"
    SELECT id, board_id, tipo, titulo, posicion_x, posicion_y, ancho, alto,
           z_index, activo, dataset_id, config, created_at, updated_at
    FROM panels
    WHERE board_id = ?
    ORDER BY z_index
    "#,
    )
        .bind(board_id)
        .fetch_all(&**pool)
        .await?;

    let mut panels_db: Vec<PanelDb> = Vec::new();
    for row in rows {
        let panel_db = PanelDb {
            id: row.try_get("id")?,
            board_id: row.try_get("board_id")?,
            tipo: row.try_get("tipo")?,
            titulo: row.try_get("titulo")?,
            posicion_x: row.try_get("posicion_x")?,
            posicion_y: row.try_get("posicion_y")?,
            ancho: row.try_get("ancho")?,
            alto: row.try_get("alto")?,
            z_index: row.try_get("z_index")?,
            activo: row.try_get("activo")?,
            dataset_id: row.try_get("dataset_id")?,
            config: row.try_get("config")?,
            created_at: row.try_get("created_at")?,
            updated_at: row.try_get("updated_at")?,
        };
        panels_db.push(panel_db);
    }

    let mut panels = Vec::new();

    for panel_db in panels_db {
        let mut panel = Panel {
            id: panel_db.id.clone(),
            board_id: panel_db.board_id,
            tipo: panel_db.tipo,
            titulo: panel_db.titulo,
            posicion: Position {
                x: panel_db.posicion_x,
                y: panel_db.posicion_y,
            },
            tamano: Size {
                width: panel_db.ancho,
                height: panel_db.alto,
            },
            z_index: panel_db.z_index,
            activo: panel_db.activo != 0,
            dataset_id: panel_db.dataset_id.clone(),
            config: serde_json::from_str(&panel_db.config).unwrap_or(serde_json::json!({})),
            data: None,
            created_at: panel_db.created_at,
            updated_at: panel_db.updated_at,
        };

        // Si el panel tiene un dataset vinculado, obtener los datos
        if let Some(dataset_id) = &panel_db.dataset_id {
            panel.data = get_dataset_data_for_panel(state.clone(), dataset_id).await.ok();
        }

        panels.push(panel);
    }

    Ok(panels)
}




async fn get_panel_with_data(state: AppStateHandle<'_>, panel_id: &str) -> DbResult<Panel> {
    let pool = &state.pool;

    let panel_db: PanelDb = sqlx::query_as::<_, PanelDb>(
        r#"
        SELECT id, board_id, tipo, titulo, posicion_x, posicion_y, ancho, alto,
               z_index, activo, dataset_id, config, created_at, updated_at
        FROM panels
        WHERE id = ?
        "#,
    )
        .bind(panel_id)
        .fetch_optional(&**pool)
        .await?
        .ok_or(DbError::NotFound)?;

    let mut panel = Panel {
        id: panel_db.id.clone(),
        board_id: panel_db.board_id,
        tipo: panel_db.tipo,
        titulo: panel_db.titulo,
        posicion: Position {
            x: panel_db.posicion_x,
            y: panel_db.posicion_y,
        },
        tamano: Size {
            width: panel_db.ancho,
            height: panel_db.alto,
        },
        z_index: panel_db.z_index,
        activo: panel_db.activo != 0,
        dataset_id: panel_db.dataset_id.clone(),
        config: serde_json::from_str(&panel_db.config).unwrap_or_else(|_| serde_json::json!({})),
        data: None,
        created_at: panel_db.created_at,
        updated_at: panel_db.updated_at,
    };

    if let Some(dataset_id) = panel_db.dataset_id.as_deref() {
        panel.data = get_dataset_data_for_panel(state.clone(), dataset_id).await.ok();
    }

    Ok(panel)
}
// Helper para obtener datos del dataset
async fn get_dataset_data_for_panel(
    state: AppStateHandle<'_>,
    dataset_id: &str,
) -> DbResult<serde_json::Value> {
    let pool = &state.pool;

    // Obtener dataset
    let dataset: (String, String, String) =
        sqlx::query_as("SELECT nombre, tipo, columnas FROM global_datasets WHERE id = ?")
            .bind(dataset_id)
            .fetch_optional(&**pool)
            .await?
            .ok_or(DbError::NotFound)?;

    let columnas: Vec<String> = serde_json::from_str(&dataset.2).unwrap_or_default();

    // Obtener datos
    let datos_raw: Vec<(String,)> = sqlx::query_as(
        "SELECT data FROM dataset_data WHERE dataset_id = ? ORDER BY created_at DESC",
    )
    .bind(dataset_id)
    .fetch_all(&**pool)
    .await?;

    let mut datos = Vec::new();
    for (data_str,) in datos_raw {
        if let Ok(data) = serde_json::from_str::<serde_json::Value>(&data_str) {
            datos.push(data);
        }
    }

    Ok(serde_json::json!({
        "nombre": dataset.0,
        "tipo": dataset.1,
        "columnas": columnas,
        "datos": datos
    }))
}
