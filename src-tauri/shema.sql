-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
                                     id TEXT PRIMARY KEY,
                                     username TEXT NOT NULL UNIQUE,
                                     email TEXT NOT NULL UNIQUE,
                                     password_hash TEXT NOT NULL,
                                     created_at TEXT NOT NULL,
                                     updated_at TEXT NOT NULL
);

-- Tabla de datasets globales
CREATE TABLE IF NOT EXISTS global_datasets (
                                               id TEXT PRIMARY KEY,
                                               nombre TEXT NOT NULL,
                                               tipo TEXT NOT NULL, -- 'grafico', 'tabla', 'kpi'
                                               columnas TEXT NOT NULL, -- JSON array de nombres de columnas
                                               created_at TEXT NOT NULL,
                                               updated_at TEXT NOT NULL
);

-- Tabla de datos de datasets
CREATE TABLE IF NOT EXISTS dataset_data (
                                            id TEXT PRIMARY KEY,
                                            dataset_id TEXT NOT NULL,
                                            data TEXT NOT NULL, -- JSON con los datos
                                            created_at TEXT NOT NULL,
                                            FOREIGN KEY (dataset_id) REFERENCES global_datasets(id) ON DELETE CASCADE
    );

-- Tabla de boards
CREATE TABLE IF NOT EXISTS boards (
                                      id TEXT PRIMARY KEY,
                                      user_id TEXT NOT NULL,
                                      title TEXT NOT NULL,
                                      description TEXT,
                                      icon TEXT,
                                      color TEXT,
                                      created_at TEXT NOT NULL,
                                      updated_at TEXT NOT NULL,
                                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- Tabla de paneles
CREATE TABLE IF NOT EXISTS panels (
                                      id TEXT PRIMARY KEY,
                                      board_id TEXT NOT NULL,
                                      tipo TEXT NOT NULL, -- 'estadistica', 'grafico', 'tabla'
                                      titulo TEXT NOT NULL,
                                      posicion_x INTEGER NOT NULL,
                                      posicion_y INTEGER NOT NULL,
                                      ancho INTEGER NOT NULL,
                                      alto INTEGER NOT NULL,
                                      z_index INTEGER NOT NULL,
                                      activo INTEGER NOT NULL DEFAULT 0,
                                      dataset_id TEXT, -- Vinculación al dataset
                                      config TEXT, -- JSON con configuración específica del panel
                                      created_at TEXT NOT NULL,
                                      updated_at TEXT NOT NULL,
                                      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (dataset_id) REFERENCES global_datasets(id) ON DELETE SET NULL
    );

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_panels_board_id ON panels(board_id);
CREATE INDEX IF NOT EXISTS idx_panels_dataset_id ON panels(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_data_dataset_id ON dataset_data(dataset_id);
