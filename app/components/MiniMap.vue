<template>
    <div
        v-if="visible"
        class="fixed bottom-4 right-4 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50 flex flex-col transition-all duration-300 ease-in-out"
        :style="{ width: `${width}px`, height: `${height}px` }"
    >
        <!-- Header del minimapa con controles -->
        <div class="flex items-center justify-between px-2 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 select-none">
            <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-map" class="w-3.5 h-3.5 text-primary" />
                <span class="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Navegación</span>
            </div>
            <div class="flex items-center gap-1">
                <UTooltip text="Centrar Vista">
                    <UButton
                        icon="i-heroicons-arrows-pointing-in"
                        color="neutral"
                        variant="ghost"
                        @click="$emit('fit-view')"
                    />
                </UTooltip>
                <UTooltip text="Ocultar">
                    <UButton
                        icon="i-heroicons-chevron-down"
                        color="neutral"
                        variant="ghost"
                        @click="$emit('toggle')"
                    />
                </UTooltip>
            </div>
        </div>

        <!-- Canvas del minimapa -->
        <div
            ref="miniMapRef"
            class="relative flex-1 bg-neutral-100/50 dark:bg-neutral-900/50 cursor-crosshair overflow-hidden"
            @click="handleMapClick"
            @mousedown="handleMapMouseDown"
            @mousemove="handleMapMouseMove"
            @mouseup="handleMapMouseUp"
            @mouseleave="handleMapMouseUp"
            @wheel.prevent.stop="handleWheel"
        >
            <!-- Contenedor interno escalado para centrar contenido -->
            <div class="absolute inset-0 w-full h-full pointer-events-none">

                <!-- Grid de referencia (Fondo) -->
                <div class="absolute inset-0 opacity-10" :style="gridStyle" />

                <!-- Paneles (Representación simplificada) -->
                <div
                    v-for="panel in paneles"
                    :key="panel.id"
                    class="absolute rounded-sm transition-all duration-75 border"
                    :class="[
                        panel.activo
                            ? 'bg-primary-500/80 border-primary-600 z-10 shadow-sm'
                            : 'bg-neutral-400/60 dark:bg-neutral-600/60 border-neutral-500/50 dark:border-neutral-500/50 hover:bg-neutral-500/80'
                    ]"
                    :style="getPanelStyle(panel)"
                />

                <!-- Viewport (Área visible actual) -->
                <div
                    class="absolute border-2 border-primary-500 bg-primary-500/10 cursor-move transition-transform duration-75 z-20 shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]"
                    :style="viewportStyle"
                >
                    <!-- Indicador de centro del viewport -->
                    <div class="absolute top-1/2 left-1/2 w-1 h-1 bg-primary-500 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                </div>
            </div>

            <!-- Indicador de escala (Zoom level) -->
            <div class="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-mono pointer-events-none">
                {{ Math.round(scale * 100) }}%
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Panel } from '~/types/panel'

interface Props {
    paneles: Panel[]
    canvasX: number
    canvasY: number
    canvasScale: number
    containerWidth: number
    containerHeight: number
    visible?: boolean
    width?: number
    height?: number
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
    width: 240,
    height: 180
})

const emit = defineEmits<{
    'navigate': [x: number, y: number]
    'toggle': []
    'fit-view': [] // Nuevo evento para centrar todo
}>()

const miniMapRef = ref<HTMLElement | null>(null)
const isDraggingViewport = ref(false)
const internalZoom = ref(1) // Zoom interno del minimapa (opcional)

// --- LÍMITES Y ESCALA ---

