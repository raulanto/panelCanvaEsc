use serde::{Deserialize,Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User{
    pub id: String,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub created_at: String,
    pub updated_at: String,
}


#[derive(Debug, Deserialize)]
pub struct CreateUserDto{
    pub username: String,
    pub email: String,
    pub password: String,
}


#[derive(Debug, Deserialize)]
pub struct LoginDto {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: User,
    pub token: String,
}