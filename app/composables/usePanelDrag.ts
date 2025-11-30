// composables/usePanelDrag.ts

import { ref } from 'vue'
import type { Panel, DragState } from '~/types/panel'

export const usePanelDrag = () => {
    const dragState = ref<DragState>({
        panel: null,
        offsetX: 0,
        offsetY: 0,
        startX: 0,
        startY: 0
    })

    const isDragging = ref(false)

    /**
     * Inicia el arrastre de un panel
     */
    const iniciarArrastre = (
        panel: Panel,
        event: MouseEvent,
        canvasX: number = 0,
        canvasY: number = 0,
        canvasScale: number = 1
    ) => {
        event.preventDefault()
        event.stopPropagation()

        // Calcular offset considerando la escala y posición del canvas
        const clientX = (event.clientX - canvasX) / canvasScale
        const clientY = (event.clientY - canvasY) / canvasScale

        dragState.value = {
            panel,
            offsetX: clientX - panel.posicion.x,
            offsetY: clientY - panel.posicion.y,
            startX: panel.posicion.x,
            startY: panel.posicion.y
        }

        panel.arrastrando = true
        panel.activo = true
        isDragging.value = true
    }

    /**
     * Mueve el panel mientras se arrastra
     */
    const moverPanel = (
        event: MouseEvent,
        canvasX: number = 0,
        canvasY: number = 0,
        canvasScale: number = 1
    ) => {
        if (!dragState.value.panel || !isDragging.value) return

        const clientX = (event.clientX - canvasX) / canvasScale
        const clientY = (event.clientY - canvasY) / canvasScale

        const nuevaX = clientX - dragState.value.offsetX
        const nuevaY = clientY - dragState.value.offsetY

        dragState.value.panel.posicion = {
            x: nuevaX,
            y: nuevaY
        }
    }

    /**
     * Finaliza el arrastre del panel
     */
    const soltarPanel = () => {
        if (dragState.value.panel) {
            dragState.value.panel.arrastrando = false
            dragState.value.panel.activo = false
        }

        dragState.value = {
            panel: null,
            offsetX: 0,
            offsetY: 0,
            startX: 0,
            startY: 0
        }

        isDragging.value = false
    }

    /**
     * Cancela el arrastre y restaura posición original
     */
    const cancelarArrastre = () => {
        if (dragState.value.panel) {
            dragState.value.panel.posicion = {
                x: dragState.value.startX,
                y: dragState.value.startY
            }
            soltarPanel()
        }
    }

    return {
        // State
        dragState,
        isDragging,

        // Methods
        iniciarArrastre,
        moverPanel,
        soltarPanel,
        cancelarArrastre
    }
}