// Calcular los límites totales del contenido (Bounding Box de todos los paneles)
const contentBounds = computed(() => {
    // Márgenes mínimos base (padding virtual alrededor de los paneles)
    const padding = 2000;

    if (props.paneles.length === 0) {
        return {
            minX: -padding,
            minY: -padding,
            maxX: padding * 2,
            maxY: padding * 2,
            width: padding * 3,
            height: padding * 3
        }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    props.paneles.forEach(p => {
        if (p.posicion.x < minX) minX = p.posicion.x
        if (p.posicion.y < minY) minY = p.posicion.y
        if (p.posicion.x + p.tamaño.width > maxX) maxX = p.posicion.x + p.tamaño.width
        if (p.posicion.y + p.tamaño.height > maxY) maxY = p.posicion.y + p.tamaño.height
    })

    // Añadir padding dinámico para que los paneles no toquen los bordes del minimapa
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    // Asegurar un tamaño mínimo para evitar divisiones por cero o zoom infinito
    const width = Math.max(maxX - minX, 1000)
    const height = Math.max(maxY - minY, 1000)

    return { minX, minY, maxX, maxY, width, height }
})

// Factor de escala: Relación entre tamaño real (minimapa px) y tamaño virtual (contenido)
const scale = computed(() => {
    // Restamos la altura del header (aprox 32px) para el área útil
    const mapHeight = props.height - 32

    const scaleX = props.width / contentBounds.value.width
    const scaleY = mapHeight / contentBounds.value.height

    // Usamos el menor para que todo quepa ("contain")
    return Math.min(scaleX, scaleY) * internalZoom.value
})

// Offset para centrar el contenido en el minimapa
const offset = computed(() => {
    const mapHeight = props.height - 32

    // Dimensiones escaladas del contenido
    const scaledContentWidth = contentBounds.value.width * scale.value
    const scaledContentHeight = contentBounds.value.height * scale.value

    // Centrar
    const offsetX = (props.width - scaledContentWidth) / 2
    const offsetY = (mapHeight - scaledContentHeight) / 2

    return { x: offsetX, y: offsetY }
})

// --- FUNCIONES DE CONVERSIÓN DE COORDENADAS ---

// De Coordenadas del Mundo (Canvas real) -> Coordenadas Minimapa (px)
const worldToMap = (worldX: number, worldY: number) => {
    // Relativo al origen del bounding box
    const relX = worldX - contentBounds.value.minX
    const relY = worldY - contentBounds.value.minY

    return {
        x: relX * scale.value + offset.value.x,
        y: relY * scale.value + offset.value.y
    }
}

// De Coordenadas Minimapa (px) -> Coordenadas del Mundo (Canvas real)
const mapToWorld = (mapX: number, mapY: number) => {
    const relX = (mapX - offset.value.x) / scale.value
    const relY = (mapY - offset.value.y) / scale.value

    return {
        x: relX + contentBounds.value.minX,
        y: relY + contentBounds.value.minY
    }
}

// --- ESTILOS VISUALES ---

const getPanelStyle = (panel: Panel) => {
    const pos = worldToMap(panel.posicion.x, panel.posicion.y)

    return {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${Math.max(panel.tamaño.width * scale.value, 2)}px`,
        height: `${Math.max(panel.tamaño.height * scale.value, 2)}px`
    }
}

const viewportStyle = computed(() => {
    // El viewport visible en el canvas es el inverso de la transformación
    // Viewport en coordenadas del mundo:
    const visibleWorldX = -props.canvasX / props.canvasScale
    const visibleWorldY = -props.canvasY / props.canvasScale
    const visibleWorldW = props.containerWidth / props.canvasScale
    const visibleWorldH = props.containerHeight / props.canvasScale

    const pos = worldToMap(visibleWorldX, visibleWorldY)

    return {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${visibleWorldW * scale.value}px`,
        height: `${visibleWorldH * scale.value}px`
    }
})

const gridStyle = computed(() => {
    const gridSize = 100 * scale.value // Grid virtual de 100px
    return {
        backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        // Alinear el grid con el origen del mundo
        backgroundPosition: `${offset.value.x - (contentBounds.value.minX * scale.value) % gridSize}px ${offset.value.y - (contentBounds.value.minY * scale.value) % gridSize}px`
    }
})

// --- INTERACCIÓN ---

const handleMapClick = (event: MouseEvent) => {
    if (isDraggingViewport.value) return
    navigate(event)
}

const handleMapMouseDown = (event: MouseEvent) => {
    if (!miniMapRef.value) return

    // Detectar si clicamos dentro del viewport actual para arrastrarlo
    const rect = miniMapRef.value.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Parsear estilo actual (calculado en computed)
    const vp = viewportStyle.value
    const vpX = parseFloat(vp.left)
    const vpY = parseFloat(vp.top)
    const vpW = parseFloat(vp.width)
    const vpH = parseFloat(vp.height)

    if (clickX >= vpX && clickX <= vpX + vpW && clickY >= vpY && clickY <= vpH + vpY) {
        isDraggingViewport.value = true
        event.preventDefault() // Evitar selección de texto
    } else {
        // Si clicamos fuera, navegamos directamente
        navigate(event)
        isDraggingViewport.value = true // Y empezamos a arrastrar desde ahí
    }
}

const handleMapMouseMove = (event: MouseEvent) => {
    if (!isDraggingViewport.value) return
    navigate(event)
}

const handleMapMouseUp = () => {
    isDraggingViewport.value = false
}

const handleWheel = (event: WheelEvent) => {
    // Zoom simple en el minimapa (opcional, solo visual)
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    internalZoom.value = Math.max(0.5, Math.min(internalZoom.value * delta, 3))
}

// Navegación principal: Convertir posición del mouse en minimapa a posición de canvas
const navigate = (event: MouseEvent) => {
    if (!miniMapRef.value) return

    const rect = miniMapRef.value.getBoundingClientRect()
    // Coordenadas relativas al contenedor del minimapa
    const miniX = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
    const miniY = Math.max(0, Math.min(event.clientY - rect.top, rect.height))

    // Convertir a coordenadas del mundo (centro de la vista deseada)
    const worldCenter = mapToWorld(miniX, miniY)

    // Calcular el desplazamiento del canvas (x, y) necesario para centrar ese punto
    // Canvas Translation = CenterOfScreen - (WorldPoint * Scale)
    const newCanvasX = (props.containerWidth / 2) - (worldCenter.x * props.canvasScale)
    const newCanvasY = (props.containerHeight / 2) - (worldCenter.y * props.canvasScale)

    emit('navigate', newCanvasX, newCanvasY)
}

// Resetear zoom interno si cambian los paneles drásticamente
// (Opcional: podrías usar un watch en paneles.length)

</script>

<style scoped>
/* Transiciones suaves para los elementos del mapa */
.cursor-crosshair {
    cursor: crosshair;
}
.cursor-move {
    cursor: move;
}
</style>