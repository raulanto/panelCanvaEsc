use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::sync::Arc;
use tauri::State;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DbError {
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),

    #[error("Not found")]
    NotFound,

    #[error("Invalid data: {0}")]
    InvalidData(String),

    #[error("Unauthorized")]
    Unauthorized,
}

impl serde::Serialize for DbError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type DbResult<T> = Result<T, DbError>;

#[derive(Clone)]
pub struct AppState {
    pub pool: Arc<SqlitePool>,
}

impl AppState {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;

        // Ejecutar migraciones
        sqlx::query(include_str!("../../shema.sql"))
            .execute(&pool)
            .await?;

        Ok(Self {
            pool: Arc::new(pool),
        })
    }
}

pub type AppStateHandle<'a> = State<'a, AppState>;