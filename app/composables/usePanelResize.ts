import { ref } from 'vue'
import type { Panel } from '~/types/panel'
import { PANEL_SIZE_PRESETS } from '~/types/panel'
import { usePanelManager } from './usePanelManager'

const { actualizarTamano, activarPanel } = usePanelManager()

const isResizing = ref(false)
const panelActual = ref<Panel | null>(null)
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

export const usePanelResize = () => {
    const iniciarRedimension = (
        panel: Panel,
        event: MouseEvent,
        canvasX: number,
        canvasY: number,
        scale: number
    ) => {
        isResizing.value = true
        panelActual.value = panel
        startX.value = event.clientX
        startY.value = event.clientY
        startWidth.value = panel.tamaño.width
        startHeight.value = panel.tamaño.height

        // Activar el panel al empezar a redimensionar
        activarPanel(panel.id)

        // Marcar como redimensionando
        panel.redimensionando = true

        event.preventDefault()
        event.stopPropagation()
    }

    const redimensionarPanel = (
        event: MouseEvent,
        canvasX: number,
        canvasY: number,
        scale: number
    ) => {
        if (!isResizing.value || !panelActual.value) return

        const deltaX = (event.clientX - startX.value) / scale
        const deltaY = (event.clientY - startY.value) / scale

        let newWidth = startWidth.value + deltaX
        let newHeight = startHeight.value + deltaY

        // Obtener límites del tipo de panel
        const preset = PANEL_SIZE_PRESETS[panelActual.value.tipo]

        // Aplicar límites mínimos
        newWidth = Math.max(newWidth, preset.minWidth)
        newHeight = Math.max(newHeight, preset.minHeight)

        // Aplicar límites máximos si existen
        if (preset.maxWidth !== undefined) {
            newWidth = Math.min(newWidth, preset.maxWidth)
        }
        if (preset.maxHeight !== undefined) {
            newHeight = Math.min(newHeight, preset.maxHeight)
        }

        // Actualizar el tamaño
        actualizarTamano(panelActual.value.id, newWidth, newHeight)
    }

    const finalizarRedimension = () => {
        if (panelActual.value) {
            panelActual.value.redimensionando = false
        }

        isResizing.value = false
        panelActual.value = null
        startX.value = 0
        startY.value = 0
        startWidth.value = 0
        startHeight.value = 0
    }

    return {
        isResizing,
        iniciarRedimension,
        redimensionarPanel,
        finalizarRedimension
    }
}