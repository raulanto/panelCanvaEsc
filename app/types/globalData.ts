// Tipos para el estado global de datos

/**
 * Define la estructura de un Dataset global.
 */
export interface GlobalDataset {
    id: string // ID único del dataset
    nombre: string // Nombre amigable (ej: "Ventas Q3 2024")
    tipo: 'grafico' | 'tabla' // Tipo de datos que contiene
    columnas: string[] // Nombres de las columnas/campos
    datos: Record<string, any>[] // Array de objetos con los datos
}
