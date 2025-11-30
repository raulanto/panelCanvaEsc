// composables/useCanvasPan.ts

import { ref, computed } from 'vue'
import type { CanvasState } from '~/types/panel'

export const useCanvasPan = () => {
    const canvas = ref<CanvasState>({
        x: 0,
        y: 0,
        scale: 1,
        panning: false
    })

    const panStart = ref({ x: 0, y: 0 })
    const isPanning = computed(() => canvas.value.panning)

    /**
     * Inicia el paneo del canvas
     */
    const iniciarPan = (event: MouseEvent) => {
        
        const esPanPermitido = event.button === 1 || (event.button === 0 && event.shiftKey)

        if (!esPanPermitido) return

        event.preventDefault()

        canvas.value.panning = true
        panStart.value = {
            x: event.clientX - canvas.value.x,
            y: event.clientY - canvas.value.y
        }
    }

    /**
     * Mueve el canvas mientras se hace pan
     */
    const moverCanvas = (event: MouseEvent) => {
        if (!canvas.value.panning) return

        event.preventDefault()

        canvas.value.x = event.clientX - panStart.value.x
        canvas.value.y = event.clientY - panStart.value.y
    }

    /**
     * Finaliza el paneo del canvas
     */
    const detenerPan = () => {
        canvas.value.panning = false
    }

    /**
     * Hace zoom en el canvas
     */
    const hacerZoom = (delta: number, centerX: number, centerY: number) => {
        const zoomFactor = delta > 0 ? 1.1 : 0.9
        const newScale = Math.max(0.1, Math.min(3, canvas.value.scale * zoomFactor))

        // Ajustar posición para zoom hacia el cursor
        const scaleChange = newScale / canvas.value.scale
        canvas.value.x = centerX - (centerX - canvas.value.x) * scaleChange
        canvas.value.y = centerY - (centerY - canvas.value.y) * scaleChange
        canvas.value.scale = newScale
    }

    /**
     * Resetea el canvas a la posición inicial
     */
    const resetearCanvas = () => {
        canvas.value = {
            x: 0,
            y: 0,
            scale: 1,
            panning: false
        }
    }

    /**
     * Centra el canvas en coordenadas específicas
     */
    const centrarEn = (x: number, y: number, containerWidth: number, containerHeight: number) => {
        canvas.value.x = (containerWidth / 2) - x * canvas.value.scale
        canvas.value.y = (containerHeight / 2) - y * canvas.value.scale
    }

    /**
     * Ajusta el zoom para mostrar todos los paneles
     */
    const ajustarZoomATodos = (
        minX: number,
        minY: number,
        maxX: number,
        maxY: number,
        containerWidth: number,
        containerHeight: number,
        padding: number = 50
    ) => {
        const contentWidth = maxX - minX
        const contentHeight = maxY - minY

        const scaleX = (containerWidth - padding * 2) / contentWidth
        const scaleY = (containerHeight - padding * 2) / contentHeight
        const newScale = Math.min(scaleX, scaleY, 1)

        canvas.value.scale = newScale

        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        centrarEn(centerX, centerY, containerWidth, containerHeight)
    }

    return {

        canvas,
        isPanning,


        iniciarPan,
        moverCanvas,
        detenerPan,
        hacerZoom,
        resetearCanvas,
        centrarEn,
        ajustarZoomATodos
    }
}