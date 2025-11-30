// utils/panelHelpers.ts

import type { Panel, PanelType, PanelPosition, PanelSize } from '~/types/panel'
import { PANEL_SIZE_PRESETS } from '~/types/panel'

/**
 * Genera un ID único para paneles
 */
export function generatePanelId(): string {
    return `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calcula la posición central del contenedor para un panel
 */
export function calcularPosicionCentral(
    containerWidth: number,
    containerHeight: number,
    panelWidth: number,
    panelHeight: number,
    canvasX: number = 0,
    canvasY: number = 0
): PanelPosition {
    return {
        x: (containerWidth / 2) - (panelWidth / 2) - canvasX,
        y: (containerHeight / 2) - (panelHeight / 2) - canvasY
    }
}

/**
 * Calcula posición con offset para evitar superposición
 */
export function calcularPosicionConOffset(
    posicionBase: PanelPosition,
    indice: number,
    offset: number = 30
): PanelPosition {
    return {
        x: posicionBase.x + (indice * offset),
        y: posicionBase.y + (indice * offset)
    }
}

/**
 * Obtiene el tamaño predefinido según el tipo de panel
 */
export function obtenerTamanoPreset(tipo: PanelType): PanelSize {
    const preset = PANEL_SIZE_PRESETS[tipo]
    return {
        width: preset.width,
        height: preset.height
    }
}

/**
 * Valida que el tamaño del panel no sea menor al mínimo
 */
export function validarTamanoMinimo(
    tipo: PanelType,
    width: number,
    height: number
): PanelSize {
    const preset = PANEL_SIZE_PRESETS[tipo]
    return {
        width: Math.max(width, preset.minWidth),
        height: Math.max(height, preset.minHeight)
    }
}

/**
 * Genera datos de muestra según el tipo de panel
 */
export function generarDatosMuestra(tipo: PanelType) {
    switch (tipo) {
        case 'estadistica':
            return {
                valor: Math.floor(Math.random() * 10000),
                subtitulo: 'Métrica del mes'
            }
        case 'grafico':
            return {
                datos: Array.from({ length: 5 }, (_, i) => ({
                    label: `Dato ${i + 1}`,
                    valor: Math.floor(Math.random() * 100)
                }))
            }
        case 'lista':
            return {
                items: Array.from({ length: 6 }, (_, i) => ({
                    id: i + 1,
                    titulo: `Elemento ${i + 1}`,
                    estado: ['Pendiente', 'En progreso', 'Completado'][Math.floor(Math.random() * 3)]
                }))
            }
        case 'tabla':
            return {
                columnas: ['Nombre', 'Valor', 'Estado'],
                filas: Array.from({ length: 5 }, (_, i) => [
                    `Ítem ${i + 1}`,
                    Math.floor(Math.random() * 1000),
                    Math.random() > 0.5 ? 'Activo' : 'Inactivo'
                ])
            }
        default:
            return {}
    }
}

/**
 * Limita la posición del panel dentro de un área
 */
export function limitarPosicion(
    x: number,
    y: number,
    panelWidth: number,
    panelHeight: number,
    minX: number = -5000,
    minY: number = -5000,
    maxX: number = 5000,
    maxY: number = 5000
): PanelPosition {
    return {
        x: Math.max(minX, Math.min(x, maxX - panelWidth)),
        y: Math.max(minY, Math.min(y, maxY - panelHeight))
    }
}