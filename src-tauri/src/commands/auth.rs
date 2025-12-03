use crate::models::{
    database::{AppStateHandle, DbError, DbResult},
    user::{AuthResponse, CreateUserDto, LoginDto, User},
};
use chrono::Utc;
use uuid::Uuid;

#[tauri::command]
pub async fn register_user(
    state: AppStateHandle<'_>,
    dto: CreateUserDto,
) -> DbResult<AuthResponse> {
    let pool = &state.pool;

    // Hash de la contraseña
    let password_hash = bcrypt::hash(&dto.password, bcrypt::DEFAULT_COST)
        .map_err(|e| DbError::InvalidData(format!("Error al hashear contraseña: {}", e)))?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    // Insertar usuario
    sqlx::query(
        r#"
        INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        "#
    )
        .bind(&id)
        .bind(&dto.username)
        .bind(&dto.email)
        .bind(&password_hash)
        .bind(&now)
        .bind(&now)
        .execute(&**pool)
        .await
        .map_err(|e| DbError::InvalidData(format!("Usuario o email ya existe: {}", e)))?;

    // Recuperar usuario creado
    let user: User = sqlx::query_as(
        "SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE id = ?"
    )
        .bind(&id)
        .fetch_one(&**pool)
        .await?;

    // Generar token simple (en producción usar JWT)
    let token = Uuid::new_v4().to_string();

    Ok(AuthResponse { user, token })
}

#[tauri::command]
pub async fn login_user(
    state: AppStateHandle<'_>,
    dto: LoginDto,
) -> DbResult<AuthResponse> {
    let pool = &state.pool;

    // Buscar usuario
    let user: User = sqlx::query_as(
        "SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = ?"
    )
        .bind(&dto.username)
        .fetch_optional(&**pool)
        .await?
        .ok_or(DbError::Unauthorized)?;

    // Verificar contraseña
    let valid = bcrypt::verify(&dto.password, &user.password_hash)
        .map_err(|e| DbError::InvalidData(format!("Error al verificar contraseña: {}", e)))?;

    if !valid {
        return Err(DbError::Unauthorized);
    }

    // Generar token
    let token = Uuid::new_v4().to_string();

    Ok(AuthResponse { user, token })
}

#[tauri::command]
pub async fn get_user_by_id(
    state: AppStateHandle<'_>,
    user_id: String,
) -> DbResult<User> {
    let pool = &state.pool;

    let user: User = sqlx::query_as(
        "SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE id = ?"
    )
        .bind(&user_id)
        .fetch_optional(&**pool)
        .await?
        .ok_or(DbError::NotFound)?;

    Ok(user)
}