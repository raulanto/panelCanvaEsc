// types/board.ts
export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Panel {
    id: string;
    tipo: 'estadistica' | 'grafico' | 'tabla';
    titulo: string;
    posicion: Position;
    tamaño: Size; // Nota: Rust enviará esto si usamos #[serde(rename = "tamaño")]
    zIndex: number;
    activo: boolean;
    data: any;
}

export interface Board {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    createdAt: string;
    panels: Panel[];
}